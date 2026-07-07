# Task manager usage for next-actions

Requires: **core**. Optional: **filters**, **projects-labels** (degrade when absent).

Tool shapes and guarantees live in the [task-manager contract](../../../../../docs/contracts/task-manager.md).
This file only records how next-actions uses them. This skill is **read-only** — never call
`add-tasks`, `update-tasks`, or `complete-tasks` here; route creation to `process-inbox` and
completion/rescheduling to `plan-day`.

## Querying (`find-tasks`)

Use the structured filter, so the backend does the work — never pull everything and filter yourself:

- `labels`: the matched context label(s), e.g. `["@calls"]`.
- `excludeLabels`: always exclude `["@waiting-for", "@someday"]` — not actionable right now.
- `sort`: `"priority"` so `p1` items lead.

**projects-labels group:** when present, call `find-labels` first to confirm the exact context-label
name (users vary — `@calls` vs `@phone`). When absent, use the label the user stated verbatim.

## Reusing saved views (`find-filters`)

**filters group:** when present, prefer an existing saved filter (e.g. "Today", "@computer") over an
ad-hoc query — call `find-filters` and match by name. If a saved filter fits, you may pass its query
through `find-tasks`'s `rawFilter` escape hatch. When the group is absent, just build the structured
query above.
