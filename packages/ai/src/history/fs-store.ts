import { readFile, writeFile } from 'node:fs/promises';

export class FSStore {
  path
  
  constructor(path) {
    this.path = path;
  }
  
  async store(tid, messages) {
    return writeFile(tid + '.json', JSON.stringify(messages))
  }
  
  async load(tid) {
    var data = await readFile(tid + '.json', 'utf8');
    return JSON.parse(data);
  }
}
