# Film Crew HQ 🎬

Our team's production hub for the AI short film competition: checklist, budget (NZD), team profiles and activity, all in one place.

**Status:** steps 1–4 of 9 are built. See [ROADMAP.md](ROADMAP.md).

## Try it on your computer

You need [Node.js](https://nodejs.org) (the LTS version) and [Git](https://git-scm.com).

```bash
git clone https://github.com/Rhys12-Tran/2027.git
cd 2027
npm install
```

### Option A: look around with sample data (no keys needed)
```bash
npm run demo
```
Open <http://localhost:5180>. Nothing you do here is saved.

### Option B: use the real team data
1. Ask the team leader for the **two Supabase values** and the **team code**. They're never put on GitHub.
2. Copy `.env.example` to a new file called `.env.local` and paste the two values in.
3. Run:
   ```bash
   npm run dev
   ```
4. Open <http://localhost:5173>, type the team code, and tap your name.

> Online: the site is published with GitHub Pages at https://rhys12-tran.github.io/2027/ (see SETUP.md, "Putting it online").

## For the team leader
Database setup and sign-in: [SETUP.md](SETUP.md).

## What's inside
| Folder | What's there |
|---|---|
| `src/pages/` | One file per page (Home, Checklist, Budget, Team…) |
| `src/components/` | Shared pieces: navigation, pop-up forms, icons |
| `src/lib/` | Sign-in, team data and the shared database connection |
| `supabase/` | Database setup scripts, run in order in the Supabase SQL Editor |
