export interface Store {
  load(transactionID: string);
  store(transactionID: string, messages);
}
