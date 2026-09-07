-- =====================================================================
--  BATTLE START — post-install check
--  Run in SQL Editor after schema.sql. Read-only: it changes nothing.
--
--  NOTE: the Supabase SQL Editor only shows the result of the LAST
--  statement in a script. PART 1 is therefore a single query. PART 2 has
--  to switch roles, so it cannot be merged — highlight those lines and
--  press Run on their own.
-- =====================================================================


-- =====================================================================
--  PART 1 — structure. Run as is; every row reports its own verdict.
-- =====================================================================
with c as (
  select 1 as ord, 'RLS enabled: profiles' as check_name,
         (select relrowsecurity::text from pg_class where oid = 'public.profiles'::regclass) as value,
         'true' as expected
  union all select 2, 'RLS enabled: kb_categories',
         (select relrowsecurity::text from pg_class where oid = 'public.kb_categories'::regclass), 'true'
  union all select 3, 'RLS enabled: kb_articles',
         (select relrowsecurity::text from pg_class where oid = 'public.kb_articles'::regclass), 'true'
  union all select 4, 'RLS enabled: kb_files',
         (select relrowsecurity::text from pg_class where oid = 'public.kb_files'::regclass), 'true'

  union all select 5, 'Policies: profiles (read/update/insert own)',
         (select count(*)::text from pg_policies where schemaname='public' and tablename='profiles'), '3'
  union all select 6, 'Policies: kb_categories',
         (select count(*)::text from pg_policies where schemaname='public' and tablename='kb_categories'), '1'
  union all select 7, 'Policies: kb_articles',
         (select count(*)::text from pg_policies where schemaname='public' and tablename='kb_articles'), '1'
  union all select 8, 'Policies: kb_files',
         (select count(*)::text from pg_policies where schemaname='public' and tablename='kb_files'), '1'

  union all select 9, 'Trigger: on_auth_user_created (makes a profile)',
         (select count(*)::text from pg_trigger where tgname='on_auth_user_created' and not tgisinternal), '1'
  union all select 10, 'Trigger: profiles_protect (guards admin fields)',
         (select count(*)::text from pg_trigger where tgname='profiles_protect' and not tgisinternal), '1'
  union all select 11, 'Trigger: profiles_touch',
         (select count(*)::text from pg_trigger where tgname='profiles_touch' and not tgisinternal), '1'
  union all select 12, 'Trigger: kb_articles_touch',
         (select count(*)::text from pg_trigger where tgname='kb_articles_touch' and not tgisinternal), '1'

  -- Every account must have a profile. A mismatch means the trigger did
  -- not fire — most often because the user predates schema.sql.
  union all select 13, 'Every auth user has a profile',
         (select count(*)::text from public.profiles),
         (select count(*)::text from auth.users)

  -- Experience: exp must be a generated column, or a client could simply
  -- write themselves to the top level through the API.
  union all select 14, 'profiles.exp is generated (cannot be written)',
         (select case when attgenerated = 's' then 'yes' else 'no' end
            from pg_attribute
           where attrelid = 'public.profiles'::regclass and attname = 'exp'), 'yes'
  union all select 15, 'Levels defined',
         (select count(*)::text from public.levels), '4'
  union all select 16, 'Scoring rules defined',
         (select count(*)::text from public.exp_rules), '12'
  union all select 17, 'Catalogue view exists',
         (select count(*)::text from pg_views where schemaname='public' and viewname='kb_catalog'), '1'

  -- Content counts: informational, they depend on whether you ran seed.sql
  union all select 18, 'Rows: kb_categories', (select count(*)::text from public.kb_categories), 'any'
  union all select 19, 'Rows: kb_articles',   (select count(*)::text from public.kb_articles),   'any'
  union all select 20, 'Rows: kb_files',      (select count(*)::text from public.kb_files),      'any'
  union all select 21, 'Rows: locked articles (min_level > 1)',
         (select count(*)::text from public.kb_articles where min_level > 1), 'any'
)
select
  check_name,
  value,
  expected,
  case when expected = 'any' then 'info'
       when value = expected then 'OK'
       else 'CHECK THIS' end as status
from c
order by ord;


-- =====================================================================
--  PART 2 — the check that matters: what an anonymous visitor can read.
--  Highlight the four lines below and press Run on their own.
--  Every count must be 0 while PART 1 shows rows actually exist.
-- =====================================================================
set role anon;
select (select count(*) from public.kb_articles)   as anon_sees_articles,
       (select count(*) from public.kb_categories) as anon_sees_categories,
       (select count(*) from public.profiles)      as anon_sees_profiles;
reset role;
