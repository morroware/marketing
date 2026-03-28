/**
 * Onboarding wizard — collects business profile data, then launches AI Autopilot.
 * Improved with progress persistence, animated transitions, and better validation.
 */

import { api } from '../core/api.js';
import { $ } from '../core/utils.js';
import { success, error } from '../core/toast.js';
import { navigate } from '../core/router.js';

let currentStep = 1;
const totalSteps = 5;
const STORAGE_KEY = 'onboarding_draft';

export async function refresh() {
  currentStep = 1;
  restoreDraft();
  showStep(currentStep);
}

export function init() {
  // Step navigation buttons
  document.querySelectorAll('.onboard-next').forEach(btn => {
    btn.addEventListener('click', () => {
      if (validateStep(currentStep)) {
        saveDraft();
        currentStep++;
        showStep(currentStep);
      }
    });
  });

  document.querySelectorAll('.onboard-prev').forEach(btn => {
    btn.addEventListener('click', () => {
      saveDraft();
      currentStep--;
      showStep(currentStep);
    });
  });

  // Add competitor fields dynamically
  const addCompBtn = $('addCompetitorField');
  if (addCompBtn) {
    addCompBtn.addEventListener('click', () => {
      const container = $('competitorFields');
      if (!container) return;
      const count = container.querySelectorAll('input').length;
      if (count >= 5) { error('Maximum 5 competitors'); return; }
      const div = document.createElement('div');
      div.className = 'flex gap-1 mb-1';
      div.innerHTML = `<input type="text" class="input competitor-input" placeholder="Competitor name or URL">
        <button type="button" class="btn btn-sm btn-ghost remove-comp">&times;</button>`;
      div.querySelector('.remove-comp').addEventListener('click', () => div.remove());
      container.appendChild(div);
    });
  }

  // Remove competitor buttons (for initial ones)
  document.querySelectorAll('.remove-comp').forEach(btn => {
    btn.addEventListener('click', () => btn.closest('.flex')?.remove());
  });

  // Launch autopilot
  const launchBtn = $('launchAutopilot');
  if (launchBtn) {
    launchBtn.addEventListener('click', launchAutopilot);
  }

  const autoResearchBtn = $('obAutoResearch');
  if (autoResearchBtn) {
    autoResearchBtn.addEventListener('click', autoResearchWebsite);
  }

  // Skip onboarding
  const skipBtn = $('skipOnboarding');
  if (skipBtn) {
    skipBtn.addEventListener('click', async () => {
      try {
        await api('/api/onboarding/profile', {
          method: 'POST',
          body: JSON.stringify({ onboarding_completed: true }),
        });
        clearDraft();
        navigate('dashboard');
      } catch (err) {
        error(err.message);
      }
    });
  }

  // Auto-save on input changes
  document.querySelectorAll('#page-onboarding input, #page-onboarding textarea, #page-onboarding select').forEach(el => {
    el.addEventListener('change', saveDraft);
  });
}

function showStep(step) {
  // Hide all steps
  document.querySelectorAll('.onboard-step').forEach(el => {
    el.style.display = 'none';
  });
  // Show current step with animation
  const stepEl = $('onboardStep' + step);
  if (stepEl) {
    stepEl.style.display = '';
    // Re-trigger animation
    stepEl.style.animation = 'none';
    stepEl.offsetHeight; // force reflow
    stepEl.style.animation = '';
  }

  // Update progress bar
  const progressFill = $('onboardProgressFill');
  if (progressFill) {
    progressFill.style.width = ((step / totalSteps) * 100) + '%';
  }

  // Update step indicators
  document.querySelectorAll('.onboard-step-indicator').forEach(el => {
    const s = parseInt(el.dataset.step);
    el.classList.toggle('active', s === step);
    el.classList.toggle('completed', s < step);
  });

  // Scroll to top of onboarding container
  document.querySelector('.onboard-container')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function validateStep(step) {
  if (step === 1) {
    const desc = $('obBusinessDesc');
    if (desc && desc.value.trim().length < 10) {
      error('Please describe your business (at least 10 characters)');
      desc.focus();
      desc.classList.add('input-error');
      setTimeout(() => desc.classList.remove('input-error'), 2000);
      return false;
    }
  }
  return true;
}

/* ================================================================== */
/*  DRAFT PERSISTENCE                                                  */
/* ================================================================== */

function saveDraft() {
  try {
    const data = {
      step: currentStep,
      business_description: $('obBusinessDesc')?.value || '',
      products_services: $('obProducts')?.value || '',
      website_url: $('obWebsite')?.value || '',
      unique_selling_points: $('obUSPs')?.value || '',
      target_audience: $('obAudience')?.value || '',
      content_examples: $('obExamples')?.value || '',
      budget_range: $('obBudget')?.value || '',
      competitors: [],
      goals: [],
      platforms: [],
    };

    document.querySelectorAll('.competitor-input').forEach(input => {
      if (input.value.trim()) data.competitors.push(input.value.trim());
    });
    document.querySelectorAll('.goal-checkbox:checked').forEach(cb => {
      data.goals.push(cb.value);
    });
    document.querySelectorAll('.platform-checkbox:checked').forEach(cb => {
      data.platforms.push(cb.value);
    });

    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    // Silent fail for storage issues
  }
}

function restoreDraft() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const data = JSON.parse(raw);

    if ($('obBusinessDesc') && data.business_description) $('obBusinessDesc').value = data.business_description;
    if ($('obProducts') && data.products_services) $('obProducts').value = data.products_services;
    if ($('obWebsite') && data.website_url) $('obWebsite').value = data.website_url;
    if ($('obUSPs') && data.unique_selling_points) $('obUSPs').value = data.unique_selling_points;
    if ($('obAudience') && data.target_audience) $('obAudience').value = data.target_audience;
    if ($('obExamples') && data.content_examples) $('obExamples').value = data.content_examples;
    if ($('obBudget') && data.budget_range) $('obBudget').value = data.budget_range;

    if (data.competitors?.length) {
      const fields = document.querySelectorAll('.competitor-input');
      data.competitors.slice(0, fields.length).forEach((v, i) => { fields[i].value = v; });
    }

    applyChecklistValues('.goal-checkbox', data.goals?.join(', '));
    applyChecklistValues('.platform-checkbox', data.platforms?.join(', '));

    if (data.step > 1 && data.step <= totalSteps) {
      currentStep = data.step;
    }
  } catch (e) {
    // Silent fail
  }
}

function clearDraft() {
  localStorage.removeItem(STORAGE_KEY);
}

/* ================================================================== */
/*  DATA COLLECTION                                                    */
/* ================================================================== */

function collectFormData() {
  const competitors = [];
  document.querySelectorAll('.competitor-input').forEach(input => {
    if (input.value.trim()) competitors.push(input.value.trim());
  });

  const goals = [];
  document.querySelectorAll('.goal-checkbox:checked').forEach(cb => {
    goals.push(cb.value);
  });

  const platforms = [];
  document.querySelectorAll('.platform-checkbox:checked').forEach(cb => {
    platforms.push(cb.value);
  });

  return {
    business_description: $('obBusinessDesc')?.value?.trim() || '',
    products_services: $('obProducts')?.value?.trim() || '',
    website_url: $('obWebsite')?.value?.trim() || '',
    unique_selling_points: $('obUSPs')?.value?.trim() || '',
    target_audience: $('obAudience')?.value?.trim() || '',
    competitors: competitors.join(', '),
    marketing_goals: goals.join(', '),
    active_platforms: platforms.join(', '),
    content_examples: $('obExamples')?.value?.trim() || '',
    budget_range: $('obBudget')?.value || '',
    onboarding_completed: true,
  };
}

/* ================================================================== */
/*  AUTOPILOT LAUNCH                                                   */
/* ================================================================== */

async function launchAutopilot() {
  const btn = $('launchAutopilot');
  if (!btn) return;

  const data = collectFormData();

  btn.classList.add('loading');
  btn.disabled = true;
  btn.textContent = 'Saving profile...';

  try {
    // Save profile first
    await api('/api/onboarding/profile', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    btn.textContent = 'Starting AI Autopilot...';

    // Queue autopilot pipeline to run in background and continue immediately.
    await api('/api/autopilot/launch', { method: 'POST', body: '{}' });

    clearDraft();
    success('AI Autopilot started! We are generating your marketing foundation in the background.');
    navigate('dashboard');
  } catch (err) {
    error('Autopilot error: ' + err.message);
    btn.innerHTML = '<span class="btn-ai-icon">&#9733;</span> Launch AI Autopilot';
  } finally {
    btn.classList.remove('loading');
    btn.disabled = false;
  }
}

/* ================================================================== */
/*  AUTO-RESEARCH                                                      */
/* ================================================================== */

async function autoResearchWebsite() {
  const website = $('obWebsite')?.value?.trim() || '';
  if (!website) {
    error('Add a website URL first.');
    return;
  }

  // Basic URL validation
  try {
    new URL(website);
  } catch {
    error('Please enter a valid URL (e.g. https://example.com)');
    return;
  }

  const btn = $('obAutoResearch');
  if (btn) {
    btn.disabled = true;
    btn.classList.add('loading');
  }

  try {
    const { item } = await api('/api/onboarding/discover', {
      method: 'POST',
      body: JSON.stringify({ website_url: website }),
      timeout: 120000,
    });
    const profile = item?.profile || {};
    if ($('obBusinessDesc') && profile.business_description) $('obBusinessDesc').value = profile.business_description;
    if ($('obProducts') && profile.products_services) $('obProducts').value = profile.products_services;
    if ($('obUSPs') && profile.unique_selling_points) $('obUSPs').value = profile.unique_selling_points;
    if ($('obAudience') && profile.target_audience) $('obAudience').value = profile.target_audience;
    if ($('obExamples') && profile.content_examples) $('obExamples').value = profile.content_examples;

    if (profile.competitors) {
      const values = String(profile.competitors).split(',').map((v) => v.trim()).filter(Boolean);
      const fields = document.querySelectorAll('.competitor-input');
      values.slice(0, fields.length).forEach((value, idx) => {
        fields[idx].value = value;
      });
    }

    applyChecklistValues('.goal-checkbox', profile.marketing_goals);
    applyChecklistValues('.platform-checkbox', profile.active_platforms);

    saveDraft();
    success(`Website analyzed successfully${item?.provider ? ` via ${item.provider}` : ''}. Review and edit before launch.`);
  } catch (err) {
    error('Auto-research failed: ' + err.message);
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.classList.remove('loading');
    }
  }
}

function applyChecklistValues(selector, csv) {
  if (!csv) return;
  const values = String(csv).split(',').map((v) => v.trim().toLowerCase()).filter(Boolean);
  if (!values.length) return;
  document.querySelectorAll(selector).forEach((box) => {
    const val = String(box.value || '').toLowerCase();
    box.checked = values.some((v) => val.includes(v) || v.includes(val));
  });
}
