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

The block covers only its own column, so the builder's white would otherwise
show as a band down each side. It therefore paints the page itself, taking the
colour from its own palette so the two can never drift apart. Set
`paintPage: false` in CONFIG to leave the page colour alone.

### Space above the header

A page builder adds padding of its own around a block — often a hundred
pixels — which pushes the hub's header down the screen for no reason. The block
clears that padding on its own wrappers and keeps exactly the gap named by
`topGap` in CONFIG (14px by default). Set it to `null` to leave the builder's
spacing alone.

If you keep the site's own header, raise `.bsh-nav`'s `top` to its height as
well, or the two will overlap once the page scrolls.

### Block height

A **Zero Block artboard has a fixed height**, decided before this app exists,
while the hub's height changes with the screen it is showing — five articles or
twenty. Left alone, a Zero Block crops the hub mid-page and drops the site
footer on top of it.

The block handles this itself: after every render it measures its real height
and pushes it onto the Tilda wrappers above it, clearing any overflow that would
crop it. Only Tilda's own containers and elements with an inline height are
touched.

A plain **T123 "HTML code"** block needs none of that, since it already grows
with its content. Prefer it unless the page is being designed around a Zero
Block canvas.

### On a phone

The hub is one layout that rearranges itself; there is no separate mobile
version to keep in step. Below 720px it changes shape rather than shrinking:

- The header splits in two — the wordmark, level, avatar and **Sign out** on
  top, the sections on a row of their own that scrolls sideways and keeps the
  current one in view. The client's name and venue drop out of the bar; the
  avatar stands in for them, and the full name is one tap away on the profile.
- Category chips in the knowledge base become a single scrolling row instead of
  three wrapped ones, which gives a whole article back above the fold.
- Everything that was a row of columns — the latest-material list, the client
  cards in the admin list — stacks.
- The arena journey scrolls sideways and snaps to a milestone.
- Every control is at least 44px tall, and every input is 16px, because iOS
  zooms the whole page when a field is smaller than that.
- Hover effects are switched off, since on a touch screen a hovered state
  sticks after the tap and leaves a card looking selected.
- **The padlock tooltip has no equivalent on a phone**, so opening a paywalled
  section says the same thing in a line above the articles, on every device.

Turning the phone re-measures the block, so a Zero Block artboard follows the
new height in both directions rather than leaving a screenful of empty space
under a landscape layout.

One thing to check in Tilda: a Zero Block keeps a separate artboard per
breakpoint. If the mobile artboards were never set up, Tilda may scale the
desktop one down instead of letting the block lay itself out, and the hub will
arrive as a shrunken copy of the desktop view rather than the layout above.
The T123 "HTML code" block has no artboards and no such setting, which is the
other reason to prefer it.

---

## Step 4 — Auth URLs

**Authentication → URL Configuration**:

- **Site URL** — `https://your-domain`
- **Redirect URLs** — add the hub page URL, e.g. `https://your-domain/hub`

The recovery email sends the client back to that address with a token in the URL
hash. The block spots it on start-up and opens the "New password" screen.

**This is the only way a client changes their password.** The profile screen
carries no password form: a client who wants a new one uses *Forgot your
password?* on the sign-in screen and follows the emailed link, which proves they
still hold the mailbox before letting them set one. So the redirect URL above is
not optional — without it that link comes back to nothing.

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
  This is also what opens the paywalled part of the library: a client with
  `status = active` and a `subscription_until` that has not passed gets the
  **Marketing** section, and loses it again the day after it lapses.
- **Suspend access**: set `status` to `suspended` and RLS stops serving that
  client the knowledge base, without deleting anything.

A client's sign-in address is shown under their name on the profile, but there is
no field to edit it: only an administrator can change an account's email, from
the Dashboard.

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

## The home screen

It is a dashboard, not a stack. The top of the page is one grid: on the left the
greeting and two cards side by side — the rank, and what is still worth filling
in — and on the right the arena's journey, read as a column.

- **The rank card** is a ring rather than a bar. Inside it: the medal, how far
  the client is towards the next level, and under it the exact experience left
  and the name of the rank they are climbing to.
- **Earn experience** lists what is still unfilled and what each field is worth,
  ending with the reward waiting at the next level.
- **Latest material** below is the six newest articles and nothing else. There
  are no filters and no search on it on purpose: the knowledge base is one tap
  away and does both properly, and a second set of the same controls only asked
  the reader which of the two to use.

The header is one row: the wordmark and the sections on the left, then the
client's own pill — a laurel emblem carrying their level, their name and venue,
and their experience — and **Sign out**. The pill leads to the profile.

Every screen is laid out to the header's own width, so the page has one left
edge and one right edge from the top down. The classes that carry a screen's
vertical rhythm (`.bsh-kb`, `.bsh-profile`, `.bsh-adm`) sit on `.bsh-wrap`
itself, so they set `padding-top` and `padding-bottom` only — a shorthand there
drops the wrapper's side padding and the content runs wider than the header.

The manager's name and WhatsApp button are on the profile screen and on any
article held back by a subscription, rather than on the home screen.

---

## The arena's journey

Down the right of the home screen runs a second, quieter track: the venue's real
history, from signing the agreement to a year in the network. It reads top to
bottom — a passed milestone is a green tick with the date it happened, the one
in progress is picked out in crimson, and the ones still ahead say what they
will mean.

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
reorder or add stops for the whole network. It ships with eight: agreement,
venue, installation, handover, opening, **first birthday party**, first 1,000
guests, and one year in the network. A client's own history is in
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
| WhatsApp | 10 | | Logo | 15 |

A fully described arena is worth **145 EXP**.

The client's own contact field is **WhatsApp**, not Telegram. On a database that
predates the change `schema.sql` renames the column rather than adding a new one,
so every number already on file survives and PostgreSQL carries the generated
`exp` expression across with it. If the rename ever refuses, drop the generated
column first and let the script rebuild it:

```sql
alter table public.profiles drop column if exists exp;
```

The separate **Telegram channel** field in the arena section is untouched: that
one is where the venue posts news for guests, not how a manager reaches the
owner.

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

That is the experience lock. There is a second, independent one — the paywall on
a whole category, set by `kb_categories.requires_subscription` — described under
[Categories](#categories). An article can be behind both; the reader is told
about the subscription first, since experience they have already earned is not
the thing standing in their way.

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

## Step 5 — Running the knowledge base

Everything below is edited in the Supabase dashboard, under **Table Editor**.
Nothing here needs a redeploy and nothing needs Tilda: the block reads the
database on every load, so a saved row is live for clients on their next
refresh.

Three tables hold the library:

| Table | What it is |
|---|---|
| `kb_categories` | the row of tabs across the top of the Knowledge base |
| `kb_articles` | the articles themselves, body included |
| `kb_files` | attachments, each one belonging to an article |

### Writing a new article

**Table Editor → `kb_articles` → Insert → Insert row.** Fill in:

| Column | What to put in it |
|---|---|
| `category_id` | pick the category — the editor offers a row picker, so you never type a UUID |
| `slug` | the address of the article: `opening-checklist` |
| `title` | the headline, as the reader sees it |
| `summary` | one or two sentences; this is the grey line on the card and in search |
| `content_md` | the body, in Markdown (see below) |
| `reading_time` | minutes, a whole number — shown on the card; leave empty to hide it |
| `cover_url` | optional image, see *Attaching files* |
| `min_level` | `1` is open to everyone signed in; higher locks it behind experience |
| `sort_order` | smaller comes first; `10, 20, 30…` leaves room to insert later |
| `is_published` | `false` while you are still writing — drafts are invisible to clients |

Leave `id`, `created_at` and `updated_at` alone: the database fills them, and
`updated_at` maintains itself on every save.

**About the slug.** It is what stands in the address bar — `#/kb/a/opening-checklist`
— so once you have sent that link to anyone, changing it breaks their link.
Lowercase Latin letters, digits and hyphens; no spaces, no punctuation, no
Cyrillic. Keep it short and descriptive: `arena-insurance`, not
`article-17-final-v2`.

### Editing an existing article

Click the row, edit the cell, save. Long bodies are easier to handle by clicking
the cell and using **Expand** — the editor opens a full-height text area.

Two habits worth keeping:

- **Do not change the slug** of anything already published.
- **Take a draft down rather than deleting it.** `is_published = false` hides an
  article from clients instantly and keeps the text, the attachments and the
  history. Deleting a row also deletes its `kb_files` rows, and that cannot be
  undone.

### Removing an article

Set `is_published` to `false`. Genuinely delete a row only when it was created
by mistake.

### Categories

`kb_categories` is the tab row. `title` is what a client reads, `slug` is what
the address uses, `icon` takes a single emoji, `description` becomes the line
under the "Knowledge base" heading when that tab is open, and `sort_order` sets
the order of the tabs. `is_published = false` removes a tab and everything in it
from view.

`requires_subscription` is the paywall. With it set to `true` — as it is on
**Marketing** — the tab shows a padlock and a hover note reading *"Opens once
you buy a subscription"*, the article cards say *"Opens with a subscription"*,
and the article itself opens a screen that names the material, explains what
opens it and hands over the client's manager with a WhatsApp button. The bodies
of those articles are never sent to the browser at all — a client without a
subscription can see that the material exists, and nothing more. Administrators
see the section as normal.

A client counts as subscribed when `profiles.status` is `active` **and**
`subscription_until` is today or later. Both are set by an administrator on the
**Clients** screen in the hub.

### Markdown the renderer understands

```
## Heading            (start at ##; the article's own title is the `title` column)
**bold**  *italic*  `inline code`
- bullet
1. numbered
> a quotation
[link text](https://example.com)
![image caption](https://cdn.jsdelivr.net/gh/pirgooo/pirgooo@main/hub/assets/covers/x.jpg)
| Column | Column |    a table needs the |---|---| line under the header
|---|---|
| cell | cell |
---                   (a horizontal rule)
```

Quotation marks and angle brackets are safe to type anywhere, the blockquote
marker included — the escaping runs before the parser, so `> like this` still
becomes a quotation.

There is no fenced code block and no nesting of lists inside lists. Raw HTML is
escaped rather than rendered, on purpose: an article cannot inject markup into
the page, so nothing typed into `content_md` can break the hub for everyone
else. Wide tables scroll inside their own frame instead of stretching the page.

---

## Step 6 — Attaching files

Every downloadable thing — a contract template, an artwork pack, a manual —
lives as a file in this repository and as a row in `kb_files` pointing at it.
The repository stores the bytes; the database stores what the client sees.

### Where the files go

```
hub/assets/
├── covers/     article cover images   → kb_articles.cover_url
└── files/      PDFs, ZIPs, documents  → kb_files.url
```

Put nothing else in `assets/`. If a category grows large, give it a subfolder —
`assets/files/legal/`, `assets/files/marketing/` — rather than letting a hundred
files sit flat.

### Naming

Lowercase Latin letters, digits and hyphens. No spaces, no Cyrillic, no
brackets — a space becomes `%20` in a URL and Cyrillic breaks on some clients
outright.

```
✓  franchise-agreement-2026.pdf
✓  opening-checklist.pdf
✓  brand-pack-summer-2026.zip
✓  covers/opening-checklist.jpg
✗  Договор франшизы (финал).pdf
✗  doc1.pdf
✗  Final FINAL v3.pdf
```

Two rules that save trouble later:

- **Name it after the content, not the version.** `franchise-agreement-2026.pdf`
  survives a revision; `agreement-v3-final.pdf` does not.
- **Put the year in the name of anything dated** — contracts, price lists,
  brand packs — so an old link stays honestly old instead of quietly changing
  meaning.

### Getting the link

Files are served from GitHub through the jsDelivr CDN. The address is the
repository path with a fixed prefix:

```
https://cdn.jsdelivr.net/gh/pirgooo/pirgooo@main/hub/assets/files/<file name>
```

So `hub/assets/files/franchise-agreement-2026.pdf` becomes

```
https://cdn.jsdelivr.net/gh/pirgooo/pirgooo@main/hub/assets/files/franchise-agreement-2026.pdf
```

**jsDelivr caches hard — for up to a week.** Uploading a new file under an old
name will not reach clients who have already loaded it. To publish a changed
file, either give it a new name (`...-2026-09.pdf`), or replace `@main` in the
link with the commit hash of the upload:

```
https://cdn.jsdelivr.net/gh/pirgooo/pirgooo@a1b2c3d/hub/assets/files/...
```

A new name is simpler and leaves the old version reachable for anyone who still
needs it.

### Registering the attachment

**Table Editor → `kb_files` → Insert row:**

| Column | What to put in it |
|---|---|
| `article_id` | the article this file belongs to — use the row picker |
| `title` | what the client reads on the button: *"Franchise agreement (2026)"* |
| `url` | the jsDelivr link |
| `kind` | `pdf`, `zip`, `image`, `video`, `link` or `file` — it only picks the icon |
| `size_label` | display only: `"2.4 MB"`. Type it by hand or leave it empty |
| `sort_order` | order within the article; `10, 20, 30…` |

The database refuses to attach the same URL to the same article twice, so a
duplicated insert fails loudly instead of showing the client two identical
buttons.

Deleting an article deletes its attachment rows with it — the file itself stays
in the repository, so nothing is lost, but no article points at it any more.

### Cover images

`kb_articles.cover_url` takes the same kind of jsDelivr link, pointing into
`assets/covers/`. Landscape, roughly 1200×630, JPEG or PNG, and keep it under a
few hundred kilobytes: it loads on the card, not on click.

### What must never go in this repository

**The repository is public. Anything in `assets/` can be downloaded by anyone
with the link, signed in or not.** The knowledge base's own locks — `min_level`
and `requires_subscription` — protect the *article*, never the file behind a
public link.

Signed contracts, personal data, price lists you would not publish, anything a
competitor should not read: put those in a **private Supabase Storage bucket**
and hand out signed URLs, or send them to the client directly. Use `assets/` for
material you would be comfortable seeing on the open web — templates, manuals,
brand packs, covers.

---

## Finding your way around a page

A long, stacked screen carries a column of dots at the left edge of the window
naming its sections. Hovering opens the labels, clicking scrolls, and the
current section stays highlighted as the reader moves — so what is further down
the page is visible without scrolling to find out. It hides below 1180px, where
it would sit on top of the content.

It appears once a screen has **three** sections worth pointing at. The home
screen, since it became a dashboard, has two — the grid at the top and the feed
below — so it does not show one. Lower the threshold in `screenHome` if you want
it back:

```js
paint((rail.length > 2 ? railMarkup(rail) : '') + …
```

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
└── assets/
    ├── covers/                 article cover images
    └── files/                  downloadable attachments (public!)
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

### The wordmark

The supplied SVG is white, which would disappear against the white header. It is
therefore used as a **CSS mask** rather than an image: the shape comes from the
file, the colour from `currentColor`. Both places that draw it — the header and
the sign-in screen — set that colour to `--bsh-navy`, the body text colour, so
recolouring the logo anywhere is a one-line change.

The file is embedded as a data URI in the `--bsh-logo` variable, so the block
stays self-contained and the logo cannot break from a dead link.

---

## Room to grow

- `profiles.role` already accepts `client | staff | admin`, so per-role access is
  a policy change rather than a migration.
- A client cannot change their own `role`, `status`, `email` or manager fields —
  the `protect_profile_fields` trigger reverts those on write.
- Announcements or support tickets would be a new table plus one more screen in
  the router, following the same pattern as the knowledge base.
