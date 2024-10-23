import "dotenv/config";

import { VectorStoreIndex } from "llamaindex";

import { FGARetriever } from "@auth0/ai-llamaindex";

import { readDocuments } from "./helpers";

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

  const vectorStoreIndex = await VectorStoreIndex.fromDocuments(documents);

  const vsiQueryEngine = vectorStoreIndex.asQueryEngine({
    // Decorate the retriever with the FGARetriever to check the permissions.
    retriever: new FGARetriever({
      user,
      retriever: vectorStoreIndex.asRetriever(),
      checkerFn: (user, document) => ({
        user: `user:${user}`,
        object: `doc:${document.metadata.id}`,
        relation: "viewer",
      }),
    }),
  });
  const vsiResponse = await vsiQueryEngine.query({
    query: "What was the salary in 2013?",
  });

  /**
   * Output: The context does not provide specific information about the salary in 2013.
   */
  console.log(vsiResponse.toString());

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
