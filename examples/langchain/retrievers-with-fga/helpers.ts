import fs from "node:fs/promises";

import { Document } from "@langchain/core/documents";

async function readDoc(path: string) {
  return await fs.readFile(path, "utf-8");
}

export async function readDocuments() {
  const document1 = new Document({
    pageContent: await readDoc("./assets/docs/doc1.txt"),
    metadata: {
      id: "doc1",
    },
  });
  const document2 = new Document({
    pageContent: await readDoc("./assets/docs/doc2.txt"),
    metadata: {
      id: "doc2",
    },
  });
  const document3 = new Document({
    pageContent: await readDoc("./assets/docs/doc3.txt"),
    metadata: {
      id: "doc3",
    },
  });

  return [document1, document2, document3];
}
