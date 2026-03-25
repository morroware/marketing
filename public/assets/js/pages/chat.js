/**
 * AI Marketing Chat — conversational interface grounded in marketing data.
 */

import { api } from '../core/api.js';
import { $, escapeHtml, onClick } from '../core/utils.js';
import { success, error } from '../core/toast.js';

let currentConversationId = 0;
const MODELS = {
  openai: {
    'gpt-4.1': 'GPT-4.1 (Best)',
    'gpt-4.1-mini': 'GPT-4.1 Mini',
    'gpt-4.1-nano': 'GPT-4.1 Nano',
    'gpt-4o': 'GPT-4o',
    'gpt-4o-mini': 'GPT-4o Mini',
  },
  anthropic: {
    'claude-sonnet-4-20250514': 'Claude Sonnet 4',
    'claude-haiku-4-5-20251001': 'Claude Haiku 4.5',
    'claude-opus-4-20250514': 'Claude Opus 4',
  },
  gemini: {
    'gemini-2.5-pro': 'Gemini 2.5 Pro',
    'gemini-2.5-flash': 'Gemini 2.5 Flash',
    'gemini-2.0-flash': 'Gemini 2.0 Flash',
  },
};

function appendMessage(role, content) {
  const el = $('chatMessages');
  if (!el) return;
  // Remove welcome screen
  const welcome = el.querySelector('.chat-welcome');
  if (welcome) welcome.remove();

  const div = document.createElement('div');
  div.className = `chat-msg chat-msg-${role}`;
  div.innerHTML = `<div class="chat-bubble">${escapeHtml(content)}</div>`;
  el.appendChild(div);
  el.scrollTop = el.scrollHeight;
}

function showTyping() {
  const el = $('chatMessages');
  if (!el) return;
  const typing = document.createElement('div');
  typing.className = 'chat-msg chat-msg-assistant';
  typing.id = 'chatTyping';
  typing.innerHTML = '<div class="chat-typing"><span></span><span></span><span></span></div>';
  el.appendChild(typing);
  el.scrollTop = el.scrollHeight;
}

function hideTyping() {
  const el = document.getElementById('chatTyping');
  if (el) el.remove();
}

async function sendMessage() {
  const input = $('chatInput');
  if (!input) return;
  const message = input.value.trim();
  if (!message) return;

  input.value = '';
  appendMessage('user', message);
  showTyping();

  const sendBtn = $('chatSendBtn');
  if (sendBtn) { sendBtn.disabled = true; sendBtn.classList.add('loading'); }

  try {
    const payload = { message, conversation_id: currentConversationId || undefined };
    const provider = $('chatProviderSelect')?.value || undefined;
    const model = $('chatModelSelect')?.value || undefined;
    if (provider) payload.provider = provider;
    if (model) payload.model = model;

    const { item } = await api('/api/ai/chat', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    hideTyping();
    appendMessage('assistant', item.reply);
    currentConversationId = item.conversation_id;
    refreshConversations();
  } catch (err) {
    hideTyping();
    appendMessage('assistant', 'Error: ' + err.message);
    error(err.message);
  } finally {
    if (sendBtn) { sendBtn.disabled = false; sendBtn.classList.remove('loading'); }
  }
}

async function loadConversation(id) {
  try {
    const { item, messages } = await api(`/api/ai/conversations/${id}`);
    currentConversationId = id;

    const el = $('chatMessages');
    if (el) {
      el.innerHTML = '';
      (messages || []).forEach((m) => appendMessage(m.role, m.content));
    }

    // Mark active
    document.querySelectorAll('.chat-conv-item').forEach((btn) => {
      btn.classList.toggle('active', parseInt(btn.dataset.convId) === id);
    });
  } catch (err) {
    error(err.message);
  }
}

async function refreshConversations() {
  try {
    const { items } = await api('/api/ai/conversations');
    const list = $('chatConversationList');
    if (!list) return;

    list.innerHTML = (items || []).map((c) => `
      <button class="chat-conv-item${c.id === currentConversationId ? ' active' : ''}" data-conv-id="${c.id}">
        ${escapeHtml(c.title || 'Chat')}
        <div class="conv-meta">${c.message_count || 0} msgs &middot; ${c.provider || ''}</div>
      </button>
    `).join('') || '<p class="text-muted text-small">No conversations yet</p>';

    list.querySelectorAll('.chat-conv-item').forEach((btn) => {
      btn.addEventListener('click', () => loadConversation(parseInt(btn.dataset.convId)));
    });
  } catch { /* ignore */ }
}

function newChat() {
  currentConversationId = 0;
  const el = $('chatMessages');
  if (el) {
    el.innerHTML = `<div class="chat-welcome">
      <div class="chat-welcome-icon">&#9733;</div>
      <h3>AI Marketing Assistant</h3>
      <p class="text-muted">Ask me anything about your marketing data, or have me create content.</p>
      <div class="chat-suggestions">
        <button class="chat-suggest-btn" data-suggest="What was my best performing platform this month?">Best performing platform?</button>
        <button class="chat-suggest-btn" data-suggest="Write me 3 Instagram posts about our latest product">Write 3 Instagram posts</button>
        <button class="chat-suggest-btn" data-suggest="Analyze my campaign performance and suggest improvements">Analyze campaigns</button>
        <button class="chat-suggest-btn" data-suggest="What content should I create this week?">Content ideas for this week</button>
      </div>
    </div>`;
    wiresuggestions();
  }
  document.querySelectorAll('.chat-conv-item').forEach((b) => b.classList.remove('active'));
}

function wiresuggestions() {
  document.querySelectorAll('.chat-suggest-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const input = $('chatInput');
      if (input) {
        input.value = btn.dataset.suggest;
        sendMessage();
      }
    });
  });
}

export async function refresh() {
  await refreshConversations();
}

export function init() {
  onClick('chatSendBtn', sendMessage);
  onClick('newChatBtn', newChat);

  // Enter to send (Shift+Enter for newline)
  const input = $('chatInput');
  if (input) {
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });
  }

  // Provider change updates model list
  const providerSelect = $('chatProviderSelect');
  if (providerSelect) {
    providerSelect.addEventListener('change', () => {
      const modelSelect = $('chatModelSelect');
      if (!modelSelect) return;
      const provider = providerSelect.value;
      if (provider && MODELS[provider]) {
        modelSelect.innerHTML = '<option value="">Default Model</option>' +
          Object.entries(MODELS[provider]).map(([k, v]) => `<option value="${k}">${v}</option>`).join('');
      } else {
        modelSelect.innerHTML = '<option value="">Default Model</option>';
      }
    });
  }

  // Wire initial suggestion buttons
  wiresuggestions();
}
