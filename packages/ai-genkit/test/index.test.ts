import { describe, it, expect, vi } from "vitest";
import { genkit, Document } from "genkit";
import { FGAReranker, auth0 } from "../src/retrievers/fga-reranker";

import { OpenFgaClient, CredentialsMethod } from "@openfga/sdk";

describe("FGAReranker", async () => {
  process.env.FGA_CLIENT_ID = "client-id";
  process.env.FGA_CLIENT_SECRET = "client-secret";

  const ai = genkit({
    plugins: [auth0()],
  });

  const documents = [
    Document.fromText("public content", { id: "public-doc" }),
    Document.fromText("private content", { id: "private-doc" }),
  ];

  const mockBuildQuery = vi.fn((doc: Document) => ({
    object: `doc:${doc.metadata?.id}`,
    relation: "viewer",
    user: "user:user1",
  }));

  const mockClient = new OpenFgaClient({
    apiUrl: "https://api.us1.fga.dev",
    storeId: "01GGXW367SRH9YFXJ7GHJN0GMK",
    credentials: {
      method: CredentialsMethod.ClientCredentials,
      config: {
        apiTokenIssuer: "fga.us.auth0.com",
        apiAudience: "https://api.us1.fga.dev/",
        clientId: "client-id",
        clientSecret: "client-secret",
      },
    },
  });

  const args = {
    ai,
    buildQuery: mockBuildQuery,
  };

  it("should create an instance of RerankerAction with default OpenFgaClient", () => {
    const retriever = FGAReranker.create(args);
    expect(retriever).toBeTypeOf("function");
    expect(retriever.__action.name).toBe("auth0/fga-reranker");
  });

  it("should create an instance of RerankerAction with provided OpenFgaClient", () => {
    const retriever = FGAReranker.create(args, mockClient);
    expect(retriever).toBeTypeOf("function");
    expect(retriever.__action.name).toBe("auth0/fga-reranker");
  });

  it("should filter relevant documents based on batchCheck results", async () => {
    // @ts-ignore
    mockClient.batchCheck = vi.fn().mockResolvedValue({
      result: [
        { request: { object: "doc:public-doc" }, allowed: true },
        { request: { object: "doc:private-doc" }, allowed: false },
      ],
    });

    const rankedDocuments = await ai.rerank({
      reranker: FGAReranker.create(args, mockClient),
      query: "input",
      documents,
    });

    expect(rankedDocuments[0].content).toEqual(documents[0].content);
    expect(rankedDocuments[0].metadata.id).toEqual(documents[0].metadata?.id);
  });
});
