import { BaseRetrieverInterface } from "@langchain/core/retrievers";
import { tool } from "@langchain/core/tools";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { ChatOpenAI } from "@langchain/openai";
import { z } from "zod";

export class RetrievalAgent {
  private agent;

  private constructor(agent) {
    this.agent = agent;
  }

  // Create a retrieval agent with a retriever tool and a language model
  static create(retriever: BaseRetrieverInterface) {
    // Convert the retriever into a tool for an agent.
    const retrieverTool = tool(
      async ({ query }) => {
        const documents = await retriever.invoke(query);
        return documents.map((doc) => doc.pageContent).join("\n\n");
      },
      {
        name: "zeko-researcher",
        description: "Returns the latest information on ZEKO.",
        schema: z.object({ query: z.string() }),
      }
    );

    // Create a retrieval agent that has access to the retrieval tool.
    const retrievalAgent = createReactAgent({
      llm: new ChatOpenAI({ temperature: 0, model: "gpt-4o-mini" }),
      tools: [retrieverTool],
      stateModifier: [
        "Answer the user's question only based on context retrieved from provided tools.",
        "Only use the information provided by the tools.",
        "If you need more information, ask for it.",
      ].join(" "),
    });

    return new RetrievalAgent(retrievalAgent);
  }

  // Query the retrieval agent with a user question
  async query(query: string) {
    const { messages } = await this.agent.invoke({
      messages: [
        {
          role: "user",
          content: query,
        },
      ],
    });

    return messages.at(-1)?.content;
  }
}
