-- =====================================================================
--  BATTLE START — demo content for the knowledge base
--  Run AFTER schema.sql. It exists only so the hub is not empty on day
--  one — edit or delete these rows from the Table Editor later.
-- =====================================================================

insert into public.kb_categories (slug, title, description, icon, accent, sort_order) values
  ('launch',     'Launching a venue', 'Everything to do before opening: the space, hardware, installation, handover.', '🚀', 'pink', 10),
  ('operations', 'Operations',        'Running the arena day to day: shifts, tills, procedures, guest service.',      '⚙️', 'blue', 20),
  ('marketing',  'Marketing',         'Artwork, social media, promotions and ready-made campaign assets.',            '📣', 'pink', 30),
  ('software',   'Software & kit',    'Updates, headset setup and troubleshooting.',                                  '🖥', 'navy', 40),
  ('documents',  'Documents',         'Contracts, templates, policies and legal paperwork.',                          '📄', 'blue', 50)
on conflict (slug) do nothing;

insert into public.kb_articles (category_id, slug, title, summary, reading_time, sort_order, content_md)
select c.id, v.slug, v.title, v.summary, v.reading_time, v.sort_order, v.content_md
from (values
  ('launch', 'opening-checklist', 'Arena opening checklist',
   'A step-by-step plan from signing the agreement to your first guest — 42 items across six areas.',
   7, 10,
$md$## Before signing

- Approve the space: floor area, ceilings from **3 metres**, its own entrance.
- Check the electrics: a dedicated circuit and sockets around the play area.
- Send a scaled floor plan to your Battle Start manager.

## Preparing the space

1. Level and cover the floor — the surface is agreed separately.
2. Install lighting to the diagram in the "Software & kit" section.
3. Set up a waiting area and storage for guests' belongings.

## Installation and handover

Installation takes **3-5 working days**. At handover we check:

- tracking calibration across the whole area;
- that there are no blind spots;
- every hardware set running under load.

> Do not announce an opening date less than a week after handover — that buffer almost always goes on small fixes.

## Before your first guest

- Train and sign off at least two operators.
- Run a full shift end to end: booking, welcome, safety briefing, game, handback.
- Open ticket sales 10-14 days before opening.
$md$),

  ('operations', 'operator-shift-procedure', 'Operator shift procedure',
   'What an operator does from open to close: preparing the room, handling guests, cashing up.',
   5, 10,
$md$## Opening the shift

- Arrive **40 minutes** before the first booking.
- Power up the hardware and wait for the server side to finish loading.
- Check every set is charged and put the spares on to charge.
- Wipe the lenses and face interfaces.

## Handling guests

1. Welcome the group and confirm the booking.
2. Deliver the safety briefing — always, no exceptions.
3. Help everyone into their kit and check the fit.
4. Stay in the room for the whole session.

## Closing the shift

- Sanitise the hardware.
- Cash up and post the shift report in the team chat.
- Shut the hardware down properly — never by cutting the power.
$md$),

  ('marketing', 'brand-assets', 'Artwork and campaign assets',
   'Where the source files live, what you may change and what you must not touch.',
   3, 10,
$md$## What you get

- Battle Start logos in every format.
- Birthday and corporate poster templates.
- Social media templates for posts and stories.
- Draft copy for listings and paid ads.

## Rules of use

You may change: city, address, phone number, price, date.

You may **not** change: the logo, brand colours, typefaces, or the wording of any legal small print.

## Downloading

The files are attached at the bottom of this article. If the layout you need is missing, message your manager and we will build it.
$md$),

  ('software', 'updating-arena-software', 'Updating the arena software',
   'How to install updates, what to do if one has to be rolled back, and where to look when a launch fails.',
   4, 10,
$md$## When to update

Updates ship **once a month**. Install on release day, before the shift opens — never between bookings.

## Steps

1. Close every game session.
2. Open the launcher and let it finish the version check.
3. Press "Update" and leave the hardware on until installation completes.
4. Run a test session on a single set.

## If something goes wrong

| Symptom | What to do |
| --- | --- |
| Game will not start | Restart the launcher, then the server |
| Tracking drifts | Recalibrate the play area |
| Headset will not connect | Swap the set and log the faulty one |

If it is not fixed within 15 minutes, stop and contact support with your venue number and software version.
$md$),

  ('documents', 'contracts-and-templates', 'Contracts and templates',
   'Current editions of the paperwork you need for guests and staff.',
   2, 10,
$md$## For guests

- Participation waiver and house rules.
- Guardian consent for guests under 14.
- Photo and video policy for the arena.

## For staff

- Operator employment contract template.
- Operator job description.
- Shift hardware handover form.

> These documents are revised periodically. Check the date in the file header before printing a batch.
$md$)
) as v(cat_slug, slug, title, summary, reading_time, sort_order, content_md)
join public.kb_categories c on c.slug = v.cat_slug
on conflict (slug) do nothing;

insert into public.kb_files (article_id, title, url, kind, size_label, sort_order)
select a.id, v.title, v.url, v.kind, v.size_label, v.sort_order
from (values
  ('opening-checklist',       'Opening checklist (PDF)',   'https://cdn.jsdelivr.net/gh/pirgooo/pirgooo@main/hub/assets/files/opening-checklist.pdf', 'pdf', '480 KB', 10),
  ('brand-assets',            'Logo pack (ZIP)',           'https://cdn.jsdelivr.net/gh/pirgooo/pirgooo@main/hub/assets/files/logo-pack.zip',         'zip', '12 MB',  10),
  ('brand-assets',            'Social templates (ZIP)',    'https://cdn.jsdelivr.net/gh/pirgooo/pirgooo@main/hub/assets/files/social-templates.zip',  'zip', '34 MB',  20),
  ('contracts-and-templates', 'House rules (PDF)',         'https://cdn.jsdelivr.net/gh/pirgooo/pirgooo@main/hub/assets/files/house-rules.pdf',       'pdf', '210 KB', 10)
) as v(article_slug, title, url, kind, size_label, sort_order)
join public.kb_articles a on a.slug = v.article_slug;
