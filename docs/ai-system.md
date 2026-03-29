# AI System

The AI system provides 60 tool endpoints across content creation, analysis, strategy, intelligence, and conversational interfaces. It supports 9 providers through a unified interface, with an autonomous memory engine, multi-step pipelines, unified search, multi-agent task execution, and task-based model routing.

See **[Configuration](configuration.md)** for provider setup and API keys.

## Providers

Set your primary provider during install or change it anytime in **Settings**.

Multiple providers can be configured simultaneously. The primary provider handles default requests while others can be selected per-request or used for multi-provider comparison.

| Provider | API Style | Default Model |
|----------|----------|---------------|
| OpenAI | Chat Completions | gpt-4.1-mini |
| Anthropic | Messages API | claude-sonnet-4-20250514 |
| Google Gemini | GenerativeAI | gemini-2.5-flash |
| DeepSeek | OpenAI-compatible | deepseek-chat |
| Groq | OpenAI-compatible | llama-3.3-70b-versatile |
| Mistral | OpenAI-compatible | mistral-large-latest |
| OpenRouter | OpenAI-compatible | anthropic/claude-sonnet-4 |
| xAI | OpenAI-compatible | grok-3-fast |
| Together AI | OpenAI-compatible | Llama-3.3-70B-Instruct-Turbo |

### Multi-Provider Features

- **Compare providers** — Run the same prompt on multiple providers simultaneously to compare output quality
- **Bulk requests** — Execute multiple different AI tasks in one request
- **Provider status** — Check which providers are configured and available from **Settings**

### Image Generation

Generate images via Banana/NanoBanana, DALL-E 3, or Gemini. Provider priority: Banana > OpenAI DALL-E > Gemini. Configure image provider keys in **Settings**.

## AI Tools

### Content Creation

| Tool | Description |
|------|-------------|
| **Content Writer** | Main content generator with audience targeting and quality modes (standard/enhanced) |
| **Blog Post Generator** | 1200-1800 word SEO blog posts with meta tags and FAQ |
| **Video Script** | Scene-by-scene scripts with hooks and overlays |
| **Caption Batch** | Multi-platform captions in one request |
| **Repurpose Content** | Convert content across formats (tweet, LinkedIn, email, Instagram, etc.) |
| **Ad Variations** | 5+ ad angles with psychological triggers |
| **Email Subject Lines** | 10 email subjects with predicted open rates |
| **Content Brief** | Full content brief with outline, SEO plan, and distribution strategy |
| **Headline Optimizer** | 10 headline variations with CTR predictions |
| **Content Workflow** | Multi-day content workflow planning |
| **Email Drip Sequence** | Automated email sequence generation |
| **Image Prompts** | AI image prompt generation |
| **Multi-Source Pipeline** | Orchestrated copy + visual pipeline using different providers per stage |
| **Localize** | Content localization for different languages |
| **RSS to Post** | Convert RSS articles to social posts |
| **Brand Voice Builder** | Extract brand voice profile from example content |

### Content Refinement

The Writing Assistant and inline toolbars offer 12 refinement actions on any content:

| Action | Description |
|--------|-------------|
| **Improve** | General quality improvement |
| **Expand** | Add more detail and depth |
| **Shorten** | Condense while keeping key points |
| **Formal** | Shift to professional tone |
| **Casual** | Shift to conversational tone |
| **Persuasive** | Add persuasive elements and CTAs |
| **Storytelling** | Rewrite with narrative structure |
| **Simplify** | Simplify language and structure |
| **Add Hooks** | Add attention-grabbing hooks |
| **Add CTA** | Add or strengthen calls-to-action |
| **Emojis** | Add relevant emojis |
| **Bullet Points** | Convert to bullet point format |

### Analysis & Optimization

| Tool | Description |
|------|-------------|
| **Tone Analysis** | Sentiment, readability, emotion map, brand alignment |
| **Content Score** | 1-100 score across engagement, clarity, CTA, emotion, platform fit |
| **SEO Keywords** | 20 keywords with intent, difficulty, and content type recommendations |
| **Hashtag Research** | 30 hashtags in 3 volume tiers |
| **SEO Audit** | 10-point page audit with scores and quick wins |
| **Pre-Flight Check** | Pre-publish brand and compliance review |
| **A/B Variants** | Generate A/B test variants for existing content |
| **A/B Analysis** | Analyze A/B test results with recommendations |

### Research & Strategy

| Tool | Description |
|------|-------------|
| **Market Research** | ICP, pain points, objections, 30-day action plan |
| **Content Ideas** | 8 platform-specific ideas with hooks and CTAs |
| **Audience Persona** | Detailed buyer persona with messaging dos/don'ts |
| **Competitor Analysis** | Deep competitive analysis with counter-strategies |
| **Social Strategy** | Full strategy with content pillars, schedule, and KPIs |
| **Schedule Suggestion** | 14-day schedule with times, channels, and KPIs |
| **Monthly Calendar** | Full month content plan |
| **Smart Posting Times** | Platform-specific optimal posting schedule |
| **Campaign Optimizer** | Budget, channel mix, and creative recommendations |
| **Weekly Report** | AI-generated performance summary from your data |
| **AI Insights** | Proactive recommendations based on marketing data |
| **Smart Segments** | Audience segment recommendations |
| **Competitor Radar** | Competitive landscape monitoring |
| **Funnel Advisor** | Funnel optimization advice |
| **Smart UTM** | Intelligent UTM link creation |
| **Daily Standup** | Daily marketing standup digest |
| **Performance Prediction** | Content performance prediction |

### Intelligence & Automation

| Tool | Description |
|------|-------------|
| **Daily Actions** | Generates 5 prioritized daily marketing to-dos from current drafts, scheduled posts, campaigns, and subscribers |
| **Repurpose Chain** | One-click content repurposing across multiple platforms (Twitter, Instagram, LinkedIn, Facebook, Email) |
| **Calendar Auto-Fill** | Generates a week or month of draft posts with AI-chosen topics, platforms, and optimal scheduling |
| **Chat Execute** | Slash commands in AI Chat: `/create-post`, `/schedule-posts`, `/check-analytics`, `/optimize-campaign` |
| **Performance Patterns** | Analyzes published content and performance feedback to identify what content types, platforms, and topics perform best |
| **Monthly Review** | Comprehensive marketing performance review for a configurable period (7-90 days) with executive summary and recommendations |
| **Describe Audience** | Converts natural language audience descriptions into structured segment filter criteria |
| **Email Intelligence** | Analyzes email campaign history (open rates, click rates, send patterns) with actionable improvement recommendations |
| **Deliverability Check** | Assesses email deliverability readiness based on SMTP configuration, with SPF/DKIM/DMARC recommendations |
| **Review Response** | Generates professional business responses to customer reviews, tone-adjusted by star rating |
| **Calendar Intelligence** | Analyzes 30-day content calendar for balance, platform coverage gaps, and seasonal opportunities |
| **SEO Opportunities** | Identifies low-competition keywords, content gaps, and quick-win SEO improvements for existing content |
| **Content Freshness** | Audits published content older than 60 days and recommends updates, refreshes, or repurposing |
| **Compliance Check** | Audits draft/scheduled content for GDPR, FTC, CAN-SPAM, platform rules, and accessibility compliance |

## AI Chat

A conversational AI assistant that has access to your marketing data (posts, campaigns, metrics, contacts). Use it to:

- Ask questions about your marketing performance
- Get analysis grounded in real data
- Generate production-ready content with brief controls (type, platform, tone, audience, goal)
- Build strategy based on your actual business context

Conversations are saved with full history. See **[API Reference](api-reference.md)** for chat endpoints.

## Shared AI Memory

Store durable business facts, offers, constraints, and context that all AI tools share. When you add a shared memory entry (e.g., "We never discount below 20%" or "Our main competitor is Acme Corp"), every AI tool — content generation, strategy, chat — will factor it in.

Manage shared memory from **AI Chat** or via the API.

## AI Writing Assistant

A floating side panel accessible from any page via the purple button in the bottom-right corner. Use it to refine content without leaving your current workflow:

- **12 quick actions** — Improve, Expand, Shorten, Add Hooks, Add CTA, Bullet Points, Emojis, Simplify
- **4 tone changes** — Formal, Casual, Persuasive, Storytelling
- **Analysis** — Tone Analysis, Content Score, Headline Ideas
- **Custom instructions** — Free-form AI refinement
- **Apply to Field** — One-click to replace the active textarea with the AI output
- Automatically detects the last-focused textarea on the current page

## AI Inline Toolbar

Contextual AI action buttons appear above textarea fields in:
- **Content Studio** post editor: Improve, Expand, Shorten, Persuasive, Emojis
- **Email Compose** editor: Improve, Expand, Shorten, Persuasive

## Command Bar

Press **Ctrl+K** from any page to open the command bar with 10 quick AI actions.

## Brand Voice

Control how AI generates content by creating a brand voice profile at **Content Library > Brand Voice**:

| Field | Description |
|-------|-------------|
| Voice Tone | Overall tone (e.g., "Professional yet approachable") |
| Vocabulary | Preferred words and phrases |
| Avoid Words | Words and phrases to avoid |
| Example Content | Sample content demonstrating the voice |
| Target Audience | Description of the target audience |

Only one profile can be active at a time. The active profile is applied to all AI-generated content automatically.

## Onboarding AI Bootstrap

During onboarding, you can auto-populate your business profile by entering your website URL. The system extracts your site's content and uses AI to infer your industry, audience, goals, and channels. Review the results, then launch **AI Autopilot** to generate starter content automatically.

## AI Brain

The AI Brain (`AiMemoryEngine`) makes the system self-aware. It logs every AI tool invocation, automatically extracts learnings from outputs, and injects accumulated context back into every AI call via the system prompt.

### Activity Logging

Every AI tool invocation is recorded in the `ai_activity_log` table with tool name, category, input/output summaries, provider, model, and duration. This creates an audit trail and provides recent-activity context for future AI calls.

### Auto-Learning

After each tool run (except simple tools like refine, headlines, hashtags, and subject-lines), the Memory Engine asks the AI to extract 1-3 key insights from the output. Extracted learnings are stored in the `ai_learnings` table with:

- **Category** — one of: audience, content, strategy, performance, brand, competitor, channel, timing
- **Confidence score** — 0.3 to 1.0, reflecting reliability
- **Source tool** — which tool produced the learning
- **Reinforcement count** — how many times the same insight was independently extracted

Duplicate detection uses keyword overlap. When a near-duplicate is found, the existing learning is reinforced (confidence boosted by 0.05, reinforcement count incremented) instead of creating a new entry. Extraction is rate-limited to one per tool per 5 minutes.

### Situational Awareness

`buildBrainContext()` constructs a context block injected into every AI system prompt. It includes:

1. **Current date/time** and day of week (from configured timezone)
2. **Active campaigns** with names, objectives, and end dates (up to 5)
3. **Upcoming scheduled posts** in the next 48 hours (up to 5)
4. **Draft count** awaiting review/publish
5. **Recent AI activity digest** — last 8 tool runs with tool name, category, input summary, and relative time
6. **Learned insights** — top 15 learnings ranked by `confidence * (1 + reinforcement_count)`, grouped by category
7. **Performance feedback** — last 10 entries showing what content worked or did not

### Performance Feedback

The `ai_performance_feedback` table links published content performance metrics back to AI activity. Feedback can be recorded manually via the API or auto-captured from published posts with AI scores using `capturePostPerformance()`. This data is injected into the Brain context so the AI learns from real-world results.

### Memory Decay

The `maintenance()` method (called by cron) handles memory housekeeping:

- **Expired learnings** — Learnings past their 30-day expiry date are deleted
- **Confidence decay** — Unreinforced learnings (reinforcement count <= 1) older than 14 days have their confidence reduced by 0.1, with a floor of 0.3
- **Activity log trimming** — Only the most recent 500 activity entries are retained
- **Expired shared memories** — Shared memory entries past their expiry are removed

### Self-Reflection

The `selfReflect()` method returns a status report of the Brain's current state:

- Total learnings, memories, and feedback entries
- Learnings grouped by category with average confidence
- Top 5 most-reinforced learnings (strongest convictions)
- Knowledge gaps — categories with fewer than 2 learnings

### Brain API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/ai/brain/status` | Self-reflection report (knowledge coverage, gaps, stats) |
| GET | `/api/ai/brain/activity` | Activity log (filterable by `?category=`, `?limit=`) |
| GET | `/api/ai/brain/stats` | Aggregated activity statistics for a period (`?days=7`) |
| GET | `/api/ai/brain/learnings` | List learnings (filterable by `?category=`, `?limit=`) |
| DELETE | `/api/ai/brain/learnings/{id}` | Delete a learning |
| POST | `/api/ai/brain/feedback` | Record performance feedback |
| GET | `/api/ai/brain/feedback` | List performance feedback (`?limit=`) |
| POST | `/api/ai/brain/capture-performance` | Auto-capture published post performance |

### Brain Database Tables

| Table | Purpose |
|-------|---------|
| `ai_activity_log` | Every AI tool call (tool_name, category, input/output summaries, provider, duration) |
| `ai_learnings` | Auto-extracted insights (category, insight, confidence, reinforcement count, expiry) |
| `ai_performance_feedback` | Content performance metrics linked to AI activity |
| `ai_shared_memory` | Durable business facts shared across all AI tools |

## AI Pipelines

The Orchestrator (`AiOrchestrator`) enables multi-step AI workflows where tools are chained together, with each step's output feeding the next.

### Pipeline Templates

Five built-in pipeline templates are available:

| Template | Steps |
|----------|-------|
| **Content Creation** | Market Research > Content Ideas > Generate Content > Content Scoring > Pre-Flight Check |
| **Campaign Launch** | Audience Research > Social Strategy > Monthly Calendar > Content Workflow > Campaign Optimization |
| **Competitor Intelligence** | Deep Analysis > Content Radar > Counter-Content Ideas > Differentiation Strategy |
| **Content Repurpose** | Score Original > Repurpose Content > Social Captions > Hashtag Research |
| **SEO Content** | Keyword Research > Blog Post > SEO Audit > Headline Optimization |

### Tool Chaining

Pipeline steps pass context between each other using template variables:

- `{{prev_summary}}` — truncated output from the previous step (up to 800 characters)
- `{{prev.content}}` — full output from the previous step
- `{{variable_name}}` — user-supplied variables (topic, platform, goal, etc.)

Steps execute sequentially. If a step fails, the pipeline continues with the remaining steps (the error is recorded and the next step receives a failure summary instead of output).

### Next-Action Suggestions

After any tool runs, the Orchestrator suggests the best follow-up tools using a static mapping. For example, after running `content`, it suggests `score`, `preflight`, `repurpose`, and `hashtags`. Each suggestion includes a reason explaining why that follow-up is relevant.

### Tool Registry

The Orchestrator maintains a registry of 28 tools mapping tool names to their API endpoints, categories (content, strategy, analysis), and expected output fields. The registry is exposed via the API for the frontend pipeline builder.

### Pipeline Execution

When a pipeline runs:

1. A `ai_pipelines` record is created or updated (tracking run count and last run)
2. An `ai_pipeline_runs` record tracks the execution (status, per-step results, timing)
3. Each step is executed via `executeToolStep()`, which dispatches to the appropriate tool class method
4. Activity is logged to the Brain after each step
5. Learnings are auto-extracted from each step's output and from the full pipeline summary
6. The final result includes next-action suggestions based on the last tool in the chain

### Pipeline API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/ai/pipelines/templates` | List built-in pipeline templates |
| POST | `/api/ai/pipelines/run` | Execute a pipeline (template or custom steps) |
| GET | `/api/ai/pipelines/next-actions` | Get suggested next tools (`?tool=`) |
| GET | `/api/ai/pipelines/runs` | Pipeline run history (`?limit=`) |
| GET | `/api/ai/pipelines/runs/{id}` | Pipeline run details with per-step results |
| GET | `/api/ai/pipelines/tools` | Tool registry for frontend pipeline builder |

### Pipeline Database Tables

| Table | Purpose |
|-------|---------|
| `ai_pipelines` | Saved pipeline definitions (name, steps, run count) |
| `ai_pipeline_runs` | Execution history with per-step results and timing |

## AI Search Engine

The Search Engine (`AiSearchEngine`) provides unified search across internal data, AI-powered web research, and website content extraction.

### Internal Search

Searches across 8 tables using keyword matching: posts, campaigns, contacts, AI learnings, shared memory, email campaigns, content ideas, and landing pages. Results are scored by keyword frequency and sorted by relevance.

### Web Search

Uses the configured AI provider to synthesize web-aware research. The AI acts as a marketing research analyst, providing key findings, market intelligence, actionable insights, data points, and confidence levels. Business context (name, industry, target audience) is injected automatically.

### Website Analysis

Fetches a URL, extracts text content and metadata, and uses AI to analyze it. The analysis covers page summary, key information, marketing analysis (tone, audience, CTAs), competitive intelligence, SEO observations, and actionable takeaways.

SSRF protection blocks private/reserved IP ranges and localhost variants. Requests have a 15-second timeout and follow up to 3 redirects.

### Multi-Source Search

When multiple sources are queried, the engine synthesizes results across all sources into a unified summary using AI. The `buildSearchContext()` method formats search results into a context string suitable for injection into agent task prompts.

### Search API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/ai/search` | Unified search (body: `query`, `sources[]`, optional `url`) |
| GET | `/api/ai/search/history` | Search history (`?limit=`) |

### Search Database Tables

| Table | Purpose |
|-------|---------|
| `ai_search_history` | Query history with sources, result counts, and summaries |

## AI Agent System

The Agent System (`AiAgentSystem`) provides multi-agent autonomous task execution with human-in-the-loop approval gates.

### How It Works

1. The user describes a high-level marketing goal (e.g., "Launch a product announcement campaign for our new feature")
2. The **Planner** uses AI to decompose the goal into 2-6 sequential steps, each assigned to a specialized agent
3. Steps execute sequentially, sharing context through a workspace
4. Steps marked `needs_approval` pause for human review before continuing
5. All outputs are logged to the Brain and auto-extracted for learnings

### Agent Types

| Agent | Temperature | Description |
|-------|-------------|-------------|
| **Researcher** | 0.3 | Gathers intelligence from internal data, web, and competitor sites |
| **Writer** | 0.7 | Creates marketing copy across all formats |
| **Analyst** | 0.2 | Scores content, audits SEO, analyzes performance and sentiment |
| **Strategist** | 0.5 | Builds marketing plans, campaign strategies, and content calendars |
| **Creative** | 0.8 | Generates visual concepts, image prompts, and creative direction |

Each agent type has a specialized system prompt, default temperature, and a list of capabilities that guide the Planner's task decomposition.

### Task Lifecycle

A task progresses through these statuses:

- `planned` — Task created, steps defined, not yet started
- `running` — Actively executing a step
- `awaiting_approval` — Paused at a human approval gate
- `completed` — All steps finished
- `cancelled` — Manually cancelled

### Human-in-the-Loop

Steps with `needs_approval: true` pause execution and present the output for human review. The user can:

- **Approve** — Continue to the next step (optional feedback is attached to the result)
- **Reject** — Re-execute the step with a revision reason appended to the instruction
- **Cancel** — Stop the entire task

When `auto_approve` is enabled on the task, approval gates are skipped.

### Per-Agent Model Configuration

Each agent type can be configured with a specific provider and model via `model_config`:

```json
{
  "researcher": {"provider": "openai", "model": "gpt-4.1"},
  "writer": {"provider": "anthropic", "model": "claude-sonnet-4-20250514"},
  "analyst": {"provider": "deepseek", "model": "deepseek-chat"}
}
```

This allows using different models for different task types within a single multi-agent run.

### Context Flow

Each agent step receives:

1. The agent's specialized system prompt (with brand voice and Brain context)
2. Previous step outputs (truncated to 2000 characters each, including any human feedback)
3. Pre-fetched search results if the step has a `search_query` configured

### Agent API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/ai/agents/types` | List available agent types with capabilities |
| POST | `/api/ai/agents/tasks` | Create a new task from a goal |
| GET | `/api/ai/agents/tasks` | List recent tasks (`?limit=`) |
| GET | `/api/ai/agents/tasks/{id}` | Get task details with plan and results |
| POST | `/api/ai/agents/tasks/{id}/execute` | Execute the next pending step |
| POST | `/api/ai/agents/tasks/{id}/execute-all` | Execute all remaining steps (stops at approval gates) |
| POST | `/api/ai/agents/tasks/{id}/approve` | Approve a pending step (body: optional `feedback`) |
| POST | `/api/ai/agents/tasks/{id}/reject` | Reject and re-execute a step (body: `reason`) |
| POST | `/api/ai/agents/tasks/{id}/cancel` | Cancel the task |

### Agent Database Tables

| Table | Purpose |
|-------|---------|
| `ai_agent_tasks` | Task definitions with goal, plan, results, status, model config |

## Model Routing

Model routing allows assigning specific providers and models to different task types, so the best model handles each kind of work.

### Task Types

| Task Type | Description |
|-----------|-------------|
| `copywriting` | Content writing (posts, blogs, emails, ads) |
| `analysis` | Analysis and scoring (tone, SEO, quality) |
| `strategy` | Strategy and planning (campaigns, calendars) |
| `research` | Research and intelligence gathering |
| `creative` | Creative and visual (image prompts, concepts) |
| `chat` | Conversational AI chat |
| `extraction` | Data extraction and summarization (learnings) |
| `image` | Image generation (DALL-E, Flux, Imagen) |

### How It Works

When a routing rule is configured for a task type, `AiService::getModelForTask()` looks up the `ai_model_routing` table. If a match is found, that provider/model pair is used. Otherwise, the default provider handles the request.

Tool classes can call `generateForTask()` instead of `generateAdvanced()` to automatically apply task-type routing without managing provider/model selection themselves.

### Model Routing API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/ai/model-routing` | Get all routing rules with available task types and providers |
| POST | `/api/ai/model-routing` | Create or update a routing rule (body: `task_type`, `provider`, `model`) |
| DELETE | `/api/ai/model-routing/{taskType}` | Delete a routing rule (reverts to default provider) |

### Model Routing Database Tables

| Table | Purpose |
|-------|---------|
| `ai_model_routing` | Task-type to provider/model mapping |

## Fallback Mode

If no AI API keys are configured, the platform returns deterministic placeholder output so all workflows remain functional. This lets you explore the full interface without paid API access.

---

**Next:** [Content Management](content-management.md) | [Configuration](configuration.md) | [API Reference](api-reference.md)
