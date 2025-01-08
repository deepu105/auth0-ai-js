import openAI, { gpt4oMini, textEmbedding3Small } from "genkitx-openai";

// import { auth0 } from "@auth0/ai-genkit";
import { auth0 } from "./fga-retriever";
import { generate } from "@genkit-ai/ai";
import { Document } from "@genkit-ai/ai/retriever";
import { configureGenkit } from "@genkit-ai/core";
import devLocalVectorstore, {
  devLocalIndexerRef,
  devLocalRetrieverRef,
} from "@genkit-ai/dev-local-vectorstore";

export const indexName = "documents";

export const documentsRetriever = devLocalRetrieverRef(indexName);

export const documentsIndexer = devLocalIndexerRef(indexName);

export function initializeGenkit() {
  configureGenkit({
    logLevel: "error",
    plugins: [
      openAI(),
      auth0(),
      devLocalVectorstore([
        {
          indexName,
          embedder: textEmbedding3Small,
        },
      ]),
    ],
  });
}

/**
 * Executes a query using a language model and a given context.
 *
 * @param query - The query string to be answered.
 * @param context - An array of Document objects to be used as context for the query.
 * @returns A promise that resolves to the output string generated by the language model.
 */
export async function executeQuery(query: string, context: Document[]) {
  const llmResponse = await generate({
    model: gpt4oMini,
    prompt: `    
  Use only the context provided to answer the question.
  If you don't know, do not make up an answer.

  Question: ${query}
`,
    context,
  });

  const output = llmResponse.text();
  return output;
}
