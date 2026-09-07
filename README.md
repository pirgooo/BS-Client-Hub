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

## Local preview

You can click through every screen without Tilda and without a Supabase project —
the preview loads the real block file and swaps in a stubbed Supabase client:

```bash
cd hub
python3 -m http.server 8000
# open http://localhost:8000/preview/
```

Demo credentials: `demo@battlestart.com` / `demo1234`.

The bar along the bottom switches screens and clears the session; it exists only
in the preview. `preview/mock-supabase.js` never ships to production.

---

## File map

```
hub/
├── supabase/
│   ├── schema.sql              tables, triggers, RLS policies
│   └── seed.sql                demo content (optional)
├── tilda/
│   └── battle-start-hub.html   THE HUB — paste this one file into Tilda
├── preview/
│   ├── index.html              local stand
│   └── mock-supabase.js        Supabase stub, preview only
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
