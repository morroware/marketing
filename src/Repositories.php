<?php

declare(strict_types=1);

final class CampaignRepository
{
    public function __construct(private PDO $pdo)
    {
    }

    public function all(): array
    {
        $stmt = $this->pdo->query('SELECT * FROM campaigns ORDER BY id DESC');
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function create(array $data): array
    {
        $stmt = $this->pdo->prepare('INSERT INTO campaigns(name, channel, objective, budget, notes, start_date, end_date, created_at) VALUES(:name,:channel,:objective,:budget,:notes,:start_date,:end_date,:created_at)');
        $stmt->execute([
            ':name' => $data['name'],
            ':channel' => $data['channel'],
            ':objective' => $data['objective'],
            ':budget' => (float)($data['budget'] ?? 0),
            ':notes' => $data['notes'] ?? '',
            ':start_date' => $data['start_date'] ?? null,
            ':end_date' => $data['end_date'] ?? null,
            ':created_at' => gmdate(DATE_ATOM),
        ]);

        return $this->find((int)$this->pdo->lastInsertId());
    }

    public function find(int $id): ?array
    {
        $stmt = $this->pdo->prepare('SELECT * FROM campaigns WHERE id = :id LIMIT 1');
        $stmt->execute([':id' => $id]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        return $row ?: null;
    }
}

final class PostRepository
{
    public function __construct(private PDO $pdo)
    {
    }

    public function all(): array
    {
        $stmt = $this->pdo->query('SELECT p.*, c.name as campaign_name FROM posts p LEFT JOIN campaigns c ON c.id = p.campaign_id ORDER BY COALESCE(p.scheduled_for, p.created_at) DESC');
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function create(array $data): array
    {
        $stmt = $this->pdo->prepare('INSERT INTO posts(campaign_id, platform, content_type, title, body, cta, tags, scheduled_for, status, ai_score, created_at) VALUES(:campaign_id,:platform,:content_type,:title,:body,:cta,:tags,:scheduled_for,:status,:ai_score,:created_at)');
        $stmt->execute([
            ':campaign_id' => !empty($data['campaign_id']) ? (int)$data['campaign_id'] : null,
            ':platform' => $data['platform'],
            ':content_type' => $data['content_type'] ?? 'social_post',
            ':title' => $data['title'],
            ':body' => $data['body'],
            ':cta' => $data['cta'] ?? '',
            ':tags' => $data['tags'] ?? '',
            ':scheduled_for' => $data['scheduled_for'] ?: null,
            ':status' => $data['status'] ?? 'draft',
            ':ai_score' => (int)($data['ai_score'] ?? 0),
            ':created_at' => gmdate(DATE_ATOM),
        ]);

        return $this->find((int)$this->pdo->lastInsertId());
    }

    public function updateStatus(int $id, string $status): ?array
    {
        $stmt = $this->pdo->prepare('UPDATE posts SET status = :status WHERE id = :id');
        $stmt->execute([':status' => $status, ':id' => $id]);
        return $this->find($id);
    }

    public function find(int $id): ?array
    {
        $stmt = $this->pdo->prepare('SELECT p.*, c.name as campaign_name FROM posts p LEFT JOIN campaigns c ON c.id = p.campaign_id WHERE p.id = :id LIMIT 1');
        $stmt->execute([':id' => $id]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        return $row ?: null;
    }

    public function metrics(): array
    {
        $totals = $this->pdo->query('SELECT COUNT(*) as posts, SUM(CASE WHEN status = "scheduled" THEN 1 ELSE 0 END) as scheduled, SUM(CASE WHEN status = "published" THEN 1 ELSE 0 END) as published, AVG(ai_score) as avg_score FROM posts')->fetch(PDO::FETCH_ASSOC);
        return [
            'posts' => (int)($totals['posts'] ?? 0),
            'scheduled' => (int)($totals['scheduled'] ?? 0),
            'published' => (int)($totals['published'] ?? 0),
            'avg_score' => round((float)($totals['avg_score'] ?? 0), 1),
        ];
    }
}

final class CompetitorRepository
{
    public function __construct(private PDO $pdo)
    {
    }

    public function all(): array
    {
        return $this->pdo->query('SELECT * FROM competitors ORDER BY id DESC')->fetchAll(PDO::FETCH_ASSOC);
    }

    public function create(array $data): array
    {
        $stmt = $this->pdo->prepare('INSERT INTO competitors(name, channel, positioning, recent_activity, opportunity, created_at) VALUES(:name,:channel,:positioning,:recent_activity,:opportunity,:created_at)');
        $stmt->execute([
            ':name' => $data['name'],
            ':channel' => $data['channel'],
            ':positioning' => $data['positioning'] ?? '',
            ':recent_activity' => $data['recent_activity'] ?? '',
            ':opportunity' => $data['opportunity'] ?? '',
            ':created_at' => gmdate(DATE_ATOM),
        ]);
        $id = (int)$this->pdo->lastInsertId();
        return $this->pdo->query('SELECT * FROM competitors WHERE id = ' . $id)->fetch(PDO::FETCH_ASSOC) ?: [];
    }
}

final class KpiRepository
{
    public function __construct(private PDO $pdo)
    {
    }

    public function all(): array
    {
        return $this->pdo->query('SELECT * FROM kpi_logs ORDER BY logged_on DESC, id DESC')->fetchAll(PDO::FETCH_ASSOC);
    }

    public function create(array $data): array
    {
        $stmt = $this->pdo->prepare('INSERT INTO kpi_logs(channel, metric_name, metric_value, logged_on, note) VALUES(:channel,:metric_name,:metric_value,:logged_on,:note)');
        $stmt->execute([
            ':channel' => $data['channel'],
            ':metric_name' => $data['metric_name'],
            ':metric_value' => (float)$data['metric_value'],
            ':logged_on' => $data['logged_on'] ?? gmdate('Y-m-d'),
            ':note' => $data['note'] ?? '',
        ]);
        $id = (int)$this->pdo->lastInsertId();
        return $this->pdo->query('SELECT * FROM kpi_logs WHERE id = ' . $id)->fetch(PDO::FETCH_ASSOC) ?: [];
    }

    public function summary(): array
    {
        $rows = $this->pdo->query('SELECT channel, metric_name, AVG(metric_value) as avg_value, MAX(logged_on) as latest_on FROM kpi_logs GROUP BY channel, metric_name ORDER BY channel, metric_name')->fetchAll(PDO::FETCH_ASSOC);
        return $rows;
    }
}

final class AiLogRepository
{
    public function __construct(private PDO $pdo)
    {
    }

    public function saveResearch(string $focus, string $output): void
    {
        $stmt = $this->pdo->prepare('INSERT INTO research_briefs(focus, output, created_at) VALUES(:focus,:output,:created_at)');
        $stmt->execute([':focus' => $focus, ':output' => $output, ':created_at' => gmdate(DATE_ATOM)]);
    }

    public function saveIdea(string $topic, string $platform, string $output): void
    {
        $stmt = $this->pdo->prepare('INSERT INTO content_ideas(topic, platform, output, created_at) VALUES(:topic,:platform,:output,:created_at)');
        $stmt->execute([':topic' => $topic, ':platform' => $platform, ':output' => $output, ':created_at' => gmdate(DATE_ATOM)]);
    }

    public function ideas(): array
    {
        return $this->pdo->query('SELECT * FROM content_ideas ORDER BY id DESC LIMIT 50')->fetchAll(PDO::FETCH_ASSOC);
    }
}
