# Sabri's Dental Clinic — management software

Desktop app (Electron) for reception + dentist, both connected to the same
live data. Backend runs on Railway, database/auth on Supabase.

```
sabri-dental/
  backend/     FastAPI API (patients, visits, appointments, payments, PDF export)
  frontend/    React + Electron desktop app
  supabase/    Database schema (run once in Supabase)
```

Follow the steps in order. Steps 1–2 you only do once. Steps 3–6 are for you
now (dev machine); step 7 is what you hand to the clinic.

---

## Step 1 — Create the Supabase project

1. Go to https://supabase.com, sign up/log in, click **New project**.
2. Name it `sabri-dental-clinic`, pick a strong database password (save it
   somewhere), pick a region close to Pakistan (e.g. Singapore), click
   **Create new project**. Takes ~2 minutes to spin up.
3. Once it's ready, go to **SQL Editor** → **New query**, paste in the
   entire contents of `supabase/schema.sql`, click **Run**. This creates
   all 5 tables (staff, patients, visits, appointments, payments).
4. Go to **Project Settings → API Keys**. You'll need two values from here in
   the next steps:
   - `Project URL` (Project Settings → General, or top of API Keys page) →
     this is `SUPABASE_URL`
   - **Secret keys** section → the `default` key (starts with `sb_secret_`,
     click the eye icon to reveal it) → this is `SUPABASE_SERVICE_KEY`.
     **Keep this secret, never put it in the frontend.**
   - **Publishable key** section (starts with `sb_publishable_`) → this is
     `SUPABASE_ANON_KEY`, safe to use in the frontend.

   (Newer Supabase projects only show these two key types — no separate
   JWT secret to copy. The backend verifies logins against Supabase's
   public JWKS endpoint automatically, so there's nothing else to configure.)

## Step 2 — Create staff logins

1. Go to **Authentication → Users → Add user**, create one for the dentist
   (e.g. `dr.sabri@sabridental.pk`, set a password) and one for the
   receptionist (e.g. `reception@sabridental.pk`). Untick "auto confirm"
   only if you want them to verify by email — for an internal tool it's
   fine to leave "Auto Confirm User" checked so they can log in right away.
2. Copy each user's `UID` from the users table.
3. Back in **SQL Editor**, run (replace the UUIDs and names):

```sql
insert into staff (auth_user_id, name, role)
values ('<dentist-uuid-here>', 'Dr. Sabri', 'dentist');

insert into staff (auth_user_id, name, role)
values ('<receptionist-uuid-here>', 'Reception', 'receptionist');
```

To add more staff later, repeat steps 1–3 for each new person.

---

## Step 3 — Run the backend locally (to test)

```bash
cd sabri-dental/backend
python3 -m venv venv
source venv/bin/activate        # on Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
```

Open `.env` and fill in the two values from Step 1:

```
SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
SUPABASE_SERVICE_KEY=sb_secret_xxxxxxxxxxxxxxxxxxxx
ALLOWED_ORIGINS=*
```

Run it:

```bash
uvicorn app.main:app --reload --port 8000
```

Visit `http://localhost:8000/health` — should return `{"status":"ok"}`.
Visit `http://localhost:8000/docs` to see and try every endpoint.

## Step 4 — Deploy the backend to Railway

1. Push the `backend/` folder to a GitHub repo (or the whole `sabri-dental`
   repo — Railway lets you pick the root directory).
2. Go to https://railway.app, **New Project → Deploy from GitHub repo**,
   pick the repo. Set the root directory to `backend` if you pushed the
   whole monorepo.
3. In the Railway project → **Variables**, add the same two values as
   your local `.env`:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_KEY`
   - `ALLOWED_ORIGINS` = `*` (fine for a desktop app with no browser CORS
     concerns)
4. Railway auto-detects the `Procfile` and deploys. Once live, copy the
   public URL it gives you, e.g. `https://sabri-dental-backend-production.up.railway.app`
   — this is your `VITE_API_URL` for the frontend.

## Step 5 — Run the frontend locally (to test)

```bash
cd sabri-dental/frontend
npm install
cp .env.example .env
```

Fill in `.env`:

```
VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_xxxxxxxxxxxxxxxxxxxx
VITE_API_URL=http://localhost:8000       # or your Railway URL once deployed
```

Run the app in Electron:

```bash
npm run electron:dev
```

A desktop window should open with the login screen. Log in with the
dentist or receptionist email/password you created in Step 2.

## Step 6 — Build installers

Once `VITE_API_URL` in `.env` points at your **Railway** URL (not
localhost), build the real installer:

```bash
npm run electron:build
```

- On Windows this produces a `.exe` installer under `frontend/dist/` (actual
  output folder is printed at the end of the build).
- On Mac it produces a `.dmg`.
- Build on the OS you're targeting — a Windows `.exe` needs to be built on
  Windows (or with the right cross-build tooling), same for Mac.

## Step 7 — Install at the clinic

1. Copy the installer file to reception's PC and the dentist's PC/laptop.
2. Run it on each machine — it installs like any normal desktop app, with
   a "Sabri's Dental Clinic" icon.
3. Log in with the email/password set up for that staff member. Both PCs
   will show the same live patients, appointments, and billing data since
   they both talk to the same backend.
4. Needs an internet connection to work (it's talking to Railway +
   Supabase in the cloud).

---

## What's included

- Login with role (dentist / receptionist)
- Patients: add, search, edit
- Visit history per patient: numbered visits, procedure, medicine —
  logged directly on the patient's page
- Export a patient's full visit history as a PDF
- Appointments: day view, add, change status (scheduled / checked in /
  completed / cancelled)
- Billing: record a payment, mark as paid, daily total collected

## Not included (phase 2 ideas)

- WhatsApp/SMS appointment reminders
- Inventory tracking
- Multi-branch support
- Detailed financial reports/analytics

## Everyday use — adding staff or resetting a password

Both are done from the Supabase dashboard, no code changes needed:

- **New staff member**: Authentication → Users → Add user, then run the
  `insert into staff (...)` SQL from Step 2 with their role.
- **Reset a password**: Authentication → Users → click the user → Send
  password recovery, or just set a new password directly there.
