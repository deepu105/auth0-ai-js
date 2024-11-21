export interface StateStore {
  get(stateId: string);
  save(stateId: string, stateData);
}
