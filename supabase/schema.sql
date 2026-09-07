-- =====================================================================
--  BATTLE START — client information hub
--  Supabase (PostgreSQL) database schema
--
--  How to apply:
--    Supabase Dashboard -> SQL Editor -> New query -> paste -> Run
--  The script is idempotent: running it again breaks nothing.
-- =====================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------
-- 1. CLIENT PROFILES
--    A row is created automatically when you add a user in
--    Authentication -> Users -> Add user.
-- ---------------------------------------------------------------------
create table if not exists public.profiles (
  id              uuid primary key references auth.users (id) on delete cascade,
  email           text,
  full_name       text,
  company         text,                       -- venue / location name
  city            text,
  phone           text,
  telegram        text,
  avatar_url      text,
  manager_name     text,                      -- dedicated Battle Start manager
  manager_contact  text,
  manager_whatsapp text,                      -- digits only, e.g. 447700900123

  -- Subscription, filled in by an administrator. Free text on purpose:
  -- the plan is whatever was actually agreed, not an item from a list.
  plan               text,
  subscription_from  date,
  subscription_until date,

  -- The arena's public face. Filling these is what earns experience;
  -- see the exp column below.
  address          text,
  website          text,
  social_facebook  text,
  social_instagram text,
  social_telegram  text,
  about            text,
  logo_url         text,
  role            text not null default 'client',   -- room to grow: client | staff | admin
  status          text not null default 'active',   -- active | suspended
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  constraint profiles_role_check   check (role   in ('client', 'staff', 'admin')),
  constraint profiles_status_check check (status in ('active', 'suspended'))
);

comment on table public.profiles is 'Battle Start client profile, 1:1 with auth.users';

-- Re-running on a database created before these columns existed.
alter table public.profiles add column if not exists address          text;
alter table public.profiles add column if not exists website          text;
-- Renaming rather than adding: a database created before the company
-- went international still holds social_vk, and the exp expression
-- references it. PostgreSQL carries a rename through into that
-- expression, so the order below is safe either way.
do $$
begin
  if exists (select 1 from information_schema.columns
              where table_schema = 'public' and table_name = 'profiles'
                and column_name = 'social_vk')
     and not exists (select 1 from information_schema.columns
              where table_schema = 'public' and table_name = 'profiles'
                and column_name = 'social_facebook')
  then
    execute 'alter table public.profiles rename column social_vk to social_facebook';
  end if;
end $$;

alter table public.profiles add column if not exists social_facebook  text;
alter table public.profiles add column if not exists social_instagram text;
alter table public.profiles add column if not exists social_telegram  text;
alter table public.profiles add column if not exists about            text;
alter table public.profiles add column if not exists logo_url         text;
alter table public.profiles add column if not exists manager_whatsapp   text;
alter table public.profiles add column if not exists plan               text;
alter table public.profiles add column if not exists subscription_from  date;
alter table public.profiles add column if not exists subscription_until date;

-- ---------------------------------------------------------------------
-- 2. KNOWLEDGE BASE: CATEGORIES
-- ---------------------------------------------------------------------
create table if not exists public.kb_categories (
  id           uuid primary key default gen_random_uuid(),
  slug         text unique not null,
  title        text not null,
  description  text,
  icon         text,                            -- emoji or icon name
  accent       text default 'pink',             -- pink | blue | navy — tile colour
  sort_order   integer not null default 100,
  is_published boolean not null default true,
  created_at   timestamptz not null default now()
);

comment on table public.kb_categories is 'Knowledge base categories';

-- ---------------------------------------------------------------------
-- 3. KNOWLEDGE BASE: ARTICLES
--    content_md holds Markdown, editable straight from the Table Editor.
-- ---------------------------------------------------------------------
create table if not exists public.kb_articles (
  id           uuid primary key default gen_random_uuid(),
  category_id  uuid references public.kb_categories (id) on delete set null,
  slug         text unique not null,
  title        text not null,
  summary      text,
  content_md   text,
  cover_url    text,                            -- image hosted on GitHub (jsDelivr)
  reading_time integer,                         -- minutes, optional
  min_level    integer not null default 1,      -- experience level required to read it
  sort_order   integer not null default 100,
  is_published boolean not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists kb_articles_category_idx  on public.kb_articles (category_id);
create index if not exists kb_articles_published_idx on public.kb_articles (is_published);

comment on table public.kb_articles is 'Knowledge base articles, body stored as Markdown';

alter table public.kb_articles add column if not exists min_level integer not null default 1;

-- ---------------------------------------------------------------------
-- 4. ATTACHMENTS
--    The files themselves live in the GitHub repository — only links here.
-- ---------------------------------------------------------------------
create table if not exists public.kb_files (
  id          uuid primary key default gen_random_uuid(),
  article_id  uuid references public.kb_articles (id) on delete cascade,
  title       text not null,
  url         text not null,
  kind        text default 'file',              -- pdf | zip | image | video | link | file
  size_label  text,                             -- "2.4 MB" — display only
  sort_order  integer not null default 100,
  created_at  timestamptz not null default now()
);

create index if not exists kb_files_article_idx on public.kb_files (article_id);

-- The same file attached twice to the same article is always a mistake,
-- so the database refuses it rather than relying on the seed script.
create unique index if not exists kb_files_article_url_idx
  on public.kb_files (article_id, url);

comment on table public.kb_files is 'Links to files (GitHub/CDN) attached to articles';

-- ---------------------------------------------------------------------
-- 5. CREATE A PROFILE WHENEVER A USER IS ADDED
-- ---------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, company, city, phone)
  values (
    new.id,
    new.email,
    nullif(new.raw_user_meta_data ->> 'full_name', ''),
    nullif(new.raw_user_meta_data ->> 'company',   ''),
    nullif(new.raw_user_meta_data ->> 'city',      ''),
    nullif(new.raw_user_meta_data ->> 'phone',     '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------
-- 6. KEEP updated_at CURRENT
-- ---------------------------------------------------------------------
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_touch on public.profiles;
create trigger profiles_touch before update on public.profiles
  for each row execute function public.touch_updated_at();

drop trigger if exists kb_articles_touch on public.kb_articles;
create trigger kb_articles_touch before update on public.kb_articles
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------
-- 7. PROTECT ADMINISTRATIVE PROFILE FIELDS
--    A client may edit their own card, but cannot grant themselves the
--    admin role or lift their own suspension. Those fields change only
--    from the Dashboard (service_role skips this trigger).
-- ---------------------------------------------------------------------
create or replace function public.protect_profile_fields()
returns trigger
language plpgsql
as $$
begin
  -- Who is allowed to set these fields:
  --   * anything without a signed-in user — the Dashboard's table editor
  --     and SQL editor connect directly, the service role carries no
  --     subject, and both must keep working. Without this the very first
  --     administrator could never be appointed: promoting someone would
  --     require already being one.
  --   * administrators.
  -- Everyone else gets the old values put back.
  if auth.uid() is null or public.is_admin() then
    return new;
  end if;
  new.id                 := old.id;
  new.email              := old.email;
  new.role               := old.role;
  new.status             := old.status;
  new.manager_name       := old.manager_name;
  new.manager_contact    := old.manager_contact;
  new.manager_whatsapp   := old.manager_whatsapp;
  new.plan               := old.plan;
  new.subscription_from  := old.subscription_from;
  new.subscription_until := old.subscription_until;
  new.created_at         := old.created_at;
  return new;
end;
$$;

drop trigger if exists profiles_protect on public.profiles;
create trigger profiles_protect before update on public.profiles
  for each row execute function public.protect_profile_fields();

-- =====================================================================
-- 7b. EXPERIENCE AND LEVELS
--     The hub rewards a client for describing their arena properly.
--
--     exp is a GENERATED column: PostgreSQL computes it from the profile
--     itself and rejects any attempt to write it. That matters — a client
--     can edit their own profile through the API, so a plain integer
--     column would just be set to 9999. Here the only way to gain
--     experience is to actually fill a field in.
-- =====================================================================

-- Points per field. Kept in a table so the interface can render the
-- "what to fill in next" list from the same numbers.
-- KEEP IN SYNC with the exp expression below — a generated column cannot
-- read from a table, so the weights necessarily appear twice.
create table if not exists public.exp_rules (
  field       text primary key,
  points      integer not null,
  label       text not null,
  hint        text,
  min_length  integer not null default 1,   -- what counts as filled in
  sort_order  integer not null default 100
);

alter table public.exp_rules add column if not exists min_length integer not null default 1;

insert into public.exp_rules (field, points, label, hint, min_length, sort_order) values
  ('full_name',        10, 'Your name',        'How the Battle Start team should address you',  1,  10),
  ('company',          10, 'Venue name',       'The name guests see',                           1,  20),
  ('city',             10, 'City',             'Where the arena operates',                      1,  30),
  ('address',          15, 'Full address',     'Street and building, as in the maps listing',   1,  40),
  ('phone',            10, 'Phone',            'The number guests call',                        1,  50),
  ('telegram',         10, 'Telegram',         'For your manager to reach you quickly',         1,  60),
  ('website',          15, 'Website',          'Your arena page or booking site',               1,  70),
  ('social_facebook',  10, 'Facebook page',    'The public page for your arena',                1,  80),
  ('social_instagram', 10, 'Instagram',        'The arena account',                             1,  90),
  ('social_telegram',  10, 'Telegram channel', 'Where you post news for guests',                1, 100),
  ('about',            20, 'About the arena',  'A short description, 80 characters or more',   80, 110),
  ('logo_url',         15, 'Logo',             'A link to your logo file',                      1, 120)
on conflict (field) do update
  set points     = excluded.points,
      label      = excluded.label,
      hint       = excluded.hint,
      min_length = excluded.min_length,
      sort_order = excluded.sort_order;

-- Retired: replaced by social_facebook when the network went international.
delete from public.exp_rules where field = 'social_vk';

-- Levels. min_exp is the threshold; perk is the teaser shown to a client
-- who has not reached it yet — it is meant to be worth the effort.
create table if not exists public.levels (
  level   integer primary key,
  min_exp integer not null,
  title   text not null,
  perk    text
);

insert into public.levels (level, min_exp, title, perk) values
  (1,   0, 'Newcomer', null),
  (2,  60, 'Operator', 'Case study: how an arena reached break-even in four months'),
  (3, 110, 'Veteran',  'Marketing playbooks and the ad creatives that worked'),
  (4, 145, 'Legend',   'A direct line to the Battle Start operations team')
on conflict (level) do update
  set min_exp = excluded.min_exp,
      title   = excluded.title,
      perk    = excluded.perk;

-- The experience itself. A filled field counts; whitespace does not.
-- To change the weights, drop the column first — ADD COLUMN IF NOT EXISTS
-- will not rewrite an expression that already exists:
--   alter table public.profiles drop column if exists exp;
alter table public.profiles add column if not exists exp integer
  generated always as (
    (case when length(btrim(coalesce(full_name,        ''))) > 0  then 10 else 0 end) +
    (case when length(btrim(coalesce(company,          ''))) > 0  then 10 else 0 end) +
    (case when length(btrim(coalesce(city,             ''))) > 0  then 10 else 0 end) +
    (case when length(btrim(coalesce(address,          ''))) > 0  then 15 else 0 end) +
    (case when length(btrim(coalesce(phone,            ''))) > 0  then 10 else 0 end) +
    (case when length(btrim(coalesce(telegram,         ''))) > 0  then 10 else 0 end) +
    (case when length(btrim(coalesce(website,          ''))) > 0  then 15 else 0 end) +
    (case when length(btrim(coalesce(social_facebook,  ''))) > 0  then 10 else 0 end) +
    (case when length(btrim(coalesce(social_instagram, ''))) > 0  then 10 else 0 end) +
    (case when length(btrim(coalesce(social_telegram,  ''))) > 0  then 10 else 0 end) +
    (case when length(btrim(coalesce(about,            ''))) >= 80 then 20 else 0 end) +
    (case when length(btrim(coalesce(logo_url,         ''))) > 0  then 15 else 0 end)
  ) stored;

comment on column public.profiles.exp is
  'Computed by PostgreSQL from the filled-in fields. Cannot be written to.';

-- The caller's level. SECURITY DEFINER so it can read the profile from
-- inside a policy on another table without tripping over RLS.
-- Is the caller an administrator? SECURITY DEFINER so it can read the
-- role from inside a policy on profiles without recursing into that same
-- policy.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

create or replace function public.current_level()
returns integer
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select max(l.level)
       from public.levels l
      where l.min_exp <= coalesce(
              (select p.exp from public.profiles p where p.id = auth.uid()), 0)),
    1);
$$;

-- =====================================================================
-- 7c. THE ARENA'S JOURNEY
--     Not a score — the venue's real history, from signing to a year in
--     the network. An administrator records each milestone by hand, the
--     client sees the road behind them and the next stop ahead.
--
--     It holds its meaning in a way points cannot: these are facts about
--     their own business, so there is nothing to inflate or devalue.
-- =====================================================================

-- The path every arena walks. Same for the whole network.
create table if not exists public.milestone_types (
  slug        text primary key,
  title       text not null,
  description text,
  icon        text,
  sort_order  integer not null default 100
);

insert into public.milestone_types (slug, title, description, icon, sort_order) values
  ('agreement',    'Agreement signed',    'You joined the network',                        '🤝', 10),
  ('venue',        'Venue approved',      'The space passed our requirements',             '📍', 20),
  ('installation', 'Hardware installed',  'The arena was built and wired',                 '🔧', 30),
  ('handover',     'Handover passed',     'Tracking calibrated, every set under load',     '✅', 40),
  ('opening',      'Opened to guests',    'The first session ran',                         '🎉', 50),
  ('guests_1000',  'First 1,000 guests',  'A thousand people played at your arena',        '👥', 60),
  ('year_one',     'One year in the network', 'Twelve months of operation',                '🏆', 70)
on conflict (slug) do update
  set title       = excluded.title,
      description = excluded.description,
      icon        = excluded.icon,
      sort_order  = excluded.sort_order;

-- Which milestones a given arena has reached, and when.
-- A row exists only once the milestone is behind them.
create table if not exists public.client_milestones (
  profile_id     uuid not null references public.profiles (id) on delete cascade,
  milestone_slug text not null references public.milestone_types (slug) on delete cascade,
  reached_on     date not null,
  note           text,
  created_at     timestamptz not null default now(),
  primary key (profile_id, milestone_slug)
);

create index if not exists client_milestones_profile_idx
  on public.client_milestones (profile_id);

comment on table public.client_milestones is
  'Milestones an arena has reached. Written by administrators only.';

-- =====================================================================
-- 8. ROW LEVEL SECURITY
--    Everything is closed by default. An anonymous visitor sees nothing —
--    that is what protects the content, not the redirect on the Tilda page.
-- =====================================================================
alter table public.profiles      enable row level security;
alter table public.kb_categories enable row level security;
alter table public.kb_articles   enable row level security;
alter table public.kb_files      enable row level security;
alter table public.levels        enable row level security;
alter table public.exp_rules     enable row level security;
alter table public.milestone_types   enable row level security;
alter table public.client_milestones enable row level security;

-- --- profiles: own row only ---
drop policy if exists "profiles: read own"   on public.profiles;
create policy "profiles: read own" on public.profiles
  for select to authenticated
  using (auth.uid() = id or public.is_admin());

drop policy if exists "profiles: update own" on public.profiles;
create policy "profiles: update own" on public.profiles
  for update to authenticated
  using (auth.uid() = id or public.is_admin())
  with check (auth.uid() = id or public.is_admin());

drop policy if exists "profiles: insert own" on public.profiles;
create policy "profiles: insert own" on public.profiles
  for insert to authenticated
  with check (
    auth.uid() = id
    and role   = 'client'      -- no self-promotion to admin
    and status = 'active'
  );

-- --- knowledge base: any signed-in client reads published rows ---
drop policy if exists "kb_categories: read published" on public.kb_categories;
create policy "kb_categories: read published" on public.kb_categories
  for select to authenticated
  using (is_published);

drop policy if exists "kb_articles: read published" on public.kb_articles;
create policy "kb_articles: read published" on public.kb_articles
  for select to authenticated
  using (
    is_published
    and (min_level <= public.current_level() or public.is_admin())
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.status = 'active'
    )
  );

drop policy if exists "kb_files: read published" on public.kb_files;
create policy "kb_files: read published" on public.kb_files
  for select to authenticated
  using (
    exists (
      select 1 from public.kb_articles a
      where a.id = kb_files.article_id and a.is_published
    )
  );

-- --- levels and scoring rules: readable by any signed-in client ---
drop policy if exists "levels: read" on public.levels;
create policy "levels: read" on public.levels
  for select to authenticated using (true);

drop policy if exists "exp_rules: read" on public.exp_rules;
create policy "exp_rules: read" on public.exp_rules
  for select to authenticated using (true);

-- --- the journey ---
drop policy if exists "milestone_types: read" on public.milestone_types;
create policy "milestone_types: read" on public.milestone_types
  for select to authenticated using (true);

-- A client sees their own history; an administrator sees and writes all.
-- A client cannot mark their own milestones: the point of the path is
-- that Battle Start confirms each step.
drop policy if exists "client_milestones: read" on public.client_milestones;
create policy "client_milestones: read" on public.client_milestones
  for select to authenticated
  using (profile_id = auth.uid() or public.is_admin());

drop policy if exists "client_milestones: admin writes" on public.client_milestones;
create policy "client_milestones: admin writes" on public.client_milestones
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- There are deliberately no INSERT/UPDATE/DELETE policies for the
-- knowledge base, levels or scoring rules: they are edited from the
-- Dashboard only (service_role bypasses RLS).


-- =====================================================================
-- 9. THE CATALOGUE
--     A locked article has to be visible as a promise — title, summary,
--     the level it needs — while its body stays out of reach. RLS works
--     per row, not per column, so it cannot do that on its own.
--
--     This view is the answer: it runs with its owner's rights (the
--     default for a view), so it sees past the kb_articles policy, and it
--     simply never selects content_md. Locked rows can be advertised;
--     their contents cannot leak.
-- =====================================================================
create or replace view public.kb_catalog as
  select
    a.id,
    a.slug,
    a.title,
    a.summary,
    a.category_id,
    a.reading_time,
    a.min_level,
    a.sort_order,
    a.created_at,
    (a.min_level <= public.current_level()) as unlocked
  from public.kb_articles a
  where a.is_published;

-- The view bypasses RLS, so access is granted explicitly instead.
-- Anonymous visitors must not see even the titles.
revoke all on public.kb_catalog from anon;
grant select on public.kb_catalog to authenticated;
