# Auth0 AI for LangChain

This package integrates [LangChain](https://js.langchain.com/docs/tutorials/) with [Auth0 AI](https://www.auth0.ai/) for enhanced document retrieval capabilities.

## Usage

```typescript
import { FGARetriever } from "@auth0/ai-langchain";
import { MemoryStore, RetrievalChain } from "./helpers/memory-store";
import { readDocuments } from "./helpers/read-documents";

async function main() {
  // UserID
  const user = "user1";
  const documents = await readDocuments();
  // 1. Call helper function to load LangChain MemoryStore
  const vectorStore = await MemoryStore.fromDocuments(documents);
  // 2. Call helper function to create a LangChain retrieval chain.
  const retrievalChain = await RetrievalChain.create({
    // 3. Decorate the retriever with the FGARetriever to check permissions.
    retriever: FGARetriever.create({
      retriever: vectorStore.asRetriever(),
      buildQuery: (doc) => ({
        user: `user:${user}`,
        object: `doc:${doc.metadata.id}`,
        relation: "viewer",
      }),
    }),
  });

  // 4. Execute the query
  const { answer } = await retrievalChain.query({
    query: "Show me forecast for ZEKO?",
  });

  console.log(answer);
}

main().catch(console.error);
```

---

<p align="center">
  <picture>
    <source media="(prefers-color-scheme: light)" srcset="https://cdn.auth0.com/website/sdks/logos/auth0_light_mode.png"   width="150">
    <source media="(prefers-color-scheme: dark)" srcset="https://cdn.auth0.com/website/sdks/logos/auth0_dark_mode.png" width="150">
    <img alt="Auth0 Logo" src="https://cdn.auth0.com/website/sdks/logos/auth0_light_mode.png" width="150">
  </picture>
</p>
<p align="center">Auth0 is an easy to implement, adaptable authentication and authorization platform. To learn more checkout <a href="https://auth0.com/why-auth0">Why Auth0?</a></p>
<p align="center">
This project is licensed under the MIT license. See the <a href="/LICENSE"> LICENSE</a> file for more info.</p>
