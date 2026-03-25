<?php

declare(strict_types=1);

final class ContactRepository
{
    public function __construct(private PDO $pdo)
    {
    }

    public function all(?string $stage = null, ?string $search = null): array
    {
        $where = [];
        $params = [];
        if ($stage) {
            $where[] = 'stage = :stage';
            $params[':stage'] = $stage;
        }
        if ($search) {
            $where[] = '(email LIKE :s OR first_name LIKE :s2 OR last_name LIKE :s3 OR company LIKE :s4)';
            $params[':s'] = "%{$search}%";
            $params[':s2'] = "%{$search}%";
            $params[':s3'] = "%{$search}%";
            $params[':s4'] = "%{$search}%";
        }
        $sql = 'SELECT * FROM contacts';
        if ($where) {
            $sql .= ' WHERE ' . implode(' AND ', $where);
        }
        $sql .= ' ORDER BY id DESC';
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function find(int $id): ?array
    {
        $stmt = $this->pdo->prepare('SELECT * FROM contacts WHERE id = :id LIMIT 1');
        $stmt->execute([':id' => $id]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        return $row ?: null;
    }

    public function findByEmail(string $email): ?array
    {
        $stmt = $this->pdo->prepare('SELECT * FROM contacts WHERE email = :e LIMIT 1');
        $stmt->execute([':e' => strtolower(trim($email))]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        return $row ?: null;
    }

    public function create(array $data): array
    {
        $email = strtolower(trim($data['email']));
        $existing = $this->findByEmail($email);
        if ($existing) {
            return $this->update($existing['id'], $data);
        }

        $stmt = $this->pdo->prepare('INSERT INTO contacts(email, first_name, last_name, company, phone, source, source_detail, stage, score, tags, notes, custom_fields, created_at) VALUES(:e,:fn,:ln,:co,:ph,:src,:sd,:st,:sc,:tg,:nt,:cf,:c)');
        $stmt->execute([
            ':e' => $email,
            ':fn' => $data['first_name'] ?? '',
            ':ln' => $data['last_name'] ?? '',
            ':co' => $data['company'] ?? '',
            ':ph' => $data['phone'] ?? '',
            ':src' => $data['source'] ?? 'manual',
            ':sd' => $data['source_detail'] ?? '',
            ':st' => $data['stage'] ?? 'lead',
            ':sc' => (int)($data['score'] ?? 0),
            ':tg' => $data['tags'] ?? '',
            ':nt' => $data['notes'] ?? '',
            ':cf' => is_array($data['custom_fields'] ?? null) ? json_encode($data['custom_fields']) : ($data['custom_fields'] ?? '{}'),
            ':c' => gmdate(DATE_ATOM),
        ]);
        $id = (int)$this->pdo->lastInsertId();
        $this->logActivity($id, 'created', 'Contact created via ' . ($data['source'] ?? 'manual'));
        return $this->find($id);
    }

    public function update(int $id, array $data): ?array
    {
        $fields = [];
        $params = [':id' => $id];
        $allowed = ['first_name', 'last_name', 'company', 'phone', 'source', 'source_detail', 'stage', 'score', 'tags', 'notes', 'custom_fields'];
        foreach ($allowed as $col) {
            if (array_key_exists($col, $data)) {
                $fields[] = "{$col} = :{$col}";
                $val = $data[$col];
                if ($col === 'custom_fields' && is_array($val)) $val = json_encode($val);
                $params[":{$col}"] = $val;
            }
        }
        if ($fields) {
            $fields[] = "updated_at = :ua";
            $params[':ua'] = gmdate(DATE_ATOM);
            $this->pdo->prepare('UPDATE contacts SET ' . implode(', ', $fields) . ' WHERE id = :id')->execute($params);
        }
        return $this->find($id);
    }

    public function delete(int $id): bool
    {
        $this->pdo->prepare('DELETE FROM contact_activities WHERE contact_id = :id')->execute([':id' => $id]);
        $stmt = $this->pdo->prepare('DELETE FROM contacts WHERE id = :id');
        $stmt->execute([':id' => $id]);
        return $stmt->rowCount() > 0;
    }

    public function logActivity(int $contactId, string $type, string $description, array $data = []): void
    {
        $this->pdo->prepare('INSERT INTO contact_activities(contact_id, activity_type, description, data_json, created_at) VALUES(:ci,:at,:d,:dj,:c)')->execute([
            ':ci' => $contactId,
            ':at' => $type,
            ':d' => $description,
            ':dj' => json_encode($data),
            ':c' => gmdate(DATE_ATOM),
        ]);
        $this->pdo->prepare('UPDATE contacts SET last_activity = :la WHERE id = :id')->execute([
            ':la' => gmdate(DATE_ATOM),
            ':id' => $contactId,
        ]);
    }

    public function activities(int $contactId): array
    {
        $stmt = $this->pdo->prepare('SELECT * FROM contact_activities WHERE contact_id = :ci ORDER BY id DESC LIMIT 50');
        $stmt->execute([':ci' => $contactId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function stageBreakdown(): array
    {
        return $this->pdo->query("SELECT stage, COUNT(*) as count FROM contacts GROUP BY stage ORDER BY CASE stage WHEN 'lead' THEN 1 WHEN 'mql' THEN 2 WHEN 'sql' THEN 3 WHEN 'opportunity' THEN 4 WHEN 'customer' THEN 5 ELSE 6 END")->fetchAll(PDO::FETCH_ASSOC);
    }

    public function metrics(): array
    {
        $row = $this->pdo->query("SELECT COUNT(*) as total, SUM(CASE WHEN stage='lead' THEN 1 ELSE 0 END) as leads, SUM(CASE WHEN stage='mql' THEN 1 ELSE 0 END) as mqls, SUM(CASE WHEN stage='sql' THEN 1 ELSE 0 END) as sqls, SUM(CASE WHEN stage='opportunity' THEN 1 ELSE 0 END) as opportunities, SUM(CASE WHEN stage='customer' THEN 1 ELSE 0 END) as customers, AVG(score) as avg_score FROM contacts")->fetch(PDO::FETCH_ASSOC);
        return $row ?: [];
    }
}
