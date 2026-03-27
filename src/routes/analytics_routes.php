<?php

declare(strict_types=1);

function register_analytics_routes(Router $router, Analytics $analytics): void
{
    $router->get('/api/analytics/overview', function () use ($analytics) {
        $days = max(1, min(365, (int)($_GET['days'] ?? 30)));
        json_response($analytics->overview($days));
    });

    $router->get('/api/analytics/content', function () use ($analytics) {
        json_response(['items' => $analytics->contentPerformance()]);
    });

    $router->get('/api/analytics/chart/{metric}', function ($p) use ($analytics) {
        $allowedMetrics = ['posts_by_day', 'posts_by_platform', 'kpi_trend', 'publish_success'];
        if (!in_array($p['metric'], $allowedMetrics, true)) {
            json_response(['error' => 'Invalid metric'], 400);
            return;
        }
        $days = max(1, min(365, (int)($_GET['days'] ?? 30)));
        json_response(['data' => $analytics->chartData($p['metric'], $days)]);
    });

    $router->get('/api/analytics/export/{type}', function ($p) use ($analytics) {
        $allowedTypes = ['posts', 'campaigns', 'kpis', 'competitors', 'subscribers', 'publish_log'];
        if (!in_array($p['type'], $allowedTypes, true)) {
            json_response(['error' => 'Invalid export type'], 400);
            return;
        }
        $csv = $analytics->exportCsv($p['type']);
        if ($csv === '') { json_response(['error' => 'No data'], 404); return; }
        csv_response($csv, $p['type'] . '-export-' . date('Y-m-d') . '.csv');
    });
}
