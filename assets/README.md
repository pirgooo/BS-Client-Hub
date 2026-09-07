# Assets

Images and downloadable files for the hub. Anything here is served over jsDelivr:

```
https://cdn.jsdelivr.net/gh/pirgooo/pirgooo@main/hub/assets/<path>
```

Suggested layout:

```
assets/
├── files/      PDFs, ZIPs — link from kb_files.url
└── covers/     article covers — link from kb_articles.cover_url
```

Two things to keep in mind:

- **jsDelivr caches hard.** To publish a changed file, rename it or pin a commit
  hash in place of `@main`.
- **A public repository is public.** Anyone with the link can download these
  files. Confidential documents belong in a private Supabase Storage bucket with
  signed URLs, not here.
