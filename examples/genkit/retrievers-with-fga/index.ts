/**
 * GenKit Example: Retrievers with Okta FGA (Fine-Grained Authorization)
 *
 *
 */
import "dotenv/config";

import * as z from "zod";

import { FGARetriever } from "@auth0/ai-genkit";
import { retrieve } from "@genkit-ai/ai";
import { defineFlow, runFlow } from "@genkit-ai/flow";

import { documentsRetriever, executeQuery, initializeGenkit } from "./helpers";

initializeGenkit();

/**
 * Demonstrates the usage of the Okta FGA (Fine-Grained Authorization)
 * with a vector store index to query documents with permission checks.
 *
 * It performs the following steps:
 *    1. Defines a user ID.
 *    2. Retrive documents from a data source based on the user's permissions.
 *    3. Executes the user query and logs the response.
 *
 * The retrieveWithFGA checks if the user has the "viewer" relation to the document
 * based on predefined tuples in Okta FGA.
 *
 * Example:
 * - A tuple {user: "user:*", relation: "viewer", object: "doc:public-doc"} allows all users to view "public-doc".
 * - A tuple {user: "user:user1", relation: "viewer", object: "doc:private-doc"} allows "user1" to view "private-doc".
 *
 * The output of the query depends on the user's permissions to view the documents.
 */
async function main() {
  console.log(
    "\n..:: GenKit Example: Retrievers with Okta FGA (Fine-Grained Authorization)\n\n"
  );

  // UserID
  const user = "user1";

  const demoFlow = defineFlow(
    { name: "demo", inputSchema: z.string(), outputSchema: z.string() },
    async (input: string) => {
      const documents = await retrieve({
        retriever: FGARetriever.create({
          retriever: documentsRetriever,
          buildQuery: (doc) => ({
            user: `user:${user}`,
            object: `doc:${doc.metadata?.id}`,
            relation: "viewer",
          }),
        }),
        query: input,
      });

      return await executeQuery(input, documents);
    }
  );

  /**
   * Output: `The provided context does not include any forecast...`
   */
  console.log(await runFlow(demoFlow, "Show me forecast for ZEKO?"));

  /**
   * If we add the following tuple to the Okta FGA:
   *
   *    { user: "user:user1", relation: "viewer", object: "doc:private-doc" }
   *
   * Then, the output will be: `The forecast for Zeko Advanced Systems Inc. (ZEKO) for fiscal year 2025...`
   */
}

main().catch(console.error);
