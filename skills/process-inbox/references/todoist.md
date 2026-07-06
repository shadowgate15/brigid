# Todoist contract for process-inbox

Use these exact tools when the Todoist connector is detected.

## Creating next actions

Use `add-tasks` (max 25 per call). For each clarified next action:

- `content`: the concrete physical action, verb-first (e.g. "Call dentist to reschedule cleaning").
- `priority`: `p1`–`p4` as strings only (`p1` highest, `p4`/default lowest). Don't over-assign `p1` — reserve it for genuinely time-critical items.
- `labels`: the GTD context, e.g. `@calls`, `@computer`, `@errands`, `@home`, `@agenda`, `@waiting-for`, `@someday`. Use `find-labels` first to reuse existing labels rather than creating near-duplicates; use `add-labels` only if the needed context label doesn't exist yet.
- `dueString`: only set if there's a real external deadline (natural language like "next Friday"). Leave unset for ordinary next actions — GTD next-action lists aren't scheduled by default.
- `deadlineDate`: use instead of `dueString` for a hard immovable constraint (ISO 8601, e.g. "2025-12-31").
- `project_id`: attach to the right project if one exists; use `find-projects` to look it up.

## Creating projects

Use `add-projects` when an item needs multiple steps. Immediately follow with `add-tasks` for that project's first next action, using the new project's ID.

## Delegated / waiting-for items

Create via `add-tasks` with label `@waiting-for`. Put who it's delegated to and what was asked in `content` (e.g. "Waiting for Sam to send Q3 numbers"). Optionally set `dueString` to a follow-up check-in date, not a deadline for the other person.

## Someday/Maybe

Create via `add-tasks` with label `@someday` and no `dueString`. These get reviewed in `weekly-review`, not surfaced in day-to-day next-action lists.

## Reference / non-actionable

Todoist has no reference/notes store. Don't create a task for pure reference material — tell the user to file it in their own notes app instead.
