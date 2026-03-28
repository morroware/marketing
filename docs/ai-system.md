# AI System

The AI system provides 60+ tools across content creation, analysis, strategy, and conversational interfaces. It supports 9 providers through a unified interface.

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

## Fallback Mode

If no AI API keys are configured, the platform returns deterministic placeholder output so all workflows remain functional. This lets you explore the full interface without paid API access.

---

**Next:** [Content Management](content-management.md) | [Configuration](configuration.md) | [API Reference](api-reference.md)
