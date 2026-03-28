/**
 * AI Brain — Streamlined self-awareness dashboard with actionable insights,
 * knowledge map, activity timeline, pipelines, and performance feedback.
 */
import { api } from '../core/api.js';
import { success, error } from '../core/toast.js';
import { $, $$, escapeHtml, formatDateTime } from '../core/utils.js';
import { navigate } from '../core/router.js';

let currentPipelineTemplate = null;

/* ================================================================== */
/*  PAGE LIFECYCLE                                                     */
/* ================================================================== */

export function init() {
  $('#brainRefreshBtn')?.addEventListener('click', refresh);
  $('#brainCapturePerf')?.addEventListener('click', capturePerformance);
  $('#brainLearningFilter')?.addEventListener('change', loadLearnings);
  $('#brainActivityFilter')?.addEventListener('change', loadActivity);
  $('#brainPipelineRunBtn')?.addEventListener('click', runPipeline);
  $('#brainPipelineClose')?.addEventListener('click', closePipelineRunner);

  // Quick-start action buttons on overview
  document.querySelectorAll('[data-brain-action]').forEach(btn => {
    btn.addEventListener('click', () => {
      const action = btn.dataset.brainAction;
      if (action === 'run-pipeline') {
        document.querySelector('[data-tab="brain-pipelines"]')?.click();
      } else if (action === 'view-learnings') {
        document.querySelector('[data-tab="brain-learnings"]')?.click();
      } else if (action === 'ai-studio') {
        navigate('ai');
      } else if (action === 'ai-chat') {
        navigate('chat');
      }
    });
  });
}

export async function refresh() {
  // Show skeleton loading state
  showLoadingState();
  await Promise.all([
    loadOverview(),
    loadLearnings(),
    loadActivity(),
    loadPipelineTemplates(),
    loadPipelineHistory(),
    loadFeedback(),
  ]);
}

function showLoadingState() {
  const metrics = $('#brainMetrics');
  if (metrics) {
    metrics.innerHTML = Array(4).fill(0).map(() =>
      '<div class="metric-card skeleton"><div class="metric-value">--</div><div class="metric-label">Loading...</div></div>'
    ).join('');
  }
}

/* ================================================================== */
/*  OVERVIEW TAB — Redesigned with actionable insights                 */
/* ================================================================== */

async function loadOverview() {
  try {
    const [statusRes, statsRes] = await Promise.all([
      api('/api/ai/brain/status'),
      api('/api/ai/brain/stats?days=7'),
    ]);
    const status = statusRes.item || {};
    const stats = statsRes.item || {};

    renderMetrics(status, stats);
    renderHealthScore(status, stats);
    renderKnowledgeMap(status);
    renderTopLearnings(status);
    renderRecentActivity(stats);
    renderQuickActions(status);
  } catch (e) {
    error('Failed to load brain overview: ' + e.message);
  }
}

function renderMetrics(status, stats) {
  const metricsEl = $('#brainMetrics');
  if (!metricsEl) return;

  const items = [
    { value: stats.total_calls || 0, label: 'AI Calls (7d)', icon: '&#9889;', trend: getTrend(stats.total_calls, 'calls') },
    { value: status.total_learnings || 0, label: 'Learned Insights', icon: '&#128161;', trend: null },
    { value: status.total_feedback || 0, label: 'Feedback Points', icon: '&#127919;', trend: null },
    { value: calculateBrainScore(status, stats), label: 'Brain Score', icon: '&#129504;', trend: null, suffix: '/100' },
  ];

  metricsEl.innerHTML = items.map(m => `
    <div class="metric-card">
      <div class="metric-icon">${m.icon}</div>
      <div class="metric-value">${m.value}${m.suffix || ''}</div>
      <div class="metric-label">${m.label}</div>
      ${m.trend ? `<div class="metric-trend ${m.trend > 0 ? 'up' : 'down'}">${m.trend > 0 ? '&#9650;' : '&#9660;'} ${Math.abs(m.trend)}%</div>` : ''}
    </div>
  `).join('');
}

function calculateBrainScore(status, stats) {
  const learnings = Math.min(40, (status.total_learnings || 0) * 4);
  const activity = Math.min(30, (stats.total_calls || 0) * 1.5);
  const feedback = Math.min(20, (status.total_feedback || 0) * 5);
  const gaps = status.knowledge_gaps || [];
  const coverage = Math.max(0, 10 - gaps.length * 2);
  return Math.min(100, Math.round(learnings + activity + feedback + coverage));
}

function getTrend(current, type) {
  const prev = parseInt(localStorage.getItem('brain_prev_' + type) || '0');
  localStorage.setItem('brain_prev_' + type, String(current || 0));
  if (!prev || !current) return null;
  return Math.round(((current - prev) / prev) * 100);
}

function renderHealthScore(status, stats) {
  const el = $('#brainHealthScore');
  if (!el) return;

  const score = calculateBrainScore(status, stats);
  const gaps = status.knowledge_gaps || [];

  let statusText, statusClass;
  if (score >= 70) { statusText = 'Thriving'; statusClass = 'success'; }
  else if (score >= 40) { statusText = 'Growing'; statusClass = 'warning'; }
  else { statusText = 'Just Getting Started'; statusClass = 'info'; }

  const suggestions = [];
  if (gaps.length > 3) suggestions.push('Use more AI tools across different categories to fill knowledge gaps.');
  if ((stats.total_calls || 0) < 5) suggestions.push('Try running some AI tools — each one teaches the Brain something new.');
  if ((status.total_feedback || 0) === 0) suggestions.push('Capture performance data to help the AI learn what content works best.');
  if ((status.total_learnings || 0) > 5 && gaps.length > 0) suggestions.push(`Focus on ${gaps.slice(0, 2).map(capitalize).join(' and ')} — your AI has gaps there.`);
  if (suggestions.length === 0) suggestions.push('Your AI Brain is well-rounded! Keep using tools to reinforce and expand its knowledge.');

  el.innerHTML = `
    <div class="brain-health">
      <div class="brain-health-ring">
        <svg viewBox="0 0 100 100" class="brain-ring-svg">
          <circle cx="50" cy="50" r="42" class="brain-ring-bg"/>
          <circle cx="50" cy="50" r="42" class="brain-ring-fill" style="stroke-dasharray: ${score * 2.64} 264; stroke-dashoffset: 0"/>
        </svg>
        <div class="brain-ring-label">
          <span class="brain-ring-score">${score}</span>
          <span class="brain-ring-max">/100</span>
        </div>
      </div>
      <div class="brain-health-info">
        <div class="brain-health-status text-${statusClass}">${statusText}</div>
        <div class="brain-health-suggestions">
          ${suggestions.map(s => `<div class="brain-suggestion"><span class="brain-suggestion-icon">&#10148;</span> ${s}</div>`).join('')}
        </div>
      </div>
    </div>
  `;
}

function renderKnowledgeMap(status) {
  const mapEl = $('#brainKnowledgeMap');
  if (!mapEl) return;

  const allCategories = ['audience', 'content', 'strategy', 'performance', 'brand', 'competitor', 'channel', 'timing'];
  const byCategory = {};
  (status.learnings_by_category || []).forEach(c => { byCategory[c.category] = c; });
  const gaps = status.knowledge_gaps || [];

  mapEl.innerHTML = allCategories.map(cat => {
    const data = byCategory[cat];
    const count = data ? data.count : 0;
    const conf = data ? Math.round(data.avg_confidence * 100) : 0;
    const isGap = gaps.includes(cat);
    const barWidth = Math.min(100, count * 10);

    return `<div class="knowledge-bar ${isGap ? 'knowledge-gap' : count >= 5 ? 'knowledge-strong' : ''}">
      <div class="knowledge-bar-header">
        <span class="knowledge-cat-icon">${categoryEmoji(cat)}</span>
        <span class="knowledge-cat-name">${capitalize(cat)}</span>
        <span class="knowledge-cat-stat">${count} insight${count !== 1 ? 's' : ''}${conf ? ` &middot; ${conf}%` : ''}</span>
      </div>
      <div class="knowledge-bar-track">
        <div class="knowledge-bar-fill${isGap ? ' gap' : ''}" style="width:${barWidth}%"></div>
      </div>
    </div>`;
  }).join('');
}

function renderTopLearnings(status) {
  const topEl = $('#brainTopLearnings');
  if (!topEl) return;

  const top = status.strongest_learnings || [];
  if (top.length === 0) {
    topEl.innerHTML = `
      <div class="brain-empty-state">
        <div class="brain-empty-icon">&#128218;</div>
        <p>No learnings yet. Use AI tools to start building knowledge.</p>
        <button class="btn btn-ai btn-sm" data-brain-action="ai-studio"><span class="btn-ai-icon">&#9733;</span> Open AI Studio</button>
      </div>
    `;
    topEl.querySelector('[data-brain-action]')?.addEventListener('click', () => navigate('ai'));
    return;
  }

  topEl.innerHTML = top.map(l => `
    <div class="brain-learning-card">
      <div class="brain-learning-header">
        <span class="brain-cat-badge" style="--cat-color:${categoryColor(l.category)}">${categoryEmoji(l.category)} ${capitalize(l.category)}</span>
        <span class="brain-reinforced" title="Confirmed ${l.times_reinforced} time${l.times_reinforced !== 1 ? 's' : ''}">&#10003; x${l.times_reinforced}</span>
      </div>
      <p class="brain-learning-text">${escapeHtml(l.insight)}</p>
    </div>
  `).join('');
}

function renderRecentActivity(stats) {
  const actEl = $('#brainRecentActivity');
  if (!actEl) return;

  const byTool = stats.by_tool || [];
  if (byTool.length === 0) {
    actEl.innerHTML = '<p class="text-muted text-small">No AI activity recorded yet. Start using AI tools to see activity here.</p>';
    return;
  }

  // Sort by count descending, take top 10
  const sorted = [...byTool].sort((a, b) => b.count - a.count).slice(0, 10);
  const maxCount = sorted[0]?.count || 1;

  actEl.innerHTML = `<div class="activity-bar-chart">${sorted.map(t => `
    <div class="activity-bar-row">
      <span class="activity-bar-label">${escapeHtml(t.tool_name)}</span>
      <div class="activity-bar-track">
        <div class="activity-bar-fill" style="width:${(t.count / maxCount) * 100}%"></div>
      </div>
      <span class="activity-bar-count">${t.count}</span>
    </div>
  `).join('')}</div>`;
}

function renderQuickActions(status) {
  const el = $('#brainQuickActions');
  if (!el) return;

  const gaps = status.knowledge_gaps || [];
  const actions = [];

  if (gaps.includes('content')) {
    actions.push({ icon: '&#9998;', label: 'Generate Content', desc: 'Fill your content knowledge gap', page: 'ai' });
  }
  if (gaps.includes('strategy')) {
    actions.push({ icon: '&#128202;', label: 'Build Strategy', desc: 'Develop marketing strategy insights', page: 'ai' });
  }
  if (gaps.includes('competitor')) {
    actions.push({ icon: '&#9878;', label: 'Analyze Competitors', desc: 'Research your competition', page: 'competitors' });
  }
  if (gaps.includes('audience')) {
    actions.push({ icon: '&#9823;', label: 'Define Audience', desc: 'Build audience personas', page: 'ai' });
  }

  // Always show these
  actions.push({ icon: '&#9889;', label: 'Run Pipeline', desc: 'Multi-step AI workflow', action: 'run-pipeline' });
  actions.push({ icon: '&#128172;', label: 'Ask AI Chat', desc: 'Get marketing advice', page: 'chat' });

  el.innerHTML = actions.slice(0, 4).map(a => `
    <button class="brain-quick-action" ${a.page ? `data-brain-nav="${a.page}"` : `data-brain-action="${a.action}"`}>
      <span class="brain-quick-icon">${a.icon}</span>
      <span class="brain-quick-label">${a.label}</span>
      <span class="brain-quick-desc">${a.desc}</span>
    </button>
  `).join('');

  el.querySelectorAll('[data-brain-nav]').forEach(btn => {
    btn.addEventListener('click', () => navigate(btn.dataset.brainNav));
  });
  el.querySelectorAll('[data-brain-action]').forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.dataset.brainAction === 'run-pipeline') {
        document.querySelector('[data-tab="brain-pipelines"]')?.click();
      }
    });
  });
}

/* ================================================================== */
/*  LEARNINGS TAB                                                      */
/* ================================================================== */

async function loadLearnings() {
  const filter = $('#brainLearningFilter')?.value || '';
  const url = filter ? `/api/ai/brain/learnings?category=${filter}` : '/api/ai/brain/learnings';
  try {
    const data = await api(url);
    const items = data.items || [];
    const el = $('#brainLearningsList');
    if (!el) return;

    if (items.length === 0) {
      el.innerHTML = `
        <div class="brain-empty-state">
          <div class="brain-empty-icon">&#129504;</div>
          <p>No learnings yet. Use AI tools and the system will automatically extract insights.</p>
          <button class="btn btn-ai btn-sm" onclick="location.hash='#ai'"><span class="btn-ai-icon">&#9733;</span> Start Using AI Tools</button>
        </div>
      `;
      return;
    }

    el.innerHTML = items.map(l => `
      <div class="brain-learning-item">
        <div class="brain-learning-item-header">
          <div class="flex gap-1" style="align-items:center">
            <span class="brain-cat-badge" style="--cat-color:${categoryColor(l.category)}">${categoryEmoji(l.category)} ${capitalize(l.category)}</span>
            <span class="text-small text-muted">from ${escapeHtml(l.source_tool || 'unknown')}</span>
          </div>
          <div class="flex gap-1" style="align-items:center">
            <span class="brain-confidence" title="Confidence: ${Math.round(l.confidence * 100)}%">
              <span class="brain-conf-bar"><span class="brain-conf-fill" style="width:${l.confidence * 100}%"></span></span>
              ${Math.round(l.confidence * 100)}%
            </span>
            ${l.times_reinforced > 1 ? `<span class="brain-reinforced-badge">&#10003; x${l.times_reinforced}</span>` : ''}
            <button class="btn btn-ghost btn-sm text-danger" data-delete-learning="${l.id}" title="Delete" aria-label="Delete learning">&#10005;</button>
          </div>
        </div>
        <p class="brain-learning-item-text">${escapeHtml(l.insight)}</p>
        <div class="text-small text-muted">${formatDateTime(l.created_at)}</div>
      </div>
    `).join('');

    // Wire delete buttons
    el.querySelectorAll('[data-delete-learning]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.dataset.deleteLearning;
        try {
          await api(`/api/ai/brain/learnings/${id}`, { method: 'DELETE' });
          success('Learning deleted');
          loadLearnings();
        } catch (e) { error(e.message); }
      });
    });
  } catch (e) {
    error('Failed to load learnings: ' + e.message);
  }
}

/* ================================================================== */
/*  ACTIVITY LOG TAB                                                   */
/* ================================================================== */

async function loadActivity() {
  const filter = $('#brainActivityFilter')?.value || '';
  const url = filter ? `/api/ai/brain/activity?category=${filter}&limit=50` : '/api/ai/brain/activity?limit=50';
  try {
    const data = await api(url);
    const items = data.items || [];
    const el = $('#brainActivityList');
    if (!el) return;

    if (items.length === 0) {
      el.innerHTML = `
        <div class="brain-empty-state">
          <div class="brain-empty-icon">&#128196;</div>
          <p>No activity logged yet. Every AI tool you use will appear here.</p>
        </div>
      `;
      return;
    }

    el.innerHTML = items.map(a => `
      <div class="brain-activity-item">
        <div class="brain-activity-icon" style="--cat-color:${categoryColor(a.tool_category)}">${categoryEmoji(a.tool_category)}</div>
        <div class="brain-activity-content">
          <div class="brain-activity-header">
            <strong>${escapeHtml(a.tool_name)}</strong>
            <span class="text-small text-muted">${a.provider ? escapeHtml(a.provider) + ' &middot; ' : ''}${formatDateTime(a.created_at)}</span>
          </div>
          ${a.input_summary ? `<div class="text-small text-muted brain-activity-input">${escapeHtml(a.input_summary)}</div>` : ''}
          ${a.output_summary ? `<div class="text-small brain-activity-output">${escapeHtml(a.output_summary.substring(0, 200))}</div>` : ''}
        </div>
      </div>
    `).join('');
  } catch (e) {
    error('Failed to load activity: ' + e.message);
  }
}

/* ================================================================== */
/*  PIPELINES TAB                                                      */
/* ================================================================== */

async function loadPipelineTemplates() {
  try {
    const data = await api('/api/ai/pipelines/templates');
    const items = data.items || [];
    const el = $('#brainPipelineTemplates');
    if (!el) return;

    el.innerHTML = items.map(t => `
      <div class="brain-pipeline-card" data-pipeline-id="${escapeHtml(t.id)}">
        <div class="brain-pipeline-card-header">
          <h4>${escapeHtml(t.name)}</h4>
          <span class="brain-pipeline-steps-count">${t.steps.length} steps</span>
        </div>
        <p class="text-small text-muted">${escapeHtml(t.description)}</p>
        <div class="brain-pipeline-steps-preview">
          ${t.steps.map((s, i) => `<span class="brain-pipeline-step-dot" title="${escapeHtml(s.label)}">${i + 1}</span>`).join('<span class="brain-pipeline-arrow">&#8594;</span>')}
        </div>
        <button class="btn btn-ai btn-sm brain-pipeline-run-btn">Run Pipeline</button>
      </div>
    `).join('');

    el.querySelectorAll('[data-pipeline-id]').forEach(card => {
      card.querySelector('.brain-pipeline-run-btn')?.addEventListener('click', (e) => {
        e.stopPropagation();
        openPipelineRunner(card.dataset.pipelineId, items.find(t => t.id === card.dataset.pipelineId));
      });
      card.addEventListener('click', () => openPipelineRunner(card.dataset.pipelineId, items.find(t => t.id === card.dataset.pipelineId)));
    });
  } catch (e) {
    error('Failed to load pipeline templates: ' + e.message);
  }
}

function openPipelineRunner(templateId, template) {
  currentPipelineTemplate = { id: templateId, ...template };
  const runner = $('#brainPipelineRunner');
  if (!runner) return;

  runner.classList.remove('hidden');
  runner.scrollIntoView({ behavior: 'smooth', block: 'start' });

  $('#brainPipelineName').textContent = template.name;
  $('#brainPipelineDesc').textContent = template.description;

  // Show steps with visual flow
  $('#brainPipelineSteps').innerHTML = `<div class="brain-pipeline-flow">${template.steps.map((s, i) => `
    <div class="brain-pipeline-flow-step" id="pipelineStep${i}">
      <span class="brain-pipeline-flow-num">${i + 1}</span>
      <span class="brain-pipeline-flow-label">${escapeHtml(s.label)}</span>
      <span class="brain-pipeline-flow-tool">${escapeHtml(s.tool)}</span>
    </div>
    ${i < template.steps.length - 1 ? '<div class="brain-pipeline-flow-connector"></div>' : ''}
  `).join('')}</div>`;

  // Build input fields
  const variableSet = new Set();
  (template.steps || []).forEach(s => {
    Object.values(s.map || {}).forEach(v => {
      if (typeof v === 'string') {
        for (const m of v.matchAll(/\{\{(\w+)\}\}/g)) {
          if (!m[1].startsWith('prev')) variableSet.add(m[1]);
        }
      }
    });
  });

  const inputs = $('#brainPipelineInputs');
  if (inputs) {
    if (variableSet.size === 0) {
      inputs.innerHTML = '<p class="text-small text-muted">No additional inputs needed. Click Run to start.</p>';
    } else {
      inputs.innerHTML = Array.from(variableSet).map(v => `
        <div class="brain-pipeline-input-group">
          <label>${capitalize(v.replace(/_/g, ' '))}</label>
          <input data-pipeline-var="${v}" placeholder="Enter ${v.replace(/_/g, ' ')}" class="input" />
        </div>
      `).join('');
    }
  }

  $('#brainPipelineResults')?.classList.add('hidden');
}

function closePipelineRunner() {
  $('#brainPipelineRunner')?.classList.add('hidden');
  currentPipelineTemplate = null;
}

async function runPipeline() {
  if (!currentPipelineTemplate) return;

  const btn = $('#brainPipelineRunBtn');
  btn.classList.add('loading');
  btn.disabled = true;

  // Gather variables
  const variables = {};
  $$('#brainPipelineInputs [data-pipeline-var]').forEach(input => {
    variables[input.dataset.pipelineVar] = input.value;
  });

  // Animate steps
  const stepEls = document.querySelectorAll('.brain-pipeline-flow-step');

  try {
    const data = await api('/api/ai/pipelines/run', {
      method: 'POST',
      body: JSON.stringify({ template_id: currentPipelineTemplate.id, variables }),
    });
    const result = data.item || {};

    // Mark steps as complete/error
    (result.steps || []).forEach((s, i) => {
      if (stepEls[i]) {
        stepEls[i].classList.add(s.status === 'completed' ? 'step-complete' : 'step-error');
      }
    });

    const resultsEl = $('#brainPipelineResults');
    if (resultsEl) {
      resultsEl.classList.remove('hidden');
      const steps = result.steps || [];
      resultsEl.innerHTML = `
        <div class="brain-pipeline-results-header">
          <h4>Results <span class="badge ${result.status === 'completed' ? 'text-success' : 'text-danger'}">${result.status}</span></h4>
        </div>
        ${steps.map(s => `
          <div class="brain-pipeline-result-step ${s.status === 'completed' ? 'result-success' : 'result-error'}">
            <div class="flex-between">
              <strong>${s.status === 'completed' ? '&#10003;' : '&#10007;'} Step ${s.step}: ${escapeHtml(s.label)}</strong>
              <span class="text-small text-muted">${s.duration_ms ? `${(s.duration_ms / 1000).toFixed(1)}s` : ''}</span>
            </div>
            ${s.status === 'completed' ? `<div class="brain-pipeline-output">${escapeHtml(typeof s.output === 'string' ? s.output : JSON.stringify(s.output, null, 2)).substring(0, 2000)}</div>` : ''}
            ${s.error ? `<div class="text-danger text-small mt-1">${escapeHtml(s.error)}</div>` : ''}
          </div>
        `).join('')}
        ${result.next_actions?.length ? `
          <div class="brain-pipeline-next-actions">
            <h4>Suggested Next Steps</h4>
            <div class="flex flex-wrap gap-1">
              ${result.next_actions.map(a => `<button class="btn btn-ai btn-sm" title="${escapeHtml(a.reason)}">${escapeHtml(a.tool)}</button>`).join('')}
            </div>
          </div>
        ` : ''}
      `;
    }

    success('Pipeline completed!');
    loadPipelineHistory();
  } catch (e) {
    error('Pipeline failed: ' + e.message);
  } finally {
    btn.classList.remove('loading');
    btn.disabled = false;
  }
}

async function loadPipelineHistory() {
  try {
    const data = await api('/api/ai/pipelines/runs?limit=10');
    const items = data.items || [];
    const el = $('#brainPipelineHistory');
    if (!el) return;

    if (items.length === 0) {
      el.innerHTML = '<p class="text-muted text-small">No pipeline runs yet. Pick a template above to get started.</p>';
      return;
    }

    el.innerHTML = items.map(r => `
      <div class="brain-history-item">
        <span class="brain-history-status ${r.status === 'completed' ? 'status-success' : r.status === 'partial' ? 'status-warning' : 'status-error'}">
          ${r.status === 'completed' ? '&#10003;' : r.status === 'partial' ? '&#9888;' : '&#10007;'}
        </span>
        <strong style="flex:1">${escapeHtml(r.name)}</strong>
        <span class="text-small text-muted">${r.steps_completed}/${r.steps_total} steps</span>
        <span class="text-small text-muted">${formatDateTime(r.started_at)}</span>
      </div>
    `).join('');
  } catch (e) {
    // Silently fail for non-critical section
  }
}

/* ================================================================== */
/*  FEEDBACK TAB                                                       */
/* ================================================================== */

async function loadFeedback() {
  try {
    const data = await api('/api/ai/brain/feedback?limit=30');
    const items = data.items || [];
    const el = $('#brainFeedbackList');
    if (!el) return;

    if (items.length === 0) {
      el.innerHTML = `
        <div class="brain-empty-state">
          <div class="brain-empty-icon">&#127919;</div>
          <p>No performance feedback yet. Publish AI-generated content, then click "Capture Performance" to start the feedback loop.</p>
          <button class="btn btn-ai btn-sm" id="brainCapturePerf2">&#127919; Capture Performance Now</button>
        </div>
      `;
      el.querySelector('#brainCapturePerf2')?.addEventListener('click', capturePerformance);
      return;
    }

    el.innerHTML = items.map(f => `
      <div class="brain-feedback-item">
        <div class="brain-feedback-metric">
          <span class="brain-feedback-value">${f.metric_value}</span>
          <span class="brain-feedback-name">${escapeHtml(f.metric_name)}</span>
        </div>
        <div class="brain-feedback-details">
          <strong>${escapeHtml(f.entity_type)} #${f.entity_id}</strong>
          ${f.feedback_note ? `<div class="text-small text-muted">${escapeHtml(f.feedback_note)}</div>` : ''}
          ${f.tool_name ? `<div class="text-small text-muted">Generated by: ${escapeHtml(f.tool_name)}</div>` : ''}
          <div class="text-small text-muted">${formatDateTime(f.created_at)}</div>
        </div>
      </div>
    `).join('');
  } catch (e) {
    // Silently fail
  }
}

async function capturePerformance() {
  const btn = $('#brainCapturePerf') || $('#brainCapturePerf2');
  if (btn) {
    btn.classList.add('loading');
    btn.disabled = true;
  }
  try {
    const data = await api('/api/ai/brain/capture-performance', { method: 'POST' });
    const captured = data.item?.captured || 0;
    success(`Captured performance data for ${captured} posts`);
    if (captured > 0) loadFeedback();
  } catch (e) {
    error(e.message);
  } finally {
    if (btn) {
      btn.classList.remove('loading');
      btn.disabled = false;
    }
  }
}

/* ================================================================== */
/*  HELPERS                                                            */
/* ================================================================== */

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function categoryColor(cat) {
  const colors = {
    content: '#6366f1', strategy: '#8b5cf6', analysis: '#a855f7',
    conversation: '#3b82f6', pipeline: '#06b6d4', audience: '#f59e0b',
    brand: '#ec4899', competitor: '#ef4444', channel: '#10b981',
    timing: '#f97316', performance: '#14b8a6', general: '#6b7280',
  };
  return colors[cat] || '#6b7280';
}

function categoryEmoji(cat) {
  const emojis = {
    content: '&#9998;', strategy: '&#128202;', analysis: '&#128300;',
    conversation: '&#128172;', pipeline: '&#9889;', audience: '&#9823;',
    brand: '&#127912;', competitor: '&#9878;', channel: '&#128225;',
    timing: '&#9200;', performance: '&#127919;', general: '&#9733;',
  };
  return emojis[cat] || '&#9733;';
}
