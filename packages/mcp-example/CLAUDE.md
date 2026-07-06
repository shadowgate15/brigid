# mcp-example — CLAUDE.md

An example **MCP** (Model Context Protocol) server, and the **template** to copy when adding a new
MCP server to the repo. Read the root [CLAUDE.md](../../CLAUDE.md) first for repo-wide rules.

## The pattern (copy this for new servers)

Two-file split under `src/`:

- [`src/index.ts`](src/index.ts) — exports `createServer(): McpServer`. This wires up the server
  and registers tools but **does not attach a transport**, so it stays reusable and testable.
  Tools are registered with `server.registerTool(...)` using **zod** input schemas.
- [`src/bin.ts`](src/bin.ts) — the executable (`#!/usr/bin/env node`, registered as the package
  `bin`). It calls `createServer()`, attaches a `StdioServerTransport`, and connects.

Keep new servers to this same `createServer()` + stdio-runner split.

## Rules specific to MCP servers

- **stdout is the JSON-RPC stream.** Never `console.log` to stdout — all diagnostics go to
  `stderr` (`console.error`). Violating this corrupts the protocol.
- **ESM + NodeNext.** `package.json` has `"type": "module"`; the package `tsconfig.json` uses
  `module`/`moduleResolution: nodenext`. Use `.js` extensions in relative imports (e.g.
  `from './index.js'`) even though the source is `.ts`.
- **Published to npm.** Unlike the plugin, MCP packages publish publicly
  (`publishConfig.access: public`). The `version` export in `index.ts` mirrors `package.json` and
  is bumped by `nx release` — don't edit either by hand.
- **Deps come from the root.** Import what you need (`@modelcontextprotocol/sdk`, `zod`), then run
  `nx lint mcp-example --fix` to populate this package's `dependencies` (single-version policy —
  see root CLAUDE.md).

## Build

```sh
pnpm exec nx build mcp-example      # tsc → dist/packages/mcp-example
```

## Adding a new MCP server

```sh
pnpm exec nx g @nx/js:lib packages/mcp-<name> --name=mcp-<name> --publishable \
  --importPath=@brigid/mcp-<name> --bundler=tsc --unitTestRunner=none --linter=eslint
```

Then make it match this package: set `type: module`, add `bin` + `publishConfig` to
`package.json`, switch the package `tsconfig.json` to `nodenext`, and copy the
`index.ts` (`createServer()`) + `bin.ts` (stdio runner) split.
