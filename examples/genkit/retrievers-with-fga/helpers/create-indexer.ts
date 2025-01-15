import "dotenv/config";

import fs from "fs";
import path from "path";

import { z } from "genkit";
import { Document } from "genkit/retriever";

import { documentsIndexer, initializeGenkit } from "./";

const ai = initializeGenkit();

export const documentIndex = ai.defineFlow(
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

    await ai.index({
      indexer: documentsIndexer,
      documents,
    });
  }
);

(async () => {
  await documentIndex("./assets/docs");
})();
