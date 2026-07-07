# brigid

The brigid GTD plugin and its MCP servers. This glossary fixes the language for how
skills reach the outside tools (task managers, calendars, …) they act through.

## Language

**Connector**:
A tool integration a skill can use in the current session. Turned on or off entirely by
the user's own environment settings; the plugin never bundles one.
_Avoid_: integration, plugin, backend (as a synonym)

**Task manager**:
The connector category for task, project, and label tools. Todoist is one _backend_ for it.
_Avoid_: to-do app, task tool

**Backend**:
A concrete product behind a connector category (e.g. Todoist behind Task manager).
_Avoid_: provider, vendor

**Capability contract**:
The written spec that defines the tool capabilities a conforming task-manager MCP must
expose for skills to use it. The "interface" we design; skills target it, servers implement it.
_Avoid_: interface, API, schema, port

**Conforming server / conformance**:
A task-manager MCP whose tools satisfy the capability contract, so skills detect and use it.

**Reference implementation**:
The task-manager MCP this repo ships and maintains as the canonical conforming server.
It is an example of the contract, not the only allowed backend.

**Capability group**:
A named cluster of related capabilities in the contract that a server implements and
advertises as a unit (e.g. `filters`, `analytics`). Skills detect and degrade per group.

**Core**:
The one required capability group — task create/query/update/complete/reschedule. A server
must implement Core to be _conforming_ at all; every other group is optional.

**Structured filter**:
The small, backend-neutral set of query parameters skills use to find tasks (labels,
excludeLabels, project, date/dateRange, sort). A conforming server maps these onto its
backend's own query language.
_Avoid_: filter string, query DSL (those name the backend-native form)

**Signature**:
The recognizable tool-name pattern a skill matches on to detect that a conforming connector
is present in the session.

**Manual fallback**:
The conversational mode a skill runs in when no conforming connector is detected — it does
the work in chat instead of writing to a tool.

**Calendar**:
The connector category for a user's committed schedule — the tools that read the events they
have deliberately placed on specific days and times. A second connector category alongside Task
manager; it has its own capability contract.
_Avoid_: schedule app, agenda

**Hard landscape**:
The set of commitments fixed to a specific day or time — what lives on the Calendar. It is
_immovable scaffolding_ a plan is built around, categorically distinct from the flexible
next-action lists a skill draws candidates from. A task carrying a due date is **not** part of
the hard landscape.
_Avoid_: schedule, commitments (unqualified)

**Event**:
One entry on the Calendar: a titled commitment with a start and end. It is **day-specific**
(all-day — must happen that day, no fixed time) or **time-specific** (a start/end time). This
day-specific vs time-specific split is the load-bearing distinction in the Event shape.
_Avoid_: appointment, meeting (those are kinds of event, not the category)
