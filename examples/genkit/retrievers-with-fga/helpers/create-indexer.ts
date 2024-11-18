import "dotenv/config";

import fs from "fs";
import path from "path";
import * as z from "zod";

import { index } from "@genkit-ai/ai";
import { Document } from "@genkit-ai/ai/retriever";
import { defineFlow, runFlow } from "@genkit-ai/flow";

import { documentsIndexer, initializeGenkit } from "./";

initializeGenkit();

export const documentIndex = defineFlow(
  {
    name: "documentIndex",
    inputSchema: z.string().describe("MD file path"),
    outputSchema: z.void(),
  },
  async (directoryPath: string) => {
    directoryPath = path.resolve(directoryPath);

    const files = fs.readdirSync(directoryPath);
    const documents: Document[] = [];

    files.forEach((file) => {
      const id = path.basename(file).replace(path.extname(file), "");
      const txt = fs.readFileSync(path.join(directoryPath, file), {
        encoding: "utf-8",
      });
      documents.push(Document.fromText(txt, { file, id }));
    });

    await index({
      indexer: documentsIndexer,
      documents,
    });
  }
);

(async () => {
  await runFlow(documentIndex, "./assets/docs");
})();
