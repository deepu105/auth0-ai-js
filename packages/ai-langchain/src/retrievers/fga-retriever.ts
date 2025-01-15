import { Document, DocumentInterface } from "@langchain/core/documents";
import { BaseRetriever } from "@langchain/core/retrievers";
import {
  ClientBatchCheckItem,
  CredentialsMethod,
  OpenFgaClient,
} from "@openfga/sdk";

import type { BaseRetrieverInput } from "@langchain/core/retrievers";
import type { CallbackManagerForRetrieverRun } from "@langchain/core/callbacks/manager";

type FGARetrieverCheckerFn<T extends ClientBatchCheckItem> = (
  doc: DocumentInterface<Record<string, any>>
) => T;

type FGARetrieverArgsWithoutAccessByDocument<T extends ClientBatchCheckItem> = {
  retriever: BaseRetriever;
  buildQuery: FGARetrieverCheckerFn<T>;
  fields?: BaseRetrieverInput;
};

type AccessByDocumentFn<T extends ClientBatchCheckItem> = (
  checks: T[]
) => Promise<Map<string, boolean>>;

type FGARetrieverArgs<T extends ClientBatchCheckItem> =
  FGARetrieverArgsWithoutAccessByDocument<T> & {
    accessByDocument: AccessByDocumentFn<T>;
  };

/**
 * A retriever that allows filtering documents based on access control checks
 * using OpenFGA. This class wraps an underlying retriever and performs batch
 * checks on retrieved documents, returning only the ones that pass the
 * specified access criteria.
 *
 * @template T - The type representing a single access check request item.
 *
 * @remarks
 * The FGARetriever requires a buildQuery function to specify how access checks
 * are formed for each document, and an accessByDocument function to execute
 * the checks via an OpenFGA client or equivalent mechanism. The checks are then
 * mapped back to their corresponding documents to filter out those for which
 * access is denied.
 *
 * @example
 * ```ts
 * const retriever = FGARetriever.create({
 *   retriever: someOtherRetriever,
 *   buildQuery: (doc) => ({
 *     user: `user:${user}`,
 *     object: `doc:${doc.metadata.id}`,
 *     relation: "viewer",
 *   }),
 * });
 * ```
 */
export class FGARetriever<
  T extends ClientBatchCheckItem
> extends BaseRetriever {
  lc_namespace = ["@langchain", "retrievers"];
  private retriever: BaseRetriever;
  private buildQuery: FGARetrieverCheckerFn<T>;
  private accessByDocument: AccessByDocumentFn<T>;

  private constructor({
    retriever,
    buildQuery,
    accessByDocument,
    fields,
  }: FGARetrieverArgs<T>) {
    super(fields);
    this.buildQuery = buildQuery;
    this.retriever = retriever;
    this.accessByDocument = accessByDocument as AccessByDocumentFn<T>;
  }

  /**
   * Creates a new FGARetriever instance using the given arguments and optional OpenFgaClient.
   *
   * @param args - @FGARetrieverArgsWithoutAccessByDocument
   * @param args.retriever - The underlying retriever instance to fetch documents.
   * @param args.buildQuery - A function to generate access check requests for each document.
   * @param args.fields - Optional - Additional fields to pass to the underlying retriever.
   * @param fgaClient - Optional - OpenFgaClient instance to execute checks against.
   * @returns A newly created FGARetriever instance configured with the provided arguments.
   */
  static create(
    args: FGARetrieverArgsWithoutAccessByDocument<ClientBatchCheckItem>,
    fgaClient?: OpenFgaClient
  ): FGARetriever<ClientBatchCheckItem> {
    const client =
      fgaClient ||
      new OpenFgaClient({
        apiUrl: process.env.FGA_API_URL!,
        storeId: process.env.FGA_STORE_ID!,
        credentials: {
          method: CredentialsMethod.ClientCredentials,
          config: {
            apiTokenIssuer: process.env.FGA_API_TOKEN_ISSUER!,
            apiAudience: process.env.FGA_API_AUDIENCE!,
            clientId: process.env.FGA_CLIENT_ID!,
            clientSecret: process.env.FGA_CLIENT_SECRET!,
          },
        },
      });

    const accessByDocument: AccessByDocumentFn<ClientBatchCheckItem> =
      async function (checks) {
        const response = await client.batchCheck({ checks });
        return response.result.reduce((c: Map<string, boolean>, v) => {
          c.set(v.request.object, v.allowed || false);
          return c;
        }, new Map<string, boolean>());
      };

    return new FGARetriever({ ...args, accessByDocument });
  }

  async _getRelevantDocuments(
    query: string,
    runManager?: CallbackManagerForRetrieverRun
  ): Promise<Document[]> {
    const documents = await this.retriever._getRelevantDocuments(
      query,
      runManager
    );

    const out = documents.reduce(
      (out, doc) => {
        const check = this.buildQuery(doc);
        out.checks.push(check);
        out.documentToObject.set(doc, check.object);
        return out;
      },
      {
        checks: [] as T[],
        documentToObject: new Map<
          DocumentInterface<Record<string, any>>,
          string
        >(),
      }
    );

    const { checks, documentToObject } = out;
    const resultsByObject = await this.accessByDocument(checks);

    return documents.filter(
      (d, i) => resultsByObject.get(documentToObject.get(d) || "") === true
    );
  }
}
