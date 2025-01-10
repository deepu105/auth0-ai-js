import { describe, it, expect, vi } from "vitest";
import {
  FGARetriever,
  FGARetrieverCheckerFn,
} from "../src/retrievers/fga-retriever";
import { OpenFgaClient, CredentialsMethod } from "@openfga/sdk";
import { BaseRetriever, NodeWithScore } from "llamaindex";

describe("FGARetriever", () => {
  process.env.FGA_CLIENT_ID = "client-id";
  process.env.FGA_CLIENT_SECRET = "client-secret";

  const mockDocuments = [
    {
      node: { text: "public content", metadata: { id: "public-doc" } },
      score: 1,
    } as unknown as NodeWithScore,
    {
      node: { text: "private content", metadata: { id: "private-doc" } },
      score: 1,
    } as unknown as NodeWithScore,
  ];

  const mockRetriever = {
    retrieve: vi.fn().mockResolvedValue(mockDocuments),
  } as unknown as BaseRetriever;

  const mockBuildQuery = vi.fn((doc) => ({
    object: `doc:${doc.metadata.id}`,
    relation: "viewer",
    user: "user:user1",
  })) as unknown as FGARetrieverCheckerFn;

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

  it("should create an instance of FGARetriever with default OpenFgaClient", () => {
    const retriever = FGARetriever.create(args);
    expect(retriever).toBeInstanceOf(FGARetriever);
  });

  it("should create an instance of FGARetriever with provided OpenFgaClient", () => {
    const retriever = FGARetriever.create(args, mockClient);
    expect(retriever).toBeInstanceOf(FGARetriever);
  });

  it("retrieves and filters nodes based on permissions", async () => {
    // @ts-ignore
    mockClient.batchCheck = vi.fn().mockResolvedValue({
      responses: [
        { _request: { object: "doc:public-doc" }, allowed: true },
        { _request: { object: "doc:private-doc" }, allowed: false },
      ],
    });

    const retriever = FGARetriever.create(args, mockClient);

    const result = await retriever._retrieve({ query: "test" });
    expect(result).toEqual([mockDocuments[0]]);
  });
});
