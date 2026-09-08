# Assets

Images and downloadable files for the hub. Full instructions — naming, linking,
registering an attachment in the database — are in
[`../README.md`, "Step 6 — Attaching files"](../README.md#step-6--attaching-files).
The short version:

```
assets/
├── covers/     article cover images   → kb_articles.cover_url
└── files/      PDFs, ZIPs, documents  → kb_files.url
```

Link to anything here through jsDelivr:

```
https://cdn.jsdelivr.net/gh/pirgooo/pirgooo@main/hub/assets/<path>
```

Name files in lowercase Latin letters, digits and hyphens — no spaces, no
Cyrillic, no brackets — and name them after their content rather than their
version: `franchise-agreement-2026.pdf`, not `agreement-v3-final.pdf`.

Two things to keep in mind:

- **jsDelivr caches hard**, for up to a week. To publish a changed file, give it
  a new name or pin a commit hash in place of `@main`.
- **A public repository is public.** Anyone with the link can download these
  files, signed in or not — the knowledge base's locks protect the article, not
  the file behind it. Confidential documents belong in a private Supabase
  Storage bucket with signed URLs.
