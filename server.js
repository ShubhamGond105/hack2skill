// server.js — Local development server (Express)
// Uses OpenRouter API (free models available)
// Run with: node server.js

const express = require('express');
const path = require('path');

try { require('dotenv').config({ path: '.env.local' }); } catch (e) {
  try { require('dotenv').config(); } catch (e2) {}
}

const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.json());

// Rate limiter
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 60_000;
const RATE_LIMIT_MAX = 20;

function isRateLimited(ip) {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now - entry.start > RATE_LIMIT_WINDOW) {
    rateLimitMap.set(ip, { start: now, count: 1 });
    return false;
  }
  entry.count++;
  return entry.count > RATE_LIMIT_MAX;
}

app.post('/api/chat', async (req, res) => {
  if (!process.env.OPENROUTER_API_KEY) {
    console.error('\n❌ OPENROUTER_API_KEY is not set!');
    console.error('   Create .env.local with: OPENROUTER_API_KEY=sk-or-...\n');
    return res.status(500).json({ error: 'API key not configured.', code: 'MISSING_API_KEY' });
  }

  const clientIP = req.ip || 'local';
  if (isRateLimited(clientIP)) {
    return res.status(429).json({ error: 'Too many requests.', code: 'RATE_LIMITED' });
  }

  const { mode, language, messages } = req.body;
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Invalid request body', code: 'INVALID_BODY' });
  }

  const SYSTEM_BASE = `
You are Bharat Chunav Sahayak — a friendly, expert Indian Election Process Assistant.
Always answer based on Indian constitutional law, ECI guidelines, and Representation of the People Act.
Be factual, non-partisan, clear, and concise.
Always respond in the language specified at the end of this prompt.

RESPONSE FORMAT RULES:
- For multi-step processes or timelines → respond ONLY with JSON:
  {"type":"timeline","intro":"One sentence.","steps":[{"label":"Step","desc":"Description","color":"blue|green|orange"}]}
- For key statistics or numbers → respond ONLY with JSON:
  {"type":"facts","intro":"One sentence context.","facts":[{"num":"543","lbl":"Lok Sabha seats"}]}
- For quiz questions → respond ONLY with JSON:
  {"type":"quiz","question":"Question text?","options":["A","B","C","D"],"answer":0,"explanation":"Why A is correct."}
- For all other answers → plain text only, under 120 words. No markdown.
`;

  const MODE_CONTEXT = {
    general: 'You specialise in Indian General Elections (Lok Sabha). Topics: ECI, 543 constituencies, FPTP, Model Code of Conduct, Delimitation, election schedule, phases of polling, counting day, government formation.',
    state:   'You specialise in Indian State (Vidhan Sabha) elections. Topics: Vidhan Sabha, Rajya Sabha indirect elections, President\'s Rule (Article 356), Chief Minister, Governor, by-elections, floor tests.',
    voter:   'You specialise in Indian voter rights. Topics: Form 6 registration at voters.eci.gov.in, EPIC card, Electoral Roll, eligibility (18+), booth rights, NOTA, BLO, differently-abled voter assistance.',
    evm:     'You specialise in Indian EVMs and VVPAT. Topics: Control Unit + Ballot Unit, M2/M3 EVM, VVPAT paper slip, BEL/ECIL manufacturing, mock polls, FLC, randomisation, sealing, result counting.',
    quiz:    'Generate quiz questions about Indian elections testing civic knowledge: ECI history, Articles 324-329, election terms, famous elections, voting rights, EVM, MCC, Lok Sabha vs Rajya Sabha.'
  };

  const systemPrompt = SYSTEM_BASE + '\n\n' + (MODE_CONTEXT[mode] || MODE_CONTEXT.general)
    + '\n\nAlways respond in: ' + (language || 'English') + '.';

  const openRouterMessages = [
    { role: 'system', content: systemPrompt },
    ...messages.slice(-10)
  ];

  try {
    const apiRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'Bharat Chunav Sahayak'
      },
      body: JSON.stringify({
        model: 'openrouter/free',
        messages: openRouterMessages,
        max_tokens: 1024
      })
    });

    if (!apiRes.ok) {
      const errText = await apiRes.text();
      console.error('OpenRouter error:', apiRes.status, errText);
      if (apiRes.status === 401) return res.status(500).json({ error: 'Invalid API key.', code: 'AUTH_ERROR' });
      if (apiRes.status === 429) return res.status(429).json({ error: 'Rate limit. Try shortly.', code: 'AI_RATE_LIMITED' });
      return res.status(500).json({ error: 'AI service error.', code: 'AI_ERROR' });
    }

    const data = await apiRes.json();
    const text = data.choices?.[0]?.message?.content || '';

    return res.json({ content: [{ type: 'text', text }] });

  } catch (err) {
    console.error('Server error:', err);
    return res.status(500).json({ error: 'Server error.', code: 'SERVER_ERROR' });
  }
});

app.use(express.static(path.join(__dirname, 'public')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log('\n🇮🇳 Bharat Chunav Sahayak — Local Dev Server');
  console.log(`   http://localhost:${PORT}\n`);
  if (!process.env.OPENROUTER_API_KEY) {
    console.log('⚠️  OPENROUTER_API_KEY not found!');
    console.log('   Create .env.local with: OPENROUTER_API_KEY=sk-or-...\n');
  } else {
    console.log('✅ OpenRouter API key loaded\n');
  }
});
