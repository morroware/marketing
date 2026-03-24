<?php

declare(strict_types=1);

final class AiService
{
    public function __construct(
        private string $provider,
        private string $businessName,
        private string $industry,
        private string $timezone,
        private array $config,
    ) {
    }

    public function providerStatus(): array
    {
        return [
            'active_provider' => $this->provider,
            'supports' => ['openai', 'anthropic', 'gemini'],
            'has_openai_key' => !empty($this->config['openai_api_key']),
            'has_anthropic_key' => !empty($this->config['anthropic_api_key']),
            'has_gemini_key' => !empty($this->config['gemini_api_key']),
        ];
    }

    public function marketResearch(string $audience, string $goal): array
    {
        $prompt = "Create a practical market research brief for {$this->businessName} in {$this->industry}. Audience: {$audience}. Business goal: {$goal}. Include: ICP summary, top pain points, top objections, 3 competitor angles, messaging opportunities, and a 30-day execution plan.";
        return ['brief' => $this->generate($prompt), 'generated_at' => gmdate(DATE_ATOM), 'provider' => $this->provider];
    }

    public function contentIdeas(string $topic, string $platform): array
    {
        $prompt = "Generate 8 {$platform} content ideas for {$this->businessName} ({$this->industry}) around: {$topic}. Each idea must include: Hook, Value, CTA, and best posting time in {$this->timezone}.";
        return ['ideas' => $this->generate($prompt), 'platform' => $platform, 'topic' => $topic, 'provider' => $this->provider];
    }

    public function generateContent(array $input): array
    {
        $contentType = $input['content_type'] ?? 'social_post';
        $tone = $input['tone'] ?? 'professional';
        $platform = $input['platform'] ?? 'instagram';
        $topic = $input['topic'] ?? 'seasonal promotion';
        $goal = $input['goal'] ?? 'drive qualified leads';
        $length = $input['length'] ?? 'medium';

        $prompt = "Write a {$contentType} for {$platform} for {$this->businessName}. Topic: {$topic}. Tone: {$tone}. Goal: {$goal}. Length: {$length}. Include strong CTA, hashtags, and a short A/B variant.";
        return ['content' => $this->generate($prompt), 'provider' => $this->provider];
    }

    public function scheduleSuggestion(string $objective): array
    {
        $prompt = "Produce a 14-day marketing schedule for {$this->businessName}. Objective: {$objective}. Include date, weekday, channel, content type, posting time in {$this->timezone}, and primary KPI.";
        return ['schedule' => $this->generate($prompt), 'provider' => $this->provider];
    }

    private function generate(string $prompt): string
    {
        return match ($this->provider) {
            'anthropic' => $this->callAnthropic($prompt),
            'gemini' => $this->callGemini($prompt),
            default => $this->callOpenAiCompatible($prompt),
        };
    }

    private function callOpenAiCompatible(string $prompt): string
    {
        if (empty($this->config['openai_api_key'])) {
            return $this->fallback($prompt);
        }

        $url = rtrim((string)$this->config['openai_base_url'], '/') . '/chat/completions';
        $payload = [
            'model' => $this->config['openai_model'] ?? 'gpt-4.1-mini',
            'messages' => [
                ['role' => 'system', 'content' => 'You are a practical SMB marketing strategist. Be concise but specific.'],
                ['role' => 'user', 'content' => $prompt],
            ],
            'temperature' => 0.7,
        ];

        $data = $this->postJson($url, [
            'Authorization: Bearer ' . $this->config['openai_api_key'],
        ], $payload);

        $content = $data['choices'][0]['message']['content'] ?? null;
        return is_string($content) && $content !== '' ? $content : $this->fallback($prompt);
    }

    private function callAnthropic(string $prompt): string
    {
        if (empty($this->config['anthropic_api_key'])) {
            return $this->fallback($prompt);
        }

        $payload = [
            'model' => $this->config['anthropic_model'] ?? 'claude-sonnet-4-20250514',
            'max_tokens' => 1200,
            'system' => 'You are a practical SMB marketing strategist. Be concise but specific.',
            'messages' => [['role' => 'user', 'content' => $prompt]],
        ];

        $data = $this->postJson('https://api.anthropic.com/v1/messages', [
            'x-api-key: ' . $this->config['anthropic_api_key'],
            'anthropic-version: 2023-06-01',
        ], $payload);

        $content = $data['content'][0]['text'] ?? null;
        return is_string($content) && $content !== '' ? $content : $this->fallback($prompt);
    }

    private function callGemini(string $prompt): string
    {
        if (empty($this->config['gemini_api_key'])) {
            return $this->fallback($prompt);
        }

        $model = $this->config['gemini_model'] ?? 'gemini-2.5-flash';
        $url = sprintf('https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent?key=%s', $model, urlencode((string)$this->config['gemini_api_key']));

        $payload = [
            'contents' => [[
                'parts' => [[
                    'text' => 'You are a practical SMB marketing strategist. Be concise but specific. ' . $prompt,
                ]],
            ]],
        ];

        $data = $this->postJson($url, [], $payload);
        $content = $data['candidates'][0]['content']['parts'][0]['text'] ?? null;
        return is_string($content) && $content !== '' ? $content : $this->fallback($prompt);
    }

    private function postJson(string $url, array $headers, array $payload): array
    {
        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST => true,
            CURLOPT_HTTPHEADER => array_merge(['Content-Type: application/json'], $headers),
            CURLOPT_POSTFIELDS => json_encode($payload),
            CURLOPT_TIMEOUT => 45,
        ]);

        $raw = curl_exec($ch);
        $error = curl_error($ch);
        curl_close($ch);

        if ($error || !$raw) {
            return [];
        }

        $decoded = json_decode($raw, true);
        return is_array($decoded) ? $decoded : [];
    }

    private function fallback(string $prompt): string
    {
        return "[Fallback mode: configure AI provider keys in .env]\n\n" .
            "- Core strategy: 40% educational, 30% social proof, 20% offer, 10% behind-the-scenes.\n" .
            "- Recommended cadence: 5 posts/week + 2 stories/day + 1 email/week.\n" .
            "- Highest-conversion windows: Tue 11:30 AM, Wed 6:30 PM, Thu 12:15 PM ({$this->timezone}).\n" .
            "- CTA suggestions: 'Comment START', 'Book your spot', 'Send us DM with keyword'.\n\n" .
            "Prompt used:\n{$prompt}";
    }
}
