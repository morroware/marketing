/**
 * Contextual Help Widget — floating help panel with section-specific guidance.
 * Provides quick tips, links to relevant features, and a searchable FAQ.
 */
import { $, escapeHtml } from './utils.js';
import { currentPageName, navigate } from './router.js';
import { startTour, resetAllTours } from './guidedTour.js';

/* ================================================================== */
/*  HELP CONTENT DATABASE                                              */
/* ================================================================== */

const helpContent = {
  dashboard: {
    title: 'Dashboard',
    icon: '&#9632;',
    tips: [
      { text: 'Your dashboard shows key metrics, recent content, and AI insights at a glance.' },
      { text: 'Use the AI Quick Actions to generate content without leaving the dashboard.' },
      { text: 'The AI Insights card shows proactive recommendations based on your marketing data.' },
    ],
    quickActions: [
      { label: 'Create a post', page: 'content' },
      { label: 'Run AI Studio', page: 'ai' },
      { label: 'Check analytics', page: 'analytics' },
    ],
  },
  ai: {
    title: 'AI Studio',
    icon: '&#9733;',
    tips: [
      { text: '25+ AI tools organized into Content Creation, Analysis, and Strategy categories.' },
      { text: 'Click any tool card to expand it. Fill in the inputs and hit the AI button to generate.' },
      { text: 'Use "Copy" to grab the output, or "Use in Post" to send it straight to Content Studio.' },
      { text: 'Switch AI providers per-request using the provider dropdown at the top.' },
    ],
    quickActions: [
      { label: 'AI Chat for advice', page: 'chat' },
      { label: 'View AI Brain', page: 'brain' },
    ],
  },
  brain: {
    title: 'AI Brain',
    icon: '&#129504;',
    tips: [
      { text: 'The AI Brain learns from every tool you use and feeds insights back into future AI calls.' },
      { text: 'Knowledge Coverage shows which areas your AI knows about. Red bars = gaps to fill.' },
      { text: 'Learnings are auto-extracted. High-confidence insights get reinforced over time.' },
      { text: 'Pipelines chain multiple AI tools together for automated workflows.' },
      { text: 'Capture Performance feeds real content metrics back to improve AI quality.' },
    ],
    quickActions: [
      { label: 'Run a pipeline', action: () => document.querySelector('[data-tab="brain-pipelines"]')?.click() },
      { label: 'View learnings', action: () => document.querySelector('[data-tab="brain-learnings"]')?.click() },
    ],
  },
  content: {
    title: 'Content Studio',
    icon: '&#9998;',
    tips: [
      { text: 'Create, schedule, and manage all your content from one place.' },
      { text: 'Use the AI buttons (Write, Title, Hashtags, Score) to supercharge your content.' },
      { text: 'The inline AI toolbar above the body field offers quick refinements.' },
      { text: 'Switch between Calendar and List views to manage your content pipeline.' },
    ],
    quickActions: [
      { label: 'AI Studio tools', page: 'ai' },
      { label: 'Publish Queue', page: 'queue' },
    ],
  },
  email: {
    title: 'Email Marketing',
    icon: '&#9993;',
    tips: [
      { text: 'Create email lists, manage subscribers, and send campaigns with tracking.' },
      { text: 'Use AI Write Email for instant professional email drafts.' },
      { text: 'AI Subject Lines generates 10 click-worthy options.' },
      { text: 'Track opens and clicks in real-time after sending.' },
    ],
    quickActions: [
      { label: 'AI Studio for emails', page: 'ai' },
      { label: 'Create a form', page: 'forms' },
    ],
  },
  campaigns: {
    title: 'Campaigns',
    icon: '&#9776;',
    tips: [
      { text: 'Track your marketing campaigns with budgets, objectives, and ROI.' },
      { text: 'AI Strategy generates a full campaign plan based on your objectives.' },
      { text: 'AI Optimize analyzes your campaign and suggests improvements.' },
    ],
  },
  chat: {
    title: 'AI Chat',
    icon: '&#128172;',
    tips: [
      { text: 'Have a conversation with your AI marketing advisor.' },
      { text: 'Ask about strategy, get content feedback, or brainstorm ideas.' },
      { text: 'Chat history is saved so you can pick up where you left off.' },
      { text: 'The AI uses your business context and Brain learnings in every response.' },
    ],
  },
  social: {
    title: 'Social Accounts',
    icon: '&#8644;',
    tips: [
      { text: 'Connect your social media accounts to publish directly from the app.' },
      { text: 'Supports Twitter/X, Instagram, Facebook, LinkedIn, TikTok, and more.' },
      { text: 'Once connected, schedule posts from Content Studio or the Publish Queue.' },
    ],
    quickActions: [
      { label: 'Publish Queue', page: 'queue' },
      { label: 'Create content', page: 'content' },
    ],
  },
  analytics: {
    title: 'Analytics',
    icon: '&#9670;',
    tips: [
      { text: 'Track events, page views, and content performance.' },
      { text: 'Export data as CSV for further analysis.' },
      { text: 'Use AI Insights on the dashboard for automated recommendations.' },
    ],
  },
  settings: {
    title: 'Settings',
    icon: '&#9881;',
    tips: [
      { text: 'Configure AI providers, API keys, and business settings.' },
      { text: 'Run health checks to ensure everything is working properly.' },
      { text: 'Create and restore backups of your database.' },
    ],
  },
};

// Default help for pages without specific content
const defaultHelp = {
  title: 'Help',
  icon: '&#10067;',
  tips: [
    { text: 'Use the sidebar to navigate between sections.' },
    { text: 'Press Ctrl+K (Cmd+K on Mac) for quick AI content generation.' },
    { text: 'The AI Writing Assistant (purple button, bottom-right) works on any page.' },
  ],
};

/* ================================================================== */
/*  FAQ DATABASE                                                       */
/* ================================================================== */

const faqItems = [
  { q: 'How do I connect a social media account?', a: 'Go to Social Accounts, click "Add Account", and follow the authentication steps for your platform.', page: 'social' },
  { q: 'How does the AI Brain learn?', a: 'Every time you use an AI tool, the Brain automatically extracts key insights. These get fed into future AI calls to improve results.', page: 'brain' },
  { q: 'Can I change the AI provider?', a: 'Yes! Go to Settings to change your default provider. You can also override it per-request in AI Studio.', page: 'settings' },
  { q: 'How do I schedule a post?', a: 'Create content in Content Studio, set the date/time, and change the status to "scheduled". It will auto-publish at the set time.', page: 'content' },
  { q: 'What are AI Pipelines?', a: 'Pipelines chain multiple AI tools together. For example, "Content Creation" runs Research > Ideas > Write > Score > Pre-flight check automatically.', page: 'brain' },
  { q: 'How do I send an email campaign?', a: 'Go to Email Marketing, create a list, add subscribers, compose your campaign, and hit Send. Track opens and clicks in real-time.', page: 'email' },
  { q: 'What is the AI Writing Assistant?', a: 'The purple floating button (bottom-right) opens a side panel with quick refinement actions. It works on any textarea across the app.' },
  { q: 'How do I run the welcome tour again?', a: 'Click the "Restart Tours" button in this help panel to reset all guided tours.' },
  { q: 'How do I set up the cron for scheduling?', a: 'Set a CRON_KEY in Settings, then configure an external cron job to hit /cron.php?key=YOUR_KEY every few minutes.', page: 'settings' },
  { q: 'Can I use multiple AI providers?', a: 'Yes! Configure additional provider keys in Settings. You can switch between them in AI Studio or AI Chat.', page: 'settings' },
];

/* ================================================================== */
/*  WIDGET RENDERING                                                   */
/* ================================================================== */

let widgetEl = null;
let isOpen = false;

function createWidget() {
  if (widgetEl) return;

  widgetEl = document.createElement('div');
  widgetEl.id = 'helpWidget';
  widgetEl.className = 'help-widget';
  widgetEl.innerHTML = `
    <button class="help-widget-trigger" id="helpWidgetBtn" aria-label="Help & Tips" title="Help & Tips">?</button>
    <div class="help-widget-panel" id="helpWidgetPanel">
      <div class="help-widget-header">
        <h3 id="helpWidgetTitle">Help</h3>
        <button class="help-widget-close" id="helpWidgetClose" aria-label="Close help">&times;</button>
      </div>
      <div class="help-widget-search">
        <input type="text" id="helpSearchInput" placeholder="Search help topics..." aria-label="Search help" />
      </div>
      <div class="help-widget-body" id="helpWidgetBody"></div>
    </div>
  `;

  document.body.appendChild(widgetEl);

  // Wire events
  const trigger = widgetEl.querySelector('#helpWidgetBtn');
  const closeBtn = widgetEl.querySelector('#helpWidgetClose');
  const searchInput = widgetEl.querySelector('#helpSearchInput');

  trigger.addEventListener('click', toggleWidget);
  closeBtn.addEventListener('click', () => setOpen(false));
  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.trim().toLowerCase();
    if (query.length >= 2) {
      renderSearchResults(query);
    } else {
      renderPageHelp();
    }
  });

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen) setOpen(false);
  });
}

function toggleWidget() {
  setOpen(!isOpen);
}

function setOpen(open) {
  isOpen = open;
  const panel = widgetEl?.querySelector('#helpWidgetPanel');
  const btn = widgetEl?.querySelector('#helpWidgetBtn');
  if (panel) panel.classList.toggle('open', open);
  if (btn) btn.classList.toggle('active', open);
  if (open) renderPageHelp();
}

function renderPageHelp() {
  const page = currentPageName();
  const help = helpContent[page] || defaultHelp;
  const body = widgetEl?.querySelector('#helpWidgetBody');
  const title = widgetEl?.querySelector('#helpWidgetTitle');
  if (!body) return;

  if (title) title.innerHTML = `${help.icon || ''} ${help.title}`;

  let html = '';

  // Tips
  html += '<div class="help-section">';
  html += '<h4 class="help-section-title">Tips</h4>';
  help.tips.forEach(tip => {
    html += `<div class="help-tip-item"><span class="help-tip-icon">&#128161;</span><span>${tip.text}</span></div>`;
  });
  html += '</div>';

  // Quick actions
  if (help.quickActions?.length) {
    html += '<div class="help-section">';
    html += '<h4 class="help-section-title">Quick Actions</h4>';
    html += '<div class="help-actions">';
    help.quickActions.forEach(a => {
      if (a.page) {
        html += `<button class="help-action-btn" data-help-nav="${a.page}">${a.label}</button>`;
      } else {
        html += `<button class="help-action-btn" data-help-custom="${a.label}">${a.label}</button>`;
      }
    });
    html += '</div></div>';
  }

  // Relevant FAQs
  const pageFaqs = faqItems.filter(f => f.page === page).slice(0, 3);
  if (pageFaqs.length) {
    html += '<div class="help-section">';
    html += '<h4 class="help-section-title">Common Questions</h4>';
    pageFaqs.forEach(faq => {
      html += `<details class="help-faq"><summary>${escapeHtml(faq.q)}</summary><p>${faq.a}</p></details>`;
    });
    html += '</div>';
  }

  // Tours & meta
  html += '<div class="help-section help-meta">';
  html += `<button class="help-tour-btn" id="helpStartTour">&#127919; Take a guided tour of this page</button>`;
  html += `<button class="help-tour-btn help-tour-reset" id="helpRestartTours">&#128260; Restart all tours</button>`;
  html += '</div>';

  body.innerHTML = html;

  // Wire quick action buttons
  body.querySelectorAll('[data-help-nav]').forEach(btn => {
    btn.addEventListener('click', () => {
      navigate(btn.dataset.helpNav);
      setOpen(false);
    });
  });

  // Wire custom actions
  body.querySelectorAll('[data-help-custom]').forEach(btn => {
    const label = btn.dataset.helpCustom;
    const action = help.quickActions?.find(a => a.label === label);
    if (action?.action) {
      btn.addEventListener('click', () => {
        action.action();
        setOpen(false);
      });
    }
  });

  // Wire tour buttons
  body.querySelector('#helpStartTour')?.addEventListener('click', () => {
    setOpen(false);
    const page = currentPageName();
    startTour(page || 'welcome');
  });
  body.querySelector('#helpRestartTours')?.addEventListener('click', () => {
    resetAllTours();
    setOpen(false);
    startTour('welcome');
  });
}

function renderSearchResults(query) {
  const body = widgetEl?.querySelector('#helpWidgetBody');
  if (!body) return;

  const results = [];

  // Search FAQ
  faqItems.forEach(faq => {
    if (faq.q.toLowerCase().includes(query) || faq.a.toLowerCase().includes(query)) {
      results.push({ type: 'faq', ...faq });
    }
  });

  // Search page tips
  Object.entries(helpContent).forEach(([page, content]) => {
    content.tips.forEach(tip => {
      if (tip.text.toLowerCase().includes(query)) {
        results.push({ type: 'tip', page, title: content.title, text: tip.text });
      }
    });
  });

  if (results.length === 0) {
    body.innerHTML = '<div class="help-section"><p class="text-muted">No results found. Try a different search term.</p></div>';
    return;
  }

  let html = '<div class="help-section">';
  html += `<h4 class="help-section-title">${results.length} result${results.length !== 1 ? 's' : ''}</h4>`;

  results.forEach(r => {
    if (r.type === 'faq') {
      html += `<details class="help-faq"><summary>${escapeHtml(r.q)}</summary><p>${r.a}</p>${r.page ? `<button class="help-action-btn" data-help-nav="${r.page}">Go to ${r.page}</button>` : ''}</details>`;
    } else {
      html += `<div class="help-tip-item" style="cursor:pointer" data-help-nav="${r.page}"><span class="help-tip-icon">&#128161;</span><span><strong>${r.title}:</strong> ${r.text}</span></div>`;
    }
  });

  html += '</div>';
  body.innerHTML = html;

  body.querySelectorAll('[data-help-nav]').forEach(btn => {
    btn.addEventListener('click', () => {
      navigate(btn.dataset.helpNav);
      setOpen(false);
    });
  });
}

/* ================================================================== */
/*  PUBLIC API                                                         */
/* ================================================================== */

export function initHelpWidget() {
  createWidget();
}

export function showHelp() {
  setOpen(true);
}

export function hideHelp() {
  setOpen(false);
}

/**
 * Refresh help content when page changes.
 */
export function onPageChange() {
  if (isOpen) renderPageHelp();
  // Clear search
  const input = widgetEl?.querySelector('#helpSearchInput');
  if (input) input.value = '';
}
