# Task manager usage for process-inbox

Requires: **core**, and **projects-labels** (optional — degrade when absent).

Tool shapes and guarantees live in the [task-manager contract](../../../../../docs/contracts/task-manager.md).
This file only records how process-inbox uses them.

## Creating next actions (`add-tasks`)

For each clarified next action:

- `content`: the concrete physical action, verb-first (e.g. "Call dentist to reschedule cleaning").
- `priority`: `p1`–`p4` (`p1` highest, `p4`/default lowest). Don't over-assign `p1` — reserve it for
  genuinely time-critical items.
- `labels`: the GTD context, e.g. `@calls`, `@computer`, `@errands`, `@home`, `@agenda`,
  `@waiting-for`, `@someday`. **projects-labels group:** call `find-labels` first to reuse an existing
  label rather than creating a near-duplicate; use `add-labels` only if the needed context doesn't
  exist yet. When the group is absent, just apply the label name and let the backend create it, or ask
  the user to confirm the context.
- `dueString`: only for a real external deadline (natural language like "next Friday"). Leave unset
  for ordinary next actions — GTD lists aren't scheduled by default.
- `deadlineDate`: a hard immovable constraint (`YYYY-MM-DD`) — use instead of `dueString` for that.
- `project`: file under the right project. **projects-labels group:** use `find-projects` to look one
  up. When the group is absent, skip project filing.

## Creating projects (`add-projects`)

Part of the **projects-labels** group. Use `add-projects` when an item needs multiple steps, then
immediately follow with `add-tasks` for that project's first next action, using the returned project
id. When the group is absent, track the multi-step outcome as a single task and note the follow-ups in
its description instead.

## Delegated / waiting-for items

`add-tasks` with label `@waiting-for`. Put who it's delegated to and what was asked in `content`
(e.g. "Waiting for Sam to send Q3 numbers"). Optionally set `dueString` to a follow-up check-in date,
not a deadline for the other person.

## Someday/Maybe

`add-tasks` with label `@someday` and no `dueString`. These get reviewed in `weekly-review`, not
surfaced in day-to-day next-action lists.

## Reference / non-actionable

There is no reference/notes connector in this plugin version. Don't create a task for pure reference
material — tell the user to file it in their own notes app instead.
