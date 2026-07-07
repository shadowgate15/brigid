# mcp-todoist — CLAUDE.md

The lean **Todoist** MCP server — the **reference implementation** of the task-manager
[capability contract](../../docs/contracts/task-manager.md). Read the root
[CLAUDE.md](../../CLAUDE.md) and the [mcp-example CLAUDE.md](../mcp-example/CLAUDE.md) (the template
this package follows) first.

## What it is

A conforming task-manager server for the brigid GTD skills. It exposes **only** the contract's
canonical tools, under their exact names, so skills detect it by signature. It is *a* backend, not a
privileged one — the contract, not this server, is the interface.

## Rules on top of the mcp-example pattern

- **The contract is the spec.** Tool names, input shapes, and the guarantees each tool must uphold
  come from [`docs/contracts/task-manager.md`](../../docs/contracts/task-manager.md). Don't invent
  tool names or drift shapes here — change the contract first (following its Evolution rules), then
  this server.
- **Canonical names only.** Register tools under the bare contract names (`find-tasks`, not a
  prefixed or renamed variant). The session prefix is added by the host.
- **Structured filters translate here.** Skills send the neutral `StructuredFilter`; this server is
  the only place that knows Todoist's filter DSL. Keep that translation in `src/todoist.ts`.
- **Scope is tiered.** v1 implements **Core**. Optional groups (`projects-labels`, `filters`,
  `analytics`) are added group-by-group; `analytics` is intentionally deferred.
- **Token from the environment.** `TODOIST_API_TOKEN`. Never log it; never read config from stdin.
- **stdout is JSON-RPC.** Diagnostics go to stderr only (inherited rule — see mcp-example).
