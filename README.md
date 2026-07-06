# brigid

An [Nx](https://nx.dev) monorepo housing the **brigid** Claude Code plugin and a growing set of
custom [Model Context Protocol](https://modelcontextprotocol.io) (MCP) servers.

## Packages

| Package | Path | Description |
|---|---|---|
| `claude-plugin` | [`packages/claude-plugin`](packages/claude-plugin) | The brigid GTD personal-assistant plugin (skills + marketplace entry). |
| `mcp-example` | [`packages/mcp-example`](packages/mcp-example) | Example MCP server and the template for new ones. |

The repo root is also a Claude Code plugin **marketplace** — `.claude-plugin/marketplace.json`
points at `packages/claude-plugin`, so `/plugin marketplace add shadowgate15/brigid` still works
unchanged. See the [plugin README](packages/claude-plugin/README.md) for install/usage.

## Getting started

```sh
pnpm install
pnpm exec nx show projects      # list projects
pnpm exec nx build mcp-example  # build a package
pnpm exec nx run-many -t lint --fix
```

## Dependencies (single-version policy)

All external dependencies are declared once in the **root** `package.json`. Individual packages do
**not** hand-maintain their own `dependencies` — the `@nx/dependency-checks` ESLint rule derives
them from actual imports and writes them into each package's `package.json` when you run
`nx lint <pkg> --fix`. Add a new dependency at the root, import it, then `lint --fix`.

## Add a new MCP server

```sh
pnpm exec nx g @nx/js:lib packages/mcp-<name> --name=mcp-<name> --publishable \
  --importPath=@brigid/mcp-<name> --bundler=tsc --unitTestRunner=none --linter=eslint
```

Then adapt it to the [`mcp-example`](packages/mcp-example) pattern: set `type: module`, add a `bin`
and `publishConfig` to `package.json`, switch the package `tsconfig.json` to `nodenext`, and copy
the `src/index.ts` (`createServer()`) + `src/bin.ts` (stdio runner) split.

## Releasing (independent versions)

Releases are driven by [`nx release`](https://nx.dev/features/manage-releases) with
**conventional commits** and **independent** per-project versions. Each project tags as
`{projectName}@{version}`.

```sh
pnpm exec nx release --dry-run --first-release   # preview the first release
pnpm exec nx release --first-release             # cut it for real
pnpm exec nx release                             # subsequent releases
```

- **MCP packages** (`mcps` group) bump their `package.json`, generate a changelog, tag, and publish
  to npm.
- **The plugin** (`plugin` group) is not an npm package. A custom version action
  ([`tools/nx/claude-plugin-version-actions.js`](tools/nx/claude-plugin-version-actions.js))
  propagates its version from `packages/claude-plugin/package.json` into
  `packages/claude-plugin/.claude-plugin/plugin.json` and the root `.claude-plugin/marketplace.json`
  in the same release commit. It is `private`, so npm publish is skipped.
