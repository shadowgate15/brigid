# CLAUDE.md

Guidance for Claude Code when working in this repo. Kept intentionally lean — package-specific
detail lives in nested `CLAUDE.md` files that load automatically when you work in that subtree
(see the map below). Read the nested file before making changes inside a package.

## What this is

`@brigid/source` — an **Nx** monorepo (pnpm workspaces) housing the **brigid** Claude Code plugin
and a growing set of custom **MCP** (Model Context Protocol) servers. The repo root is also a
Claude Code plugin **marketplace** (`.claude-plugin/marketplace.json`).

## Project map

| Project | Path | What it is | Read before editing |
|---|---|---|---|
| `claude-plugin` | `packages/claude-plugin` | brigid GTD assistant plugin (skills only; not on npm) | [packages/claude-plugin/CLAUDE.md](packages/claude-plugin/CLAUDE.md) |
| `mcp-example` | `packages/mcp-example` | Example MCP server + the template for new ones | [packages/mcp-example/CLAUDE.md](packages/mcp-example/CLAUDE.md) |

Human-facing overview: [README.md](README.md). Add new MCP servers under `packages/mcp-<name>`.

## Everyday commands

```sh
pnpm install
pnpm exec nx show projects              # list projects
pnpm exec nx build <project>            # build one (mcp-example builds; the plugin is a noop)
pnpm exec nx run-many -t build          # build all
pnpm exec nx run-many -t lint --fix     # lint + autofix (also rewrites package deps — see below)
```

Prefer `pnpm exec nx ...` over calling tools directly, so Nx caching and task graph apply.

## Conventions that apply everywhere

- **Single-version dependency policy.** All external deps are declared **once** in the root
  [package.json](package.json). Packages do **not** hand-maintain their own `dependencies` — the
  `@nx/dependency-checks` ESLint rule derives them from actual imports and writes them into each
  package's `package.json` on `nx lint <pkg> --fix`. To add a dep: add it at the root, import it,
  then `lint --fix`.
- **TypeScript is strict.** `tsconfig.base.json` enables `strict`, `noUnusedLocals`,
  `noImplicitReturns`, `noImplicitOverride`, and more. Don't loosen these; fix the types.
- **Conventional commits.** Releases are automated from commit messages (`feat:`, `fix:`,
  `chore:`, …). A non-conventional message on a change that should ship a version won't trigger
  the right bump.
- **Independent releases via `nx release`.** Each project versions and tags independently as
  `{projectName}@{version}`. Don't hand-edit versions or changelogs — `nx release` owns them.
  MCP packages publish to npm; the plugin is `private` (see its nested `CLAUDE.md` for how its
  version propagates to three files). Details in [README.md](README.md#releasing-independent-versions).

## When you touch a package

1. Open that package's `CLAUDE.md` first — the two packages have different authoring models.
2. Never bump a `version` field by hand (release tooling owns it).
3. After changing TS source, run `nx lint <pkg> --fix` so derived deps stay correct.
