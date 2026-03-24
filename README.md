# Full-Stack Marketing Suite (Vanilla JS + PHP + SQLite)

This project expands the PoC into an end-to-end marketing operations suite with very few dependencies.

- **Backend:** PHP 8+ (no framework), PDO + SQLite
- **Frontend:** vanilla HTML/CSS/JS
- **Storage:** local SQLite (`data/marketing.sqlite`)
- **AI Providers:** OpenAI, Anthropic, Gemini

## Major Capabilities

- Campaign planning and budget tracking
- Content calendar and publishing workflow (draft → approved → scheduled → published)
- AI market research briefs
- AI content generation (post/caption/ad/video script/email)
- AI post-idea ideation with hooks, CTAs, and suggested posting windows
- Competitor watchlist tracker
- KPI logging and dashboard rollups

## Quick Start

### Option A: CLI setup

```bash
cd fullstack
cp .env.example .env
php -S localhost:8080 -t public
```

Open http://localhost:8080.

### Option B: Web installer (no shell access required)

1. Start the PHP server pointed at `public`.
2. Open `http://localhost:8080/install.php`.
3. Fill in business + AI settings and submit.
4. Open `http://localhost:8080/`.

The installer writes `.env`, initializes `data/marketing.sqlite`, and can be reused to update settings.

## API Highlights

- `GET /api/dashboard`
- `GET/POST /api/campaigns`
- `GET/POST /api/posts`
- `PATCH /api/posts/{id}`
- `GET/POST /api/competitors`
- `GET/POST /api/kpis`
- `POST /api/ai/research`
- `POST /api/ai/content`
- `POST /api/ai/ideas`
- `POST /api/ai/calendar`
- `GET /api/settings`

## AI Provider Notes

Set `AI_PROVIDER` in `.env` to one of:

- `openai` (uses `OPENAI_API_KEY`, `OPENAI_BASE_URL`, and `AI_MODEL`)
- `anthropic` (uses `ANTHROPIC_API_KEY`, `ANTHROPIC_MODEL`)
- `gemini` (uses `GEMINI_API_KEY`, `GEMINI_MODEL`)

If the selected provider is missing credentials, the app automatically returns deterministic fallback output so workflows remain testable.

## Repository Notes

- The SQLite database file is generated locally at runtime (`data/marketing.sqlite`) and is intentionally gitignored to avoid binary-file commit issues.
- `data/.gitkeep` is committed so the folder exists in fresh clones.
