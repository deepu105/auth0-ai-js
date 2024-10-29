export interface Authorizer {
  authorize(scope: string[]);
}
