# mcp-apple-calendar — CLAUDE.md

The **Apple Calendar** MCP server — the **reference implementation** of the calendar
[capability contract](../../docs/contracts/calendar.md). Read the root
[CLAUDE.md](../../CLAUDE.md) and the [mcp-example CLAUDE.md](../mcp-example/CLAUDE.md) (the
template this package follows) first. Design context:
[ADR 0002](../../docs/adr/0002-calendar-connector-eventkit-reference.md).

## What it is

A conforming Calendar server for the brigid GTD skills. It exposes **only** the contract's
canonical tool (`find-events`), so skills detect it by signature. **Read-only** — there is no
write capability in this server, matching the contract's v1 scope.

## Why this package is different from mcp-todoist

Every other MCP server here is pure Node/TS. This one is not: Apple Calendar has no REST API, so
the server shells out to a **native JXA (JavaScript for Automation) shim** that bridges into macOS
EventKit — the same store `Calendar.app` reads, which transparently aggregates every account the
user has added (iCloud, Google, Exchange). This is a deliberate, ADR-recorded departure from the
repo's toolchain convention; see ADR 0002 for the trade-off against CalDAV/Google Calendar.

**This means the server is macOS-only.** It will not run (and should not be expected to run) on
Linux or Windows.

## Structure

- [`src/eventkit.ts`](src/eventkit.ts) — the only TS module that knows how to invoke the native
  shim; translates its JSON result into the contract's `Event` shape or throws.
- [`src/native/find-events.jxa.js`](src/native/find-events.jxa.js) — the JXA script, run via
  `osascript -l JavaScript`. **Not compiled by tsc** — copied verbatim to `dist` by the build (see
  the `assets` glob in `project.json`). Always emits exactly one line of JSON to stdout, even on
  failure (`{ok:false,reason,message}`), so the Node side never has to parse a stack trace.
- `src/index.ts` / `src/bin.ts` — the standard `createServer()` + stdio-runner split.

## Rules specific to this server

- **The contract is the spec.** Tool name, input shape, and guarantees come from
  [`docs/contracts/calendar.md`](../../docs/contracts/calendar.md). Don't invent shapes here —
  change the contract first (following its Evolution rules), then this server.
- **Empty means truly empty.** `find-events` must throw (surfacing as an MCP tool error) on any
  read failure — permission not granted, prompt timed out, no calendars — and must **never**
  return `events: []` for those cases. Only a genuinely successful, empty-result read returns `[]`.
  See the JXA shim's `reason` codes (`permission-denied`, `permission-timeout`, `no-calendars`,
  `bad-input`, `error`) and keep that distinction when touching this code.
- **Timezone-aware, always.** Timed events carry an ISO 8601 offset (via
  `NSISO8601DateFormatter` with `timeZone` explicitly set to `NSTimeZone.localTimeZone` — it does
  **not** default to local, don't remove that line). All-day events are a bare `YYYY-MM-DD`
  derived from `NSCalendar` date components, never from `Date` getters, to avoid DST/UTC boundary
  bugs.
- **Merge all calendars, no source field.** `calendarsForEntityType` results are passed as-is into
  one predicate; don't add a per-event calendar-name field without updating the contract first.
- **Permission requests must be bounded.** The shim waits up to 30s for the EventKit completion
  handler using JXA's global `delay()` (not `Application.currentApplication().delay` — that throws
  "Message not understood" in this bridging context). A prompt that never resolves is a timeout
  error, never an infinite hang.
- **stdout is JSON-RPC** on the Node side; diagnostics to stderr only (inherited rule).

## Configuration

None — no API token. The only requirement is the user granting Calendar access when macOS prompts
(first run only; persists afterward via TCC).
