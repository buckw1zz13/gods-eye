# ⬛ GOD'S EYE — Deploy Guide
## Total cost: $0/month · Zero API keys required

---

## STEP 1 — Upload to GitHub (5 minutes)

### Option A: GitHub Desktop (easiest)
1. Download GitHub Desktop from desktop.github.com
2. File → New Repository → name it `gods-eye` → Create
3. Drag the entire `gods-eye-final` folder contents into the repo folder
4. Click "Commit to main" → "Publish repository"

### Option B: GitHub website (drag and drop)
1. Go to github.com → Sign in (or create free account)
2. Click "+" → "New repository" → name it `gods-eye` → Create repository
3. Click "uploading an existing file" link
4. Drag the entire `gods-eye-final` folder into the upload area
5. Click "Commit changes"

### Option C: Terminal
```bash
cd gods-eye-final
git init
git add .
git commit -m "God's Eye initial deploy"
gh repo create gods-eye --public --source=. --push
```

---

## STEP 2 — Connect to Netlify (3 minutes)

1. Go to **netlify.com** → click "Sign up" (use your GitHub account — it's free)
2. Click **"Add new site"** → **"Import an existing project"**
3. Click **"GitHub"** → Authorize Netlify → Select your `gods-eye` repo
4. Build settings are auto-detected from `netlify.toml` — don't change anything
5. Click **"Deploy gods-eye"**
6. Wait ~60 seconds → Your site is live at `https://random-name.netlify.app`

---

## STEP 3 — Set your password (2 minutes)

1. In Netlify → click your site → click **"Site settings"**
2. In the left menu click **"Environment variables"**
3. Click **"Add a variable"**
4. Key: `ACCESS_PASS`
5. Value: `4llSeing3ye` (or change to your own password — anything you want)
6. Click **"Save"**
7. Go to **"Deploys"** tab → click **"Trigger deploy"** → **"Deploy site"**

---

## STEP 4 — Open your dashboard

Visit your Netlify URL (e.g. `https://gods-eye-abc123.netlify.app`)

You'll see the login screen. Enter your access code (`4llSeing3ye` or whatever you set).

---

## How to change your password later

1. Netlify → Site settings → Environment variables → Edit `ACCESS_PASS`
2. No redeployment needed — change takes effect immediately

---

## What goes live automatically after deploy

| Data | Source | Refresh | Cost |
|---|---|---|---|
| Weather (6 cities) | Open-Meteo | Every 5 min | Free, no key |
| Exchange rates (PHP, IDR, SGD...) | Frankfurter/ECB | Every 10 min | Free, no key |
| Earthquakes M4.5+ on map | USGS | Every 10 min | Free, no key |
| Conflict news in ticker | GDELT | Every 15 min | Free, no key |
| Live flights (SEA region) | OpenSky Network | On demand | Free, no key |
| CCTV webcam feeds | Windy.com public cams | Live | Free, no key |
| Commodity prices | Simulated | Every 2.5s | N/A |

---

## Custom domain (optional, still free)

1. Netlify → Site settings → Domain management → Add custom domain
2. Enter your domain (e.g. `monitor.yourdomain.com`)
3. Update your DNS to point to Netlify
4. Netlify auto-provisions HTTPS/SSL certificate (free via Let's Encrypt)

---

## File structure reminder

```
gods-eye-final/
├── public/
│   └── index.html          ← the full dashboard (login + map + all panels)
├── netlify/
│   └── functions/
│       └── proxy.js        ← API proxy (keeps password server-side)
├── netlify.toml            ← build config (auto-detected)
├── .env.example            ← copy ACCESS_PASS value from here
└── DEPLOY.md               ← this file
```

---

## Troubleshooting

**Login says "Access Denied" even with correct password**
→ Make sure you added `ACCESS_PASS` in Netlify env vars and redeployed

**Weather/forex shows "deploy to Netlify for live data"**
→ These need the Netlify function — they only work on your deployed site, not locally

**CCTV feeds show "SIM" instead of live video**
→ Some Windy.com embed URLs may have changed. Visit windy.com/webcams to find
   updated embed URLs and replace in index.html, then redeploy

**Site not found after deploy**
→ Wait 2-3 minutes — Netlify DNS propagation takes a moment on first deploy
