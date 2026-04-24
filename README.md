# Bharat Chunav Sahayak 🇮🇳
### India Election Process Assistant — Hackathon Project

An AI-powered, multilingual assistant that helps Indian citizens understand the election process, timelines, voter rights, EVMs, and more.

---

## Tech Stack (100% Free)

| Layer      | Tool                          | Cost  |
|------------|-------------------------------|-------|
| Frontend   | HTML + CSS + Vanilla JS       | Free  |
| AI Model   | Claude Haiku via Anthropic API| Free trial credits |
| Backend    | Vercel Serverless Functions   | Free hobby tier |
| Hosting    | Vercel                        | Free  |

---

## Project Structure

```
india-election-assistant/
├── public/
│   ├── index.html    ← Main UI
│   ├── style.css     ← All styles
│   ├── app.js        ← Chat logic + API calls + rendering
│   └── prompts.js    ← System prompts + topic pills config
├── api/
│   └── chat.js       ← Vercel serverless function (API proxy)
├── vercel.json       ← Vercel routing config
├── package.json
└── README.md
```

---

## Setup Instructions

### Step 1 — Get your free Anthropic API key
1. Go to https://console.anthropic.com
2. Sign up for a free account
3. Go to "API Keys" → Create a new key
4. Copy the key (starts with `sk-ant-...`)

### Step 2 — Clone and install
```bash
git clone https://github.com/YOUR_USERNAME/india-election-assistant
cd india-election-assistant
npm install
```

### Step 3 — Run locally
```bash
npx vercel dev
```
Open http://localhost:3000

When prompted for ANTHROPIC_API_KEY, paste your key.

### Step 4 — Deploy to Vercel (free)
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

In the Vercel dashboard:
1. Go to your project → Settings → Environment Variables
2. Add: `ANTHROPIC_API_KEY` = your key from Step 1

Your app is now live at `https://your-project.vercel.app` — **free forever**.

---

## Features

- **5 modes**: General Elections, State Elections, Voter Rights, EVM & VVPAT, Quiz Mode
- **8 languages**: English, Hindi, Tamil, Telugu, Bengali, Marathi, Gujarati, Kannada
- **3 response types**: Timeline cards, Fact grids, Interactive quiz
- **Conversation memory**: Full multi-turn chat
- **Mobile responsive**: Works on all screen sizes

---

## Hackathon Presentation Tips

1. **Demo flow**: Start with "How does Lok Sabha election work?" → shows timeline
2. **Then show**: Switch to Hindi language → same question in Hindi
3. **Then show**: Quiz mode → interactive MCQ card
4. **Then show**: Voter rights → "How do I register to vote?"

---

## Future Roadmap

- [ ] Voter eligibility checker (Form with age/state inputs)
- [ ] ECI polling booth finder by pincode
- [ ] Live election calendar with upcoming dates
- [ ] WhatsApp bot integration via Twilio (free tier)
- [ ] Voice input using Web Speech API
- [ ] Offline mode with Service Workers

---

## License
MIT — Free to use, modify, and deploy.
