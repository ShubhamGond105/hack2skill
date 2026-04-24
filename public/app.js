// ── State ────────────────────────────────────────────────────────────────────
let currentMode = 'general';
let history     = [];
const MAX_HISTORY = 20;   // cap client-side history
const chatEl    = document.getElementById('chat');
const inputEl   = document.getElementById('q');
const btnEl     = document.getElementById('send-btn');

// ── Dark mode ────────────────────────────────────────────────────────────────
const themeBtn = document.getElementById('theme-btn');
function applyTheme(dark) {
  document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
  themeBtn.textContent = dark ? '☀️' : '🌙';
  localStorage.setItem('theme', dark ? 'dark' : 'light');
}
// Load saved theme or respect OS preference
const savedTheme = localStorage.getItem('theme');
if (savedTheme) {
  applyTheme(savedTheme === 'dark');
} else {
  applyTheme(window.matchMedia('(prefers-color-scheme: dark)').matches);
}
themeBtn.addEventListener('click', () => {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  applyTheme(!isDark);
});

// ── Clear chat ───────────────────────────────────────────────────────────────
const clearBtn = document.getElementById('clear-btn');
clearBtn.addEventListener('click', () => {
  history = [];
  chatEl.innerHTML = '';
  // Re-add welcome message
  const row = document.createElement('div');
  row.className = 'msg bot msg-enter';

  const av = document.createElement('div');
  av.className = 'av bot-av';
  av.textContent = 'ECI';

  const bubble = document.createElement('div');
  bubble.className = 'bubble bot-bubble';
  bubble.textContent = '🙏 Jai Hind! Chat cleared. Ask me anything about Indian elections!';

  row.appendChild(av);
  row.appendChild(bubble);
  chatEl.appendChild(row);
});

// ── Mode tabs ────────────────────────────────────────────────────────────────
document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    currentMode = tab.dataset.mode;
    history = [];
    renderPills();

    if (currentMode === 'quiz') {
      inputEl.value = 'Give me a quiz question about Indian elections';
      send();
    }
  });
});

function renderPills() {
  const box = document.getElementById('pill-box');
  box.innerHTML = '';
  (PILLS[currentMode] || []).forEach(text => {
    const el = document.createElement('button');
    el.className = 'pill';
    el.textContent = text;
    el.onclick = () => { inputEl.value = text; send(); };
    box.appendChild(el);
  });
}
renderPills();

// ── Typing indicator ─────────────────────────────────────────────────────────
function showTyping() {
  const row = document.createElement('div');
  row.className = 'msg bot msg-enter'; row.id = 'typing-row';
  const av = document.createElement('div');
  av.className = 'av bot-av';
  av.textContent = 'ECI';
  const dots = document.createElement('div');
  dots.className = 'typing-dots';
  dots.innerHTML = '<span></span><span></span><span></span>';
  row.appendChild(av);
  row.appendChild(dots);
  chatEl.appendChild(row);
  chatEl.scrollTop = chatEl.scrollHeight;
}
function hideTyping() {
  const el = document.getElementById('typing-row');
  if (el) el.remove();
}

// ── Append message (XSS-safe) ────────────────────────────────────────────────
function appendMsg(role, contentEl, isError) {
  const row = document.createElement('div');
  row.className = 'msg ' + (role === 'user' ? 'user' : 'bot') + ' msg-enter';

  const av = document.createElement('div');
  av.className = 'av ' + (role === 'user' ? 'user-av' : 'bot-av');
  av.textContent = role === 'user' ? 'You' : 'ECI';

  const bubble = document.createElement('div');
  bubble.className = 'bubble ' + (role === 'user' ? 'user-bubble' : 'bot-bubble');
  if (isError) bubble.classList.add('error-bubble');

  if (typeof contentEl === 'string') {
    bubble.textContent = contentEl;   // safe — no innerHTML
  } else {
    bubble.appendChild(contentEl);
  }

  row.appendChild(av);
  row.appendChild(bubble);
  chatEl.appendChild(row);
  chatEl.scrollTop = chatEl.scrollHeight;
}

// ── Render: Timeline (XSS-safe) ─────────────────────────────────────────────
function renderTimeline(data) {
  const wrap = document.createElement('div');

  const intro = document.createElement('p');
  intro.className = 'tl-intro';
  intro.textContent = data.intro || '';
  wrap.appendChild(intro);

  const card = document.createElement('div');
  card.className = 'tl-card';

  (data.steps || []).forEach((step, i) => {
    const row = document.createElement('div');
    row.className = 'tl-step';

    const dotClass = step.color === 'green' ? 'dot-green' : step.color === 'orange' ? 'dot-orange' : 'dot-blue';
    const num = document.createElement('div');
    num.className = 'tl-num ' + dotClass;
    num.textContent = i + 1;

    const content = document.createElement('div');
    const title = document.createElement('div');
    title.className = 'tl-title';
    title.textContent = step.label || '';
    const desc = document.createElement('div');
    desc.className = 'tl-desc';
    desc.textContent = step.desc || '';
    content.appendChild(title);
    content.appendChild(desc);

    row.appendChild(num);
    row.appendChild(content);
    card.appendChild(row);
  });

  wrap.appendChild(card);
  return wrap;
}

// ── Render: Facts grid (XSS-safe) ───────────────────────────────────────────
function renderFacts(data) {
  const wrap = document.createElement('div');

  const intro = document.createElement('p');
  intro.className = 'tl-intro';
  intro.textContent = data.intro || '';
  wrap.appendChild(intro);

  const grid = document.createElement('div');
  grid.className = 'facts-grid';

  (data.facts || []).forEach(f => {
    const item = document.createElement('div');
    item.className = 'fact-item';
    const numEl = document.createElement('div');
    numEl.className = 'fact-num';
    numEl.textContent = f.num || '';
    const lblEl = document.createElement('div');
    lblEl.className = 'fact-lbl';
    lblEl.textContent = f.lbl || '';
    item.appendChild(numEl);
    item.appendChild(lblEl);
    grid.appendChild(item);
  });

  wrap.appendChild(grid);
  return wrap;
}

// ── Render: Quiz (XSS-safe) ─────────────────────────────────────────────────
function renderQuiz(data) {
  const card = document.createElement('div');
  card.className = 'quiz-card';

  const q = document.createElement('div');
  q.className = 'quiz-q';
  q.textContent = data.question || '';
  card.appendChild(q);

  let answered = false;

  (data.options || []).forEach((opt, i) => {
    const btn = document.createElement('div');
    btn.className = 'quiz-opt';
    btn.textContent = String.fromCharCode(65 + i) + '. ' + opt;

    btn.onclick = () => {
      if (answered) return;
      answered = true;

      card.querySelectorAll('.quiz-opt').forEach((el, j) => {
        if (j === data.answer) el.classList.add('correct');
        else if (j === i && i !== data.answer) el.classList.add('wrong');
        el.style.cursor = 'default';
      });

      const exp = document.createElement('p');
      exp.className = 'quiz-explanation';
      exp.textContent = data.explanation || '';
      card.appendChild(exp);

      const next = document.createElement('button');
      next.className = 'quiz-next-btn';
      next.textContent = 'Next question ↗';
      next.onclick = () => {
        inputEl.value = 'Give me another quiz question about Indian elections';
        send();
      };
      card.appendChild(next);
    };

    card.appendChild(btn);
  });

  return card;
}

// ── Parse AI response ─────────────────────────────────────────────────────────
function parseResponse(text) {
  try {
    const clean = text.replace(/```json|```/g, '').trim();
    const start = clean.indexOf('{');
    const end   = clean.lastIndexOf('}');
    if (start !== -1 && end !== -1) {
      return JSON.parse(clean.slice(start, end + 1));
    }
  } catch (e) {}
  return null;
}

// ── Error message helper ─────────────────────────────────────────────────────
function getErrorMessage(status, data) {
  if (!navigator.onLine) return '📡 You appear to be offline. Please check your internet connection.';
  if (status === 429) return '⏳ Too many requests. Please wait a moment and try again.';
  if (status === 500 && data?.code === 'MISSING_API_KEY') return '🔑 Server API key not configured. Please set ANTHROPIC_API_KEY.';
  if (status === 500 && data?.code === 'AUTH_ERROR') return '🔑 Invalid API key. Please check your Anthropic API key.';
  if (data?.error) return '⚠️ ' + data.error;
  return '⚠️ Something went wrong. Please try again.';
}

// ── Send message ──────────────────────────────────────────────────────────────
async function send() {
  const q = inputEl.value.trim();
  if (!q) return;

  // Input length guard
  if (q.length > 1000) {
    appendMsg('bot', '⚠️ Message is too long. Please keep it under 1000 characters.', true);
    return;
  }

  const lang = document.getElementById('lang').value;
  inputEl.value = '';
  btnEl.disabled = true;
  inputEl.disabled = true;

  appendMsg('user', q);
  history.push({ role: 'user', content: q });

  // Cap history to prevent unbounded growth
  if (history.length > MAX_HISTORY) {
    history = history.slice(-MAX_HISTORY);
  }

  showTyping();

  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mode: currentMode,
        language: lang,
        messages: history
      })
    });

    if (!res.ok) {
      let errData = {};
      try { errData = await res.json(); } catch (e) {}
      hideTyping();
      appendMsg('bot', getErrorMessage(res.status, errData), true);
      // Remove failed user message from history
      history.pop();
      btnEl.disabled = false;
      inputEl.disabled = false;
      inputEl.focus();
      return;
    }

    const data = await res.json();
    const text = data.content
      .filter(b => b.type === 'text')
      .map(b => b.text)
      .join('');

    hideTyping();
    history.push({ role: 'assistant', content: text });

    const parsed = parseResponse(text);

    if (parsed?.type === 'timeline') {
      appendMsg('bot', renderTimeline(parsed));
    } else if (parsed?.type === 'facts') {
      appendMsg('bot', renderFacts(parsed));
    } else if (parsed?.type === 'quiz') {
      appendMsg('bot', renderQuiz(parsed));
    } else {
      appendMsg('bot', text);
    }

  } catch (err) {
    hideTyping();
    if (!navigator.onLine) {
      appendMsg('bot', '📡 You appear to be offline. Please check your connection.', true);
    } else {
      appendMsg('bot', '⚠️ Network error. Please check your connection and try again.', true);
    }
    history.pop();
    console.error(err);
  }

  btnEl.disabled = false;
  inputEl.disabled = false;
  inputEl.focus();
}

// ── Enter key ─────────────────────────────────────────────────────────────────
inputEl.addEventListener('keydown', e => {
  if (e.key === 'Enter' && !btnEl.disabled) send();
});

// ── Send button click ─────────────────────────────────────────────────────────
btnEl.addEventListener('click', send);
