/**
 * Thin Todoist REST v2 client and the structured-filter -> Todoist-filter translation.
 *
 * This module is the ONLY place that knows Todoist's wire format and filter DSL; the tools in
 * index.ts speak the neutral capability-contract shapes. See
 * docs/contracts/task-manager.md for the contract this implements.
 */

const API_BASE = 'https://api.todoist.com/rest/v2';
const SYNC_BASE = 'https://api.todoist.com/sync/v9';

/** Contract priorities are p1 (highest) .. p4 (default). Todoist's API is 4 (highest) .. 1. */
const PRIORITY_TO_API: Record<Priority, number> = { p1: 4, p2: 3, p3: 2, p4: 1 };
const API_TO_PRIORITY: Record<number, Priority> = { 4: 'p1', 3: 'p2', 2: 'p3', 1: 'p4' };

export type Priority = 'p1' | 'p2' | 'p3' | 'p4';

export interface StructuredFilter {
  labels?: string[];
  excludeLabels?: string[];
  project?: string;
  date?: string;
  dateRange?: { from: string; to: string };
  sort?: 'priority';
  /** filters group: backend-native query passed through, bypassing the structured fields. */
  rawFilter?: string;
}

export interface CompletedQuery {
  since?: string;
  until?: string;
  project?: string;
  limit?: number;
}

export interface SavedFilter {
  name: string;
  query: string;
}

export interface CompletedTask {
  id: string;
  content: string;
  completedAt: string;
}

export interface TaskInput {
  content: string;
  description?: string;
  priority?: Priority;
  labels?: string[];
  dueString?: string;
  deadlineDate?: string;
  project?: string;
}

export interface TaskPatch {
  id: string;
  content?: string;
  description?: string;
  priority?: Priority;
  labels?: string[];
  deadlineDate?: string;
}

/** The minimum-guaranteed task shape the contract promises to skills. */
export interface ContractTask {
  id: string;
  content: string;
  priority: Priority;
  due: { date: string; recurring: boolean; datetime?: string } | null;
  labels: string[];
  project: string | null;
}

/** Raw Todoist REST task fields this client reads. */
interface TodoistTask {
  id: string;
  content: string;
  priority: number;
  labels?: string[];
  project_id?: string;
  due?: { date: string; is_recurring?: boolean; datetime?: string } | null;
}

interface TodoistProject {
  id: string;
  name: string;
}

interface TodoistLabel {
  id: string;
  name: string;
}

export interface ContractProject {
  id: string;
  name: string;
}

export interface ContractLabel {
  name: string;
}

export interface ProjectInput {
  name: string;
  parent?: string;
}

/** A leading "@" is display sugar; Todoist stores label names without it. */
function bareLabel(label: string): string {
  return label.replace(/^@/, '');
}

/** Shift a YYYY-MM-DD date by whole days, in UTC, to build inclusive range bounds. */
function shiftDay(iso: string, delta: number): string {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + delta);
  return d.toISOString().slice(0, 10);
}

const isNumericId = (value: string): boolean => /^\d+$/.test(value);

/**
 * Translate a neutral StructuredFilter into a Todoist filter string plus (when a numeric project
 * id is given) a separate `project_id` query param — ids can't go in the filter DSL.
 */
function buildQuery(filter: StructuredFilter): { filter?: string; project_id?: string } {
  // Raw escape hatch (filters group) wins over the structured fields.
  if (filter.rawFilter) return { filter: filter.rawFilter };

  const parts: string[] = [];
  for (const label of filter.labels ?? []) parts.push(`@${bareLabel(label)}`);
  for (const label of filter.excludeLabels ?? []) parts.push(`!@${bareLabel(label)}`);

  let projectId: string | undefined;
  if (filter.project) {
    if (isNumericId(filter.project)) projectId = filter.project;
    else parts.push(`#${filter.project}`);
  }

  if (filter.date) parts.push(`(date: ${filter.date})`);
  else if (filter.dateRange) {
    parts.push(
      `(due after: ${shiftDay(filter.dateRange.from, -1)} & due before: ${shiftDay(
        filter.dateRange.to,
        1,
      )})`,
    );
  }

  const query: { filter?: string; project_id?: string } = {};
  if (parts.length > 0) query.filter = parts.join(' & ');
  if (projectId) query.project_id = projectId;
  return query;
}

function toContractTask(task: TodoistTask): ContractTask {
  return {
    id: task.id,
    content: task.content,
    priority: API_TO_PRIORITY[task.priority] ?? 'p4',
    due: task.due
      ? {
          date: task.due.date,
          recurring: task.due.is_recurring ?? false,
          ...(task.due.datetime ? { datetime: task.due.datetime } : {}),
        }
      : null,
    labels: task.labels ?? [],
    project: task.project_id ?? null,
  };
}

/** A single request's typed result; `null` for 204 No Content responses. */
export class TodoistClient {
  #cachedToken: string | undefined;

  /** Read (and validate) the API token lazily so createServer() needs no token to construct. */
  #token(): string {
    if (this.#cachedToken) return this.#cachedToken;
    const token = process.env['TODOIST_API_TOKEN'];
    if (!token) {
      throw new Error(
        'TODOIST_API_TOKEN is not set. Export a Todoist API token (Settings → Integrations → Developer).',
      );
    }
    this.#cachedToken = token;
    return token;
  }

  async #request<T>(
    method: string,
    path: string,
    opts: { query?: Record<string, string>; body?: unknown; base?: string } = {},
  ): Promise<T> {
    const url = new URL(`${opts.base ?? API_BASE}${path}`);
    for (const [key, value] of Object.entries(opts.query ?? {})) url.searchParams.set(key, value);

    const response = await fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${this.#token()}`,
        ...(opts.body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      },
      ...(opts.body !== undefined ? { body: JSON.stringify(opts.body) } : {}),
    });

    if (!response.ok) {
      const detail = await response.text();
      throw new Error(`Todoist API ${method} ${path} failed (${response.status}): ${detail}`);
    }
    if (response.status === 204) return null as T;
    return (await response.json()) as T;
  }

  /** Resolve a project reference (id or name) to its Todoist id. */
  async #resolveProjectId(project: string): Promise<string> {
    if (isNumericId(project)) return project;
    const projects = await this.#request<TodoistProject[]>('GET', '/projects');
    const match = projects.find((p) => p.name.toLowerCase() === project.toLowerCase());
    if (!match) throw new Error(`No Todoist project named "${project}".`);
    return match.id;
  }

  async createTask(input: TaskInput): Promise<{ id: string; content: string }> {
    const body: Record<string, unknown> = { content: input.content };
    if (input.description !== undefined) body['description'] = input.description;
    if (input.priority !== undefined) body['priority'] = PRIORITY_TO_API[input.priority];
    if (input.labels !== undefined) body['labels'] = input.labels.map(bareLabel);
    if (input.dueString !== undefined) body['due_string'] = input.dueString;
    if (input.deadlineDate !== undefined) body['deadline_date'] = input.deadlineDate;
    if (input.project !== undefined) body['project_id'] = await this.#resolveProjectId(input.project);

    const task = await this.#request<TodoistTask>('POST', '/tasks', { body });
    return { id: task.id, content: task.content };
  }

  async findTasks(filter: StructuredFilter): Promise<ContractTask[]> {
    const query = buildQuery(filter);
    const tasks = await this.#request<TodoistTask[]>('GET', '/tasks', {
      query: query as Record<string, string>,
    });
    const mapped = tasks.map(toContractTask);
    if (filter.sort === 'priority') {
      // p1 first == highest Todoist priority number first.
      mapped.sort((a, b) => PRIORITY_TO_API[b.priority] - PRIORITY_TO_API[a.priority]);
    }
    return mapped;
  }

  async updateTask(patch: TaskPatch): Promise<ContractTask> {
    const body: Record<string, unknown> = {};
    if (patch.content !== undefined) body['content'] = patch.content;
    if (patch.description !== undefined) body['description'] = patch.description;
    if (patch.priority !== undefined) body['priority'] = PRIORITY_TO_API[patch.priority];
    if (patch.labels !== undefined) body['labels'] = patch.labels.map(bareLabel);
    if (patch.deadlineDate !== undefined) body['deadline_date'] = patch.deadlineDate;

    const task = await this.#request<TodoistTask>('POST', `/tasks/${patch.id}`, { body });
    return toContractTask(task);
  }

  async completeTask(id: string): Promise<void> {
    await this.#request<null>('POST', `/tasks/${id}/close`);
  }

  async uncompleteTask(id: string): Promise<void> {
    await this.#request<null>('POST', `/tasks/${id}/reopen`);
  }

  /** Move a due date while preserving recurrence: update due_date/due_datetime, never due_string. */
  async rescheduleTask(id: string, date: string): Promise<ContractTask> {
    const body = date.includes('T') ? { due_datetime: date } : { due_date: date };
    const task = await this.#request<TodoistTask>('POST', `/tasks/${id}`, { body });
    return toContractTask(task);
  }

  async findProjects(): Promise<ContractProject[]> {
    const projects = await this.#request<TodoistProject[]>('GET', '/projects');
    return projects.map((p) => ({ id: p.id, name: p.name }));
  }

  async createProject(input: ProjectInput): Promise<ContractProject> {
    const body: Record<string, unknown> = { name: input.name };
    if (input.parent !== undefined) body['parent_id'] = await this.#resolveProjectId(input.parent);
    const project = await this.#request<TodoistProject>('POST', '/projects', { body });
    return { id: project.id, name: project.name };
  }

  async findLabels(): Promise<ContractLabel[]> {
    const labels = await this.#request<TodoistLabel[]>('GET', '/labels');
    return labels.map((l) => ({ name: l.name }));
  }

  async createLabel(name: string): Promise<ContractLabel> {
    const label = await this.#request<TodoistLabel>('POST', '/labels', {
      body: { name: bareLabel(name) },
    });
    return { name: label.name };
  }

  /** Saved filters live in the Sync API, not REST. */
  async findFilters(): Promise<SavedFilter[]> {
    const data = await this.#request<{ filters?: { name: string; query: string }[] }>(
      'GET',
      '/sync',
      { base: SYNC_BASE, query: { sync_token: '*', resource_types: '["filters"]' } },
    );
    return (data.filters ?? []).map((f) => ({ name: f.name, query: f.query }));
  }

  /** Completed tasks come from the Sync API's completed history. */
  async findCompletedTasks(query: CompletedQuery): Promise<CompletedTask[]> {
    const params: Record<string, string> = {};
    if (query.since) params['since'] = `${query.since}T00:00:00`;
    if (query.until) params['until'] = `${query.until}T23:59:59`;
    if (query.limit !== undefined) params['limit'] = String(query.limit);
    if (query.project) params['project_id'] = await this.#resolveProjectId(query.project);

    const data = await this.#request<{
      items?: { task_id?: string; id?: string; content: string; completed_at: string }[];
    }>('GET', '/completed/get_all', { base: SYNC_BASE, query: params });

    return (data.items ?? []).map((item) => ({
      id: item.task_id ?? item.id ?? '',
      content: item.content,
      completedAt: item.completed_at,
    }));
  }
}
