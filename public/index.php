<?php

declare(strict_types=1);

require __DIR__ . '/../src/bootstrap.php';
require __DIR__ . '/../src/Database.php';
require __DIR__ . '/../src/Repositories.php';
require __DIR__ . '/../src/AiService.php';

$db = new Database(__DIR__ . '/../data/marketing.sqlite');
$campaigns = new CampaignRepository($db->pdo());
$posts = new PostRepository($db->pdo());
$competitors = new CompetitorRepository($db->pdo());
$kpis = new KpiRepository($db->pdo());
$aiLogs = new AiLogRepository($db->pdo());

$ai = new AiService(
    env_value('AI_PROVIDER', 'openai') ?? 'openai',
    env_value('BUSINESS_NAME', 'My Small Business') ?? 'My Small Business',
    env_value('BUSINESS_INDUSTRY', 'Local services') ?? 'Local services',
    env_value('TIMEZONE', 'America/New_York') ?? 'America/New_York',
    [
        'openai_api_key' => env_value('OPENAI_API_KEY'),
        'openai_base_url' => env_value('OPENAI_BASE_URL', 'https://api.openai.com/v1') ?? 'https://api.openai.com/v1',
        'openai_model' => env_value('AI_MODEL', 'gpt-4.1-mini') ?? 'gpt-4.1-mini',
        'anthropic_api_key' => env_value('ANTHROPIC_API_KEY'),
        'anthropic_model' => env_value('ANTHROPIC_MODEL', 'claude-sonnet-4-20250514') ?? 'claude-sonnet-4-20250514',
        'gemini_api_key' => env_value('GEMINI_API_KEY'),
        'gemini_model' => env_value('GEMINI_MODEL', 'gemini-2.5-flash') ?? 'gemini-2.5-flash',
    ],
);

$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH) ?: '/';

if (str_starts_with($path, '/api/')) {
    if ($path === '/api/health' && $method === 'GET') {
        json_response(['ok' => true, 'service' => 'marketing-suite']);
        return;
    }

    if ($path === '/api/settings' && $method === 'GET') {
        json_response([
            'business_name' => env_value('BUSINESS_NAME', 'My Small Business'),
            'business_industry' => env_value('BUSINESS_INDUSTRY', 'Local services'),
            'timezone' => env_value('TIMEZONE', 'America/New_York'),
            'ai' => $ai->providerStatus(),
        ]);
        return;
    }

    if ($path === '/api/dashboard' && $method === 'GET') {
        json_response([
            'metrics' => $posts->metrics(),
            'campaigns' => count($campaigns->all()),
            'kpis' => $kpis->summary(),
            'recent_posts' => array_slice($posts->all(), 0, 8),
            'recent_ideas' => array_slice($aiLogs->ideas(), 0, 5),
        ]);
        return;
    }

    if ($path === '/api/campaigns' && $method === 'GET') {
        json_response(['items' => $campaigns->all()]);
        return;
    }

    if ($path === '/api/campaigns' && $method === 'POST') {
        $payload = request_json();
        foreach (['name', 'channel', 'objective'] as $required) {
            if (empty($payload[$required])) {
                json_response(['error' => "Missing field: {$required}"], 422);
                return;
            }
        }
        json_response(['item' => $campaigns->create($payload)], 201);
        return;
    }

    if ($path === '/api/posts' && $method === 'GET') {
        json_response(['items' => $posts->all()]);
        return;
    }

    if ($path === '/api/posts' && $method === 'POST') {
        $payload = request_json();
        foreach (['platform', 'title', 'body'] as $required) {
            if (empty($payload[$required])) {
                json_response(['error' => "Missing field: {$required}"], 422);
                return;
            }
        }
        json_response(['item' => $posts->create($payload)], 201);
        return;
    }

    if (preg_match('#^/api/posts/(\d+)$#', $path, $matches) && $method === 'PATCH') {
        $payload = request_json();
        if (empty($payload['status'])) {
            json_response(['error' => 'Missing field: status'], 422);
            return;
        }
        $updated = $posts->updateStatus((int)$matches[1], $payload['status']);
        json_response(['item' => $updated]);
        return;
    }

    if ($path === '/api/competitors' && $method === 'GET') {
        json_response(['items' => $competitors->all()]);
        return;
    }

    if ($path === '/api/competitors' && $method === 'POST') {
        $payload = request_json();
        foreach (['name', 'channel'] as $required) {
            if (empty($payload[$required])) {
                json_response(['error' => "Missing field: {$required}"], 422);
                return;
            }
        }
        json_response(['item' => $competitors->create($payload)], 201);
        return;
    }

    if ($path === '/api/kpis' && $method === 'GET') {
        json_response(['items' => $kpis->all(), 'summary' => $kpis->summary()]);
        return;
    }

    if ($path === '/api/kpis' && $method === 'POST') {
        $payload = request_json();
        foreach (['channel', 'metric_name', 'metric_value'] as $required) {
            if ($payload[$required] === '' || !isset($payload[$required])) {
                json_response(['error' => "Missing field: {$required}"], 422);
                return;
            }
        }
        json_response(['item' => $kpis->create($payload)], 201);
        return;
    }

    if ($path === '/api/ideas' && $method === 'GET') {
        json_response(['items' => $aiLogs->ideas()]);
        return;
    }

    if ($path === '/api/ai/research' && $method === 'POST') {
        $payload = request_json();
        $focus = sprintf('audience=%s;goal=%s', $payload['audience'] ?? 'local customers', $payload['goal'] ?? 'grow inbound leads');
        $result = $ai->marketResearch($payload['audience'] ?? 'local customers', $payload['goal'] ?? 'grow inbound leads');
        $aiLogs->saveResearch($focus, $result['brief']);
        json_response(['item' => $result]);
        return;
    }

    if ($path === '/api/ai/content' && $method === 'POST') {
        $payload = request_json();
        json_response(['item' => $ai->generateContent($payload)]);
        return;
    }

    if ($path === '/api/ai/ideas' && $method === 'POST') {
        $payload = request_json();
        $topic = $payload['topic'] ?? 'seasonal offer';
        $platform = $payload['platform'] ?? 'instagram';
        $result = $ai->contentIdeas($topic, $platform);
        $aiLogs->saveIdea($topic, $platform, $result['ideas']);
        json_response(['item' => $result]);
        return;
    }

    if ($path === '/api/ai/calendar' && $method === 'POST') {
        $payload = request_json();
        json_response(['item' => $ai->scheduleSuggestion($payload['objective'] ?? 'increase qualified leads')]);
        return;
    }

    json_response(['error' => 'Not found'], 404);
    return;
}

$file = $path === '/' ? '/app.html' : $path;
$publicFile = __DIR__ . $file;
if (!is_file($publicFile)) {
    http_response_code(404);
    echo 'Not found';
    return;
}

$ext = pathinfo($publicFile, PATHINFO_EXTENSION);
$types = [
    'html' => 'text/html',
    'css' => 'text/css',
    'js' => 'application/javascript',
];
if (isset($types[$ext])) {
    header('Content-Type: ' . $types[$ext]);
}
readfile($publicFile);
