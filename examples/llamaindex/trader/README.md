## Trader Agent

## How to run it

1. Install dependencies. If you want to run with local dependencies follow root instructions.

   ```sh
   $ npm install
   ```

2. Example flow
   ```sh
   $ npx tsx agent.ts "Buy 100 shares of ZEKO"
   $ npx tsx agent.ts -t tid-222-333 -C secret
   ```

## `.env` file

```sh
OPENAI_API_KEY=xx-xxxx-xxxxxxxxxxxxxxxxxxxxxxxxxxx
```

## License

Apache-2.0
