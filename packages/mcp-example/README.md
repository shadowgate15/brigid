# @brigid/mcp-example

An example [Model Context Protocol](https://modelcontextprotocol.io) (MCP) server, and the
starting template for new MCP servers in this monorepo.

It exposes one demo tool, `greet`, over the stdio transport.

## Structure

- `src/index.ts` — `createServer()`, the reusable/testable server factory (registers tools, no transport).
- `src/bin.ts` — the executable entry (`bin`), which attaches the stdio transport and runs the server.

## Develop

```sh
nx build mcp-example        # compile to dist/packages/mcp-example
nx lint mcp-example --fix    # lint + sync package.json deps from the root (single-version policy)
```

External dependencies are installed once at the workspace root; the `@nx/dependency-checks`
ESLint rule keeps this package's `dependencies` in sync — do not hand-edit them.

## Run

After building, launch the server over stdio:

```sh
node dist/packages/mcp-example/src/bin.js
```

Or, once published, via `npx @brigid/mcp-example`.

## Create a new MCP server

Copy this package as a template:

```sh
nx g @nx/js:lib packages/mcp-<name> --name=mcp-<name> --publishable \
  --importPath=@brigid/mcp-<name> --bundler=tsc --unitTestRunner=none --linter=eslint
```

then adapt `package.json` (add `type: module`, `bin`, `publishConfig`), point the tsconfig at
`nodenext`, and copy the `src/index.ts` + `src/bin.ts` pattern.

🚀
