import { type SessionStore, type SessionData } from 'genkit';
import { readFile, writeFile } from 'node:fs/promises';

// https://github.com/firebase/genkit/blob/main/js/ai/src/session.ts

export class FSSessionStore<S = any> implements SessionStore<S> {
  async get(sessionId: string): Promise<SessionData<S> | undefined> {
    try {
      const s = await readFile(`${sessionId}.json`, { encoding: 'utf8' });
      const data = JSON.parse(s);
      return data;
    } catch {
      return undefined;
    }
  }

  async save(sessionId: string, sessionData: SessionData<S>): Promise<void> {
    const s = JSON.stringify(sessionData);
    await writeFile(`${sessionId}.json`, s, { encoding: 'utf8' });
  }
}
