<?php

declare(strict_types=1);

final class FunnelRepository
{
    public function __construct(private PDO $pdo)
    {
    }

    public function all(): array
    {
        $funnels = $this->pdo->query('SELECT f.*, c.name as campaign_name FROM funnels f LEFT JOIN campaigns c ON c.id = f.campaign_id ORDER BY f.id DESC')->fetchAll(PDO::FETCH_ASSOC);
        foreach ($funnels as &$funnel) {
            $funnel['stages'] = $this->stages((int)$funnel['id']);
        }
        return $funnels;
    }

    public function find(int $id): ?array
    {
        $stmt = $this->pdo->prepare('SELECT f.*, c.name as campaign_name FROM funnels f LEFT JOIN campaigns c ON c.id = f.campaign_id WHERE f.id = :id LIMIT 1');
        $stmt->execute([':id' => $id]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($row) {
            $row['stages'] = $this->stages($id);
        }
        return $row ?: null;
    }

    public function create(array $data): array
    {
        $this->pdo->prepare('INSERT INTO funnels(name, description, campaign_id, created_at) VALUES(:n,:d,:ci,:c)')->execute([
            ':n' => $data['name'],
            ':d' => $data['description'] ?? '',
            ':ci' => !empty($data['campaign_id']) ? (int)$data['campaign_id'] : null,
            ':c' => gmdate(DATE_ATOM),
        ]);
        $funnelId = (int)$this->pdo->lastInsertId();

        $stages = $data['stages'] ?? [];
        foreach ($stages as $i => $stage) {
            $this->addStage($funnelId, $stage, $i);
        }

        return $this->find($funnelId);
    }

    public function addStage(int $funnelId, array $data, int $order = 0): void
    {
        $this->pdo->prepare('INSERT INTO funnel_stages(funnel_id, name, stage_order, target_count, actual_count, conversion_rate, color, created_at) VALUES(:fi,:n,:so,:tc,:ac,:cr,:co,:c)')->execute([
            ':fi' => $funnelId,
            ':n' => $data['name'],
            ':so' => $data['stage_order'] ?? $order,
            ':tc' => (int)($data['target_count'] ?? 0),
            ':ac' => (int)($data['actual_count'] ?? 0),
            ':cr' => (float)($data['conversion_rate'] ?? 0),
            ':co' => $data['color'] ?? '#4c8dff',
            ':c' => gmdate(DATE_ATOM),
        ]);
    }

    public function update(int $id, array $data): ?array
    {
        $fields = [];
        $params = [':id' => $id];
        foreach (['name', 'description', 'campaign_id'] as $col) {
            if (array_key_exists($col, $data)) {
                $fields[] = "{$col} = :{$col}";
                $params[":{$col}"] = $data[$col];
            }
        }
        if ($fields) {
            $this->pdo->prepare('UPDATE funnels SET ' . implode(', ', $fields) . ' WHERE id = :id')->execute($params);
        }
        return $this->find($id);
    }

    public function updateStage(int $stageId, array $data): void
    {
        $fields = [];
        $params = [':id' => $stageId];
        foreach (['name', 'stage_order', 'target_count', 'actual_count', 'conversion_rate', 'color'] as $col) {
            if (array_key_exists($col, $data)) {
                $fields[] = "{$col} = :{$col}";
                $params[":{$col}"] = $data[$col];
            }
        }
        if ($fields) {
            $this->pdo->prepare('UPDATE funnel_stages SET ' . implode(', ', $fields) . ' WHERE id = :id')->execute($params);
        }
    }

    public function delete(int $id): bool
    {
        $this->pdo->prepare('DELETE FROM funnel_stages WHERE funnel_id = :id')->execute([':id' => $id]);
        $stmt = $this->pdo->prepare('DELETE FROM funnels WHERE id = :id');
        $stmt->execute([':id' => $id]);
        return $stmt->rowCount() > 0;
    }

    public function deleteStage(int $stageId): bool
    {
        $stmt = $this->pdo->prepare('DELETE FROM funnel_stages WHERE id = :id');
        $stmt->execute([':id' => $stageId]);
        return $stmt->rowCount() > 0;
    }

    private function stages(int $funnelId): array
    {
        $stmt = $this->pdo->prepare('SELECT * FROM funnel_stages WHERE funnel_id = :fi ORDER BY stage_order');
        $stmt->execute([':fi' => $funnelId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}
