# Battle Start — client hub

An invitation-only information hub for Battle Start clients: a knowledge base and
a client profile, built as **one Tilda block driven by Supabase**.

Visual language follows the [avatararena.ru](https://avatararena.ru/) reference —
light ground, floating white pill header, generous rounding, crimson `#EC1E5E`
accent against deep navy `#1F2A5A` text.

---

## How it is put together

| Layer | Job |
| --- | --- |
| **Tilda** | One page, one block. Pastes in as an HTML element. |
| **Supabase Postgres** | Articles, categories, attachment links, client profiles. |
| **Supabase Auth** | Sign-in. Accounts are created by hand — there is no public sign-up. |
| **GitHub + jsDelivr** | Storage for images and downloadable files. |

The whole hub is a single file, `tilda/battle-start-hub.html`. Every screen —
sign in, home, knowledge base, article, profile, password reset — lives at a
URL hash on that one page, so nothing goes into the site HEAD and there is only
ever one place to update.

| Hash | Screen |
| --- | --- |
| `#/login` | sign in |
| `#/hub` | home |
| `#/kb` | knowledge base |
| `#/kb/c/<slug>` | one category |
| `#/kb/a/<slug>` | one article |
| `#/profile` | client profile |
| `#/reset` | set a new password (from the recovery email) |

### One thing to understand before you start

**Tilda pages are public.** Anything typed into a Zero Block sits in the page
source and is readable by anyone, signed in or not — a redirect script is a
curtain, not a lock (`view-source:` walks straight past it).

So protected content must **not** be typed into Tilda. It lives in Supabase and
is fetched after sign-in, where Row Level Security actually enforces access. In
this setup Tilda supplies the shell and the design; Supabase supplies the
content and the access control. `schema.sql` closes every table to anonymous
visitors by default.

---

## Step 1 — Supabase project

1. Sign up at [supabase.com](https://supabase.com) and create a project.
   Pick the region closest to your clients and save the database password.
2. Open **SQL Editor → New query**, paste all of `supabase/schema.sql`, press **Run**.
   The script is idempotent — running it twice breaks nothing.
3. Optional: run `supabase/seed.sql` the same way for five demo articles, so the
   hub is not empty while you are wiring up Tilda.
4. Go to **Project Settings → API** and copy two values:
   - **Project URL** — `https://xxxxx.supabase.co`
   - the **public** key — either the current publishable key
     (`sb_publishable_...`) or the legacy anon JWT (`eyJ...`); both work.

That key is meant to be public and is safe in page source: access is limited by
RLS policies, not by hiding the key. The **secret** key (`sb_secret_...`, formerly
`service_role`) is the opposite — it bypasses RLS entirely, so it must never
appear anywhere in Tilda. The block checks for it on start-up and refuses to run.

---

## Step 2 — Create client accounts

There is no self-registration. For each client:

1. **Authentication → Users → Add user**.
2. Enter the email and a password, and tick **Auto Confirm User** — otherwise the
   client cannot sign in until they confirm the address.
3. Optionally fill **User Metadata** so the profile arrives pre-populated:

   ```json
   { "full_name": "Jane Doe", "company": "Battle Start Camden", "city": "London", "phone": "+44 20 7946 0210" }
   ```

A `profiles` row is created automatically by the `on_auth_user_created` trigger.
Open it in **Table Editor → profiles** to set `manager_name` and `manager_contact` —
those two fields are read-only for the client and appear on their profile page.

To cut someone off, set their `profiles.status` to `suspended`: RLS then hides
every article from them without deleting the account.

---

## Step 3 — Tilda

1. Create **one page**, for example at `/hub`.
2. Add a **Zero Block**, then an **HTML** element inside it. A plain **T123
   "HTML code"** block works identically if you would rather not use Zero Block.
3. Paste the entire contents of `tilda/battle-start-hub.html`.
4. Near the top of the `<script>`, fill in `CONFIG`:

   ```js
   var CONFIG = {
     url:     'https://xxxxx.supabase.co',       // Project URL
     anonKey: 'sb_publishable_...',              // the PUBLIC key
     brand:   'Battle Start'
   };
   ```

That is the whole installation. Nothing goes into the site HEAD, and there are no
other blocks to place.

The block refuses to start on placeholder credentials and says so on screen, so a
half-configured page fails loudly rather than silently showing an empty hub.

### Page background

The block paints its own background. If Tilda's own page background shows through
at the edges, set it to `#F6F7FB` in page settings.

---

## Step 4 — Auth URLs

**Authentication → URL Configuration**:

- **Site URL** — `https://your-domain`
- **Redirect URLs** — add the hub page URL, e.g. `https://your-domain/hub`

The recovery email sends the client back to that address with a token in the URL
hash. The block spots it on start-up and opens the "New password" screen.

---

## Step 5 — Images and files on GitHub

Put files in `hub/assets/` in this repository and reference them through jsDelivr:

```
https://cdn.jsdelivr.net/gh/pirgooo/pirgooo@main/hub/assets/files/opening-checklist.pdf
```

Use that URL in `kb_files.url` (attachments) or `kb_articles.cover_url` (covers).

jsDelivr caches aggressively. To publish a changed file, either give it a new
name or pin a commit hash instead of `@main`.

**Know the trade-off:** a file in a public repository is readable by anyone with
the link. Keep genuinely confidential documents in **Supabase Storage** with a
private bucket and signed links instead.

---

## Administration

An administrator manages client accounts from inside the hub: a **Clients**
tab appears in the header, listing every account with its plan and paid-until
date, and opening one gives a form where every value is typed in by hand.

### Making someone an administrator

**Table Editor → profiles →** set that row's `role` to `admin`. There is no
button for this on purpose: the first administrator has to come from the
Dashboard, so an account in the hub can never promote itself.

### What an administrator can do

- **Edit any client**: contact details, arena details, socials.
- **Assign a manager**: name, contact, and a WhatsApp number. The number is
  digits only with the country code (`447700900123`); the hub turns it into a
  `wa.me` link shown to the client on their profile and home screen.
- **Record a subscription**: plan and the dates it is paid from and until.
  The plan is free text — whatever was actually agreed, not an item from a
  list. Dates accept `2026-03-01` or `01.03.2026` and are normalised on save.
- **Suspend access**: set `status` to `suspended` and RLS stops serving that
  client the knowledge base, without deleting anything.

A client sees the plan and the paid period on their own profile, with a badge
that turns amber two weeks out and crimson once it lapses. They cannot edit any
of it: the `protect_profile_fields` trigger reverts a client's writes to the
manager and subscription fields.

### Creating accounts — the Edge Function

Creating a user needs the **service role key**, which bypasses RLS entirely and
can never go near a browser. So account creation lives in an Edge Function that
checks the caller is an administrator before it does anything.

Deploy it once:

```bash
supabase functions deploy admin-create-client
```

Or paste `supabase/functions/admin-create-client/index.ts` into
**Dashboard → Edge Functions → Deploy a new function**. `SUPABASE_URL` and
`SUPABASE_SERVICE_ROLE_KEY` are provided by the platform — there is nothing to
configure.

Until it is deployed the rest of the admin area works normally, and **Add
client** says so and points you at the Dashboard instead. Creating the account
there by hand (Authentication → Users → Add user, with *Auto Confirm User*)
gets the same result — the trigger still makes the profile, and it appears in
the Clients list ready to edit.

---

## The arena's journey

Beside the experience bar the home screen carries a second, quieter track: the
venue's real history, from signing the agreement to a year in the network.

It is deliberately **not** a score. The milestones are facts about the client's
own business, so there is nothing to inflate and nothing that goes stale once
the profile is full. An owner with "First 1,000 guests" ahead of them actually
wants to reach it.

Milestones are marked by an **administrator**, never by the client — Battle
Start confirming each step is what gives the path its weight. Open a client in
the Clients tab and the Journey section has one date box per milestone: fill it
in and the step goes solid, clear it and the step goes back to pending. Dates
are typed by hand and accept `2026-03-01` or `01.03.2026`.

The path itself lives in `public.milestone_types` — edit that table to rename,
reorder or add stops for the whole network. A client's own history is in
`public.client_milestones`, one row per milestone reached.

It also gives the network a plain operational view: who has been stuck on
installation for three months.

---

## Experience and levels

The hub rewards a client for describing their arena properly: every filled field
is worth experience, and experience opens material that is otherwise unreadable.

### Why the experience cannot be faked

A client can edit their own profile through the API — that is the whole point of
the profile screen. So a plain `exp` integer would simply be set to 9999 by
anyone who opened the network tab.

Instead `profiles.exp` is a **generated column**: PostgreSQL computes it from the
profile's own fields and rejects any attempt to write to it. Filling a field in
*is* the only way to earn the points. The browser never sends `exp`, it only
reads it back.

The same applies to the locked material. Hiding an article in the interface
would be theatre — the row is still one API call away. Instead the RLS policy on
`kb_articles` carries `min_level <= public.current_level()`, so a locked article
returns no rows at all, body included.

That creates a second problem: a locked article has to be *advertised* to be
tempting, and RLS works per row, not per column. The `kb_catalog` view solves it
— it runs with its owner's rights, so it lists every published article with its
title, summary and required level, and it simply never selects `content_md`.
Titles tempt; bodies stay shut.

### What earns what

Points live in `public.exp_rules`, so the "what to fill in next" list on the home
screen is rendered from the same numbers the database scores with.

| Field | Points | | Field | Points |
| --- | --- | --- | --- | --- |
| Your name | 10 | | Website | 15 |
| Venue name | 10 | | Facebook page | 10 |
| City | 10 | | Instagram | 10 |
| Full address | 15 | | Telegram channel | 10 |
| Phone | 10 | | About the arena (80+ chars) | 20 |
| Telegram | 10 | | Logo | 15 |

A fully described arena is worth **145 EXP**.

### Levels

Thresholds and rewards live in `public.levels`. `perk` is the teaser a client
sees for the level they have not reached yet, so make it worth the effort.

| Level | From | Title | What opens |
| --- | --- | --- | --- |
| 1 | 0 | Newcomer | — |
| 2 | 60 | Operator | The break-even case study |
| 3 | 110 | Veteran | Marketing playbooks and ad creatives |
| 4 | 145 | Legend | A direct line to the ops team |

### Locking an article

Set `kb_articles.min_level` in the Table Editor. `1` means open to everyone
signed in; anything higher locks it, and the catalogue starts advertising it as
a reward.

### Changing the numbers

Thresholds, titles and perks are ordinary rows — edit `levels` and `exp_rules`
in the Table Editor and the interface follows on the next load.

Changing what a **field** is worth is different: the weights are baked into the
generated column, because a generated expression cannot read from a table. Edit
the expression in `schema.sql`, then drop the column before re-running, since
`ADD COLUMN IF NOT EXISTS` will not rewrite an expression that already exists:

```sql
alter table public.profiles drop column if exists exp;
```

Then re-run `schema.sql` and update the matching row in `exp_rules` so the
interface shows the same number the database awards.

---

## Step 6 — Managing content

Everything is edited from **Table Editor** — no redeploy, no Tilda changes.

- **kb_categories** — the tab row. `sort_order` sets the order, `icon` takes an emoji.
- **kb_articles** — the articles. `content_md` is Markdown; `slug` is what the URL
  uses, so keep it stable once shared. Set `is_published` to `false` to hide a draft.
- **kb_files** — attachments, linked to an article by `article_id`.

Markdown supported by the renderer: headings, ordered and unordered lists,
tables, blockquotes, inline code, links, images, bold, italic, horizontal rules.
Raw HTML is escaped rather than rendered, so an article cannot inject markup.

---

## Running it locally

Both local entry points load the same `tilda/battle-start-hub.html`, so what you
see is what Tilda will serve. Start a web server from the `hub` folder:

```bash
cd hub
python3 -m http.server 8000     # Windows: python -m http.server 8000
```

**Opening the file straight from disk does not work.** A page on `file://` has a
null origin, which breaks Supabase sessions, and the browser blocks the block
file from loading. It has to be served over `http://localhost`.

### `http://localhost:8000/preview/` — stubbed data

No Supabase project needed, no network. Sign in with
`demo@battlestart.com` / `demo1234`. The bar along the bottom switches screens
and clears the session. `preview/mock-supabase.js` never ships to production.

Use it for design work and for clicking through flows.

### `http://localhost:8000/local/` — the live database

The real project, no stub: signing in creates a real session and anything you
save is written to the live database. A crimson bar across the top names the
project it is pointed at, so it can never be mistaken for the preview.

Use it to check the real content and real accounts before touching Tilda.

Two things to set up for it:

- Add `http://localhost:8000/local/` to **Authentication → URL Configuration →
  Redirect URLs**, otherwise the password-recovery link will not come back here.
  Sign-in itself works without this.
- The user must exist and be confirmed (**Add user** with *Auto Confirm User*).

Sessions are kept per origin, so `localhost` and the Tilda domain sign in
separately — being signed in on one says nothing about the other.

---

## File map

```
hub/
├── supabase/
│   ├── schema.sql              tables, triggers, RLS, experience rules
│   ├── seed.sql                demo content, locked material included
│   ├── verify.sql              post-install check
│   ├── fix-duplicate-files.sql one-off repair for a doubled seed
│   └── functions/
│       └── admin-create-client/  Edge Function: creates client accounts
├── tilda/
│   └── battle-start-hub.html   THE HUB — paste this one file into Tilda
├── preview/
│   ├── index.html              local stand, stubbed data
│   └── mock-supabase.js        Supabase stub, preview only
├── local/
│   └── index.html              local stand, live database
└── assets/                     images and files served via jsDelivr
```

---

## Design tokens

Defined at the top of the block's `<style>`; change them there and every screen follows.

| Token | Value | Where it shows |
| --- | --- | --- |
| `--bsh-pink` | `#EC1E5E` | logo, active tab, accented heading word |
| `--bsh-blue` | `#2F6BFF` | primary buttons, links |
| `--bsh-navy` | `#1F2A5A` | headings and body text |
| `--bsh-muted` | `#8A93A6` | labels and captions |
| `--bsh-bg` | `#F6F7FB` | page ground |
| `--bsh-soft` | `#F1F3FA` | tiles and article cards |

CSS classes are prefixed `bsh-` and everything is scoped to `.bsh`, so nothing
collides with Tilda's own styles.

---

## Room to grow

- `profiles.role` already accepts `client | staff | admin`, so per-role access is
  a policy change rather than a migration.
- A client cannot change their own `role`, `status`, `email` or manager fields —
  the `protect_profile_fields` trigger reverts those on write.
- Announcements or support tickets would be a new table plus one more screen in
  the router, following the same pattern as the knowledge base.
