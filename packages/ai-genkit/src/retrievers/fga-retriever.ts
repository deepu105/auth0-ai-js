import { z } from "zod";

import {
  defineRetriever,
  Document,
  retrieve,
  RetrieverArgument,
} from "@genkit-ai/ai/retriever";
import { genkitPlugin } from "@genkit-ai/core";
import {
  ClientCheckRequest,
  ConsistencyPreference,
  CredentialsMethod,
  OpenFgaClient,
} from "@openfga/sdk";

type FGARetrieverCheckerFn = (document: Document) => {
  user: string;
  object: string;
  relation: string;
};

type FGAConstructorProps = {
  buildQuery: FGARetrieverCheckerFn;
};

type FGARetrieverProps<CustomOptions extends z.ZodTypeAny = z.ZodTypeAny> =
  FGAConstructorProps & {
    retriever: RetrieverArgument<CustomOptions>;
  };

export class FGARetriever {
  private buildQuery: FGARetrieverCheckerFn;
  private fgaClient: OpenFgaClient;

  static lc_name() {
    return "FGARetriever";
  }

  lc_namespace = ["genkit", "retrievers", "fga-retriever"];

  private constructor(
    { buildQuery }: FGAConstructorProps,
    fgaClient?: OpenFgaClient
  ) {
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

  /**
   * Creates an instance of FGARetriever.
   *
   * @param buildQuery - A function that checks the FGARetriever query.
   * @param fgaClient - An optional OpenFgaClient instance.
   * @returns A new FGARetriever instance.
   */
  static create<CustomOptions extends z.ZodTypeAny = z.ZodTypeAny>(
    { buildQuery, retriever }: FGARetrieverProps<CustomOptions>,
    fgaClient?: OpenFgaClient
  ) {
    const fga = new FGARetriever({ buildQuery }, fgaClient);

    return defineRetriever(
      {
        name: `auth0/fga-retriever`,
      },
      async (input, options) => {
        const documents = await retrieve({
          retriever,
          query: input,
          options,
        });

        const filteredDocuments = await fga.filter(documents);

        return { documents: filteredDocuments };
      }
    );
  }

  /**
   * Checks permissions for a list of client requests.
   *
   * @param checks - An array of `ClientCheckRequest` objects representing the permissions to be checked.
   * @returns A promise that resolves to a `Map` where the keys are object identifiers and the values are booleans indicating whether the permission is allowed.
   */
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

  /**
   * Retrieves a filtered list of documents based on permission checks.
   *
   * @param documents - An array of documents to be checked for permissions.
   * @returns A promise that resolves to an array of documents that have passed the permission checks.
   */
  private async filter(documents: any[]): Promise<Array<Document>> {
    const { checks, documentToObjectMap } = documents.reduce(
      (accumulator, document: Document) => {
        const permissionCheck = this.buildQuery(document);
        accumulator.checks.push(permissionCheck);
        accumulator.documentToObjectMap.set(document, permissionCheck.object);
        return accumulator;
      },
      {
        checks: [] as ClientCheckRequest[],
        documentToObjectMap: new Map<Document, string>(),
      }
    );

    const permissionsMap = await this.checkPermissions(checks);

    return documents.filter(
      (document) =>
        permissionsMap.get(documentToObjectMap.get(document) || "") === true
    );
  }
}

export const auth0 = genkitPlugin("auth0", async () => {});
