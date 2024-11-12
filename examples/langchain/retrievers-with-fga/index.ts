/**
 * Langchain Example: Retrievers with OKTA FGA (Fine-Grained Authorization)
 *
 *
 */
import "dotenv/config";

import { FGARetriever } from "@auth0/ai-langchain";

import { readDocuments } from "./helpers";
// Custom memory store
import { MemoryStore } from "./memory-store";

/**
 * Demonstrates the usage of the OKTA FGA (Fine-Grained Authorization)
 * with a vector store index to query documents with permission checks.
 *
 * It performs the following steps:
 *    1. Defines a user ID.
 *    2. Reads documents from a data source.
 *    3. Creates a VectorStoreIndex from the documents.
 *    4. Sets up a query engine with an FGARetriever to enforce permissions.
 *    5. Executes a query and logs the response.
 *
 * The FGARetriever checks if the user has the "viewer" relation to the document
 * based on predefined tuples in OKTA FGA.
 *
 * Example:
 * - A tuple {user: "user:*", relation: "viewer", object: "doc:doc1"} allows all users to view "doc1".
 * - A tuple {user: "user:user1", relation: "viewer", object: "doc:doc2"} allows "user1" to view "doc2".
 *
 * The output of the query depends on the user's permissions to view the documents.
 */
async function main() {
  // UserID
  const user = "user1";
  const documents = await readDocuments();
  const vectorStore = await MemoryStore.fromDocuments(documents);

  const queryEngine = await vectorStore.asQueryEngine({
    // Decorate the retriever with the FGARetriever to check the permissions.
    retriever: FGARetriever.adaptFGA({
      retriever: vectorStore.asRetriever(),
      buildQuery: (doc) => ({
        user: `user:${user}`,
        object: `doc:${doc.metadata.id}`,
        relation: "viewer",
      }),
    }),
  });

  const { answer } = await queryEngine.query({
    query: "What was the salary in 2013?",
  });

  /**
   * Output: The context provided does not specify a salary for the year 2013.
   */
  console.log(answer);

  /**
   * If we add the following tuple to the OKTA FGA:
   *
   *    { user: "user:user1", relation: "viewer", object: "doc:doc2" }
   *
   * Then, the output will be:
   *
   *    Output: By 2013, my salary was $30k/year — almost twice what I made at my previous job. While low by US standards, it was pretty decent in Russia.
   */
}

main().catch(console.error);
