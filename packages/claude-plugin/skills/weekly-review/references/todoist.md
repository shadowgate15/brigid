# Todoist contract for weekly-review

## Get Current

- `get-overview`: pull a snapshot of the workspace to orient the review.
- `find-projects`: list all active projects.
- `find-tasks`: for each project, check for at least one open next action. Also query broadly for tasks with no due date and no recent activity to spot stale items.
- `find-tasks` with label `@waiting-for`: review delegated items; check if any need a follow-up nudge based on how long they've sat.
- `find-completed-tasks`: review what actually got done this week — useful for the "empty the head" and reflection steps.
- `get-productivity-stats`: optional, use if the user wants a completion-trend view.
- `analyze-project-health` / `get-project-health`: use if available to flag stalled or at-risk projects directly rather than inferring it manually.

## Get Creative

- `find-tasks` with label `@someday`: pull the full someday/maybe list for review. For anything the user wants to activate, follow the `process-inbox` reference for converting it into a project or next action (`add-tasks`, `add-projects`).

## Calendar

Todoist has no calendar connector in this plugin version. If the user wants calendar review, ask them to summarize their past/upcoming week directly — don't claim to see calendar data that isn't connected.
