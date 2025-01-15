import { describe, it, expect, vi } from "vitest";
import { FGARetriever } from "../src/retrievers/fga-retriever";
import { OpenFgaClient, CredentialsMethod } from "@openfga/sdk";
import { Document } from "@langchain/core/documents";
import { BaseRetriever } from "@langchain/core/retrievers";

describe("FGARetriever", () => {
  process.env.FGA_CLIENT_ID = "client-id";
  process.env.FGA_CLIENT_SECRET = "client-secret";

  const mockRetriever = {
    _getRelevantDocuments: vi.fn(),
  } as unknown as BaseRetriever;

  const mockBuildQuery = vi.fn((doc: Document) => ({
    object: `doc:${doc.metadata.id}`,
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

  const mockDocuments = [
    new Document({
      metadata: { id: "public-doc" },
      pageContent: "public content",
    }),
    new Document({
      metadata: { id: "private-doc" },
      pageContent: "private content",
    }),
  ];

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

  it("should filter relevant documents based on accessByDocument results", async () => {
    const retriever = FGARetriever.create(args, mockClient);
    // @ts-ignore
    mockRetriever._getRelevantDocuments.mockResolvedValue(mockDocuments);
    // @ts-ignore
    mockClient.batchCheck = vi.fn().mockResolvedValue({
      result: [
        { request: { object: "doc:public-doc" }, allowed: true },
        { request: { object: "doc:private-doc" }, allowed: false },
      ],
    });

    const result = await retriever._getRelevantDocuments("query");
    expect(result).toEqual([mockDocuments[0]]);
  });
});
