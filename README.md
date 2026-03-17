# Ridge Mystery Drop 📦

A tongue-in-cheek idle gacha game built for Ridge team presentations. Open mystery packages, collect Ridge products, and try to complete your Collector's Booklet before the next standup.

---

## What is this?

Ridge Mystery Drop is a browser-based idle game where you:

- **Place orders** for mystery packages across four tiers (Standard → Express → Priority → Overnight)
- **Wait for real-time countdowns** as your shipments arrive
- **Open packages** to discover Ridge products — wallets, keycases, bags, pens, and more
- **Earn credits** from each unboxing to fund your next order
- **Upgrade carriers** to slash shipping times (Budget Courier → SonicRidge at 5× speed)
- **Complete the Collector's Booklet** — 18 items across Common / Uncommon / Rare / Ultra Rare
- **Prestige** after collecting everything, resetting your stash for a permanent +10% rare rate bonus

Credits trickle in passively (1 per 30 seconds), so it rewards leaving the tab open during your meeting.

---

## File Structure

```
index.html   — HTML structure and script/style wiring
style.css    — All styles and pixel-art CSS icons
data.js      — Game constants (tiers, carriers, collectibles, milestones)
state.js     — State object, persistence (localStorage), helper functions
audio.js     — Web Audio API sound system (no audio files needed)
render.js    — All UI rendering functions
game.js      — Core game logic (ordering, opening, milestones, prestige)
main.js      — Entry point: init, game loop, tab switching, modals
README.md    — This file
```

---

## How to Run Locally

No build step required.

```bash
# Option 1 — just open the file directly
open index.html

# Option 2 — serve locally to avoid any CORS edge cases
npx serve .
# then open http://localhost:3000
```

---

## How to Deploy to Vercel

### Via CLI

```bash
npm i -g vercel
vercel
# Follow the prompts — choose "Other" framework, output directory "."
```

### Via Dashboard

1. Push this repo to GitHub
2. Go to [vercel.com/new](https://vercel.com/new)
3. Import the repo
4. Framework preset: **Other**
5. Output directory: leave blank (root)
6. Click **Deploy**

Vercel will serve `index.html` as the root. No `vercel.json` needed.

---

## Gameplay Tips

- **Standard** packages are cheap but slow — stack multiples while you wait.
- **Overnight** has a 50% rare-rate boost. Worth it for chasing Ultra Rares.
- Carrier upgrades are permanent and carry over after Prestige.
- The **Collector's Booklet** filter buttons let you focus on what you're missing.
- Sound can be toggled with the 🔊 button in the top bar.
- The warehouse background changes based on your real local time (dawn / day / dusk / night).

---

*Made with love (and mild self-deprecation) by the Ridge team.*
