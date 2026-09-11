# Axis Motion — practice app

Multi-physio patient management: each physio only ever sees their own
patients, keeps a calendar of their own sessions, and can upload home
exercises. Each patient gets their own read-only login to see their
exercises and upcoming sessions.

## How it works

- **Next.js** is the app (pages, forms, routing).
- **Supabase** is the backend: it gives you a Postgres database, login/auth,
  and (later, if you want) file storage — all free to start.
- **Row Level Security (RLS)**, set up in `supabase/schema.sql`, is what
  actually keeps physio A from ever seeing physio B's patients. It's
  enforced by the database itself, not just by the app's code.

## 1. Create your Supabase project

1. Go to https://supabase.com, sign in, and create a new project (free tier).
2. Wait for it to finish provisioning (~2 minutes).
3. Open **SQL Editor** in the left sidebar, paste in the entire contents of
   `supabase/schema.sql` from this project, and run it. This creates all
   four tables (`profiles`, `patients`, `sessions`, `exercises`) and turns
   on the security rules.
4. Open **Project Settings → API**. You'll need three values from this page
   in the next step: the **Project URL**, the **anon public** key, and the
   **service_role** key (click "reveal" to see it).
5. Open **Authentication → Providers** and confirm Email is enabled (it is
   by default). Optional: under **Authentication → Settings**, you can turn
   off "Confirm email" while you're testing, so new physio accounts don't
   need to click an email link before they can log in.

## 2. Run it locally

```bash
npm install
cp .env.local.example .env.local
```

Open `.env.local` and paste in your Project URL and the two keys from
step 1.4.

```bash
npm run dev
```

Visit http://localhost:3000 — it redirects to `/login`. Click
"Create an account" to make your own physio login, then sign in.

## 3. Deploy to Vercel

1. Push this project to a new GitHub repo.
2. Go to https://vercel.com, "Add New Project", and import that repo.
3. In the Vercel project's **Settings → Environment Variables**, add the
   same three variables from your `.env.local` (`NEXT_PUBLIC_SUPABASE_URL`,
   `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`).
4. Deploy. You'll get a `your-app.vercel.app` URL — same pattern as your old
   `axis-motion.vercel.app`.

## 4. Day-to-day use

- **You and each coworker** sign up once at `/signup` — that creates a
  separate physio account. Nobody's patient list is shared; a physio only
  ever sees patients they personally added.
- **Adding a patient**: from your dashboard, "+ Add patient" creates a
  login for them on the spot and shows you a temporary password once —
  copy it and send it to the patient yourself (text, WhatsApp, in person).
  They should change it after their first login (Supabase's password-reset
  flow handles that if you want to wire it up later).
- **Booking sessions**: open a patient's page to book a session for them;
  see everything on your plate at `/dashboard/calendar`.
- **Exercises**: also added from the patient's page. Only you (their
  physio) can add or edit them; the patient can only view them.
- **Patients log in** at the same `/login` page and land on a read-only
  view of their own sessions and exercises — they can't see or edit
  anything else, and can't see other patients.

## What's deliberately left out (v1)

To keep this buildable in one pass, a few things are simplified — worth
knowing about, not blockers:

- Exercise "videos" are just a link field (e.g. a YouTube link or a file
  you host elsewhere). Direct video upload via Supabase Storage is a
  natural next step.
- No patient self-registration — physios create patient accounts, which
  matches "only I can upload/add" from your brief.
- No password-reset UI yet; Supabase's built-in reset-by-email works out
  of the box if you enable it in Authentication settings.
- No appointment reminders/notifications — could be added later with a
  scheduled Supabase Edge Function + email or SMS provider.
