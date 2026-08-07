# CUI Job Register — Vercel + Firebase setup

## What changed
The original file called `window.storage`, which only exists inside Claude's
artifact preview — not in a real browser. It now talks directly to **Google
Firebase Firestore** from the page's own JavaScript. No serverless function,
no backend code — Firestore's free tier and browser SDK handle everything.

## Project layout
```
cui-job-register/
└── public/index.html   ← the whole app (was CUI_JOB_REGISTER_MAIN.html)
```
That's it. Fully static — Vercel just serves this one file.

## Step 1 — Create a Firebase project
1. Go to https://console.firebase.google.com → **Add project**.
2. Name it (e.g. `cui-job-register`) → disable Google Analytics (not needed) → **Create project**.

## Step 2 — Create a Firestore database
1. In the left sidebar → **Build → Firestore Database → Create database**.
2. Choose a location close to Nigeria (e.g. `eur3` / Europe-west).
3. Start in **test mode** for now (you'll lock it down in Step 4).

## Step 3 — Register a Web App and get your config
1. Project Overview → click the **`</>`** (Web) icon → nickname it → **Register app**.
2. Firebase shows a `firebaseConfig` object like:
   ```js
   const firebaseConfig = {
     apiKey: "AIza...",
     authDomain: "cui-job-register.firebaseapp.com",
     projectId: "cui-job-register",
     storageBucket: "cui-job-register.appspot.com",
     messagingSenderId: "123456789",
     appId: "1:123456789:web:abcdef"
   };
   ```
3. Open `public/index.html` in your repo, find the `firebaseConfig` block near
   the top of the `<script>` section, and replace the placeholder values with
   your real ones. Commit the change.

## Step 4 — Lock down Firestore rules
Test mode allows anyone to read/write for 30 days, then locks everything —
better to set explicit rules now.
1. Firestore Database → **Rules** tab → replace the contents with:
   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /registers/{document} {
         allow read, write: if true;
       }
     }
   }
   ```
2. **Publish**.

This keeps it open (no login) but scoped to only the `registers` collection
this app uses — same tradeoff as before: anyone with the URL can edit data.
Add Firebase Authentication later if you want to restrict who can write.

## Step 5 — Deploy on Vercel
1. Push this folder to GitHub (`public/index.html` at that path).
2. Vercel → Add New → Project → import the repo → Deploy.
   No build settings or environment variables needed — it's a static file.
3. Open the deployed URL, add an entry, refresh, check it on another device.

## Notes
- Both job lists are stored as two documents in Firestore
  (`registers/scaffold`, `registers/insulation`), each holding the full
  array as one field — fine for the current scale (dozens–low hundreds of
  rows).
- Free tier: 1 GB storage, 50,000 reads/day, 20,000 writes/day — far beyond
  what this tool will use.
- If you ever want per-user login or an edit history, Firebase Authentication
  and Firestore's built-in change history are natural next additions.
