/* =====================================================================
   SUPABASE STUB FOR THE LOCAL PREVIEW
   Replaces window.supabase.createClient so the blocks in ../tilda/
   run without a real project and without internet access.
   Never ships to production — it exists only for hub/preview/.
   ===================================================================== */
(function () {
  'use strict';

  var DEMO_EMAIL  = 'demo@battlestart.com';
  var DEMO_PASS   = 'demo1234';
  var ADMIN_EMAIL = 'admin@battlestart.com';
  var ADMIN_PASS  = 'admin1234';
  var KEY         = 'bsh-preview-session';

  /* Accounts the stub will let in. The Edge Function stub adds to this. */
  var ACCOUNTS = {};
  ACCOUNTS[DEMO_EMAIL]  = { password: DEMO_PASS,  id: 'demo-user-0001' };
  ACCOUNTS[ADMIN_EMAIL] = { password: ADMIN_PASS, id: 'demo-admin-0001' };

  /* ------------------------- data ------------------------- */
  var db = {
    profiles: [{
      id: 'demo-user-0001',
      email: DEMO_EMAIL,
      full_name: 'Dmitrii Pirogovskii',
      company: 'Battle Start Camden',
      city: 'London',
      phone: '+44 20 7946 0210',
      telegram: '@Pirgooo',
      avatar_url: null,

      /* Left empty on purpose: the demo starts at 50 EXP, ten short of
         level 2, so filling one field flips the level and unlocks the
         case study. */
      address: null,
      website: null,
      social_facebook: null,
      social_instagram: null,
      social_telegram: null,
      about: null,
      logo_url: null,

      manager_name: 'Anna Kovaleva',
      manager_contact: '@bs_anna · +44 20 7946 0000',
      manager_whatsapp: '447700900123',
      plan: 'Standard 300',
      subscription_from: '2026-03-01',
      subscription_until: '2026-09-30',
      role: 'client',
      status: 'active',
      created_at: '2026-03-14T09:00:00Z',
      updated_at: '2026-09-01T12:00:00Z'
    }, {
      id: 'demo-admin-0001',
      email: ADMIN_EMAIL,
      full_name: 'Anna Kovaleva',
      company: 'Battle Start HQ',
      city: 'London',
      phone: '+44 20 7946 0000',
      telegram: '@bs_anna',
      avatar_url: null,
      address: null, website: null, social_facebook: null,
      social_instagram: null, social_telegram: null, about: null, logo_url: null,
      manager_name: null, manager_contact: null, manager_whatsapp: null,
      plan: null, subscription_from: null, subscription_until: null,
      role: 'admin',
      status: 'active',
      created_at: '2026-01-10T09:00:00Z',
      updated_at: '2026-01-10T09:00:00Z'
    }],

    kb_categories: [
      { id: 'c1', slug: 'launch',     title: 'Launching a venue', description: 'Everything to do before opening: the space, hardware, installation, handover.', icon: '🚀', accent: 'pink', sort_order: 10, is_published: true },
      { id: 'c2', slug: 'operations', title: 'Operations',        description: 'Running the arena day to day: shifts, tills, procedures, guest service.',      icon: '⚙️', accent: 'blue', sort_order: 20, is_published: true },
      { id: 'c3', slug: 'marketing',  title: 'Marketing',         description: 'Artwork, social media, promotions and ready-made campaign assets.',            icon: '📣', accent: 'pink', sort_order: 30, is_published: true },
      { id: 'c4', slug: 'software',   title: 'Software & kit',    description: 'Updates, headset setup and troubleshooting.',                                  icon: '🖥', accent: 'navy', sort_order: 40, is_published: true },
      { id: 'c5', slug: 'documents',  title: 'Documents',         description: 'Contracts, templates, policies and legal paperwork.',                          icon: '📄', accent: 'blue', sort_order: 50, is_published: true }
    ],

    kb_articles: [
      {
        id: 'a1', category_id: 'c1', slug: 'opening-checklist',
        title: 'Arena opening checklist',
        summary: 'A step-by-step plan from signing the agreement to your first guest — 42 items across six areas.',
        reading_time: 7, sort_order: 10, is_published: true, cover_url: null,
        created_at: '2026-08-28T10:00:00Z', updated_at: '2026-09-02T10:00:00Z',
        content_md: [
          '## Before signing',
          '',
          '- Approve the space: floor area, ceilings from **3 metres**, its own entrance.',
          '- Check the electrics: a dedicated circuit and sockets around the play area.',
          '- Send a scaled floor plan to your Battle Start manager.',
          '',
          '## Preparing the space',
          '',
          '1. Level and cover the floor — the surface is agreed separately.',
          '2. Install lighting to the diagram in the "Software & kit" section.',
          '3. Set up a waiting area and storage for guests’ belongings.',
          '',
          '## Installation and handover',
          '',
          'Installation takes **3-5 working days**. At handover we check:',
          '',
          '- tracking calibration across the whole area;',
          '- that there are no blind spots;',
          '- every hardware set running under load.',
          '',
          '> Do not announce an opening date less than a week after handover — that buffer almost always goes on small fixes.',
          '',
          '## Before your first guest',
          '',
          '- Train and sign off at least two operators.',
          '- Run a full shift end to end: booking, welcome, safety briefing, game, handback.',
          '- Open ticket sales 10-14 days before opening.'
        ].join('\n')
      },
      {
        id: 'a2', category_id: 'c2', slug: 'operator-shift-procedure',
        title: 'Operator shift procedure',
        summary: 'What an operator does from open to close: preparing the room, handling guests, cashing up.',
        reading_time: 5, sort_order: 10, is_published: true, cover_url: null,
        created_at: '2026-08-20T10:00:00Z', updated_at: '2026-08-20T10:00:00Z',
        content_md: [
          '## Opening the shift',
          '',
          '- Arrive **40 minutes** before the first booking.',
          '- Power up the hardware and wait for the server side to finish loading.',
          '- Check every set is charged and put the spares on to charge.',
          '',
          '## Handling guests',
          '',
          '1. Welcome the group and confirm the booking.',
          '2. Deliver the safety briefing — always, no exceptions.',
          '3. Help everyone into their kit and check the fit.',
          '4. Stay in the room for the whole session.',
          '',
          '## Closing the shift',
          '',
          '- Sanitise the hardware.',
          '- Cash up and post the shift report in the team chat.',
          '- Shut the hardware down properly — never by cutting the power.'
        ].join('\n')
      },
      {
        id: 'a3', category_id: 'c3', slug: 'brand-assets',
        title: 'Artwork and campaign assets',
        summary: 'Where the source files live, what you may change and what you must not touch.',
        reading_time: 3, sort_order: 10, is_published: true, cover_url: null,
        created_at: '2026-08-12T10:00:00Z', updated_at: '2026-08-12T10:00:00Z',
        content_md: [
          '## What you get',
          '',
          '- Battle Start logos in every format.',
          '- Birthday and corporate poster templates.',
          '- Social media templates for posts and stories.',
          '',
          '## Rules of use',
          '',
          'You may change: city, address, phone number, price, date.',
          '',
          'You may **not** change: the logo, brand colours, typefaces, or the wording of any legal small print.'
        ].join('\n')
      },
      {
        id: 'a4', category_id: 'c4', slug: 'updating-arena-software',
        title: 'Updating the arena software',
        summary: 'How to install updates, what to do if one has to be rolled back, and where to look when a launch fails.',
        reading_time: 4, sort_order: 10, is_published: true, cover_url: null,
        created_at: '2026-09-01T10:00:00Z', updated_at: '2026-09-05T10:00:00Z',
        content_md: [
          '## When to update',
          '',
          'Updates ship **once a month**. Install on release day, before the shift opens — never between bookings.',
          '',
          '## Steps',
          '',
          '1. Close every game session.',
          '2. Open the launcher and let it finish the version check.',
          '3. Press "Update" and leave the hardware on until installation completes.',
          '4. Run a test session on a single set.',
          '',
          '## If something goes wrong',
          '',
          '| Symptom | What to do |',
          '| --- | --- |',
          '| Game will not start | Restart the launcher, then the server |',
          '| Tracking drifts | Recalibrate the play area |',
          '| Headset will not connect | Swap the set and log the faulty one |',
          '',
          'If it is not fixed within 15 minutes, stop and contact support with your venue number and software version.'
        ].join('\n')
      },
      {
        id: 'a5', category_id: 'c5', slug: 'contracts-and-templates',
        title: 'Contracts and templates',
        summary: 'Current editions of the paperwork you need for guests and staff.',
        reading_time: 2, sort_order: 10, is_published: true, cover_url: null,
        created_at: '2026-07-30T10:00:00Z', updated_at: '2026-07-30T10:00:00Z',
        content_md: [
          '## For guests',
          '',
          '- Participation waiver and house rules.',
          '- Guardian consent for guests under 14.',
          '',
          '## For staff',
          '',
          '- Operator employment contract template.',
          '- Operator job description.',
          '',
          '> These documents are revised periodically. Check the date in the file header before printing a batch.'
        ].join('\n')
      },
      {
        id: 'a6', category_id: 'c2', slug: 'break-even-in-four-months',
        title: 'Case study: break-even in four months',
        summary: 'The real numbers from one arena — traffic, average cheque, ad spend and the three decisions that moved them.',
        reading_time: 9, sort_order: 5, is_published: true, cover_url: null, min_level: 2,
        created_at: '2026-09-03T10:00:00Z', updated_at: '2026-09-03T10:00:00Z',
        content_md: [
          '## The starting position',
          '',
          'A 300 m² arena in a city of 600,000. Opened in March with no prior traffic and no local brand recognition.',
          '',
          '| Month | Guests | Average cheque | Revenue |',
          '| --- | --- | --- | --- |',
          '| 1 | 410 | 1,150 | 471,500 |',
          '| 2 | 690 | 1,240 | 855,600 |',
          '| 3 | 980 | 1,310 | 1,283,800 |',
          '| 4 | 1,140 | 1,380 | 1,573,200 |',
          '',
          '## Decision one: birthdays before walk-ins',
          '',
          'Birthday bookings were **2.6 times** the average cheque and brought their own audience.',
          '',
          '> Repeat visits went from 8% to 31% between month one and month four. Nothing else moved the number that far.'
        ].join('\n')
      },
      {
        id: 'a7', category_id: 'c3', slug: 'ads-that-worked',
        title: 'The ad creatives that actually worked',
        summary: 'Six campaigns, what each one cost per booking, and why the two obvious ones failed.',
        reading_time: 6, sort_order: 5, is_published: true, cover_url: null, min_level: 3,
        created_at: '2026-09-04T10:00:00Z', updated_at: '2026-09-04T10:00:00Z',
        content_md: [
          '## What we measured',
          '',
          'Cost per completed booking, not per click.',
          '',
          '| Creative | Cost per booking | Verdict |',
          '| --- | --- | --- |',
          '| Kids mid-game, filmed from behind | 340 | Best performer |',
          '| Gameplay capture from inside the headset | 1,120 | Failed |',
          '',
          'The winners all show **a real person having a good time in a real room**.'
        ].join('\n')
      }
    ],

    levels: [
      { level: 1, min_exp:   0, title: 'Newcomer', perk: null },
      { level: 2, min_exp:  60, title: 'Operator', perk: 'Case study: how an arena reached break-even in four months' },
      { level: 3, min_exp: 110, title: 'Veteran',  perk: 'Marketing playbooks and the ad creatives that worked' },
      { level: 4, min_exp: 145, title: 'Legend',   perk: 'A direct line to the Battle Start operations team' }
    ],

    exp_rules: [
      { field: 'full_name',        points: 10, label: 'Your name',        hint: 'How the Battle Start team should address you', min_length: 1,  sort_order: 10 },
      { field: 'company',          points: 10, label: 'Venue name',       hint: 'The name guests see',                          min_length: 1,  sort_order: 20 },
      { field: 'city',             points: 10, label: 'City',             hint: 'Where the arena operates',                     min_length: 1,  sort_order: 30 },
      { field: 'address',          points: 15, label: 'Full address',     hint: 'Street and building, as in the maps listing',  min_length: 1,  sort_order: 40 },
      { field: 'phone',            points: 10, label: 'Phone',            hint: 'The number guests call',                       min_length: 1,  sort_order: 50 },
      { field: 'telegram',         points: 10, label: 'Telegram',         hint: 'For your manager to reach you quickly',        min_length: 1,  sort_order: 60 },
      { field: 'website',          points: 15, label: 'Website',          hint: 'Your arena page or booking site',              min_length: 1,  sort_order: 70 },
      { field: 'social_facebook',  points: 10, label: 'Facebook page',    hint: 'The public page for your arena',               min_length: 1,  sort_order: 80 },
      { field: 'social_instagram', points: 10, label: 'Instagram',        hint: 'The arena account',                            min_length: 1,  sort_order: 90 },
      { field: 'social_telegram',  points: 10, label: 'Telegram channel', hint: 'Where you post news for guests',               min_length: 1,  sort_order: 100 },
      { field: 'about',            points: 20, label: 'About the arena',  hint: 'A short description, 80 characters or more',   min_length: 80, sort_order: 110 },
      { field: 'logo_url',         points: 15, label: 'Logo',             hint: 'A link to your logo file',                     min_length: 1,  sort_order: 120 }
    ],

    milestone_types: [
      { slug: 'agreement',    title: 'Agreement signed',        description: 'You joined the network',                    icon: '🤝', sort_order: 10 },
      { slug: 'venue',        title: 'Venue approved',          description: 'The space passed our requirements',         icon: '📍', sort_order: 20 },
      { slug: 'installation', title: 'Hardware installed',      description: 'The arena was built and wired',             icon: '🔧', sort_order: 30 },
      { slug: 'handover',     title: 'Handover passed',         description: 'Tracking calibrated, every set under load', icon: '✅', sort_order: 40 },
      { slug: 'opening',      title: 'Opened to guests',        description: 'The first session ran',                     icon: '🎉', sort_order: 50 },
      { slug: 'first_party',  title: 'First birthday party',    description: 'A birthday group celebrated at your arena', icon: '🎂', sort_order: 55 },
      { slug: 'guests_1000',  title: 'First 1,000 guests',      description: 'A thousand people played at your arena',    icon: '👥', sort_order: 60 },
      { slug: 'year_one',     title: 'One year in the network', description: 'Twelve months of operation',                icon: '🏆', sort_order: 70 }
    ],

    /* The demo arena is built and handed over but not open yet, so the
       next stop on the path is the opening. */
    client_milestones: [
      { profile_id: 'demo-user-0001', milestone_slug: 'agreement',    reached_on: '2026-03-14', note: null },
      { profile_id: 'demo-user-0001', milestone_slug: 'venue',        reached_on: '2026-04-02', note: null },
      { profile_id: 'demo-user-0001', milestone_slug: 'installation', reached_on: '2026-05-20', note: null },
      { profile_id: 'demo-user-0001', milestone_slug: 'handover',     reached_on: '2026-06-01', note: null }
    ],

    kb_files: [
      { id: 'f1', article_id: 'a1', title: 'Opening checklist (PDF)', url: '#', kind: 'pdf', size_label: '480 KB', sort_order: 10 },
      { id: 'f2', article_id: 'a3', title: 'Logo pack (ZIP)',         url: '#', kind: 'zip', size_label: '12 MB',  sort_order: 10 },
      { id: 'f3', article_id: 'a3', title: 'Social templates (ZIP)',  url: '#', kind: 'zip', size_label: '34 MB',  sort_order: 20 },
      { id: 'f4', article_id: 'a5', title: 'House rules (PDF)',       url: '#', kind: 'pdf', size_label: '210 KB', sort_order: 10 }
    ]
  };

  /* ------------------------- session ------------------------- */
  function readSession() {
    try { return JSON.parse(sessionStorage.getItem(KEY)); } catch (e) { return null; }
  }
  function writeSession(s) {
    if (s) sessionStorage.setItem(KEY, JSON.stringify(s));
    else   sessionStorage.removeItem(KEY);
  }
  function makeSession(email) {
    var acc = ACCOUNTS[email];
    var row = db.profiles.filter(function (p) { return p.id === acc.id; })[0];
    return {
      access_token: 'preview-token',
      user: {
        id: acc.id,
        email: email,
        created_at: (row && row.created_at) || new Date().toISOString()
      }
    };
  }

  function me() {
    var s = readSession();
    if (!s) return null;
    return db.profiles.filter(function (p) { return p.id === s.user.id; })[0] || null;
  }
  function callerIsAdmin() { var m = me(); return !!(m && m.role === 'admin'); }

  function delay(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }

  /* Mirrors the generated exp column: points for every filled field.
     Computed on read, never stored — same as in PostgreSQL. */
  function computeExp(profile) {
    return db.exp_rules.reduce(function (sum, r) {
      var v = (profile[r.field] == null ? '' : String(profile[r.field])).trim();
      return sum + (v.length >= (r.min_length || 1) ? r.points : 0);
    }, 0);
  }

  /* Mirrors public.current_level() */
  function currentLevel() {
    var s = readSession();
    if (!s) return 1;
    var me = db.profiles.filter(function (r) { return r.id === s.user.id; })[0];
    if (!me) return 1;
    var exp = computeExp(me), lvl = 1;
    db.levels.forEach(function (l) { if (exp >= l.min_exp && l.level > lvl) lvl = l.level; });
    return lvl;
  }

  /* --------------------- query builder --------------------- */
  function Query(table) {
    this.table = table;
    this.filters = [];
    this.sel = '*';
    this.mode = 'many';
    this.headOnly = false;
    this.wantCount = false;
    this.orderCol = null;
    this.orderAsc = true;
    this.limitN = null;
    this.writeRow = null;
  }

  Query.prototype.select = function (sel, opts) {
    this.sel = sel || '*';
    if (opts && opts.count) this.wantCount = true;
    if (opts && opts.head)  this.headOnly = true;
    return this;
  };
  Query.prototype.eq = function (col, val) { this.filters.push([col, val]); return this; };
  Query.prototype.order = function (col, opts) {
    this.orderCol = col;
    this.orderAsc = !opts || opts.ascending !== false;
    return this;
  };
  Query.prototype.limit = function (n) { this.limitN = n; return this; };
  Query.prototype.single = function () { this.mode = 'single'; return this; };
  Query.prototype.maybeSingle = function () { this.mode = 'maybe'; return this; };
  Query.prototype.upsert = function (row) { this.writeRow = row; return this; };
  Query.prototype.update = function (row) { this.patchRow = row; return this; };
  Query.prototype.delete = function () { this.isDelete = true; return this; };
  Query.prototype.in = function (col, list) { this.inFilter = [col, list || []]; return this; };

  /* Which columns identify a row, so upsert knows what to replace. */
  var PRIMARY_KEY = {
    profiles: ['id'],
    client_milestones: ['profile_id', 'milestone_slug']
  };

  Query.prototype._matches = function (row) {
    var ok = this.filters.every(function (f) { return row[f[0]] === f[1]; });
    if (ok && this.inFilter) ok = this.inFilter[1].indexOf(row[this.inFilter[0]]) !== -1;
    return ok;
  };

  Query.prototype._exec = function () {
    var self = this;

    /* --- delete matching rows --- */
    if (this.isDelete) {
      var table = db[this.table] || [];
      for (var d = table.length - 1; d >= 0; d--) {
        if (self._matches(table[d])) table.splice(d, 1);
      }
      return { data: null, error: null };
    }

    /* --- update matching rows --- */
    if (this.patchRow) {
      var store = db[this.table] || [];
      var hit = store.filter(function (r) {
        return self.filters.every(function (f) { return r[f[0]] === f[1]; });
      });
      if (!hit.length) return { data: null, error: null };
      hit.forEach(function (r) {
        for (var k in self.patchRow) { r[k] = self.patchRow[k]; }
        r.updated_at = new Date().toISOString();
      });
      var one = JSON.parse(JSON.stringify(hit[0]));
      if (this.table === 'profiles') one.exp = computeExp(hit[0]);
      return { data: one, error: null };
    }

    /* --- write --- */
    if (this.writeRow) {
      var store = db[this.table] || [];
      var keys  = PRIMARY_KEY[this.table] || ['id'];
      var rows  = [].concat(this.writeRow);
      var last  = null;

      rows.forEach(function (row) {
        var found = null;
        for (var i = 0; i < store.length; i++) {
          if (keys.every(function (k) { return store[i][k] === row[k]; })) { found = store[i]; break; }
        }
        if (found) {
          for (var k in row) { found[k] = row[k]; }
          found.updated_at = new Date().toISOString();
        } else {
          found = JSON.parse(JSON.stringify(row));
          found.created_at = found.updated_at = new Date().toISOString();
          store.push(found);
        }
        last = found;
      });

      if (!last) return { data: null, error: null };
      var out = JSON.parse(JSON.stringify(last));
      if (this.table === 'profiles') out.exp = computeExp(last);
      return { data: out, error: null };
    }

    /* --- read --- */
    var rows;

    if (this.table === 'kb_catalog') {
      /* The view: every published article, no body, with the flag saying
         whether this client may open it. */
      rows = db.kb_articles.filter(function (a) { return a.is_published; }).map(function (a) {
        return {
          id: a.id, slug: a.slug, title: a.title, summary: a.summary,
          category_id: a.category_id, reading_time: a.reading_time,
          min_level: a.min_level || 1, sort_order: a.sort_order,
          created_at: a.created_at,
          unlocked: (a.min_level || 1) <= currentLevel()
        };
      });
    } else {
      rows = (db[this.table] || []).slice();
    }

    /* a client sees only their own profile — emulating RLS */
    if (this.table === 'profiles') {
      var s = readSession();
      var admin = callerIsAdmin();
      rows = rows.filter(function (r) { return s && (admin || r.id === s.user.id); })
                 .map(function (r) {
                   var copy = JSON.parse(JSON.stringify(r));
                   copy.exp = computeExp(r);      /* generated, never stored */
                   return copy;
                 });
    }

    /* the level gate on article bodies, as the RLS policy does it */
    if (this.table === 'kb_articles') {
      var lvl = currentLevel();
      rows = rows.filter(function (a) { return (a.min_level || 1) <= lvl; });
    }

    /* a client sees only their own milestones */
    if (this.table === 'client_milestones' && !callerIsAdmin()) {
      var sess = readSession();
      rows = rows.filter(function (r) { return sess && r.profile_id === sess.user.id; });
    }

    this.filters.forEach(function (f) {
      rows = rows.filter(function (r) { return r[f[0]] === f[1]; });
    });
    if (this.inFilter) {
      rows = rows.filter(function (r) { return self.inFilter[1].indexOf(r[self.inFilter[0]]) !== -1; });
    }

    if (this.orderCol) {
      rows.sort(function (a, b) {
        var x = a[self.orderCol], y = b[self.orderCol];
        if (x === y) return 0;
        return (x > y ? 1 : -1) * (self.orderAsc ? 1 : -1);
      });
    }

    var count = rows.length;
    if (this.limitN != null) rows = rows.slice(0, this.limitN);

    /* emulate the embedded select: kb_categories(title) */
    if (this.sel.indexOf('kb_categories(') !== -1) {
      rows = rows.map(function (r) {
        var copy = JSON.parse(JSON.stringify(r));
        var cat = db.kb_categories.filter(function (c) { return c.id === r.category_id; })[0];
        copy.kb_categories = cat ? { title: cat.title } : null;
        return copy;
      });
    } else {
      rows = JSON.parse(JSON.stringify(rows));
    }

    if (this.headOnly) return { data: null, error: null, count: count };

    if (this.mode === 'single') {
      if (rows.length !== 1) {
        return { data: null, error: { code: 'PGRST116', message: 'Row not found' }, count: count };
      }
      return { data: rows[0], error: null, count: count };
    }
    if (this.mode === 'maybe') {
      return { data: rows[0] || null, error: null, count: count };
    }
    return { data: rows, error: null, count: count };
  };

  Query.prototype.then = function (onOk, onErr) {
    var self = this;
    return delay(160).then(function () { return self._exec(); }).then(onOk, onErr);
  };
  Query.prototype.catch = function (onErr) { return this.then(null, onErr); };

  /* ------------------------- client ------------------------- */
  function createClient() {
    return {
      from: function (table) { return new Query(table); },

      /* Stands in for the admin-create-client Edge Function, including
         its authorisation check — an ordinary client gets refused here
         exactly as it would on the server. */
      functions: {
        invoke: function (name, opts) {
          return delay(700).then(function () {
            if (name !== 'admin-create-client') {
              return { data: null, error: { message: 'No such function: ' + name } };
            }
            if (!callerIsAdmin()) {
              return { data: { error: 'Administrators only' },
                       error: { message: 'Administrators only', context: { status: 403 } } };
            }

            var b = (opts && opts.body) || {};
            var mail = String(b.email || '').trim().toLowerCase();
            if (ACCOUNTS[mail]) {
              return { data: { error: 'That email already has an account' },
                       error: { message: 'conflict', context: { status: 409 } } };
            }

            var id = 'demo-user-' + Math.random().toString(36).slice(2, 8);
            ACCOUNTS[mail] = { password: b.password, id: id };
            db.profiles.push({
              id: id, email: mail,
              full_name: b.full_name || null,
              company: b.company || null,
              city: b.city || null,
              phone: null, telegram: null, avatar_url: null,
              address: null, website: null, social_facebook: null,
              social_instagram: null, social_telegram: null, about: null, logo_url: null,
              manager_name: b.manager_name || null,
              manager_contact: b.manager_contact || null,
              manager_whatsapp: b.manager_whatsapp || null,
              plan: b.plan || null,
              subscription_from: null,
              subscription_until: b.subscription_until || null,
              role: 'client', status: 'active',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });
            return { data: { user_id: id, email: mail }, error: null };
          });
        }
      },

      auth: {
        getSession: function () {
          return delay(120).then(function () {
            return { data: { session: readSession() }, error: null };
          });
        },
        signInWithPassword: function (creds) {
          return delay(500).then(function () {
            var mail = String(creds.email || '').trim().toLowerCase();
            var acc  = ACCOUNTS[mail];
            if (!acc || acc.password !== creds.password) {
              return { data: null, error: { message: 'Invalid login credentials' } };
            }
            var s = makeSession(mail);
            writeSession(s);
            return { data: { session: s, user: s.user }, error: null };
          });
        },
        signOut: function () {
          return delay(200).then(function () { writeSession(null); return { error: null }; });
        },
        updateUser: function () {
          return delay(400).then(function () { return { data: {}, error: null }; });
        },
        resetPasswordForEmail: function () {
          return delay(500).then(function () { return { data: {}, error: null }; });
        }
      }
    };
  }

  window.supabase = { createClient: createClient };
  window.BSH_PREVIEW = {
    email: DEMO_EMAIL, password: DEMO_PASS,
    adminEmail: ADMIN_EMAIL, adminPassword: ADMIN_PASS,
    db: db,
    reset: function () { writeSession(null); }
  };
})();
