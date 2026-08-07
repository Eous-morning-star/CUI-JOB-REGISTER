# CUI Job Register — Vercel + KV setup

## What changed
The original file called `window.storage`, which only exists inside Claude's
artifact preview — not in a real browser. It's been swapped for two `fetch`
calls to `/api/data`, backed by a serverless function (`api/data.js`) that
reads/writes Vercel KV (Redis). This gives you real persistence, shared
across every device that opens the site.

## Project layout
```
cui-job-register/
├── public/index.html   ← the app (was CUI_JOB_REGISTER_MAIN.html)
├── api/data.js         ← serverless function, talks to KV
├── package.json
└── vercel.json
```

## Deploy steps

1. **Push this folder to a GitHub repo** (or drag-and-drop deploy via the
   Vercel dashboard).

2. **Import the repo into Vercel** (vercel.com → Add New → Project).

3. **Create a KV store**:
   - In your Vercel project → Storage tab → Create Database → KV.
   - Connect it to this project. Vercel automatically injects the required
     `KV_REST_API_URL` and `KV_REST_API_TOKEN` environment variables — you
     don't need to set them manually.

4. **Redeploy** once the KV store is connected (Vercel does this
   automatically on first connect; if not, trigger a redeploy from the
   dashboard).

5. Open the deployed URL on your phone and your laptop — both will read and
   write the same two KV keys (`scaffold-jobs`, `insulation-jobs`), so data
   now survives refreshes and shows up on every device.

## Local testing (optional)
```
npm install -g vercel
cd cui-job-register
vercel dev
```
This pulls your KV credentials locally so `vercel dev` behaves like
production.

## Notes
- Both job lists are stored as single JSON blobs (one KV key per module).
  That's fine at your current scale (dozens–low hundreds of rows). If this
  grows into thousands of entries with concurrent editors, migrate to
  Postgres/Neon later — the only file that changes is `api/data.js`.
- No auth is enforced. Anyone with the URL can edit the register. Add
  Vercel's built-in password protection (Project Settings → Deployment
  Protection) if that's a concern before sharing the link widely.
