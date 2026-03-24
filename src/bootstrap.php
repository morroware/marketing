<?php

declare(strict_types=1);

function env_value(string $key, ?string $default = null): ?string
{
    static $loaded = false;

    if (!$loaded) {
        $envFile = __DIR__ . '/../.env';
        if (is_file($envFile)) {
            $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
            foreach ($lines as $line) {
                if (str_starts_with(trim($line), '#') || !str_contains($line, '=')) {
                    continue;
                }
                [$k, $v] = array_map('trim', explode('=', $line, 2));
                $_ENV[$k] = $v;
            }
        }
        $loaded = true;
    }

    return $_ENV[$key] ?? getenv($key) ?: $default;
}

function json_response(array $payload, int $status = 200): void
{
    http_response_code($status);
    header('Content-Type: application/json');
    echo json_encode($payload, JSON_PRETTY_PRINT);
}

function request_json(): array
{
    $body = file_get_contents('php://input') ?: '{}';
    $decoded = json_decode($body, true);
    return is_array($decoded) ? $decoded : [];
}
