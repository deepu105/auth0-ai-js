import {
  BaseNode,
  BaseRetriever,
  Metadata,
  NodeWithScore,
  QueryBundle,
} from "llamaindex";

import {
  ClientCheckRequest,
  ConsistencyPreference,
  CredentialsMethod,
  OpenFgaClient,
} from "@openfga/sdk";

export type FGARetrieverCheckerFn = (document: BaseNode<Metadata>) => {
  user: string;
  object: string;
  relation: string;
};

export interface FGARetrieverProps {
  buildQuery: FGARetrieverCheckerFn;
  retriever: BaseRetriever;
}

/**
 * The `FGARetriever` class extends the `BaseRetriever` and integrates with the OpenFGA client to perform permission checks
 * on retrieved nodes. It uses a checker function to determine the permissions required for each node and filters the nodes
 * based on these permissions.
 *
 * @property {string} user - The user identifier for whom the permissions are being checked.
 * @property {BaseRetriever} retriever - The base retriever instance used to fetch nodes.
 * @property {FGARetrieverCheckerFn} checkerFn - A function used to determine the permissions required for each node.
 * @property {OpenFgaClient} fgaClient - Optional - The OpenFGA client instance used to perform permission checks.
 */
export class FGARetriever extends BaseRetriever {
  private retriever: BaseRetriever;

  private buildQuery: FGARetrieverCheckerFn;
  private fgaClient: OpenFgaClient;

  static lc_name() {
    return "FGARetriever";
  }

  lc_namespace = ["llamaindex", "retrievers", "fga-retriever"];

  private constructor(
    { buildQuery, retriever }: FGARetrieverProps,
    fgaClient?: OpenFgaClient
  ) {
    super();

    this.retriever = retriever;
    this.buildQuery = buildQuery;
    this.fgaClient =
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
  }

  static adaptFGA(
    { buildQuery, retriever }: FGARetrieverProps,
    fgaClient?: OpenFgaClient
  ) {
    return new FGARetriever({ buildQuery, retriever }, fgaClient);
  }

  /**
   * Checks permissions for a list of client requests.
   *
   * @param checks - An array of `ClientCheckRequest` objects representing the permissions to be checked.
   * @returns A promise that resolves to a `Map` where the keys are object identifiers and the values are booleans indicating whether the permission is allowed.
   */
  async checkPermissions(
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
   * Retrieves nodes based on the provided query parameters, processes them through a checker function,
   * and filters the nodes based on permissions.
   *
   * @param params - The query parameters used to retrieve nodes.
   * @returns A promise that resolves to an array of nodes with scores that have passed the permission checks.
   */
  async _retrieve(params: QueryBundle): Promise<NodeWithScore[]> {
    const retrievedNodes = await this.retriever.retrieve(params);

    const { checks, documentToObjectMap } = retrievedNodes.reduce(
      (accumulator, nodeWithScore: NodeWithScore<Metadata>) => {
        const permissionCheck = this.buildQuery(nodeWithScore.node);
        accumulator.checks.push(permissionCheck);
        accumulator.documentToObjectMap.set(
          nodeWithScore,
          permissionCheck.object
        );
        return accumulator;
      },
      {
        checks: [] as ClientCheckRequest[],
        documentToObjectMap: new Map<NodeWithScore<Metadata>, string>(),
      }
    );

    const permissionsMap = await this.checkPermissions(checks);

    return retrievedNodes.filter(
      (node) => permissionsMap.get(documentToObjectMap.get(node) || "") === true
    );
  }
}
