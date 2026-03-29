# WordPress Plugin

## Overview

The **Marketing Suite Connector** (v2.0.0) is a WordPress plugin that bridges your WordPress site with the Marketing Suite platform. It enables bidirectional content sync, AI writing tools, taxonomy mapping, webhook notifications, and campaign management directly from the WordPress admin.

## Requirements

- WordPress 6.0+
- PHP 8.0+
- A running Marketing Suite instance with API access

## Installation

1. Upload the `marketing-suite-connector` folder to `/wp-content/plugins/`
2. Activate the plugin through the **Plugins** menu in WordPress
3. Go to **Marketing Suite > Settings**
4. Enter your Marketing Suite URL (e.g., `https://marketing.example.com`)
5. Paste your API token (found in Marketing Suite under Settings)
6. Click **Save Changes** and **Test Connection**
7. For bidirectional sync, add your WordPress site as a Social Account in Marketing Suite (Social > Add Account > WordPress) using WordPress Application Passwords

## Plugin Structure

```
marketing-suite-connector/
├── marketing-suite-connector.php     # Plugin bootstrap (singleton), REST route registration
├── readme.txt                        # WordPress plugin readme
├── includes/
│   ├── class-msc-api-client.php      # HTTP client for Marketing Suite API (GET/POST/PUT/DELETE)
│   ├── class-msc-settings.php        # Settings page with connection, content sync, and automation sections
│   ├── class-msc-dashboard-widget.php # WP dashboard widget + full dashboard page
│   ├── class-msc-post-metabox.php    # Post/page editor sidebar metabox with sync + AI tools
│   ├── class-msc-content-sync.php    # Content pull/push, bulk operations, AI content, auto-push
│   ├── class-msc-taxonomy-sync.php   # Bidirectional category/tag sync with mapping support
│   └── class-msc-webhook.php         # Real-time webhook notifications to Marketing Suite
└── assets/
    ├── admin.css                     # Admin styles
    └── admin.js                      # Admin JavaScript
```

## Features

### Admin Menu

The plugin adds a top-level **Marketing Suite** menu with:
- **Dashboard** — Metrics overview, recent posts, active campaigns, sync activity
- **Content Sync** — Five-tab interface: Pull, Push, WordPress Site Content, AI Content, Taxonomy Sync
- **Settings** — Connection, content sync, and automation configuration

### Dashboard Widget

A WordPress dashboard widget shows:
- Total posts in Marketing Suite
- Published and scheduled counts
- Active campaigns
- Recent posts with status badges
- Link to the full dashboard page

### Full Dashboard Page

The dedicated dashboard page provides:
- Content metrics (total, published, scheduled, drafts)
- Campaign overview with budgets
- Recent posts list
- Recent sync activity
- Quick action buttons (Content Sync, New Post, Refresh, Open Marketing Suite)

### Content Sync

#### Pull Content (Marketing Suite -> WordPress)

Pulls posts from Marketing Suite and displays them in a table:
- Filter by status and platform
- Import individual posts as WordPress drafts or pages
- Bulk import with checkbox selection
- Post content maps to WordPress post title and content

#### Push Content (WordPress -> Marketing Suite)

Push WordPress posts and pages to Marketing Suite:
- Filter by post type and status
- Individual push per post
- Bulk push with checkbox selection
- Post title and content are sent to Marketing Suite
- Status defaults to `draft`

#### Auto Push

When enabled in settings, posts are automatically pushed to Marketing Suite when published or updated. Configurable to include posts only or posts and pages.

#### WordPress Site Content

View and manage WordPress site content through the Marketing Suite connection:
- Browse posts and pages on the connected WordPress site
- Filter by content type, status, and search
- Paginated results

#### Sync Status

Tracks all synced items in a sync map showing:
- Local type/ID and WordPress ID
- Sync direction (push or pull)
- Content hash for change detection
- Last synced timestamp

### Taxonomy Sync

Bidirectional synchronization of categories and tags between WordPress and Marketing Suite.

#### Local Taxonomy View

Lists all WordPress categories and tags with their IDs, names, slugs, and post counts.

#### Push Taxonomies

Push WordPress categories and/or tags to Marketing Suite, creating taxonomy mappings that link WordPress term IDs to Marketing Suite values.

#### Taxonomy Mapping

The mapping system links local Marketing Suite values to WordPress term IDs:
- View current mappings filtered by taxonomy type
- Create new mappings with local value, taxonomy type, WordPress term ID, and term name
- Delete individual mappings
- Mappings are stored server-side in the `wp_taxonomy_map` table

#### Term Resolution

When importing content, the plugin resolves category/tag names to WordPress term IDs. If a term does not exist and auto-create is enabled, it creates the term automatically.

### Webhook Notifications

The `MSC_Webhook` class sends real-time event notifications to Marketing Suite when content changes in WordPress. Webhooks are enabled by default and can be toggled in Settings.

#### Post Lifecycle Events

| Event | Trigger | Payload |
|-------|---------|---------|
| `post_published` | Post transitions to `publish` status | Full post data: ID, type, title, content, excerpt, slug, status, URL, author, categories, tags, modified date |
| `post_unpublished` | Post transitions from `publish` to another status | Full post data (same as above) |
| `post_updated` | Post is updated (non-publish transitions) | Full post data (same as above) |
| `post_trashed` | Post is moved to trash | Post ID, type, title |
| `post_deleted` | Post is permanently deleted | Post ID, type, title |

Post events only fire for `post` and `page` post types. Auto-drafts and revisions are ignored.

#### Taxonomy Events

| Event | Trigger | Payload |
|-------|---------|---------|
| `term_created` | Category or tag is created | Term ID, taxonomy (`category` or `tag`), name, slug |
| `term_updated` | Category or tag is edited | Term ID, taxonomy, name, slug |
| `term_deleted` | Category or tag is deleted | Term ID, taxonomy, name, slug |

Taxonomy events only fire for `category` and `post_tag` taxonomies.

#### Server-Side Webhook Processing

Marketing Suite receives webhooks at `POST /api/wordpress-plugin/webhook` and:
- Logs every event to the `wp_webhook_log` table
- For `post_published` and `post_updated`: updates the local copy if a sync mapping exists
- For `post_deleted` and `post_trashed`: removes the sync mapping (does not delete the local post)

### Post Editor Metabox

In the WordPress post and page editor sidebar:
- **Push to Marketing Suite** — Send the current post to Marketing Suite (shows "Update" if already synced)
- **Sync status** — Shows the remote ID and last sync time if previously synced
- **AI Tools** (when enabled):
  - **Improve** — Enhance the current post content
  - **SEO Optimize** — Optimize content for search engines
  - **Headlines** — Generate headline variations
  - **Score** — Get a content quality score

### AI Content Generation

Generate complete blog posts and articles from WordPress:

```
POST msc/v1/ai-generate
{
    "topic": "How to improve your marketing ROI",
    "content_type": "blog",
    "tone": "professional"
}
```

The generated content can be inserted directly into the WordPress editor or saved as a new draft.

### AI Refinement

Refine existing post content:

```
POST msc/v1/ai-refine
{
    "content": "Current post content...",
    "action": "improve"
}
```

Available actions: improve, expand, shorten, formal, casual, persuasive, simplify

### Shared AI Memory

Bidirectional sync of AI memory items between WordPress and Marketing Suite. Memory items include a key, content, source, tags, and metadata. This allows AI context learned in one system to be available in the other.

### AJAX Draft Creation

The plugin registers a `wp_ajax_msc_create_draft` handler that creates a WordPress draft post from AI-generated content. Supports setting a title, content, post type (post or page), and category.

## WordPress REST API Routes

The plugin registers these REST API routes under the `msc/v1` namespace:

| Method | Route | Permission | Description |
|--------|-------|-----------|-------------|
| POST | `/msc/v1/test-connection` | `manage_options` | Test API connection to Marketing Suite |
| GET | `/msc/v1/pull-posts` | `edit_posts` | Pull posts from Marketing Suite (filterable by status, platform) |
| POST | `/msc/v1/push-post` | `edit_posts` | Push a single WP post to Marketing Suite |
| POST | `/msc/v1/bulk-push` | `edit_posts` | Push multiple WP posts to Marketing Suite |
| POST | `/msc/v1/import-post` | `edit_posts` | Import a Marketing Suite post into WP (as post or page) |
| POST | `/msc/v1/bulk-import` | `edit_posts` | Import multiple Marketing Suite posts into WP |
| GET | `/msc/v1/wp-content` | `edit_posts` | Fetch WordPress site content via Marketing Suite proxy |
| GET | `/msc/v1/sync-status` | `edit_posts` | Get sync map status for all synced items |
| GET | `/msc/v1/analytics` | `edit_posts` | Get dashboard analytics (clears and refreshes cache) |
| POST | `/msc/v1/ai-generate` | `edit_posts` | Generate AI content (topic, content_type, tone) |
| POST | `/msc/v1/ai-refine` | `edit_posts` | Refine content with AI (content, action) |
| GET | `/msc/v1/memory` | `edit_posts` | Pull shared AI memory from Marketing Suite |
| POST | `/msc/v1/memory` | `edit_posts` | Push shared AI memory to Marketing Suite |
| GET | `/msc/v1/categories` | `edit_posts` | Get local WordPress categories |
| GET | `/msc/v1/tags` | `edit_posts` | Get local WordPress tags |
| POST | `/msc/v1/push-taxonomies` | `edit_posts` | Push WordPress categories/tags to Marketing Suite |
| GET | `/msc/v1/taxonomy-map` | `edit_posts` | Get taxonomy mappings (filterable by taxonomy type) |

## Configuration

### WordPress Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `msc_api_url` | string | `''` | Marketing Suite instance URL |
| `msc_api_token` | string | `''` | API bearer token |
| `msc_default_status` | string | `'draft'` | Default status for imported posts (`draft` or `publish`) |
| `msc_default_post_type` | string | `'post'` | Default post type for imports (`post` or `page`) |
| `msc_auto_push` | boolean | `false` | Auto-push posts to Marketing Suite on publish/update |
| `msc_auto_push_types` | string | `'post'` | Post types to auto-push (`post` or `post,page`) |
| `msc_sync_categories` | boolean | `true` | Sync categories when importing/pushing posts |
| `msc_sync_tags` | boolean | `true` | Sync tags when importing/pushing posts |
| `msc_sync_featured_images` | boolean | `true` | Include featured image URL when pushing posts |
| `msc_ai_enabled` | boolean | `true` | Enable AI content generation and refinement |
| `msc_webhooks_enabled` | boolean | `true` | Send webhook notifications on content changes |

### Transients

The plugin uses WordPress transients for caching:

| Transient | TTL | Description |
|-----------|-----|-------------|
| `msc_dashboard_metrics` | 5 min | Cached dashboard data from Marketing Suite |
| `msc_remote_posts` | — | Cached post list from Marketing Suite |

Transients are cleared on plugin deactivation.

## API Client

The `MSC_API_Client` class handles all communication with the Marketing Suite API:
- Supports GET, POST, PUT, and DELETE methods
- Uses WordPress `wp_remote_request()` for HTTP
- Automatically includes bearer token authentication via `Authorization` header
- Sends `X-Requested-By: wordpress-plugin` header on all requests
- Handles error responses and timeouts (default 30 seconds, filterable via `msc_api_timeout`)
- Base URL and token configurable via settings
- `is_configured()` check used throughout the plugin to gate features

## Marketing Suite API Endpoints Used

The plugin communicates with these Marketing Suite endpoints (defined in `src/routes/wordpress_plugin.php`):

### Status and Dashboard

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/wordpress-plugin/status` | Connection test; returns version, post/campaign counts, capabilities list |
| GET | `/api/wordpress-plugin/dashboard` | Dashboard metrics: post counts, campaigns, contacts, memory items, synced items, recent posts, campaigns list, recent syncs |

### Local Post Management (Marketing Suite Posts)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/wordpress-plugin/posts` | List posts (filterable by status, platform) |
| GET | `/api/wordpress-plugin/posts/{id}` | Get a single post |
| POST | `/api/wordpress-plugin/posts` | Create a new post |
| PUT | `/api/wordpress-plugin/posts/{id}` | Update a post |
| DELETE | `/api/wordpress-plugin/posts/{id}` | Delete a post (also cleans up sync mapping) |

### Bulk Operations

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/wordpress-plugin/bulk-push` | Push multiple Marketing Suite posts to the connected WordPress site |
| POST | `/api/wordpress-plugin/bulk-import` | Import multiple posts from the connected WordPress site |

### WordPress Site Data (proxied via Social Account)

These endpoints communicate with the connected WordPress site through the Marketing Suite's WordPress social account integration.

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/wordpress-plugin/wp-posts` | Fetch posts from the connected WP site (paginated, filterable) |
| GET | `/api/wordpress-plugin/wp-posts/{id}` | Fetch a single post from the connected WP site |
| PUT | `/api/wordpress-plugin/wp-posts/{id}` | Update a post on the connected WP site |
| DELETE | `/api/wordpress-plugin/wp-posts/{id}` | Delete a post on the connected WP site (optional `?force=1`) |
| GET | `/api/wordpress-plugin/wp-pages` | Fetch pages from the connected WP site |
| GET | `/api/wordpress-plugin/wp-categories` | Fetch categories from the connected WP site |
| POST | `/api/wordpress-plugin/wp-categories` | Create a category on the connected WP site |
| GET | `/api/wordpress-plugin/wp-tags` | Fetch tags from the connected WP site |
| POST | `/api/wordpress-plugin/wp-tags` | Create a tag on the connected WP site |
| GET | `/api/wordpress-plugin/wp-media` | Fetch media items from the connected WP site |
| GET | `/api/wordpress-plugin/wp-site-info` | Fetch site info from the connected WP site |
| POST | `/api/wordpress-plugin/publish-to-wp` | Publish a local Marketing Suite post to the connected WP site |

### Sync Map

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/wordpress-plugin/sync-map` | Get sync mappings (filterable by `local_type`, with `limit`) |

### Taxonomy Mapping

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/wordpress-plugin/taxonomy-map` | Get taxonomy mappings (filterable by `taxonomy`) |
| POST | `/api/wordpress-plugin/taxonomy-map` | Create or replace a taxonomy mapping |
| DELETE | `/api/wordpress-plugin/taxonomy-map/{id}` | Delete a taxonomy mapping |

### Webhooks

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/wordpress-plugin/webhook` | Receive webhook events from the WordPress plugin |
| GET | `/api/wordpress-plugin/webhook-log` | View webhook event log (with `limit`) |

### Shared AI Memory

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/wordpress-plugin/memory` | List shared AI memory items (with `limit`) |
| POST | `/api/wordpress-plugin/memory` | Create memory items (single or batch via `items[]`) |

### AI Proxied Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/ai/content` | AI content generation |
| POST | `/api/ai/refine` | AI content refinement |

### Accounts

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/wordpress-plugin/accounts` | List WordPress social accounts (credentials redacted) |

## Compatibility

- Works with both Block Editor (Gutenberg) and Classic Editor
- Compatible with WordPress 6.0 through 6.7
- No conflicts with common plugins
- Uses standard WordPress APIs (Settings API, REST API, Dashboard Widgets, Application Passwords)

## License

GPL-2.0-or-later

---

**Next:** [Configuration](configuration.md) | [AI System](ai-system.md) | [API Reference](api-reference.md)
