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
  manager_name    text,                       -- dedicated Battle Start manager
  manager_contact text,
  role            text not null default 'client',   -- room to grow: client | staff | admin
  status          text not null default 'active',   -- active | suspended
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  constraint profiles_role_check   check (role   in ('client', 'staff', 'admin')),
  constraint profiles_status_check check (status in ('active', 'suspended'))
);

comment on table public.profiles is 'Battle Start client profile, 1:1 with auth.users';

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
  sort_order   integer not null default 100,
  is_published boolean not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists kb_articles_category_idx  on public.kb_articles (category_id);
create index if not exists kb_articles_published_idx on public.kb_articles (is_published);

comment on table public.kb_articles is 'Knowledge base articles, body stored as Markdown';

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
  if auth.role() = 'service_role' then
    return new;
  end if;
  new.id              := old.id;
  new.email           := old.email;
  new.role            := old.role;
  new.status          := old.status;
  new.manager_name    := old.manager_name;
  new.manager_contact := old.manager_contact;
  new.created_at      := old.created_at;
  return new;
end;
$$;

drop trigger if exists profiles_protect on public.profiles;
create trigger profiles_protect before update on public.profiles
  for each row execute function public.protect_profile_fields();

-- =====================================================================
-- 8. ROW LEVEL SECURITY
--    Everything is closed by default. An anonymous visitor sees nothing —
--    that is what protects the content, not the redirect on the Tilda page.
-- =====================================================================
alter table public.profiles      enable row level security;
alter table public.kb_categories enable row level security;
alter table public.kb_articles   enable row level security;
alter table public.kb_files      enable row level security;

-- --- profiles: own row only ---
drop policy if exists "profiles: read own"   on public.profiles;
create policy "profiles: read own" on public.profiles
  for select to authenticated
  using (auth.uid() = id);

drop policy if exists "profiles: update own" on public.profiles;
create policy "profiles: update own" on public.profiles
  for update to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

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

-- There are deliberately no INSERT/UPDATE/DELETE policies for the
-- knowledge base: content is edited from the Dashboard only
-- (service_role bypasses RLS).
