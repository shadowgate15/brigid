# Task-manager backends integrate via a detect-and-conform capability contract

The GTD skills need task-manager tools (Todoist today, others later) without the plugin
bundling or proxying an MCP server. We decided the skill/backend seam is a written
**capability contract**: a spec of canonical tool names + thin behavioral shapes that a
conforming MCP server implements, and that skills detect in-session by tool-name signature
(the `mcp__*__` suffix), falling back to conversational manual mode when no conforming
server is present. Our own lean `mcp-todoist` is the *reference implementation* of this
contract, not a privileged component. We chose this over the two obvious alternatives —
building a normalizing **adapter/proxy MCP server** (rejected: it adds a runtime layer the
plugin deliberately never bundles, and can't reach a backend the user hasn't also connected)
and having the plugin **bundle its own MCP** (rejected: same bundling objection, and it
forecloses bring-your-own-backend).

## Consequences

- **Canonical tool names, not abstract capabilities.** Detection stays a string match, which
  is the only thing reliably doable from markdown skills. Bring-your-own means "expose these
  names" (or run a thin shim); it does not mean the skills infer a mapping at runtime.
- **Tiered conformance.** A required **Core** group (task CRUD + query) plus independently
  detected optional groups (`projects-labels`, `filters`, `analytics`). A minimal backend that
  does only Core still counts as conforming; skills degrade per missing group rather than
  all-or-nothing.
- **Backend-neutral structured queries.** The query capability is a small fixed set of
  structured filters, not a backend-native filter string, so the contract doesn't smuggle
  Todoist's DSL into a supposedly neutral interface. The reference server translates them.
- **Unversioned, additive evolution.** No handshake exists in markdown detection, so the
  tool-name signatures *are* the compatibility surface: additive changes introduce a new
  optional group; incompatible changes introduce new tool names. Old servers keep conforming
  to whatever they match.
