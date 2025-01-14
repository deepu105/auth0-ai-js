import { describe, it, expect, vi } from "vitest";
import { FGARetriever, auth0 } from "../src/retrievers/fga-retriever";
import { Document } from "genkit/retriever";
import { genkit } from "genkit";

import { OpenFgaClient, CredentialsMethod } from "@openfga/sdk";

describe("FGARetriever", async () => {
  process.env.FGA_CLIENT_ID = "client-id";
  process.env.FGA_CLIENT_SECRET = "client-secret";

  const ai = genkit({
    plugins: [auth0()],
  });

  const documents = [
    Document.fromText("public content", { id: "public-doc" }),
    Document.fromText("private content", { id: "private-doc" }),
  ];

  const mockRetriever = ai.defineRetriever(
    { name: `auth0/test-retriever` },
    async () => ({ documents })
  );

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
    retriever: mockRetriever,
    buildQuery: mockBuildQuery,
  };

  it("should create an instance of RetrieverAction with default OpenFgaClient", () => {
    const retriever = FGARetriever.create(ai, args);
    expect(retriever).toBeTypeOf("function");
    expect(retriever.__action.name).toBe("auth0/fga-retriever");
  });

  it("should create an instance of RetrieverAction with provided OpenFgaClient", () => {
    const retriever = FGARetriever.create(ai, args, mockClient);
    expect(retriever).toBeTypeOf("function");
    expect(retriever.__action.name).toBe("auth0/fga-retriever");
  });

  it("should filter relevant documents based on batchCheck results", async () => {
    // @ts-ignore
    mockClient.batchCheck = vi.fn().mockResolvedValue({
      responses: [
        { _request: { object: "doc:public-doc" }, allowed: true },
        { _request: { object: "doc:private-doc" }, allowed: false },
      ],
    });

    const documents = await ai.retrieve({
      retriever: FGARetriever.create(ai, args, mockClient),
      query: "input",
    });

    expect(documents).toEqual([documents[0]]);
  });
});
