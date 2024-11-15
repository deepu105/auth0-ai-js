import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import { createRetrievalChain } from "langchain/chains/retrieval";
import { MemoryVectorStore } from "langchain/vectorstores/memory";

import { Document, DocumentInterface } from "@langchain/core/documents";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { BaseRetrieverInterface } from "@langchain/core/retrievers";
import { Runnable, RunnableInterface } from "@langchain/core/runnables";
import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";

export class RetrievalChain {
  private engine: Runnable;

  private constructor(engine: Runnable) {
    this.engine = engine;
  }

  static async create({
    retriever,
  }: {
    retriever:
      | BaseRetrieverInterface
      | RunnableInterface<Record<string, any>, DocumentInterface[]>;
  }) {
    const prompt = ChatPromptTemplate.fromTemplate(
      `Answer the user's question: {input} based on the following context {context}. Only use the information provided in the context. If you need more information, ask for it.`
    );
    const combineDocsChain = await createStuffDocumentsChain({
      llm: new ChatOpenAI({ temperature: 0, modelName: "gpt-4o-mini" }),
      prompt,
    });
    const retrievalChain = await createRetrievalChain({
      combineDocsChain,
      retriever,
    });

    return new RetrievalChain(retrievalChain);
  }

  async query({ query }: { query: string }) {
    const response = await this.engine.invoke({
      input: query,
    });

    return response;
  }
}

export class MemoryStore {
  private store: MemoryVectorStore;

  private constructor(store: MemoryVectorStore) {
    this.store = store;
  }

  static async fromDocuments(documents: Document<Record<string, any>>[]) {
    const embeddings = new OpenAIEmbeddings();
    const vectorStore = await MemoryVectorStore.fromDocuments(
      documents,
      embeddings
    );

    return new MemoryStore(vectorStore);
  }

  asRetriever() {
    return this.store.asRetriever();
  }
}
