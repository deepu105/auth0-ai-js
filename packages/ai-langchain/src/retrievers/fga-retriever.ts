import { Document, DocumentInterface } from "@langchain/core/documents";
import { BaseRetriever } from "@langchain/core/retrievers";
import {
  ClientCheckRequest,
  CredentialsMethod,
  OpenFgaClient,
} from "@openfga/sdk";

import type { BaseRetrieverInput } from "@langchain/core/retrievers";
import type { CallbackManagerForRetrieverRun } from "@langchain/core/callbacks/manager";

type FGARetrieverArgsWithoutCheckFromDocument<T extends ClientCheckRequest> = {
  retriever: BaseRetriever;
  buildQuery: (doc: DocumentInterface<Record<string, any>>, query: string) => T;
  fields?: BaseRetrieverInput;
};

type FGARetrieverArgs<T extends ClientCheckRequest> =
  FGARetrieverArgsWithoutCheckFromDocument<T> & {
    accessByDocument: (checks: T[]) => Promise<Map<string, boolean>>;
  };

export class FGARetriever<T extends ClientCheckRequest> extends BaseRetriever {
  lc_namespace = ["langchain", "retrievers"];
  private retriever: BaseRetriever;
  private buildQuery: (
    doc: DocumentInterface<Record<string, any>>,
    query: string
  ) => T;
  private accessByDocument: (checks: T[]) => Promise<Map<string, boolean>>;

  private constructor({
    retriever,
    buildQuery,
    accessByDocument,
    fields,
  }: FGARetrieverArgs<T>) {
    super(fields);
    this.buildQuery = buildQuery;
    this.retriever = retriever;

    this.accessByDocument = accessByDocument as (
      checks: ClientCheckRequest[]
    ) => Promise<Map<string, boolean>>;
  }

  static adaptFGA(
    args: FGARetrieverArgsWithoutCheckFromDocument<ClientCheckRequest>,
    fgaClient?: OpenFgaClient
  ): FGARetriever<ClientCheckRequest> {
    const client =
      fgaClient ||
      new OpenFgaClient({
        apiScheme: "https",
        apiHost: "api.us1.fga.dev",
        storeId: process.env.FGA_STORE_ID!,
        credentials: {
          method: CredentialsMethod.ClientCredentials,
          config: {
            apiTokenIssuer: "fga.us.auth0.com",
            apiAudience: "https://api.us1.fga.dev/",
            clientId: process.env.FGA_CLIENT_ID!,
            clientSecret: process.env.FGA_CLIENT_SECRET!,
          },
        },
      });

    const accessByDocument = async function accessByDocument(
      checks: ClientCheckRequest[]
    ): Promise<Map<string, boolean>> {
      const results = await client.batchCheck(checks);
      return results.responses.reduce((c: Map<string, boolean>, v) => {
        c.set(v._request.object, v.allowed || false);
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
        const check = this.buildQuery(doc, query);
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
