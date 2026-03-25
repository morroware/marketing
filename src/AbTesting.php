<?php

declare(strict_types=1);

final class AbTestRepository
{
    public function __construct(private PDO $pdo)
    {
    }

    public function all(): array
    {
        $tests = $this->pdo->query('SELECT * FROM ab_tests ORDER BY id DESC')->fetchAll(PDO::FETCH_ASSOC);
        foreach ($tests as &$test) {
            $test['variants'] = $this->variants((int)$test['id']);
        }
        return $tests;
    }

    public function find(int $id): ?array
    {
        $stmt = $this->pdo->prepare('SELECT * FROM ab_tests WHERE id = :id LIMIT 1');
        $stmt->execute([':id' => $id]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($row) {
            $row['variants'] = $this->variants($id);
        }
        return $row ?: null;
    }

    public function create(array $data): array
    {
        $this->pdo->prepare('INSERT INTO ab_tests(name, test_type, status, metric, notes, started_at, created_at) VALUES(:n,:tt,:st,:m,:nt,:sa,:c)')->execute([
            ':n' => $data['name'],
            ':tt' => $data['test_type'] ?? 'content',
            ':st' => $data['status'] ?? 'running',
            ':m' => $data['metric'] ?? 'clicks',
            ':nt' => $data['notes'] ?? '',
            ':sa' => gmdate(DATE_ATOM),
            ':c' => gmdate(DATE_ATOM),
        ]);
        $testId = (int)$this->pdo->lastInsertId();

        // Create variants
        $variants = $data['variants'] ?? [];
        foreach ($variants as $v) {
            $this->addVariant($testId, $v);
        }

        return $this->find($testId);
    }

    public function addVariant(int $testId, array $data): void
    {
        $this->pdo->prepare('INSERT INTO ab_variants(test_id, variant_name, content, created_at) VALUES(:ti,:vn,:c,:ca)')->execute([
            ':ti' => $testId,
            ':vn' => $data['variant_name'] ?? $data['name'] ?? 'Variant',
            ':c' => $data['content'] ?? '',
            ':ca' => gmdate(DATE_ATOM),
        ]);
    }

    public function update(int $id, array $data): ?array
    {
        $fields = [];
        $params = [':id' => $id];
        foreach (['name', 'test_type', 'status', 'metric', 'notes', 'winner_variant'] as $col) {
            if (array_key_exists($col, $data)) {
                $fields[] = "{$col} = :{$col}";
                $params[":{$col}"] = $data[$col];
            }
        }
        if (($data['status'] ?? '') === 'completed') {
            $fields[] = "ended_at = :ea";
            $params[':ea'] = gmdate(DATE_ATOM);
        }
        if ($fields) {
            $this->pdo->prepare('UPDATE ab_tests SET ' . implode(', ', $fields) . ' WHERE id = :id')->execute($params);
        }
        return $this->find($id);
    }

    public function recordImpression(int $variantId): void
    {
        $this->pdo->prepare('UPDATE ab_variants SET impressions = impressions + 1 WHERE id = :id')->execute([':id' => $variantId]);
    }

    public function recordConversion(int $variantId): void
    {
        $this->pdo->prepare('UPDATE ab_variants SET conversions = conversions + 1 WHERE id = :id')->execute([':id' => $variantId]);
    }

    public function updateVariant(int $variantId, array $data): void
    {
        $fields = [];
        $params = [':id' => $variantId];
        foreach (['variant_name', 'content', 'impressions', 'conversions'] as $col) {
            if (array_key_exists($col, $data)) {
                $fields[] = "{$col} = :{$col}";
                $params[":{$col}"] = $data[$col];
            }
        }
        if ($fields) {
            $this->pdo->prepare('UPDATE ab_variants SET ' . implode(', ', $fields) . ' WHERE id = :id')->execute($params);
        }
    }

    public function delete(int $id): bool
    {
        $this->pdo->prepare('DELETE FROM ab_variants WHERE test_id = :id')->execute([':id' => $id]);
        $stmt = $this->pdo->prepare('DELETE FROM ab_tests WHERE id = :id');
        $stmt->execute([':id' => $id]);
        return $stmt->rowCount() > 0;
    }

    private function variants(int $testId): array
    {
        $stmt = $this->pdo->prepare('SELECT * FROM ab_variants WHERE test_id = :ti ORDER BY id');
        $stmt->execute([':ti' => $testId]);
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
        foreach ($rows as &$row) {
            $row['conversion_rate'] = $row['impressions'] > 0 ? round(($row['conversions'] / $row['impressions']) * 100, 2) : 0;
        }
        return $rows;
    }
}
