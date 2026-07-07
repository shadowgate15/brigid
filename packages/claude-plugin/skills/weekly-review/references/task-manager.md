# Task manager usage for weekly-review

Requires: **core**. Optional: **projects-labels**, **filters**, **analytics** (degrade each when absent).

Tool shapes and guarantees live in the [task-manager contract](../../../../../docs/contracts/task-manager.md).
This file only records how weekly-review uses them.

## Get Current (Step 3)

- **Orientation.** **analytics group:** `get-overview` for a workspace snapshot. **Degrade (analytics
  absent — the default with the brigid Todoist server):** build the snapshot from `find-projects` +
  `find-tasks` (counts of active projects, open/overdue tasks).
- **Project list.** **projects-labels group:** `find-projects` to list active projects; for each, a
  `find-tasks` with `project` set confirms at least one open next action. Flag any project with none
  as stalled. **Degrade (projects-labels absent):** ask the user to name their active projects.
- **Stalled items.** `find-tasks` (Core) for tasks with no due date, sorted `priority`, to spot
  neglected next actions.
- **Waiting-for.** `find-tasks` with `labels: ["@waiting-for"]` — review delegated items and whether
  any need a follow-up nudge.
- **What got done.** **filters group:** `find-completed-tasks` (with a `since` of one week ago) for
  reflection. **Degrade (filters absent):** ask the user what they finished this week.
- **Health.** **analytics group:** `get-project-health` / `get-productivity-stats` if present.
  **Degrade:** infer stalled/at-risk projects from the project + next-action data above; derive
  completion trends from `find-completed-tasks`.

## Get Creative (Step 4)

- **Someday/maybe.** `find-tasks` with `labels: ["@someday"]` — pull the full list for review. To
  activate something, follow the `process-inbox` reference for turning it into a project or next
  action (`add-tasks`, `add-projects`).

## Calendar

There is no calendar connector in this plugin version. If the user wants a calendar review, ask them
to summarize their past/upcoming week directly — don't claim to see calendar data that isn't connected.
