# Task manager usage for plan-day

Requires: **core** (task create/query/lifecycle).

Tool shapes and guarantees live in the [task-manager contract](../../../../../docs/contracts/task-manager.md).
This file only records how plan-day uses them.

## Pulling candidates (Step 3)

- Tasks due/scheduled today: `find-tasks` with `date` set to today (`YYYY-MM-DD`). This replaces the
  old `find-tasks-by-date` tool — the date filter is built into `find-tasks`.
- Fill-in candidates: a second `find-tasks` for high-priority (`p1`/`p2`) actions with no due date,
  sorted `priority`.
- Don't pull the whole backlog — only today's tasks plus the high-priority unscheduled set.

## In-the-moment updates (Step 6)

- Finished something → `complete-tasks`.
- Marked done by mistake → `uncomplete-tasks`.
- Moving something off today → `reschedule-tasks` (never `update-tasks` for a date change — that
  would destroy recurrence; `reschedule-tasks` preserves recurrence and time-of-day). Accepts
  `YYYY-MM-DD` or `YYYY-MM-DDTHH:MM:SS`.
