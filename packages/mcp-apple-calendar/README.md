# @brigid/mcp-apple-calendar

A read-only Apple Calendar [Model Context Protocol](https://modelcontextprotocol.io) (MCP) server.
It is the **reference implementation** of brigid's
[calendar capability contract](../../docs/contracts/calendar.md) — it exposes only the tool the
brigid GTD skills need (`find-events`), using the contract's canonical tool name so the skills
detect and use it automatically.

**macOS only.** It reads Apple Calendar via macOS **EventKit** — the same store `Calendar.app`
shows, so it sees every account you've added there (iCloud, Google, Exchange, …). See
[ADR 0002](../../docs/adr/0002-calendar-connector-eventkit-reference.md) for why.

## Conformance

| Capability group | Status |
|---|---|
| **Core** (`find-events`, read-only) | ✅ implemented |

Write (event creation/moves) is intentionally out of scope for v1 — see the contract and ADR 0002.

## Permissions

No API token or configuration is needed. The first time `find-events` runs, macOS will prompt you
to grant Calendar access to whatever process is invoking the server; grant it in the dialog, or
after the fact via **System Settings → Privacy & Security → Calendars**. Access persists across
runs once granted.

If access is denied, not yet granted, or the prompt times out, `find-events` returns an explicit
tool error — it never reports an empty calendar as a way of papering over a permission problem.

## Structure

- `src/index.ts` — `createServer()`, the reusable/testable server factory (registers `find-events`, no transport).
- `src/bin.ts` — the executable entry (`bin`), which attaches the stdio transport and runs the server.
- `src/eventkit.ts` — the Node-side bridge to the native shim; translates its output into the contract's `Event` shape.
- `src/native/find-events.jxa.js` — the JXA (JavaScript for Automation) script that bridges into macOS EventKit. Not compiled by tsc; copied to `dist` as a build asset.

## Develop

```sh
nx build mcp-apple-calendar        # compile to dist/packages/mcp-apple-calendar
nx lint mcp-apple-calendar --fix    # lint + sync package.json deps from the root (single-version policy)
```

## Run

After building, launch the server over stdio (macOS only):

```sh
node dist/packages/mcp-apple-calendar/src/bin.js
```

Or, once published, via `npx @brigid/mcp-apple-calendar`.
