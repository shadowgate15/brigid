# Calendar is the first non-task connector category, with a macOS-native EventKit reference server

The GTD `plan-day` skill needs the **hard landscape** — the day/time-specific commitments a
user has deliberately placed — which no task-manager capability can supply; today it degrades to
*asking* the user. We are adding **Calendar** as the first connector category beyond Task manager:
its own backend-neutral capability contract (`docs/contracts/calendar.md`), **read-only** in v1,
with a single windowed `find-events` capability returning full, timezone-aware events. The
reference server, `@brigid/mcp-apple-calendar`, reads **Apple Calendar via macOS EventKit** — a
deliberate departure from the repo's portable Node/TS-under-Nx convention.

## Considered options

- **EventKit (chosen).** Reads the same local store `Calendar.app` shows, so it transparently
  aggregates every account the user has added (iCloud, Google, Exchange), needs no credentials
  (one OS permission grant), and yields native timezone-aware times and an all-day flag. Cost:
  requires a native shim invoked from the Node server, and ties the reference server to macOS.
- **CalDAV against iCloud (rejected).** Stays pure Node/TS and is cross-platform, but reaches
  only iCloud calendars (not Google-in-Apple-Calendar), and iCloud CalDAV needs an app-specific
  password plus fiddly principal discovery.
- **Google Calendar REST (rejected).** Cleanest API, but it is not the user's calendar; Apple
  Calendar is. Neutrality is the *contract's* job, so the reference backend picks the local-native
  path rather than the most-portable one.

## Consequences

- **Read-only by design.** Writing to the calendar (event creation, time-blocking next actions)
  is intentionally out of scope; it becomes a future optional group if a skill needs it. In GTD
  the calendar is sacred territory — the assistant reads the hard landscape, it does not populate
  it.
- **Strict task/event boundary.** A task carrying a due date is *not* part of the hard landscape.
  `find-events` never synthesizes task due-dates into events; `plan-day` treats events as
  immovable scaffolding and tasks as flexible candidates, and never merges them.
- **Empty means truly-empty.** A permission-denied or unreadable calendar must surface as an
  explicit failure, never an empty `events[]`. A silent empty would let `plan-day` confidently
  plan across a day full of meetings it could not see — worse than no connector, because the user
  trusts a connected calendar. The failure degrades to the same "ask the user" path as an absent
  connector.
- **macOS-only reference.** The contract stays portable; the *reference implementation* does not.
  A future portable backend can conform without changing the contract.
