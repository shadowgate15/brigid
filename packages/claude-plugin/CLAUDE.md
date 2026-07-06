# claude-plugin — CLAUDE.md

The **brigid** GTD (Getting Things Done) personal-assistant plugin. Read the root
[CLAUDE.md](../../CLAUDE.md) first for repo-wide rules. Human overview: [README.md](README.md).

## What makes this project different

It is **not an npm package** — it ships only Claude skills. There is no build step
(`nx-release-publish` is a noop) and no runtime code to compile. The unit of work here is a
**skill**, authored in Markdown.

## Version lives in three files (kept in sync automatically)

Do **not** hand-edit any of these — `nx release` propagates the version via a custom action
([`tools/nx/claude-plugin-version-actions.js`](../../tools/nx/claude-plugin-version-actions.js)):

1. `package.json` — the source of truth Nx bumps.
2. `.claude-plugin/plugin.json` — the plugin manifest.
3. root `.claude-plugin/marketplace.json` — the marketplace entry (matched by plugin name).

## Skill anatomy

Each skill is a directory under `skills/<name>/`:

- `SKILL.md` — frontmatter (`name`, `description`, `metadata.version`) + step-by-step instructions.
  The `description` is a triggering prompt: write it as "This skill should be used when the user
  asks …" with concrete example phrasings, because that text is what routes user requests here.
- `references/` — connector-specific instructions loaded **on demand**, not up front. This is the
  plugin's own progressive-disclosure: `SKILL.md` detects what's connected, then reads only the
  matching reference file (e.g. `references/todoist.md`) or `references/manual-fallback.md`.

Existing skills: `process-inbox`, `weekly-review`, `next-actions`, `plan-day`, `gtd-connectors`.

## Core design rule: no bundled connectors

This plugin ships **no `.mcp.json` and no bundled MCP servers.** Each skill detects, at runtime,
which tools already exist in the session (by matching `mcp__*__` tool-name signatures) and loads
the matching connector reference. If nothing matches, it falls back to a manual, conversational
mode — a missing connector is **never** an error. Keep this contract: don't add hard tool
dependencies, and don't make a skill fail when a connector is absent.

Currently supported connector: **Todoist** (task manager). Calendar / notes / email are
anticipated in the design but not implemented.

## Adding a new connector

1. Add `references/<connector>.md` to each skill that should use it, mirroring `todoist.md`.
2. Add its detection signature (the `mcp__*__` tool names) to the relevant skills' Step 1 and to
   the `gtd-connectors` skill's known-signatures list.
3. Keep the manual fallback working regardless.

## Adding a new skill

Create `skills/<name>/SKILL.md` following the frontmatter + numbered-steps pattern of an existing
skill; add `references/` only if it needs connector-specific behavior.
