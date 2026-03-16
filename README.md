# AuntyGPT 👆

> The AI aunty who knows your business better than you do.

Tell aunty your life choices. Receive unsolicited advice. Share with family. 😂

## Features
- 6 regional aunty personas (Punjabi, Tamil, Bengali, Marwari, Mallu, Colony)
- Life situation roaster
- LinkedIn profile roaster
- WhatsApp-style output card — ready to share instantly
- One-tap WhatsApp forwarding
- Try different aunties on the same situation

---

## Deploy in 5 minutes (FREE)

### Step 1 — Get your free Anthropic API key
1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Sign up for free
3. Go to "API Keys" → Create new key
4. Copy the key (starts with `sk-ant-...`)

### Step 2 — Deploy to Vercel (free)
1. Go to [vercel.com](https://vercel.com) and sign up with GitHub
2. Click "Add New Project"
3. Upload this folder OR push to a GitHub repo and connect it
4. During setup, add Environment Variable:
   - Name: `ANTHROPIC_API_KEY`
   - Value: your key from Step 1
5. Click Deploy!

Your app will be live at `your-project-name.vercel.app` in ~2 minutes. **Zero cost.**

### Step 3 — Run locally (optional)
```bash
npm install
cp .env.local.example .env.local
# Edit .env.local and add your API key
npm run dev
# Open http://localhost:3000
```

---

## Cost
- Hosting: **₹0** (Vercel free tier)
- AI: ~**₹0.001 per response** (Claude Haiku is extremely cheap)
- For 100,000 responses: ~₹100 total

---

## Tech Stack
- **Next.js 14** — React framework
- **Claude Haiku** — AI (fastest, cheapest model)
- **Vercel** — Hosting (free)
- **Vanilla CSS** — No heavy UI library

---

## You own this 100%
This code is yours. No license restrictions. Build on it, monetise it, rename it — it's fully yours.

---

*Made with chai ☕ and too much love*
