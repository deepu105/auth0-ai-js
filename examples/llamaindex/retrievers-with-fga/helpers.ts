import { Document } from "llamaindex";
import fs from "node:fs/promises";

async function readDoc(path: string) {
  return await fs.readFile(path, "utf-8");
}

export async function readDocuments() {
  const document1 = new Document({
    text: await readDoc("./assets/docs/doc1.md"),
    metadata: {
      id: "doc1",
    },
  });
  const document2 = new Document({
    text: await readDoc("./assets/docs/doc2.md"),
    metadata: {
      id: "doc2",
    },
  });

  return [document1, document2];
}
