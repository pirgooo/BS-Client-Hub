/* =====================================================================
   SUPABASE STUB FOR THE LOCAL PREVIEW
   Replaces window.supabase.createClient so the blocks in ../tilda/
   run without a real project and without internet access.
   Never ships to production — it exists only for hub/preview/.
   ===================================================================== */
(function () {
  'use strict';

  var DEMO_EMAIL = 'demo@battlestart.com';
  var DEMO_PASS  = 'demo1234';
  var KEY        = 'bsh-preview-session';

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
      manager_name: 'Anna Kovaleva',
      manager_contact: '@bs_anna · +44 20 7946 0000',
      role: 'client',
      status: 'active',
      created_at: '2026-03-14T09:00:00Z',
      updated_at: '2026-09-01T12:00:00Z'
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
      }
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
  function makeSession() {
    return {
      access_token: 'preview-token',
      user: { id: 'demo-user-0001', email: DEMO_EMAIL, created_at: '2026-03-14T09:00:00Z' }
    };
  }

  function delay(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }

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

  Query.prototype._exec = function () {
    var self = this;

    /* --- write --- */
    if (this.writeRow) {
      var store = db[this.table] || [];
      var found = null;
      for (var i = 0; i < store.length; i++) {
        if (store[i].id === this.writeRow.id) { found = store[i]; break; }
      }
      if (found) {
        for (var k in this.writeRow) { found[k] = this.writeRow[k]; }
        found.updated_at = new Date().toISOString();
      } else {
        found = JSON.parse(JSON.stringify(this.writeRow));
        found.created_at = found.updated_at = new Date().toISOString();
        store.push(found);
      }
      return { data: JSON.parse(JSON.stringify(found)), error: null };
    }

    /* --- read --- */
    var rows = (db[this.table] || []).slice();

    /* a client sees only their own profile — emulating RLS */
    if (this.table === 'profiles') {
      var s = readSession();
      rows = rows.filter(function (r) { return s && r.id === s.user.id; });
    }

    this.filters.forEach(function (f) {
      rows = rows.filter(function (r) { return r[f[0]] === f[1]; });
    });

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

      auth: {
        getSession: function () {
          return delay(120).then(function () {
            return { data: { session: readSession() }, error: null };
          });
        },
        signInWithPassword: function (creds) {
          return delay(500).then(function () {
            var ok = creds.email.trim().toLowerCase() === DEMO_EMAIL && creds.password === DEMO_PASS;
            if (!ok) return { data: null, error: { message: 'Invalid login credentials' } };
            var s = makeSession();
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
  window.BSH_PREVIEW = { email: DEMO_EMAIL, password: DEMO_PASS, db: db, reset: function () { writeSession(null); } };
})();
