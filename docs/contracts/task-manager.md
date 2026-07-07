# Task-manager capability contract

The interface between brigid's GTD skills and any task-manager backend. Skills target this
contract; a **conforming server** implements it; `@brigid/mcp-todoist` is the
**reference implementation**. See [ADR 0001](../adr/0001-task-manager-capability-contract.md)
for why the seam is a detect-and-conform contract rather than a bundled or proxy server, and
[CONTEXT.md](../../CONTEXT.md) for the vocabulary used here.

> This document grows additively. Core is specified in full below; each optional group is
> specified in its own section as it is implemented.

## Detection convention

A session exposes MCP tools under a per-server prefix: `mcp__<server-id>__<name>`. This contract
fixes the **suffix** (`<name>`); the prefix is whatever server provides it. A skill detects a
capability by testing whether a tool with the matching suffix is present in the session — a plain
string check, nothing more. Servers advertise a capability purely by exposing tools with the
canonical names.

## Tiered conformance

Capabilities are grouped. A server is **conforming** if it implements **Core**; every other group
is optional and detected independently.

| Group | Status | Tools |
|---|---|---|
| **Core** | required | `add-tasks`, `find-tasks`, `update-tasks`, `complete-tasks`, `uncomplete-tasks`, `reschedule-tasks` |
| `projects-labels` | optional | `find-projects`, `add-projects`, `find-labels`, `add-labels` |
| `filters` | optional | `find-filters`, `find-completed-tasks` |
| `analytics` | optional | `get-overview`, `get-project-health`, `get-productivity-stats` |

A **group is available** to a skill when the tool-name signatures for that group are present in the
session. Skills detect each group they use and **degrade per group**: a missing optional group means
that skill does without it (computes an approximation, skips a refinement, or asks the user), not
that the whole task manager is treated as absent.

## Manual fallback

When **Core** is not detected at all, a skill must fall back to **manual mode** — doing the work
conversationally rather than writing to a tool. A missing task manager is never framed as an error;
the skills still function, just without persistence.

## Evolution

The contract is **unversioned**. There is no handshake to negotiate — the tool-name signatures *are*
the compatibility surface. Therefore:

- **Additive change** → introduce a **new optional group** (or add a tool to an optional group). Core
  is left untouched, so every existing server keeps conforming.
- **Incompatible change** to a capability → give it a **new tool name**. Servers that only expose the
  old name simply won't match the new signature and degrade cleanly.

Never repurpose an existing tool name for incompatible behavior.

## Structured filter

Task queries use a small, backend-neutral filter object rather than a backend-native query string.
A conforming server maps these onto its own query language (the reference server translates them to
Todoist's filter syntax).

```
StructuredFilter {
  labels?:        string[]   // include tasks carrying ALL of these context labels
  excludeLabels?: string[]   // exclude tasks carrying ANY of these labels
  project?:       string     // restrict to this project (id or name)
  date?:          string     // YYYY-MM-DD — tasks due/scheduled on this day
  dateRange?:     { from: string, to: string }  // inclusive YYYY-MM-DD span
  sort?:          "priority" // ordering hint; "priority" = p1 first
}
```

`date` and `dateRange` are mutually exclusive. Omitting every field means "no filter" (all open
tasks). A server that also supports a raw backend-native filter string exposes that through the
optional `filters` group, not here — this object stays neutral.

## Shared value shapes

- **Task id** — an opaque, backend-assigned string. Skills pass ids back verbatim; they never
  construct or parse them.
- **Priority** — the strings `p1`–`p4`, where `p1` is highest and `p4` is the default/lowest.
  Integers are not part of the contract.
- **Due** — a value with at least a `date` (`YYYY-MM-DD`), and, when the backend supports it, an
  indication of whether the task is `recurring` and an optional time-of-day.

## Core

Task create, query, and lifecycle. Required for conformance.

### `add-tasks`

Create one or more tasks in a single call.

- **In:** `tasks: Task[]`, each with `content` (required — the concrete, verb-first next action) and
  optional `description`, `priority` (`p1`–`p4`), `labels` (string[]), `dueString` (natural-language
  due, e.g. "next Friday"), `deadlineDate` (`YYYY-MM-DD`, a hard immovable constraint), `project`
  (id or name).
- **Out:** the created tasks, each with at least `{ id, content }`.
- **Guarantee:** creation is batched; a task with no `dueString`/`deadlineDate` is created unscheduled.
  `dueString` sets a movable due date; `deadlineDate` sets an immovable one — they are distinct.

### `find-tasks`

Query open tasks with a [structured filter](#structured-filter).

- **In:** the `StructuredFilter` fields (all optional).
- **Out:** `tasks[]`, each with at least `{ id, content, priority, due, labels }`.
- **Guarantee:** filtering (labels, exclusions, project, date, sort) is applied **server-side** — a
  skill never has to pull everything and re-filter. `find-tasks` subsumes any "by date" query via
  `date`/`dateRange`; there is no separate date tool.

### `update-tasks`

Modify existing tasks' non-schedule fields.

- **In:** `id` (required) plus any of `content`, `description`, `priority`, `labels`, `deadlineDate`.
- **Out:** the updated task, at least `{ id }`.
- **Guarantee:** `update-tasks` **must not** be used to move a task's due date — that would destroy
  recurrence. Date moves go through `reschedule-tasks`. A server should reject or ignore a due-date
  change here.

### `complete-tasks`

Mark tasks done.

- **In:** `ids: string[]`.
- **Out:** confirmation per id.
- **Guarantee:** completing a recurring task advances it to its next occurrence rather than deleting
  the series (backend-defined next-occurrence semantics).

### `uncomplete-tasks`

Reopen tasks completed by mistake.

- **In:** `ids: string[]`.
- **Out:** confirmation per id.
- **Guarantee:** the inverse of `complete-tasks` for a non-recurring completion; restores the task to
  open.

### `reschedule-tasks`

Move tasks' due dates.

- **In:** `ids: string[]`, `date` (`YYYY-MM-DD` or `YYYY-MM-DDTHH:MM:SS`).
- **Out:** the rescheduled tasks, at least `{ id, due }`.
- **Guarantee:** **preserves recurrence patterns and the existing time-of-day.** This is the only
  contract tool permitted to change a due date. Always use it — never `update-tasks` — for date moves.

## projects-labels (optional)

Structural organization: the projects tasks belong to and the context labels they carry. Skills use
this group to file tasks correctly and to reuse existing structure rather than creating duplicates.
Detected independently of Core; when absent, a skill still creates tasks (just without project/label
lookups) or falls back to asking the user.

### `find-projects`

List the active projects.

- **In:** none.
- **Out:** `projects[]`, each with at least `{ id, name }`.
- **Guarantee:** returns the currently active projects so a skill can resolve a name to file under.

### `add-projects`

Create one or more projects.

- **In:** `projects: Project[]`, each with `name` (required) and optional `parent` (id or name of a
  parent project).
- **Out:** the created projects, each with at least `{ id, name }`.
- **Guarantee:** batched creation. A skill that creates a project for a multi-step outcome should
  follow up with `add-tasks` using the returned project id for the first next action.

### `find-labels`

List the existing context labels.

- **In:** none.
- **Out:** `labels[]`, each with at least `{ name }`.
- **Guarantee:** returns existing labels so a skill reuses them rather than creating near-duplicates.
  A leading `@` is display sugar; label names are returned and accepted without it.

### `add-labels`

Create one or more context labels.

- **In:** `names: string[]`.
- **Out:** the created labels, each with at least `{ name }`.
- **Guarantee:** batched. Use only after `find-labels` shows the needed label doesn't already exist.
  A leading `@` is normalized away.

## filters (optional)

Saved queries and completed history — the parts of a task manager beyond the live open-task list.
Detected independently; when absent, a skill does without saved filters and reconstructs "what got
done" from whatever it can, or asks the user.

### `find-filters`

List the user's saved filters.

- **In:** none.
- **Out:** `filters[]`, each with at least `{ name, query }`.
- **Guarantee:** returns the user's saved filter definitions so a skill can prefer an existing curated
  view over building an ad-hoc query.

### `find-completed-tasks`

Query recently completed tasks.

- **In:** optional `since` / `until` (`YYYY-MM-DD`), `project` (id or name), `limit`.
- **Out:** `tasks[]`, each with at least `{ id, content, completedAt }`.
- **Guarantee:** returns tasks completed in the window, most useful for reflection/review. Distinct
  from `find-tasks`, which only sees open tasks.

### Raw filter escape hatch

A server advertising the `filters` group **may** also accept an optional `rawFilter` string on
[`find-tasks`](#find-tasks): a backend-native query passed straight through, bypassing the neutral
[structured filter](#structured-filter). It is a power-user escape hatch — skills should prefer the
structured fields and only reach for `rawFilter` when a query genuinely can't be expressed neutrally.
When present, `rawFilter` takes precedence over the structured fields.
