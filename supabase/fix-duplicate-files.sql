-- =====================================================================
--  ONE-OFF REPAIR — remove duplicate attachments
--
--  Needed only if seed.sql was run more than once before the uniqueness
--  rule existed: the article inserts were guarded against re-runs, the
--  attachment insert was not, so kb_files gained a second copy of every
--  row. Symptom: each file listed twice under an article.
--
--  Safe to run even if there is nothing to clean up.
--  Run the whole thing at once — the last statement reports the result.
-- =====================================================================

-- Keep the oldest copy of each (article, url) pair, drop the rest.
delete from public.kb_files a
using public.kb_files b
where a.article_id = b.article_id
  and a.url        = b.url
  and a.id         > b.id;

-- Stop it recurring. Already present if you applied the current
-- schema.sql; this makes the repair self-contained either way.
create unique index if not exists kb_files_article_url_idx
  on public.kb_files (article_id, url);

-- Expected after seed.sql: 4 files, 0 duplicated pairs.
select
  (select count(*) from public.kb_files) as files_now,
  (select count(*) from (
      select article_id, url from public.kb_files
      group by article_id, url having count(*) > 1
   ) d) as duplicated_pairs;
