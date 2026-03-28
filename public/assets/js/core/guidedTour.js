/**
 * Guided Tour System — lightweight spotlight walkthrough for new users.
 * No dependencies beyond core utils. Persists completion state in localStorage.
 */
import { $ } from './utils.js';

const TOUR_PREFIX = 'tour_completed_';

/* ================================================================== */
/*  TOUR DEFINITIONS                                                   */
/* ================================================================== */

const tours = {
  welcome: {
    name: 'Welcome Tour',
    steps: [
      {
        target: '#globalAiBtn',
        title: 'AI at Your Fingertips',
        text: 'Press Ctrl+K (or Cmd+K on Mac) anytime to instantly generate content with AI. Social posts, emails, blog articles — all one keystroke away.',
        position: 'bottom',
      },
      {
        target: '[data-page="dashboard"]',
        title: 'Your Command Center',
        text: 'The Dashboard gives you a real-time snapshot of your marketing activity, AI insights, and quick actions to get things done fast.',
        position: 'right',
      },
      {
        target: '[data-section="ai-tools"]',
        title: 'AI & Content Tools',
        text: 'This section is your creative powerhouse. AI Studio has 25+ tools, AI Chat is your marketing advisor, and AI Brain learns from everything you do.',
        position: 'right',
      },
      {
        target: '[data-section="marketing"]',
        title: 'Marketing Channels',
        text: 'Manage campaigns, send emails, connect social accounts, build landing pages, and create forms — all in one place.',
        position: 'right',
      },
      {
        target: '[data-page="brain"]',
        title: 'AI Brain — Your AI Gets Smarter',
        text: 'The AI Brain learns from every tool you use. Over time, it builds knowledge about your business, audience, and what content works best.',
        position: 'right',
      },
      {
        target: '#themeToggle',
        title: 'Make It Yours',
        text: 'Switch between dark and light themes. Your preference is saved automatically.',
        position: 'bottom',
      },
    ],
  },
  brain: {
    name: 'AI Brain Tour',
    steps: [
      {
        target: '#brainMetrics',
        title: 'Brain Metrics',
        text: 'These cards show your AI\'s activity level — how many calls it\'s made, what it\'s learned, and how much feedback it\'s received.',
        position: 'bottom',
      },
      {
        target: '#brainKnowledgeMap',
        title: 'Knowledge Coverage',
        text: 'See which areas your AI knows most about. Red bars indicate knowledge gaps — use more tools in those categories to fill them.',
        position: 'bottom',
      },
      {
        target: '[data-tab="brain-learnings"]',
        title: 'Auto-Learned Insights',
        text: 'Every time you use an AI tool, the Brain automatically extracts key insights. These get fed back into future AI calls to improve results.',
        position: 'bottom',
      },
      {
        target: '[data-tab="brain-pipelines"]',
        title: 'AI Pipelines',
        text: 'Chain multiple AI tools together into automated workflows. Great for creating a full content strategy in one click.',
        position: 'bottom',
      },
      {
        target: '#brainCapturePerf',
        title: 'Performance Feedback',
        text: 'Click this to capture how your AI-generated content performed. This feedback loop makes your AI smarter over time.',
        position: 'left',
      },
    ],
  },
  content: {
    name: 'Content Studio Tour',
    steps: [
      {
        target: '[data-tab="content-create"]',
        title: 'Create Content',
        text: 'Write posts here. Use the AI buttons to generate content, suggest titles, add hashtags, and score your content before publishing.',
        position: 'bottom',
      },
      {
        target: '[data-tab="content-calendar"]',
        title: 'Content Calendar',
        text: 'See all your scheduled and published content on a visual calendar. Plan ahead and stay consistent.',
        position: 'bottom',
      },
    ],
  },
  ai: {
    name: 'AI Studio Tour',
    steps: [
      {
        target: '.ai-categories',
        title: 'Tool Categories',
        text: 'AI Studio has 25+ tools organized by category — Content Creation, Analysis, and Strategy. Click a category to see its tools.',
        position: 'bottom',
      },
    ],
  },
};

/* ================================================================== */
/*  TOUR ENGINE                                                        */
/* ================================================================== */

let activeTour = null;
let activeStepIndex = 0;
let overlay = null;
let spotlight = null;
let tooltip = null;

function createOverlay() {
  if (overlay) return;

  overlay = document.createElement('div');
  overlay.className = 'tour-overlay';
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) nextStep();
  });

  spotlight = document.createElement('div');
  spotlight.className = 'tour-spotlight';

  tooltip = document.createElement('div');
  tooltip.className = 'tour-tooltip';

  document.body.appendChild(overlay);
  document.body.appendChild(spotlight);
  document.body.appendChild(tooltip);
}

function removeOverlay() {
  overlay?.remove();
  spotlight?.remove();
  tooltip?.remove();
  overlay = null;
  spotlight = null;
  tooltip = null;
}

function positionSpotlight(targetEl) {
  if (!spotlight || !targetEl) return;
  const rect = targetEl.getBoundingClientRect();
  const pad = 8;
  spotlight.style.top = (rect.top - pad + window.scrollY) + 'px';
  spotlight.style.left = (rect.left - pad) + 'px';
  spotlight.style.width = (rect.width + pad * 2) + 'px';
  spotlight.style.height = (rect.height + pad * 2) + 'px';
}

function positionTooltip(targetEl, position) {
  if (!tooltip || !targetEl) return;
  const rect = targetEl.getBoundingClientRect();
  const tipW = Math.min(340, window.innerWidth - 32);
  tooltip.style.width = tipW + 'px';

  // Reset
  tooltip.style.top = '';
  tooltip.style.left = '';
  tooltip.style.right = '';
  tooltip.style.bottom = '';

  const gap = 16;
  const scrollY = window.scrollY;

  switch (position) {
    case 'right':
      tooltip.style.top = (rect.top + scrollY + rect.height / 2 - 60) + 'px';
      tooltip.style.left = (rect.right + gap) + 'px';
      break;
    case 'left':
      tooltip.style.top = (rect.top + scrollY + rect.height / 2 - 60) + 'px';
      tooltip.style.left = (rect.left - tipW - gap) + 'px';
      break;
    case 'top':
      tooltip.style.top = (rect.top + scrollY - 140) + 'px';
      tooltip.style.left = Math.max(16, rect.left + rect.width / 2 - tipW / 2) + 'px';
      break;
    case 'bottom':
    default:
      tooltip.style.top = (rect.bottom + scrollY + gap) + 'px';
      tooltip.style.left = Math.max(16, rect.left + rect.width / 2 - tipW / 2) + 'px';
      break;
  }
}

function showStep(index) {
  if (!activeTour || index >= activeTour.steps.length) {
    endTour();
    return;
  }

  activeStepIndex = index;
  const step = activeTour.steps[index];
  const targetEl = document.querySelector(step.target);

  if (!targetEl) {
    // Skip to next step if target not found
    showStep(index + 1);
    return;
  }

  // Scroll target into view
  targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });

  setTimeout(() => {
    positionSpotlight(targetEl);
    positionTooltip(targetEl, step.position || 'bottom');

    const total = activeTour.steps.length;
    const isLast = index === total - 1;

    tooltip.innerHTML = `
      <div class="tour-tooltip-header">
        <span class="tour-step-counter">${index + 1} of ${total}</span>
        <button class="tour-close-btn" aria-label="Close tour">&times;</button>
      </div>
      <h4 class="tour-tooltip-title">${step.title}</h4>
      <p class="tour-tooltip-text">${step.text}</p>
      <div class="tour-tooltip-footer">
        ${index > 0 ? '<button class="tour-prev-btn">Back</button>' : '<span></span>'}
        <button class="tour-next-btn">${isLast ? 'Finish' : 'Next'}</button>
      </div>
      <div class="tour-progress-bar">
        <div class="tour-progress-fill" style="width:${((index + 1) / total) * 100}%"></div>
      </div>
    `;

    tooltip.querySelector('.tour-close-btn').addEventListener('click', endTour);
    tooltip.querySelector('.tour-next-btn').addEventListener('click', nextStep);
    const prevBtn = tooltip.querySelector('.tour-prev-btn');
    if (prevBtn) prevBtn.addEventListener('click', prevStep);

    spotlight.classList.add('active');
    tooltip.classList.add('active');
  }, 300);
}

function nextStep() {
  showStep(activeStepIndex + 1);
}

function prevStep() {
  if (activeStepIndex > 0) showStep(activeStepIndex - 1);
}

function endTour() {
  if (activeTour) {
    localStorage.setItem(TOUR_PREFIX + activeTour.id, '1');
  }
  activeTour = null;
  activeStepIndex = 0;
  removeOverlay();
}

/* ================================================================== */
/*  PUBLIC API                                                         */
/* ================================================================== */

export function startTour(tourId) {
  const tourDef = tours[tourId];
  if (!tourDef) return;
  activeTour = { id: tourId, ...tourDef };
  activeStepIndex = 0;
  createOverlay();
  showStep(0);
}

export function isTourCompleted(tourId) {
  return localStorage.getItem(TOUR_PREFIX + tourId) === '1';
}

export function resetTour(tourId) {
  localStorage.removeItem(TOUR_PREFIX + tourId);
}

export function resetAllTours() {
  Object.keys(tours).forEach(id => localStorage.removeItem(TOUR_PREFIX + id));
}

/**
 * Auto-start the welcome tour for first-time users.
 * Call this after the app boots and the user is authenticated.
 */
export function maybeStartWelcomeTour() {
  if (!isTourCompleted('welcome')) {
    // Slight delay to let the page render
    setTimeout(() => startTour('welcome'), 800);
  }
}

/**
 * Show a page-specific tour if the user hasn't seen it yet.
 */
export function maybeStartPageTour(pageId) {
  if (tours[pageId] && !isTourCompleted(pageId)) {
    setTimeout(() => startTour(pageId), 600);
  }
}
