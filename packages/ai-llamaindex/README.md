# Auth0 AI for LlamaIndex

This package integrates [LlamaIndex](https://ts.llamaindex.ai/) with [Auth0 AI](https://www.auth0.ai/) for enhanced document retrieval capabilities.

## Usage

```typescript
import { FGARetriever } from "@auth0/ai-llamaindex";
import { VectorStoreIndex } from "llamaindex";
import { readDocuments } from "./helpers";

async function main() {
  // UserID
  const user = "user1";
  const documents = await readDocuments();
  // 1. Create `VectorStoreIndex` from documents.
  const vectorStoreIndex = await VectorStoreIndex.fromDocuments(documents);
  // 2. Initialize query engine.
  const queryEngine = vectorStoreIndex.asQueryEngine({
    // 3. Decorate the retriever with the FGARetriever to check permissions.
    retriever: FGARetriever.create({
      retriever: vectorStoreIndex.asRetriever(),
      buildQuery: (document) => ({
        user: `user:${user}`,
        object: `doc:${document.metadata.id}`,
        relation: "viewer",
      }),
    }),
  });

  // 4. Execute the query
  const vsiResponse = await queryEngine.query({
    query: "Show me forecast for ZEKO?",
  });

  console.log(vsiResponse.toString());
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
