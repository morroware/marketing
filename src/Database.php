<?php

declare(strict_types=1);

final class Database
{
    private PDO $pdo;

    public function __construct(string $path)
    {
        if (!is_dir(dirname($path))) {
            mkdir(dirname($path), 0777, true);
        }

        $this->pdo = new PDO('sqlite:' . $path);
        $this->pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        $this->migrate();
    }

    public function pdo(): PDO
    {
        return $this->pdo;
    }

    private function migrate(): void
    {
        $this->pdo->exec('CREATE TABLE IF NOT EXISTS campaigns (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            channel TEXT NOT NULL,
            objective TEXT NOT NULL,
            budget REAL NOT NULL DEFAULT 0,
            notes TEXT DEFAULT "",
            start_date TEXT,
            end_date TEXT,
            created_at TEXT NOT NULL
        )');

        $this->pdo->exec('CREATE TABLE IF NOT EXISTS posts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            campaign_id INTEGER,
            platform TEXT NOT NULL,
            content_type TEXT DEFAULT "social_post",
            title TEXT NOT NULL,
            body TEXT NOT NULL,
            cta TEXT DEFAULT "",
            tags TEXT DEFAULT "",
            scheduled_for TEXT,
            status TEXT NOT NULL DEFAULT "draft",
            ai_score INTEGER DEFAULT 0,
            created_at TEXT NOT NULL,
            FOREIGN KEY(campaign_id) REFERENCES campaigns(id)
        )');

        $this->pdo->exec('CREATE TABLE IF NOT EXISTS competitors (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            channel TEXT NOT NULL,
            positioning TEXT DEFAULT "",
            recent_activity TEXT DEFAULT "",
            opportunity TEXT DEFAULT "",
            created_at TEXT NOT NULL
        )');

        $this->pdo->exec('CREATE TABLE IF NOT EXISTS kpi_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            channel TEXT NOT NULL,
            metric_name TEXT NOT NULL,
            metric_value REAL NOT NULL,
            logged_on TEXT NOT NULL,
            note TEXT DEFAULT ""
        )');

        $this->pdo->exec('CREATE TABLE IF NOT EXISTS research_briefs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            focus TEXT NOT NULL,
            output TEXT NOT NULL,
            created_at TEXT NOT NULL
        )');

        $this->pdo->exec('CREATE TABLE IF NOT EXISTS content_ideas (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            topic TEXT NOT NULL,
            platform TEXT NOT NULL,
            output TEXT NOT NULL,
            created_at TEXT NOT NULL
        )');

        $this->applySafeAlter('campaigns', 'start_date', 'TEXT');
        $this->applySafeAlter('campaigns', 'end_date', 'TEXT');
        $this->applySafeAlter('posts', 'content_type', 'TEXT DEFAULT "social_post"');
        $this->applySafeAlter('posts', 'cta', 'TEXT DEFAULT ""');
        $this->applySafeAlter('posts', 'tags', 'TEXT DEFAULT ""');
    }

    private function applySafeAlter(string $table, string $column, string $type): void
    {
        $stmt = $this->pdo->query(sprintf('PRAGMA table_info(%s)', $table));
        $columns = array_map(static fn(array $row) => $row['name'], $stmt->fetchAll(PDO::FETCH_ASSOC));

        if (!in_array($column, $columns, true)) {
            $this->pdo->exec(sprintf('ALTER TABLE %s ADD COLUMN %s %s', $table, $column, $type));
        }
    }
}
