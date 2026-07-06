# Todoist contract for plan-day

- `find-tasks-by-date`: pull tasks due or scheduled for today.
- `find-tasks`: pull high-priority (`p1`/`p2`) next actions with no due date, as candidates to fill open time.
- `reschedule-tasks`: use this — not `update-tasks` — to move anything off today's plan to tomorrow or another day. `update-tasks` would destroy recurrence patterns on recurring tasks; `reschedule-tasks` preserves them and the existing time-of-day. Accepts `YYYY-MM-DD` or `YYYY-MM-DDTHH:MM:SS`.
- `complete-tasks`: mark something done the moment the user reports finishing it.
- `uncomplete-tasks`: use if the user says something was marked done by mistake.
- Do not use `update-tasks` for any date change in this skill.
