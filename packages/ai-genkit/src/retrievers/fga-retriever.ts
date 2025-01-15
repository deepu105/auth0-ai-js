import { z, Genkit } from "genkit";
import {
  CommonRetrieverOptionsSchema,
  Document,
  RetrieverArgument,
} from "genkit/retriever";
import { GenkitPlugin, genkitPlugin } from "genkit/plugin";

import {
  ClientBatchCheckItem,
  ConsistencyPreference,
  CredentialsMethod,
  OpenFgaClient,
} from "@openfga/sdk";

export type FGARetrieverCheckerFn = (doc: Document) => ClientBatchCheckItem;

export type FGARetrieverConstructorArgs = {
  buildQuery: FGARetrieverCheckerFn;
};

export type FGARetrieverArgs<
  CustomOptions extends z.ZodTypeAny = z.ZodTypeAny
> = FGARetrieverConstructorArgs & {
  ai: Genkit;
  retriever: RetrieverArgument<CustomOptions>;
  preRerankKMax?: number;
};

/**
 * A retriever that allows filtering documents based on access control checks
 * using OpenFGA. This class wraps an underlying retriever and performs batch
 * checks on retrieved documents, returning only the ones that pass the
 * specified access criteria.
 *
 *
 * @remarks
 * The FGARetriever requires a buildQuery function to specify how access checks
 * are formed for each document, the checks are executed via an OpenFGA client
 * or equivalent mechanism. The checks are then mapped back to their corresponding
 * documents to filter out those for which access is denied.
 *
 * @example
 * ```ts
 * const retriever = FGARetriever.create({
 *   ai,
 *   retriever: someOtherRetriever,
 *   buildQuery: (doc) => ({
 *     user: `user:${user}`,
 *     object: `doc:${doc.metadata.id}`,
 *     relation: "viewer",
 *   }),
 * });
 * ```
 */
export class FGARetriever {
  lc_namespace = ["genkit", "retrievers", "fga-retriever"];
  private buildQuery: FGARetrieverCheckerFn;
  private fgaClient: OpenFgaClient;

  static lc_name() {
    return "FGARetriever";
  }

  private constructor(
    { buildQuery }: FGARetrieverConstructorArgs,
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
   * Creates a new FGARetriever instance using the given arguments and optional OpenFgaClient.
   *
   * @param args - @FGARetrieverArgs
   * @param args.ai - A Genkit Instance.
   * @param args.retriever - The underlying retriever instance to fetch documents.
   * @param args.buildQuery - A function to generate access check requests for each document.
   * @param args.preRerankKMax - Optional - max value for Genkit preRerankK.
   * @param fgaClient - Optional - OpenFgaClient instance to execute checks against.
   * @returns A Retriever instance instance configured with the provided arguments.
   */
  static create<CustomOptions extends z.ZodTypeAny = z.ZodTypeAny>(
    {
      ai,
      buildQuery,
      retriever,
      preRerankKMax,
    }: FGARetrieverArgs<CustomOptions>,
    fgaClient?: OpenFgaClient
  ) {
    const client = new FGARetriever({ buildQuery }, fgaClient);

    const fgaRetrieverOptionsSchema = CommonRetrieverOptionsSchema.extend({
      preRerankK: z.number().max(preRerankKMax || 1000),
    });

    const fgaRetriever = ai.defineRetriever(
      {
        name: `auth0/fga-retriever`,
        configSchema: fgaRetrieverOptionsSchema,
      },
      async (input, options) => {
        const documents = await ai.retrieve({
          retriever,
          query: input,
          options,
        });

        const filteredDocuments = await client.filter(documents);

        return { documents: filteredDocuments };
      }
    );

    return fgaRetriever;
  }

  /**
   * Checks permissions for a list of client requests.
   *
   * @param requests - An array of `ClientBatchCheckItem` objects representing the permissions to be checked.
   * @returns A promise that resolves to a `Map` where the keys are object identifiers and the values are booleans indicating whether the permission is allowed.
   */
  private async checkPermissions(
    checks: ClientBatchCheckItem[]
  ): Promise<Map<string, boolean>> {
    const response = await this.fgaClient.batchCheck(
      { checks },
      {
        consistency: ConsistencyPreference.HigherConsistency,
      }
    );

    return response.result.reduce(
      (permissionMap: Map<string, boolean>, result) => {
        permissionMap.set(result.request.object, result.allowed || false);
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
  private async filter(documents: Document[]): Promise<Array<Document>> {
    const { checks, documentToObjectMap } = documents.reduce(
      (acc, document: Document) => {
        const check = this.buildQuery(document);
        acc.checks.push(check);
        acc.documentToObjectMap.set(document, check.object);
        return acc;
      },
      {
        checks: [] as ClientBatchCheckItem[],
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

export function auth0(): GenkitPlugin {
  return genkitPlugin("auth0", async (ai: Genkit) => {});
}
