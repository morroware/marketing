<?php

declare(strict_types=1);

function register_contact_routes(Router $router, ContactRepository $contacts, AutomationRepository $automations): void
{
    $router->get('/api/contacts', function () use ($contacts) {
        $stage = $_GET['stage'] ?? null;
        $search = $_GET['search'] ?? null;
        json_response($contacts->all($stage, $search));
    });

    $router->get('/api/contacts/metrics', fn() => json_response($contacts->metrics()));

    $router->get('/api/contacts/stages', fn() => json_response($contacts->stageBreakdown()));

    $router->post('/api/contacts', function () use ($contacts, $automations) {
        $data = request_json();
        if (empty($data['email'])) {
            json_response(['error' => 'email is required'], 400);
            return;
        }
        $contact = $contacts->create($data);
        $automations->fire('contact.created', ['contact_id' => $contact['id'], 'email' => $contact['email'], 'source' => $data['source'] ?? 'manual']);
        json_response($contact, 201);
    });

    $router->get('/api/contacts/{id}', function (array $params) use ($contacts) {
        $contact = $contacts->find((int)$params['id']);
        if (!$contact) {
            json_response(['error' => 'Not found'], 404);
            return;
        }
        $contact['activities'] = $contacts->activities((int)$params['id']);
        json_response($contact);
    });

    $router->patch('/api/contacts/{id}', function (array $params) use ($contacts, $automations) {
        $data = request_json();
        $old = $contacts->find((int)$params['id']);
        $contact = $contacts->update((int)$params['id'], $data);
        if ($contact && $old && isset($data['stage']) && $old['stage'] !== $data['stage']) {
            $contacts->logActivity((int)$params['id'], 'stage_changed', "Stage changed from {$old['stage']} to {$data['stage']}");
            $automations->fire('contact.stage_changed', ['contact_id' => $contact['id'], 'old_stage' => $old['stage'], 'new_stage' => $data['stage']]);
        }
        $contact ? json_response($contact) : json_response(['error' => 'Not found'], 404);
    });

    $router->delete('/api/contacts/{id}', function (array $params) use ($contacts) {
        $contacts->delete((int)$params['id'])
            ? json_response(['deleted' => true])
            : json_response(['error' => 'Not found'], 404);
    });

    $router->post('/api/contacts/{id}/activity', function (array $params) use ($contacts) {
        $data = request_json();
        $contacts->logActivity((int)$params['id'], $data['type'] ?? 'note', $data['description'] ?? '', $data['data'] ?? []);
        json_response(['ok' => true]);
    });
}
