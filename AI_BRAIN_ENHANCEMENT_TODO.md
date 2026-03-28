# AI Brain Enhancement — Remaining Work

## What's Done (this commit)

### Backend (complete)
- **`src/AiSearchEngine.php`** — Unified search across internal user data (posts, campaigns, contacts, learnings, emails, etc.), AI-powered web research, and website crawl/analysis with SSRF protection. Includes AI synthesis of multi-source results.
- **`src/AiAgentSystem.php`** — Multi-agent autonomous task system. Users describe a goal, a planner agent decomposes it into steps assigned to specialized agents (researcher, writer, analyst, strategist, creative). Supports human-in-the-loop approval gates, step rejection/revision, and auto-approve mode. All results feed back into AI Brain context.
- **`src/Database.php`** — New tables: `ai_agent_tasks`, `ai_model_routing`, `ai_search_history`.
- **`src/AiService.php`** — Model routing system: `MODEL_TASK_TYPES` constant defines 8 task types (copywriting, analysis, strategy, research, creative, chat, extraction, image). Methods: `getModelForTask()`, `generateForTask()`, `getModelRouting()`, `saveModelRouting()`, `deleteModelRouting()`.
- **`src/routes/ai.php`** — All new API endpoints wired up:
  - `POST /api/ai/search` + `GET /api/ai/search/history`
  - `GET /api/ai/agents/types`
  - `POST /api/ai/agents/tasks` (create), `GET /api/ai/agents/tasks` (list), `GET /api/ai/agents/tasks/{id}` (details)
  - `POST /api/ai/agents/tasks/{id}/execute`, `/execute-all`, `/approve`, `/reject`, `/cancel`
  - `GET /api/ai/model-routing`, `POST /api/ai/model-routing`, `DELETE /api/ai/model-routing/{taskType}`
- **`public/index.php`** — Requires and instantiates `AiSearchEngine` and `AiAgentSystem`, passes them to route registration.

### Frontend HTML (complete)
- **`public/app.html`** — Brain page restructured with 8 tabs: Overview, Agents, Search, Models, Learnings, Activity, Pipelines, Feedback. Full HTML for:
  - Agent workspace: goal input, auto-approve toggle, plan & execute buttons, agent type cards, step timeline, output viewer, approval actions (approve/reject with feedback), task history
  - Search panel: query input, source toggles (internal/web/URL), results sections (synthesis, internal matches, web research, website analysis), search history
  - Model routing: routing grid, configure form (task type, provider, model selects), save/delete buttons

## What Remains

### 1. `public/assets/js/pages/brain.js` — Frontend JavaScript (LARGEST ITEM)

The existing brain.js (671 lines) handles Overview, Learnings, Activity, Pipelines, and Feedback tabs. It needs the following additions:

#### Agents Tab (`~200-250 lines`)
- `loadAgentTypes()` — `GET /api/ai/agents/types`, render agent type cards into `#agentTypesGrid` (icon, label, description, capabilities)
- `createAgentTask()` — Read `#agentGoalInput`, `#agentContextInput`, `#agentAutoApprove`, `POST /api/ai/agents/tasks`, show the task workspace
- `openTaskWorkspace(task)` — Populate `#agentTaskWorkspace` with task details, render step timeline
- `renderStepTimeline(plan, results, stepsCompleted)` — Visual step-by-step display into `#agentStepTimeline`, each step shows: step number, agent type badge, title, status (pending/running/completed/rejected)
- `executeNextStep(taskId)` — `POST /api/ai/agents/tasks/{id}/execute`, update timeline, show output
- `executeAllSteps(taskId)` — `POST /api/ai/agents/tasks/{id}/execute-all`, animate through steps
- `approveStep(taskId)` — Read `#agentFeedbackInput`, `POST /api/ai/agents/tasks/{id}/approve`
- `rejectStep(taskId)` — Prompt reason, `POST /api/ai/agents/tasks/{id}/reject`
- `cancelTask(taskId)` — `POST /api/ai/agents/tasks/{id}/cancel`
- `loadTaskHistory()` — `GET /api/ai/agents/tasks`, render into `#agentTaskHistory` (goal, status badge, steps progress, timestamp)
- `showStepOutput(result)` — Display the current step output in `#agentStepOutputContent` (markdown-ish rendering), show/hide approval buttons based on task status
- Wire buttons: `#agentCreateBtn`, `#agentPlanOnlyBtn`, `#agentExecuteNextBtn`, `#agentExecuteAllBtn`, `#agentApproveBtn`, `#agentRejectBtn`, `#agentCancelBtn`, `#agentTaskClose`

#### Search Tab (`~150 lines`)
- `executeSearch()` — Read `#searchQueryInput`, checkbox sources, optional URL, `POST /api/ai/search`, render results
- `renderSearchResults(results)` — Show/hide result sections, populate `#searchSynthesis` (markdown), `#searchInternalList` (typed result cards), `#searchWebContent`, `#searchWebsiteContent`
- `loadSearchHistory()` — `GET /api/ai/search/history`, render into `#searchHistory`
- Toggle `#searchUrlField` visibility when `#searchSourceWebsite` checkbox changes
- Wire `#searchExecuteBtn`

#### Model Routing Tab (`~150 lines`)
- `loadModelRouting()` — `GET /api/ai/model-routing`, render current routing config into `#modelRoutingGrid` (grid of task type cards showing assigned provider/model), populate `#modelRoutingTaskType` select with task types, populate `#modelRoutingProvider` with configured providers
- `onProviderChange()` — When provider select changes, populate `#modelRoutingModel` with that provider's available models
- `saveModelRoute()` — `POST /api/ai/model-routing` with selected task_type, provider, model
- `deleteModelRoute()` — `DELETE /api/ai/model-routing/{taskType}`
- Wire `#modelRoutingSaveBtn`, `#modelRoutingDeleteBtn`, `#modelRoutingProvider` change event

#### Update `init()` and `refresh()`
- Add event listeners for all new buttons in `init()`
- Add `loadAgentTypes()`, `loadTaskHistory()`, `loadSearchHistory()`, `loadModelRouting()` to `refresh()`

### 2. `public/assets/styles.css` — CSS Styles (`~150-200 lines`)

New styles needed (follow existing patterns — dark theme vars, purple gradients for AI):

#### Agent Workspace
- `.agent-new-task` — Card styling for the goal input section
- `.agent-types-grid` — CSS grid (3-4 columns) for agent type cards
- `.agent-type-card` — Card with icon, name, description, capability tags
- `.agent-task-workspace` — Main workspace card
- `.agent-step-timeline` — Vertical timeline with connecting lines
- `.agent-step-item` — Each step: number circle + agent badge + title + status
- `.agent-step-item.completed` / `.running` / `.pending` / `.rejected` — Status colors
- `.agent-output-content` — Output display area (pre-wrap, scrollable, max-height)
- `.agent-approval-actions` — Approve/reject button row

#### Search Panel
- `.search-panel` — Card styling
- `.search-source-toggle` — Checkbox label styled as toggle chip (pill shape, border, selected state)
- `.search-source-toggle input:checked + span` — Active state (purple background)
- `.search-synthesis` — AI synthesis display (pre-wrap)
- `.search-web-content`, `.search-website-content` — Result display cards
- `.search-result-card` — Individual internal search result (type badge + content preview)

#### Model Routing
- `.model-routing-grid` — CSS grid (2-3 columns)
- `.model-route-card` — Card showing task type, assigned provider/model, with status indicator
- `.model-route-card.configured` — Has a route set (green indicator)
- `.model-route-card.default` — Using default (gray indicator)

### 3. Optional Enhancements (post-MVP)
- Agent task model config per-agent (the UI has model routing but doesn't yet let you set per-agent models when creating a task — the `model_config` field is there in the API but the UI just uses global routing)
- Real-time step execution animation (SSE or polling during long-running agent tasks)
- Search result "save to memory" button (save a search finding directly to `ai_shared_memory`)
- Pipeline builder that uses agents instead of just tools
- Agent chat mode (conversational interaction with a specific agent type)
