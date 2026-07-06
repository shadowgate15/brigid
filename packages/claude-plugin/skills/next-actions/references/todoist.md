# Todoist contract for next-actions

- `find-labels`: confirm the exact context label names in use (e.g. `@calls`, `@computer`) before querying, since label naming can vary per user.
- `find-tasks`: query by the matched context label, excluding `@waiting-for` and `@someday`. Use Todoist's filter/search syntax via the `search` parameter where supported (e.g. `@calls & !@waiting-for`) instead of pulling everything and filtering client-side.
- `find-filters`: if the user has saved Todoist filters (e.g. "Today", "@computer"), prefer reusing those over building an ad hoc query.
- Sort results by `priority` (`p1` first) within the filtered set before presenting.
- Do not call `add-tasks`, `update-tasks`, or `complete-tasks` from this skill — it's read-only surfacing. Route creation to `process-inbox` and completion/rescheduling to `plan-day`.
