# Calendar capability contract

The interface between brigid's GTD skills and any calendar backend. Skills target this contract;
a **conforming server** implements it; `@brigid/mcp-apple-calendar` is the **reference
implementation**. See [ADR 0002](../adr/0002-calendar-connector-eventkit-reference.md) for why
this connector is read-only in v1 and why the reference server reads Apple Calendar via macOS
EventKit, and [CONTEXT.md](../../CONTEXT.md) for the vocabulary used here (**Calendar**, **Hard
landscape**, **Event**).

> This document grows additively. The one required group is specified in full below; optional
> groups (write, free/busy, per-calendar selection) join later, each in its own section, following
> the same evolution policy as the task-manager contract.

## Detection convention

Identical to the task-manager contract: a session exposes MCP tools under a per-server prefix
(`mcp__<server-id>__<name>`). This contract fixes the **suffix**; a skill detects the capability by
testing whether a tool with that suffix is present in the session — a plain string check.

## Tiered conformance

| Group | Status | Tools |
|---|---|---|
| **Core** | required | `find-events` |
| _(future)_ write | not yet specified | — |
| _(future)_ free-busy | not yet specified | — |

v1 has exactly one group, and it is read-only. A server is **conforming** if it implements Core.
Write capability (creating or moving events) and a lighter-weight free/busy query are anticipated
future optional groups — see [ADR 0002](../adr/0002-calendar-connector-eventkit-reference.md) for
why write is deliberately out of scope for v1.

## Manual fallback

When **Core** is not detected at all, a skill falls back to **manual mode** — asking the user
directly for their fixed commitments rather than reading a calendar. A missing Calendar connector
is never framed as an error; skills still function, just without this input.

## Evolution

Unversioned and additive, identical policy to the task-manager contract:

- **Additive change** → a new optional group (or a new tool in one). Core is untouched.
- **Incompatible change** to a capability → a new tool name. Servers exposing only the old name
  keep conforming to what they match.

Never repurpose an existing tool name for incompatible behavior.

## Shared value shapes

### Event

The one entry shape this contract returns. See **Event** in [CONTEXT.md](../../CONTEXT.md) for the
domain definition (day-specific vs time-specific hard landscape).

```
Event {
  id:        string    // opaque, backend-assigned
  title:     string
  start:     string     // timed: ISO 8601 WITH UTC offset; all-day: bare YYYY-MM-DD
  end:       string     // same format as start
  allDay:    boolean    // selects which of the two start/end formats above applies
  location?: string     // optional; feeds a skill's context reasoning
}
```

`status` (tentative/confirmed) and `recurring` are deliberately **not** part of the v1 shape — no
skill acts on them yet. They can join additively later without breaking existing servers.

### Timezone handling

Timed events carry their `start`/`end` as ISO 8601 timestamps **with a UTC offset**
(e.g. `2026-07-06T14:00:00-05:00`) — never a bare/naive timestamp. All-day events carry a bare
`YYYY-MM-DD` with no time component and no offset; `allDay: true` is what tells a skill to read
`start`/`end` as dates, not instants. A `find-events` window (`date` / `dateRange`) is interpreted
in the user's **calendar-local** day, i.e. the system's local timezone on the machine the reference
server runs on.

## Core

Read the hard landscape. Required for conformance. Read-only — no capability in this group
creates or modifies an event.

### `find-events`

Query events overlapping a date window.

- **In:** exactly one of `date` (`YYYY-MM-DD`) or `dateRange` (`{ from: string, to: string }`,
  inclusive `YYYY-MM-DD` bounds). Mutually exclusive; one is **required** — unlike the
  task-manager's `find-tasks`, there is no "omit everything" case, since an unbounded "every event
  ever" query has no use here.
- **Out:** `events: Event[]`.
- **Guarantee:**
  - Returns every event **overlapping** the window (a multi-day all-day event or a timed event
    that starts before and ends inside the window is included), computed server-side.
  - Merges all of the user's visible/authorized calendars into one stream. There is no
    calendar-of-origin field on an `Event` in v1 (see [ADR 0002](../adr/0002-calendar-connector-eventkit-reference.md)) —
    a per-calendar selection group is a possible future addition, not this one.
  - **Empty means truly empty.** `events: []` asserts the read succeeded and nothing is scheduled
    in the window. A server that cannot read the calendar (permission not granted, no authorized
    calendars, or any other read failure) **must** return an explicit tool error — never an empty
    list. A skill must never treat a read failure as "day is clear."
