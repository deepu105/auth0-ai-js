/* From  https://github.com/auth0-lab/auth0-ai-js/blob/main/packages/ai-langchain/src/retrievers/fga-retriever.ts */
import { Document, DocumentInterface } from "@langchain/core/documents";
import { BaseRetriever } from "@langchain/core/retrievers";
import {
  ClientBatchCheckItem,
  CredentialsMethod,
  OpenFgaClient,
} from "@openfga/sdk";

import type { BaseRetrieverInput } from "@langchain/core/retrievers";
import type { CallbackManagerForRetrieverRun } from "@langchain/core/callbacks/manager";

type FGARetrieverArgsWithoutCheckFromDocument<T extends ClientBatchCheckItem> =
  {
    retriever: BaseRetriever;
    buildQuery: (
      doc: DocumentInterface<Record<string, any>>,
      query: string
    ) => T;
    fields?: BaseRetrieverInput;
  };

type FGARetrieverArgs<T extends ClientBatchCheckItem> =
  FGARetrieverArgsWithoutCheckFromDocument<T> & {
    accessByDocument: (checks: T[]) => Promise<Map<string, boolean>>;
  };

export class FGARetriever<
  T extends ClientBatchCheckItem
> extends BaseRetriever {
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
      checks: ClientBatchCheckItem[]
    ) => Promise<Map<string, boolean>>;
  }

  static create(
    args: FGARetrieverArgsWithoutCheckFromDocument<ClientBatchCheckItem>,
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

    const accessByDocument = async function accessByDocument(
      checks: ClientBatchCheckItem[]
    ): Promise<Map<string, boolean>> {
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
