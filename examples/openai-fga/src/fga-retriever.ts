import {
  ClientCheckRequest,
  ConsistencyPreference,
  CredentialsMethod,
  OpenFgaClient,
} from "@openfga/sdk";

import { Document, DocumentWithScore } from "./helpers";

export type FGARetrieverCheckerFn = (document: Document) => {
  user: string;
  object: string;
  relation: string;
};

export interface FGARetrieverProps {
  buildQuery: FGARetrieverCheckerFn;
  documents: DocumentWithScore[];
}

export class FGARetriever {
  private buildQuery: FGARetrieverCheckerFn;
  private fgaClient: OpenFgaClient;
  private documents: DocumentWithScore[];

  private constructor(
    { buildQuery, documents }: FGARetrieverProps,
    fgaClient?: OpenFgaClient
  ) {
    this.documents = documents;
    this.buildQuery = buildQuery;
    this.fgaClient =
      fgaClient ||
      new OpenFgaClient({
        apiUrl: process.env.FGA_API_URL || "https://api.us1.fga.dev",
        storeId: process.env.FGA_STORE_ID!,
        credentials: {
          method: CredentialsMethod.ClientCredentials,
          config: {
            apiTokenIssuer: process.env.FGA_API_TOKEN_ISSUER || "auth.fga.dev",
            apiAudience:
              process.env.FGA_API_AUDIENCE || "https://api.us1.fga.dev/",
            clientId: process.env.FGA_CLIENT_ID!,
            clientSecret: process.env.FGA_CLIENT_SECRET!,
          },
        },
      });
  }

  static create(
    { buildQuery, documents }: FGARetrieverProps,
    fgaClient?: OpenFgaClient
  ) {
    return new FGARetriever({ buildQuery, documents }, fgaClient);
  }

  private async checkPermissions(
    requests: ClientCheckRequest[]
  ): Promise<Map<string, boolean>> {
    const batchCheckResponse = await this.fgaClient.batchCheck(requests, {
      consistency: ConsistencyPreference.HigherConsistency,
    });

    return batchCheckResponse.responses.reduce(
      (permissionMap: Map<string, boolean>, response) => {
        permissionMap.set(response._request.object, response.allowed || false);
        return permissionMap;
      },
      new Map<string, boolean>()
    );
  }

  async retrieve(): Promise<DocumentWithScore[]> {
    const retrievedNodes = this.documents;

    const { checks, documentToObjectMap } = retrievedNodes.reduce(
      (accumulator, documentWithScore: DocumentWithScore) => {
        const permissionCheck = this.buildQuery(documentWithScore.document);
        accumulator.checks.push(permissionCheck);
        accumulator.documentToObjectMap.set(
          documentWithScore.document,
          permissionCheck.object
        );
        return accumulator;
      },
      {
        checks: [] as ClientCheckRequest[],
        documentToObjectMap: new Map<Document, string>(),
      }
    );

    const permissionsMap = await this.checkPermissions(checks);

    return retrievedNodes.filter(
      (documentWithScore) =>
        permissionsMap.get(
          documentToObjectMap.get(documentWithScore.document) || ""
        ) === true
    );
  }
}
