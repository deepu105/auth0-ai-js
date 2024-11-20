# agent-genkit

`agent-genkit` is an example stock trading agent implemented in [Genkit](https://firebase.google.com/docs/genkit)
for [Node.js](https://nodejs.org/).  The agent supports multi-turn conversations
by persisting messages sent within a chat session.  The agent executes trades
via tool calling which, in turn, call APIs.

In order to impose guardrails on the agent, APIs can, in real-time, apply
policies such as requiring human approval for any trade that exceeds a certain
amount of money.  When such a policy constraint is encountered, the agent is
challenged using, for example, [OAuth 2.0 Step Up Authentication Challenge
Protocol](https://datatracker.ietf.org/doc/html/rfc9470).  When challenged, tool
functions throw an `AuthorizationError` with the challenge parameters.

[`@auth0/ai`](../../packages/ai) provides a framework that orchestrates the
interaction between the agent and the human who can grant authorization.  It
intercepts `AuthorizationError`s, and relays the parameters in a request to an
authorization server.  Once access has been granted, a fresh set of tokens are
issued to the agent.  The framework then retries the previously denied request
using the new credentials, which should allow it to proceed.

Using [`@auth0/ai`], this agent can be hosted in a variety of different
modalities, including ...
