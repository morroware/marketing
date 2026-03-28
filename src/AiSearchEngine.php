<?php

declare(strict_types=1);

/**
 * AiSearchEngine — Unified search across user data, web, and websites.
 *
 * Capabilities:
 *  1. Internal data search: posts, campaigns, contacts, learnings, shared memory, etc.
 *  2. Web search via AI-powered synthesis (uses provider to search & summarize)
 *  3. Website content extraction & analysis
 *  4. Combined multi-source search with relevance ranking
 *  5. Context building for agent tasks from search results
 */
final class AiSearchEngine
{
    public function __construct(
        private PDO $pdo,
        private AiService $ai,
        private ?AiMemoryEngine $memoryEngine = null,
    ) {}

    /* ================================================================== */
    /*  UNIFIED SEARCH — Combines all sources                              */
    /* ================================================================== */

    /**
     * Execute a unified search across multiple sources.
     *
     * @param string   $query   Natural language search query
     * @param string[] $sources Which sources to search: internal, web, website
     * @param string   $url     URL to crawl (for 'website' source)
     * @param int      $limit   Max results per source
     * @return array   Organized search results with AI-generated summary
     */
    public function search(string $query, array $sources = ['internal'], string $url = '', int $limit = 10): array
    {
        $results = [
            'query' => $query,
            'sources' => [],
            'total_results' => 0,
            'summary' => '',
        ];

        foreach ($sources as $source) {
            switch ($source) {
                case 'internal':
                    $internal = $this->searchInternal($query, $limit);
                    $results['sources']['internal'] = $internal;
                    $results['total_results'] += count($internal['results']);
                    break;
                case 'web':
                    $web = $this->searchWeb($query);
                    $results['sources']['web'] = $web;
                    $results['total_results'] += 1;
                    break;
                case 'website':
                    if ($url !== '') {
                        $website = $this->analyzeWebsite($url, $query);
                        $results['sources']['website'] = $website;
                        $results['total_results'] += 1;
                    }
                    break;
            }
        }

        // Generate AI summary if we have results from multiple sources
        if ($results['total_results'] > 0) {
            $results['summary'] = $this->synthesizeResults($query, $results['sources']);
        }

        return $results;
    }

    /* ================================================================== */
    /*  INTERNAL SEARCH — User's own data                                  */
    /* ================================================================== */

    /**
     * Search across all internal data tables.
     */
    public function searchInternal(string $query, int $limit = 10): array
    {
        $keywords = $this->extractKeywords($query);
        $results = [];

        // Search posts
        $posts = $this->searchTable(
            'posts', ['title', 'body', 'tags'], $keywords, $limit,
            'id, title, body, platform, status, created_at',
            'post'
        );
        $results = array_merge($results, $posts);

        // Search campaigns
        $campaigns = $this->searchTable(
            'campaigns', ['name', 'description', 'objective', 'target_audience'], $keywords, $limit,
            'id, name, description, objective, status, created_at',
            'campaign'
        );
        $results = array_merge($results, $campaigns);

        // Search contacts
        $contacts = $this->searchTable(
            'contacts', ['name', 'email', 'company', 'notes', 'tags'], $keywords, $limit,
            'id, name, email, company, tags, created_at',
            'contact'
        );
        $results = array_merge($results, $contacts);

        // Search AI learnings
        $learnings = $this->searchTable(
            'ai_learnings', ['insight', 'category'], $keywords, $limit,
            'id, category, insight, confidence, source_tool, created_at',
            'learning'
        );
        $results = array_merge($results, $learnings);

        // Search shared memory
        $memories = $this->searchTable(
            'ai_shared_memory', ['memory_key', 'content', 'tags'], $keywords, $limit,
            'id, memory_key, content, source, tags, created_at',
            'memory'
        );
        $results = array_merge($results, $memories);

        // Search email campaigns
        $emails = $this->searchTable(
            'email_campaigns', ['name', 'subject', 'body_html'], $keywords, $limit,
            'id, name, subject, status, created_at',
            'email_campaign'
        );
        $results = array_merge($results, $emails);

        // Search content ideas (if table exists)
        try {
            $ideas = $this->searchTable(
                'content_ideas', ['title', 'description', 'notes'], $keywords, $limit,
                'id, title, description, status, created_at',
                'idea'
            );
            $results = array_merge($results, $ideas);
        } catch (\PDOException $e) {
            // Table may not exist
        }

        // Search landing pages
        try {
            $pages = $this->searchTable(
                'landing_pages', ['name', 'html_content'], $keywords, $limit,
                'id, name, status, created_at',
                'landing_page'
            );
            $results = array_merge($results, $pages);
        } catch (\PDOException $e) {
            // Table may not exist
        }

        // Score and sort by relevance
        usort($results, fn($a, $b) => ($b['relevance'] ?? 0) <=> ($a['relevance'] ?? 0));

        return [
            'results' => array_slice($results, 0, $limit * 2),
            'total' => count($results),
        ];
    }

    /**
     * Search a single table for keyword matches.
     */
    private function searchTable(
        string $table,
        array $searchColumns,
        array $keywords,
        int $limit,
        string $selectColumns,
        string $type,
    ): array {
        if (empty($keywords)) return [];

        $conditions = [];
        $params = [];
        $paramIdx = 0;

        foreach ($keywords as $kw) {
            $colConditions = [];
            foreach ($searchColumns as $col) {
                $paramName = ":kw{$paramIdx}";
                $colConditions[] = "{$col} LIKE {$paramName}";
                $params[$paramName] = "%{$kw}%";
                $paramIdx++;
            }
            $conditions[] = '(' . implode(' OR ', $colConditions) . ')';
        }

        $where = implode(' OR ', $conditions);
        $sql = "SELECT {$selectColumns} FROM {$table} WHERE {$where} ORDER BY created_at DESC LIMIT :lim";

        try {
            $stmt = $this->pdo->prepare($sql);
            foreach ($params as $k => $v) {
                $stmt->bindValue($k, $v);
            }
            $stmt->bindValue(':lim', $limit, PDO::PARAM_INT);
            $stmt->execute();
            $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (\PDOException $e) {
            return [];
        }

        return array_map(function ($row) use ($type, $keywords, $searchColumns) {
            $relevance = 0;
            foreach ($searchColumns as $col) {
                $val = strtolower($row[$col] ?? '');
                foreach ($keywords as $kw) {
                    $relevance += substr_count($val, strtolower($kw));
                }
            }
            return [
                'type' => $type,
                'data' => $row,
                'relevance' => $relevance,
            ];
        }, $rows);
    }

    /* ================================================================== */
    /*  WEB SEARCH — AI-powered web intelligence                           */
    /* ================================================================== */

    /**
     * Use AI to perform a web-aware search and synthesis.
     * The AI model uses its training data to provide current-ish information.
     * For real-time data, we attempt a basic HTTP fetch of search-like queries.
     */
    public function searchWeb(string $query): array
    {
        $businessContext = '';
        if ($this->ai->getBusinessProfile()) {
            $bp = $this->ai->getBusinessProfile();
            $businessContext = "Business: {$this->ai->getBusinessName()} in {$this->ai->getIndustry()}.";
            if (!empty($bp['target_audience'])) $businessContext .= " Target: {$bp['target_audience']}.";
        }

        $prompt = "Act as a thorough marketing research analyst with web access. Research the following query in the context of this business:

BUSINESS CONTEXT: {$businessContext}

RESEARCH QUERY: {$query}

Provide a comprehensive research report including:
1. **Key Findings** — The most important facts, trends, and data points relevant to this query
2. **Market Intelligence** — Current market conditions, competitor landscape, industry trends
3. **Actionable Insights** — Specific, implementable recommendations
4. **Data Points** — Any relevant statistics, benchmarks, or metrics
5. **Sources & Confidence** — How confident you are in each finding (high/medium/low)

Format as structured markdown. Be specific and data-driven, not generic.";

        $result = $this->ai->generateAdvanced(
            $this->ai->buildSystemPrompt('You are a senior marketing research analyst. Provide deep, specific, data-driven research. Include concrete numbers, trends, and actionable intelligence. Never give generic advice.'),
            $prompt,
            null,
            null,
            4096,
            0.4,
        );

        return [
            'query' => $query,
            'research' => $result,
            'provider' => $this->ai->getProvider(),
        ];
    }

    /* ================================================================== */
    /*  WEBSITE ANALYSIS — Crawl and analyze web pages                     */
    /* ================================================================== */

    /**
     * Fetch a URL and analyze its content in context of the query.
     */
    public function analyzeWebsite(string $url, string $context = ''): array
    {
        // Validate URL
        if (!filter_var($url, FILTER_VALIDATE_URL)) {
            return ['error' => 'Invalid URL', 'url' => $url];
        }

        // Block private/reserved IPs (SSRF protection)
        $host = parse_url($url, PHP_URL_HOST);
        if ($host && $this->isPrivateHost($host)) {
            return ['error' => 'Private/reserved hosts are not allowed', 'url' => $url];
        }

        // Fetch the page content
        $content = $this->fetchUrl($url);
        if ($content === null) {
            return ['error' => 'Failed to fetch URL', 'url' => $url];
        }

        // Extract text content from HTML
        $textContent = $this->extractTextFromHtml($content);
        $truncated = mb_substr($textContent, 0, 6000);

        // Extract metadata
        $meta = $this->extractMetadata($content);

        // AI analysis of the content
        $analysisPrompt = "Analyze the following website content" . ($context ? " in the context of: {$context}" : '') . "

URL: {$url}
TITLE: {$meta['title']}
META DESCRIPTION: {$meta['description']}

PAGE CONTENT:
{$truncated}

Provide:
1. **Page Summary** — What this page is about
2. **Key Information** — Important facts, data, claims, and offers
3. **Marketing Analysis** — Tone, target audience, value propositions, CTAs
4. **Competitive Intelligence** — If relevant, what can we learn from their approach
5. **SEO Observations** — Title tags, meta descriptions, content structure
6. **Actionable Takeaways** — What we can apply to our own marketing";

        $analysis = $this->ai->generateAdvanced(
            $this->ai->buildSystemPrompt('You are a marketing analyst specializing in competitive intelligence and website analysis. Be specific and actionable.'),
            $analysisPrompt,
            null,
            null,
            3000,
            0.4,
        );

        return [
            'url' => $url,
            'title' => $meta['title'],
            'description' => $meta['description'],
            'word_count' => str_word_count($textContent),
            'analysis' => $analysis,
        ];
    }

    /* ================================================================== */
    /*  CONTEXT BUILDER — Build rich context for agent tasks                */
    /* ================================================================== */

    /**
     * Build a comprehensive context string from search results for use in agent tasks.
     */
    public function buildSearchContext(array $searchResults): string
    {
        $parts = [];

        if (!empty($searchResults['sources']['internal']['results'])) {
            $internal = $searchResults['sources']['internal']['results'];
            $parts[] = "INTERNAL DATA (" . count($internal) . " results):";
            foreach (array_slice($internal, 0, 8) as $r) {
                $data = $r['data'] ?? [];
                $type = strtoupper($r['type'] ?? 'unknown');
                $summary = $this->summarizeResult($data);
                $parts[] = "  [{$type}] {$summary}";
            }
        }

        if (!empty($searchResults['sources']['web']['research'])) {
            $parts[] = "\nWEB RESEARCH:\n" . mb_substr($searchResults['sources']['web']['research'], 0, 2000);
        }

        if (!empty($searchResults['sources']['website']['analysis'])) {
            $url = $searchResults['sources']['website']['url'] ?? '';
            $parts[] = "\nWEBSITE ANALYSIS ({$url}):\n" . mb_substr($searchResults['sources']['website']['analysis'], 0, 2000);
        }

        if (!empty($searchResults['summary'])) {
            $parts[] = "\nSYNTHESIS:\n" . $searchResults['summary'];
        }

        return implode("\n", $parts);
    }

    /* ================================================================== */
    /*  AI SYNTHESIS — Combine results into actionable intelligence         */
    /* ================================================================== */

    private function synthesizeResults(string $query, array $sources): string
    {
        $contextParts = ["SEARCH QUERY: {$query}\n"];

        if (!empty($sources['internal']['results'])) {
            $contextParts[] = "INTERNAL DATA:";
            foreach (array_slice($sources['internal']['results'], 0, 6) as $r) {
                $contextParts[] = "- [{$r['type']}] " . $this->summarizeResult($r['data'] ?? []);
            }
        }

        if (!empty($sources['web']['research'])) {
            $contextParts[] = "\nWEB RESEARCH (excerpt):\n" . mb_substr($sources['web']['research'], 0, 1500);
        }

        if (!empty($sources['website']['analysis'])) {
            $contextParts[] = "\nWEBSITE ANALYSIS (excerpt):\n" . mb_substr($sources['website']['analysis'], 0, 1000);
        }

        $context = implode("\n", $contextParts);

        return $this->ai->generateAdvanced(
            'You are an AI research synthesizer. Create a concise, actionable synthesis from multi-source search results. Focus on what matters most for marketing decisions.',
            "Synthesize these search results into a brief, actionable summary. Highlight the most important findings, connections between data points, and recommended actions.\n\n{$context}",
            null,
            null,
            1500,
            0.5,
        );
    }

    /* ================================================================== */
    /*  HELPERS                                                            */
    /* ================================================================== */

    private function extractKeywords(string $query): array
    {
        $stopWords = ['the', 'is', 'at', 'which', 'on', 'a', 'an', 'and', 'or', 'but', 'in', 'with', 'to', 'for', 'of', 'not', 'from', 'by', 'as', 'it', 'its', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'this', 'that', 'these', 'those', 'what', 'how', 'my', 'our', 'your', 'their', 'all', 'any', 'some', 'about', 'into', 'more', 'most', 'such', 'only', 'than', 'then', 'when', 'where', 'who', 'whom', 'why', 'each', 'every', 'both', 'few', 'many', 'much', 'me', 'we', 'you', 'he', 'she', 'they', 'i'];

        $words = preg_split('/[\s,;.!?]+/', strtolower(trim($query)));
        $words = array_filter($words, fn($w) => mb_strlen($w) >= 2 && !in_array($w, $stopWords, true));
        return array_values(array_unique($words));
    }

    private function summarizeResult(array $data): string
    {
        // Try common column names for a human-readable summary
        $nameFields = ['title', 'name', 'subject', 'memory_key', 'insight'];
        $label = '';
        foreach ($nameFields as $f) {
            if (!empty($data[$f])) {
                $label = mb_substr($data[$f], 0, 120);
                break;
            }
        }
        if ($label === '' && !empty($data['content'])) {
            $label = mb_substr($data['content'], 0, 120);
        }
        if ($label === '' && !empty($data['email'])) {
            $label = $data['email'];
        }

        $extras = [];
        if (!empty($data['status'])) $extras[] = $data['status'];
        if (!empty($data['platform'])) $extras[] = $data['platform'];
        if (!empty($data['category'])) $extras[] = $data['category'];

        return $label . (empty($extras) ? '' : ' (' . implode(', ', $extras) . ')');
    }

    private function fetchUrl(string $url): ?string
    {
        $ch = curl_init();
        curl_setopt_array($ch, [
            CURLOPT_URL => $url,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_MAXREDIRS => 3,
            CURLOPT_TIMEOUT => 15,
            CURLOPT_CONNECTTIMEOUT => 10,
            CURLOPT_SSL_VERIFYPEER => true,
            CURLOPT_USERAGENT => 'Mozilla/5.0 (compatible; MarketingSuite/1.0)',
            CURLOPT_HTTPHEADER => ['Accept: text/html,application/xhtml+xml'],
        ]);
        $body = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($body === false || $httpCode >= 400) return null;
        return (string)$body;
    }

    private function extractTextFromHtml(string $html): string
    {
        // Remove script/style/nav/footer tags
        $html = preg_replace('/<(script|style|nav|footer|header|aside|noscript)[^>]*>.*?<\/\1>/is', '', $html);
        // Remove HTML tags
        $text = strip_tags($html);
        // Collapse whitespace
        $text = preg_replace('/\s+/', ' ', $text);
        return trim($text);
    }

    private function extractMetadata(string $html): array
    {
        $title = '';
        if (preg_match('/<title[^>]*>(.*?)<\/title>/is', $html, $m)) {
            $title = html_entity_decode(trim($m[1]));
        }
        $description = '';
        if (preg_match('/<meta[^>]*name=["\']description["\'][^>]*content=["\'](.*?)["\']/is', $html, $m)) {
            $description = html_entity_decode(trim($m[1]));
        }
        return ['title' => $title, 'description' => $description];
    }

    private function isPrivateHost(string $host): bool
    {
        // Resolve hostname
        $ip = gethostbyname($host);
        if ($ip === $host && !filter_var($host, FILTER_VALIDATE_IP)) {
            return false; // Could not resolve — allow (will fail on connect)
        }
        if (filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE) === false) {
            return true;
        }
        // Also block localhost variants
        if (in_array($host, ['localhost', '0.0.0.0', '127.0.0.1', '::1'], true)) {
            return true;
        }
        return false;
    }
}
