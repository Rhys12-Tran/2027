# Film Crew HQ: build roadmap

Each step ends with something you can click and check before the next one starts.

## Core site
| # | Step | Status |
|---|---|---|
| 1 | Site shell: navigation, colours, fonts, all pages with sample data | ✅ Done |
| 2 | Supabase connected, team-code sign-in + "Who are you?", Team profiles | ✅ Done |
| 3 | **Checklist** live and shared: tasks, owners, due dates, ticks, progress, lessons | ✅ Done |
| 4 | **Budget**: expenses, live totals, over-budget warnings, CSV export | ✅ Built, needs 04_budget.sql run |
| 5 | Budget charts: pie, bar, line | |
| 6 | Activity feed + bell notifications (incl. "every change" alerts for Checklist and Budget) | |
| 7 | **Home dashboard** using all real data | |
| 8 | Put it online (Netlify) + "Add to Home Screen" on phones | |
| 9 | Email alerts (uses the Gmail setup from SETUP.md) | |

## Extra ideas (all approved)
| # | Idea | What it does | Extra work |
|---|---|---|---|
| 10 | **Competition rules sheet** | Pin the rules, length limit, file format and submission link | Small |
| 11 | **Deadline calendar** | Month view of every task due date and the competition deadline | Small |
| 12 | **Lessons-learned log** | Anyone adds a lesson any time; one tap turns it into a checklist task | Small |
| 13 | **Prompt library** | Save prompts that worked: tool, prompt text, result image, tags | Medium |
| 14 | **Asset library** | Images, clips, music and voice files (links or uploads) marked draft or final | Medium |
| 15 | **Shot list / storyboard board** | Scene-by-scene cards: description, prompt, image, status | Medium–Large |
| 16 | **Phone push notifications** | Pop-up alerts like a real app (iPhone needs "Add to Home Screen" first) | Medium |

New pages (rules, calendar, prompts, assets, shots) will sit under a **More** tab so the bottom bar stays simple on phones.
