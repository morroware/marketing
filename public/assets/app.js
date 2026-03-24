async function api(path, options = {}) {
  const response = await fetch(path, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  return response.json();
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

async function refreshSettings() {
  const data = await api('/api/settings');
  document.getElementById('settingsSummary').textContent = `${data.business_name} • ${data.business_industry} • ${data.timezone}`;
  document.getElementById('providerBadge').textContent = `Provider: ${data.ai.active_provider}`;
}

async function refreshDashboard() {
  const data = await api('/api/dashboard');
  const metrics = data.metrics || {};
  const cards = [
    ['Total posts', metrics.posts ?? 0],
    ['Scheduled', metrics.scheduled ?? 0],
    ['Published', metrics.published ?? 0],
    ['Avg AI score', metrics.avg_score ?? 0],
  ];

  document.getElementById('metrics').innerHTML = cards
    .map(([label, value]) => `<div class="metric"><h4>${label}</h4><div>${escapeHtml(value)}</div></div>`)
    .join('');
}

async function refreshCampaigns() {
  const { items } = await api('/api/campaigns');
  const list = document.getElementById('campaignList');
  const select = document.getElementById('campaignSelect');

  list.innerHTML = items
    .map((c) => `<li><strong>${escapeHtml(c.name)}</strong> — ${escapeHtml(c.channel)} / ${escapeHtml(c.objective)} ($${escapeHtml(c.budget)}) <span class="small">${escapeHtml(c.start_date || '')} ${c.end_date ? '→ ' + escapeHtml(c.end_date) : ''}</span></li>`)
    .join('');

  select.innerHTML = ['<option value="">No campaign</option>']
    .concat(items.map((c) => `<option value="${c.id}">${escapeHtml(c.name)}</option>`))
    .join('');
}

async function refreshPosts() {
  const { items } = await api('/api/posts');
  const table = document.getElementById('postTable');

  table.innerHTML = items
    .map((p) => {
      const statusClass = p.status === 'published' ? 'badge published' : 'badge';
      return `<tr>
        <td>${p.id}</td>
        <td>${escapeHtml(p.campaign_name || '-')}</td>
        <td>${escapeHtml(p.platform)}</td>
        <td>${escapeHtml(p.content_type || 'social_post')}</td>
        <td><strong>${escapeHtml(p.title)}</strong><div class="small">${escapeHtml((p.cta || '').slice(0, 70))}</div></td>
        <td><span class="${statusClass}">${escapeHtml(p.status)}</span></td>
        <td>${escapeHtml(p.scheduled_for || '-')}</td>
        <td><button class="btn-ok" data-action="publish" data-id="${p.id}">Mark published</button></td>
      </tr>`;
    })
    .join('');

  table.querySelectorAll('button[data-action="publish"]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      await api(`/api/posts/${btn.dataset.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'published' }),
      });
      await Promise.all([refreshPosts(), refreshDashboard()]);
    });
  });
}

async function refreshCompetitors() {
  const { items } = await api('/api/competitors');
  document.getElementById('competitorList').innerHTML = items
    .map((c) => `<li><strong>${escapeHtml(c.name)}</strong> (${escapeHtml(c.channel)})<br><span class="small">${escapeHtml(c.positioning || '')}</span><br>${escapeHtml(c.opportunity || '')}</li>`)
    .join('');
}

async function refreshKpis() {
  const { items } = await api('/api/kpis');
  document.getElementById('kpiTable').innerHTML = items
    .slice(0, 30)
    .map((row) => `<tr><td>${escapeHtml(row.logged_on)}</td><td>${escapeHtml(row.channel)}</td><td>${escapeHtml(row.metric_name)}</td><td>${escapeHtml(row.metric_value)}</td><td>${escapeHtml(row.note || '')}</td></tr>`)
    .join('');
}

function bindForms() {
  document.getElementById('campaignForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    const formData = Object.fromEntries(new FormData(event.target).entries());
    await api('/api/campaigns', {
      method: 'POST',
      body: JSON.stringify(formData),
    });
    event.target.reset();
    await refreshCampaigns();
  });

  document.getElementById('postForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    const formData = Object.fromEntries(new FormData(event.target).entries());
    if (!formData.status) {
      formData.status = formData.scheduled_for ? 'scheduled' : 'draft';
    }
    await api('/api/posts', {
      method: 'POST',
      body: JSON.stringify(formData),
    });
    event.target.reset();
    await Promise.all([refreshPosts(), refreshDashboard()]);
  });

  document.getElementById('competitorForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    const formData = Object.fromEntries(new FormData(event.target).entries());
    await api('/api/competitors', {
      method: 'POST',
      body: JSON.stringify(formData),
    });
    event.target.reset();
    await refreshCompetitors();
  });

  document.getElementById('kpiForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    const formData = Object.fromEntries(new FormData(event.target).entries());
    await api('/api/kpis', {
      method: 'POST',
      body: JSON.stringify(formData),
    });
    event.target.reset();
    await Promise.all([refreshKpis(), refreshDashboard()]);
  });
}

function bindAiActions() {
  const aiOutput = document.getElementById('aiOutput');

  document.getElementById('runResearch').addEventListener('click', async () => {
    const audience = document.getElementById('audience').value;
    const goal = document.getElementById('goal').value;
    const { item } = await api('/api/ai/research', {
      method: 'POST',
      body: JSON.stringify({ audience, goal }),
    });
    aiOutput.textContent = item.brief;
  });

  document.getElementById('runIdeas').addEventListener('click', async () => {
    const topic = document.getElementById('topic').value;
    const platform = document.getElementById('platformIdeas').value;
    const { item } = await api('/api/ai/ideas', {
      method: 'POST',
      body: JSON.stringify({ topic, platform }),
    });
    aiOutput.textContent = item.ideas;
  });

  document.getElementById('runContent').addEventListener('click', async () => {
    const payload = {
      content_type: document.getElementById('contentType').value,
      tone: document.getElementById('tone').value,
      platform: document.getElementById('contentPlatform').value,
      topic: document.getElementById('contentTopic').value,
      goal: document.getElementById('contentGoal').value,
    };
    const { item } = await api('/api/ai/content', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    aiOutput.textContent = item.content;
  });

  document.getElementById('runCalendar').addEventListener('click', async () => {
    const objective = document.getElementById('calendarGoal').value;
    const { item } = await api('/api/ai/calendar', {
      method: 'POST',
      body: JSON.stringify({ objective }),
    });
    aiOutput.textContent = item.schedule;
  });
}

async function boot() {
  bindForms();
  bindAiActions();
  await Promise.all([
    refreshSettings(),
    refreshDashboard(),
    refreshCampaigns(),
    refreshPosts(),
    refreshCompetitors(),
    refreshKpis(),
  ]);
}

boot();
