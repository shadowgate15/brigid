# @brigid/mcp-todoist

A lean [Todoist](https://todoist.com) [Model Context Protocol](https://modelcontextprotocol.io)
(MCP) server. It is the **reference implementation** of brigid's
[task-manager capability contract](../../docs/contracts/task-manager.md) — it exposes only the tools
the brigid GTD skills need, using the contract's canonical tool names so the skills detect and use it
automatically.

## Conformance

| Capability group | Status |
|---|---|
| **Core** (task create / query / lifecycle) | ✅ implemented |
| `projects-labels` | ✅ implemented |
| `filters` | ✅ implemented |
| `analytics` | ⬜ not yet (skills degrade — e.g. `weekly-review` computes from Core data) |

## Configuration

The server authenticates to the Todoist API with a personal API token, read from the environment:

```sh
export TODOIST_API_TOKEN="<your Todoist API token>"
```

Find your token in Todoist under **Settings → Integrations → Developer**. The server exits with an
error on stderr if the variable is unset.

## Structure

- `src/index.ts` — `createServer()`, the reusable/testable server factory (registers tools, no transport).
- `src/bin.ts` — the executable entry (`bin`), which attaches the stdio transport and runs the server.
- `src/todoist.ts` — the thin Todoist REST client and the structured-filter → Todoist-filter translation.

## Develop

```sh
nx build mcp-todoist        # compile to dist/packages/mcp-todoist
nx lint mcp-todoist --fix    # lint + sync package.json deps from the root (single-version policy)
```

## Run

After building, launch the server over stdio:

```sh
TODOIST_API_TOKEN=... node dist/packages/mcp-todoist/src/bin.js
```

Or, once published, via `npx @brigid/mcp-todoist`.
