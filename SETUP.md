# Connecting Film Crew HQ to Supabase

Until this is done, the site runs in **demo mode**: it shows sample data and saves nothing.
Only the team leader needs to do these steps, once.

**How sign-in works:** there are no emails and no personal passwords. Everyone types one shared **team code** once on each device, then taps their name. The device remembers them after that.

---

## 1. Make a free Supabase project ✅ done
Region **Sydney (ap-southeast-2)**, Free plan.

## 2. Create the tables
In Supabase → **SQL Editor** → **New query**, paste each file below **in this order** and press **Run** each time:

| File | What it sets up | Status |
|---|---|---|
| `supabase/01_team.sql` | Profiles, roles, photo storage | ✅ done |
| `supabase/02_checklist.sql` | Competition details, checklist tasks, starter lessons | ✅ done |
| `supabase/03_team_code.sql` | Team-code sign-in (removes the need for emails) | ✅ done |
| `supabase/04_budget.sql` | Budget categories and expenses | |

After running 03, **don't run 01 again**. It would switch back on parts of the old email sign-in.

## 3. Connect the website ✅ done
`.env.local` has your Project URL and publishable key.

## 4. Only let your team in ✅ done
"Allow new users to sign up" is **off**.

## 5. Create the team code
1. Supabase → **Authentication** → **Users** → **Add user** → **Create new user**
2. Email: `team@example.com` (exactly this; it isn't a real inbox and no email is ever sent)
3. Password: **your team code**, at least 6 characters, e.g. `crew-chch-2027`
4. ✅ Tick **Auto Confirm User** → **Create user**

Share the code with your team in person or in your group chat, not anywhere public.

**To change the code later:** Users → click `team@example.com` → change its password. Everyone then has to type the new code once.

## 6. Try it
1. Open <http://localhost:5173> and type the team code.
2. Tap your name, or type it under "Not on the list?" if you're new.
3. Go to Team → **Edit my profile** → add your role and a photo → **Save**.

Your old email account (`trantruonga4pct@gmail.com`) can stay in Users. It doesn't hurt anything, and your profile is kept.

---

### If something goes wrong
| You see | Fix |
|---|---|
| "That code isn't right" | Check step 5: the email must be exactly `team@example.com`, and the password is the code |
| Your name isn't on the list | Type it under "Not on the list?" |
| Wrong name picked | Settings → **Switch person** |
| Asked for the code again | You're on a different address (always use `localhost:5173`, later the real web link), a different browser, or a private window |
| Site still says Demo mode | `.env.local` is misnamed or in the wrong folder; restart `npm run dev` |
| Project "paused" | Free projects pause after 7 days unused. Open the Supabase dashboard and press **Restore** |

### Later: email alerts (step 9)
Email alerts will need a Gmail account connected to Supabase (custom SMTP). We'll set that up when we get to step 9. Sign-in doesn't need it.
