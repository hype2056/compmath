# Proof of Work — Competition Math Study Tracker

Log your independent competition math practice (AMC10, AMC12, AIME, USAMO, BMT, SMT)
by uploading photos of your handwritten work. Claude reviews the photos and gives
you a 0–100 effort/plausibility score, qualitative feedback, and — if you claim a
number of hours — a judgment on whether the work shown is plausible for that claim.

**Current scope (v1):** Google sign-in, logging sessions, AI verification, and a
personal history view. Leaderboards/friends and a dedicated feedback dashboard are
planned next, not included yet.

## Stack

- Next.js 16 (App Router, TypeScript, Tailwind v4)
- Auth.js v5 (Google OAuth) with the Prisma adapter
- Postgres + file storage, both via Supabase (free tier)
- Claude (Anthropic API, vision) for verification

## 1. Set up Supabase (database + photo storage)

1. Create a free project at https://supabase.com.
2. **Database:** Project Settings → Database → Connection string → copy the
   "Transaction pooler" URI (port 6543) into `DATABASE_URL`.
3. **Storage:** Storage → New bucket → name it `study-session-photos` → make it
   **public** (so the AI grader and the dashboard can load photo URLs directly).
4. **API keys:** Project Settings → API → copy the Project URL into
   `SUPABASE_URL` and the `service_role` secret key into
   `SUPABASE_SERVICE_ROLE_KEY`. The service role key is server-only — never
   expose it to the client.

## 2. Set up Google OAuth

1. In the [Google Cloud Console](https://console.cloud.google.com), create a
   project → APIs & Services → Credentials → Create Credentials → OAuth client ID
   → Application type "Web application".
2. Authorized redirect URI:
   - Local dev: `http://localhost:3000/api/auth/callback/google`
   - Production: `https://yourdomain.com/api/auth/callback/google`
3. Copy the Client ID / Client Secret into `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET`.

## 3. Get a free Gemini API key

Go to https://aistudio.google.com/apikey, sign in with the same Google account,
and create a key — no credit card needed. Put it in `GEMINI_API_KEY`.

Note: on the free tier, Google may use your submitted prompts/photos to
improve their models (this changes once you enable billing). For homework
photos that's low-stakes, but worth knowing.

## 4. Configure env vars

```bash
cp .env.example .env
npx auth secret   # writes AUTH_SECRET into .env for you
```

Fill in the rest of `.env` from steps 1–3.

## 5. Install, generate Prisma client, migrate

```bash
npm install
npx prisma generate
npx prisma migrate dev --name init
```

## 6. Run it

```bash
npm run dev
```

Visit http://localhost:3000.

## Notes / known limitations

- The AI score is a **plausibility/effort estimate**, not a precise grading of
  correctness — handwritten scratch work is genuinely hard to verify exactly.
  Treat it as a strong nudge toward honesty, not a perfect detector.
- Hours are entered in 0.5-hour steps, capped at 8 per session, to keep self-reports
  coarse-grained rather than implying false precision.
- File uploads currently go through Server Actions, capped by Next.js's default
  body size limit (~1MB per action by default — see `next.config.ts` if you want
  to raise it for larger photos).
