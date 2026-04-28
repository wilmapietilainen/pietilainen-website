// Kadotettujen ruuvien hautausmaa — app.js
// Loads data from site_data2.json, then initialises the SPA.

(async function () {
  'use strict';

  // ── Load data ──────────────────────────────────────────────────────────────
  let POEMS, SECTIONS, TAG_POEMS, TAGS, QUOTES;
  try {
    const res = await fetch('./site_data2.json');
    const d = await res.json();
    POEMS     = d.poems;
    SECTIONS  = d.sections;
    TAG_POEMS = d.tagPoems;
    TAGS      = d.tagData;
    QUOTES    = d.quotes;
  } catch (e) {
    console.error('Data load failed', e);
    document.body.innerHTML = '<p style="color:#e8e3d8;padding:4rem;font-family:Georgia,serif">Sivuston data ei latautunut.</p>';
    return;
  }

  // ── State ──────────────────────────────────────────────────────────────────
  let currentPage = null;
  let currentPoemId = 0;
  let menuOpen = false;
  let lineRevealTimers = [];
  let scrollListener = null;

  // Audio
  let audioCtx = null, audioPlaying = false;
  const audioNodes = {};

  // ── Navigation: showPage ───────────────────────────────────────────────────
  function showPage(name, params = {}) {
    // Tear down previous poem's scroll listener
    lineRevealTimers.forEach(t => clearTimeout(t));
    lineRevealTimers = [];
    if (scrollListener) { window.removeEventListener('scroll', scrollListener); scrollListener = null; }

    if (name === 'random') { name = 'poem'; params = { id: Math.floor(Math.random() * POEMS.length) }; }
    if (name === 'contents-start') { name = 'section-cover'; params = { sectionIdx: 0 }; }

    // Hide all pages
    document.querySelectorAll('.page').forEach(p => {
      p.classList.remove('active');
      p.style.display = 'none';
    });

    currentPage = name;
    const el = document.getElementById('page-' + name);
    if (!el) return;
    el.style.display = 'block';
    el.classList.add('active');
    window.scrollTo(0, 0);

    if (name === 'home')           initHome();
    else if (name === 'contents')  initContents();
    else if (name === 'section-cover') initSectionCover(params.sectionIdx || 0);
    else if (name === 'poem')      initPoem(params.id ?? 0);
    else if (name === 'tags')      initTags();
  }

  // ── HOME ───────────────────────────────────────────────────────────────────
  function initHome() {
    const el = document.getElementById('page-home');
    el.classList.remove('home-reveal');
    const q = QUOTES[Math.floor(Math.random() * QUOTES.length)];
    document.getElementById('home-quote').innerHTML = q.html;
    requestAnimationFrame(() => setTimeout(() => el.classList.add('home-reveal'), 80));
  }

  // ── CONTENTS ───────────────────────────────────────────────────────────────
  function initContents() {
    const container = document.getElementById('contents-list');
    if (container.children.length > 0) return;
    let html = '';
    for (const section of SECTIONS) {
      const idx = SECTIONS.indexOf(section);
      const cleanTitle = section.title.replace(/^[IVX]+\.\s*/, '');
      html += `<div class="section-entry">
        <p class="section-number">Osa ${section.number}</p>
        <a class="section-title-link" data-action="section-cover" data-idx="${idx}">${cleanTitle}</a>
        ${section.subtitle ? `<p class="section-subtitle">${section.subtitle}</p>` : ''}
        <ul class="poem-list">`;
      let lastSub = null;
      for (const pid of section.poemIds) {
        const poem = POEMS[pid];
        if (poem.subsection && poem.subsection !== lastSub) {
          html += `<li><span class="subsection-label">${poem.subsection}</span></li>`;
          lastSub = poem.subsection;
        }
        html += `<li class="poem-list-item"><a data-action="poem" data-id="${pid}">${poem.title}</a></li>`;
      }
      html += `</ul></div>`;
    }
    container.innerHTML = html;
    container.addEventListener('click', e => {
      e.preventDefault();
      const a = e.target.closest('[data-action]');
      if (!a) return;
      if (a.dataset.action === 'poem') showPage('poem', { id: parseInt(a.dataset.id) });
      if (a.dataset.action === 'section-cover') showPage('section-cover', { sectionIdx: parseInt(a.dataset.idx) });
    });
  }

  // ── SECTION COVER ──────────────────────────────────────────────────────────
  function initSectionCover(idx) {
    const section = SECTIONS[idx];
    const el = document.getElementById('page-section-cover');
    el.classList.remove('cover-reveal');
    document.getElementById('section-cover-number').textContent = 'Osa ' + section.number;
    document.getElementById('section-cover-title').textContent = section.title.replace(/^[IVX]+\.\s*/, '');
    document.getElementById('section-cover-subtitle').textContent = section.subtitle || '';
    document.getElementById('section-cover-enter').onclick = () => showPage('poem', { id: section.poemIds[0] });
    requestAnimationFrame(() => setTimeout(() => el.classList.add('cover-reveal'), 60));
  }

  // ── POEM ───────────────────────────────────────────────────────────────────
  function initPoem(id) {
    currentPoemId = id;
    const poem = POEMS[id];
    if (!poem) return;

    // Breadcrumb
    const sIdx = SECTIONS.findIndex(s => s.poemIds.includes(id));
    const section = SECTIONS[sIdx];
    const crumb = document.getElementById('poem-crumb');
    crumb.innerHTML = `<a data-sidx="${sIdx}" class="crumb-link">${section.title}</a>${poem.subsection ? ' · ' + poem.subsection : ''}`;
    crumb.querySelector('.crumb-link').onclick = () => showPage('section-cover', { sectionIdx: sIdx });

    // Title
    const titleEl = document.getElementById('poem-title');
    titleEl.textContent = poem.title;
    titleEl.classList.remove('vis');
    setTimeout(() => titleEl.classList.add('vis'), 60);

    // Tags
    const tagsEl = document.getElementById('poem-tags');
    tagsEl.innerHTML = poem.tags.map(t => `<button class="poem-tag" data-tag="${t}">${t}</button>`).join('');
    tagsEl.querySelectorAll('.poem-tag').forEach(btn => {
      btn.onclick = () => { showPage('tags'); setTimeout(() => openTagDetail(btn.dataset.tag), 300); };
    });

    // Poem lines
    const body = document.getElementById('poem-body');
    body.innerHTML = '';
    const lineEls = [];
    for (const rawLine of poem.lines) {
      const span = document.createElement('span');
      if (rawLine === '') {
        span.className = 'poem-line empty vis';
        span.innerHTML = '\u200B';
      } else {
        span.className = 'poem-line';
        span.innerHTML = rawLine;
        lineEls.push(span);
      }
      body.appendChild(span);
    }
    revealLinesProgressive(lineEls);

    // Progress bar
    updateProgressBar(id);

    // Related poems
    const related = document.getElementById('poem-related');
    const rel = getRelated(poem, 4);
    related.innerHTML = rel.length
      ? rel.map(r => `<li><a data-id="${r.id}" class="rel-link">${r.title}</a><span class="via">${r.via}</span></li>`).join('')
      : '<li style="color:var(--text-dimmer);font-family:var(--sans);font-size:0.75rem">—</li>';
    related.querySelectorAll('.rel-link').forEach(a => {
      a.onclick = () => showPage('poem', { id: parseInt(a.dataset.id) });
    });

    // Prev / Next navigation
    const prevBtn = document.getElementById('poem-prev');
    const nextBtn = document.getElementById('poem-next');
    document.getElementById('poem-prev-title').textContent = id > 0 ? POEMS[id - 1].title : '';
    document.getElementById('poem-next-title').textContent = id < POEMS.length - 1 ? POEMS[id + 1].title : '';
    prevBtn.disabled = id === 0;
    nextBtn.disabled = id === POEMS.length - 1;
    prevBtn.onclick = () => id > 0 && showPage('poem', { id: id - 1 });
    nextBtn.onclick = () => id < POEMS.length - 1 && showPage('poem', { id: id + 1 });
  }

  // ── Line-by-line reveal ────────────────────────────────────────────────────
  function revealLinesProgressive(lineEls) {
    const INITIAL = 4;
    const BASE_DELAY = 180;
    const INITIAL_DELAY = 120;

    for (let i = 0; i < Math.min(INITIAL, lineEls.length); i++) {
      const t = setTimeout(() => lineEls[i].classList.add('vis'), INITIAL_DELAY + i * BASE_DELAY);
      lineRevealTimers.push(t);
    }
    if (lineEls.length <= INITIAL) return;

    const REVEAL_AHEAD_PX = 120;

    function checkScroll() {
      const vBottom = window.scrollY + window.innerHeight + REVEAL_AHEAD_PX;
      for (let i = INITIAL; i < lineEls.length; i++) {
        const el = lineEls[i];
        if (el.classList.contains('vis')) continue;
        const top = el.getBoundingClientRect().top + window.scrollY;
        if (top < vBottom) {
          for (let j = i; j < Math.min(i + 3, lineEls.length); j++) {
            const delay = (j - i) * 60;
            const t = setTimeout(() => lineEls[j].classList.add('vis'), delay);
            lineRevealTimers.push(t);
          }
        }
      }
    }

    scrollListener = checkScroll;
    window.addEventListener('scroll', checkScroll, { passive: true });
    const t = setTimeout(checkScroll, INITIAL_DELAY + INITIAL * BASE_DELAY + 100);
    lineRevealTimers.push(t);
  }

  function updateProgressBar(id) {
    const pct = POEMS.length > 1 ? (id / (POEMS.length - 1)) * 100 : 0;
    document.getElementById('poem-progress-bar').style.height = pct + '%';
  }

  function getRelated(poem, max) {
    const scores = {};
    for (const tag of poem.tags) {
      for (const pid of (TAG_POEMS[tag] || [])) {
        if (pid === poem.id) continue;
        if (!scores[pid]) scores[pid] = { count: 0, via: tag };
        scores[pid].count++;
      }
    }
    return Object.entries(scores)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, max)
      .map(([pid, s]) => ({ id: parseInt(pid), title: POEMS[pid].title, via: s.via }));
  }

  // ── TAGS ───────────────────────────────────────────────────────────────────
  let tagsBuilt = false;

  function initTags() {
    const cloud = document.getElementById('tags-cloud');
    if (tagsBuilt) return;
    tagsBuilt = true;

    const W = Math.min(860, window.innerWidth - 40);
    const H = Math.max(520, Math.round(TAGS.length * 6.5));
    cloud.style.height = H + 'px';

    const sorted = [...TAGS].sort((a, b) => b.count - a.count);
    const maxCount = sorted[0].count;
    const placed = [];
    const pad = 14;
    const isMobile = window.innerWidth <= 600;

    function overlaps(nx, ny, nw, nh) {
      for (const p of placed) {
        if (nx < p.x + p.w + pad && nx + nw + pad > p.x && ny < p.y + p.h + pad && ny + nh + pad > p.y) return true;
      }
      return false;
    }

    const frag = document.createDocumentFragment();

    for (const tagData of sorted) {
      const el = document.createElement('div');
      el.className = 'tag-node';
      el.setAttribute('tabindex', '0');
      el.setAttribute('role', 'button');
      el.setAttribute('aria-label', `${tagData.tag} — ${tagData.count} runoa`);
      el.textContent = tagData.tag;

      const t = tagData.count / maxCount;
      const fs = 0.52 + t * 1.1;
      el.style.fontSize = fs + 'rem';
      if (t > 0.6) el.classList.add('cnt-high');
      else if (t > 0.25) el.classList.add('cnt-mid');
      else el.classList.add('cnt-low');

      if (!isMobile) {
        const estW = tagData.tag.length * fs * 8.5;
        const estH = fs * 18;
        let ok = false;
        for (let a = 0; a < 100; a++) {
          const x = 10 + Math.random() * (W - estW - 20);
          const y = 10 + Math.random() * (H - estH - 20);
          if (!overlaps(x, y, estW, estH)) {
            el.style.left = x + 'px';
            el.style.top = y + 'px';
            const dur = (4 + Math.random() * 5).toFixed(1);
            const del = (Math.random() * -7).toFixed(1);
            el.style.animation = `float-tag ${dur}s ${del}s ease-in-out infinite alternate`;
            placed.push({ x, y, w: estW, h: estH });
            ok = true;
            break;
          }
        }
        if (!ok) {
          el.style.left = (Math.random() * (W - 80)) + 'px';
          el.style.top = (Math.random() * H) + 'px';
        }
      }

      el.addEventListener('click', () => openTagDetail(tagData.tag, el));
      el.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') openTagDetail(tagData.tag, el); });
      frag.appendChild(el);
    }
    cloud.appendChild(frag);
  }

  function openTagDetail(tag, triggerEl) {
    document.querySelectorAll('.tag-node').forEach(n => n.classList.remove('active-tag'));
    if (triggerEl) triggerEl.classList.add('active-tag');

    const poemIds = TAG_POEMS[tag] || [];
    document.getElementById('tag-detail-name').textContent = tag;
    document.getElementById('tag-detail-count').textContent = poemIds.length === 1 ? '1 runo' : poemIds.length + ' runoa';
    const ul = document.getElementById('tag-detail-poems');
    ul.innerHTML = poemIds.map(id => `<li><a data-id="${id}" class="td-link">${POEMS[id].title}</a></li>`).join('');
    ul.querySelectorAll('.td-link').forEach(a => {
      a.onclick = () => showPage('poem', { id: parseInt(a.dataset.id) });
    });
    const detail = document.getElementById('tag-detail');
    detail.classList.add('open');
    const top = detail.getBoundingClientRect().top + window.scrollY - 80;
    window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
  }

  // ── Navigation wiring ──────────────────────────────────────────────────────
  document.getElementById('nav-home-btn').addEventListener('click', e => {
    e.preventDefault(); showPage('home'); closeMenu();
  });
  document.getElementById('nav-menu-btn').addEventListener('click', () => {
    menuOpen = !menuOpen;
    document.getElementById('nav-menu').classList.toggle('open', menuOpen);
    document.getElementById('nav-menu-btn').setAttribute('aria-expanded', menuOpen);
  });
  document.getElementById('nav-menu').addEventListener('click', e => {
    const a = e.target.closest('[data-page]');
    if (!a) return;
    e.preventDefault();
    showPage(a.dataset.page);
    closeMenu();
  });
  // Home page links
  document.getElementById('home-links').addEventListener('click', e => {
    const a = e.target.closest('[data-page]');
    if (!a) return;
    e.preventDefault();
    showPage(a.dataset.page);
  });
  // Back links in poem footer
  document.querySelectorAll('.back-links a[data-page]').forEach(a => {
    a.addEventListener('click', e => { e.preventDefault(); showPage(a.dataset.page); });
  });

  function closeMenu() {
    menuOpen = false;
    document.getElementById('nav-menu').classList.remove('open');
    document.getElementById('nav-menu-btn').setAttribute('aria-expanded', 'false');
  }
  document.addEventListener('click', e => {
    if (menuOpen && !e.target.closest('#nav-menu') && !e.target.closest('#nav-menu-btn')) closeMenu();
  });

  // Keyboard nav within poem
  document.addEventListener('keydown', e => {
    if (currentPage !== 'poem') return;
    if (e.key === 'ArrowRight' && currentPoemId < POEMS.length - 1) showPage('poem', { id: currentPoemId + 1 });
    else if (e.key === 'ArrowLeft' && currentPoemId > 0) showPage('poem', { id: currentPoemId - 1 });
  });

  // ── Audio ──────────────────────────────────────────────────────────────────
  function initAudio() {
    if (audioCtx) return;
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const master = audioCtx.createGain();
    master.gain.setValueAtTime(0, audioCtx.currentTime);
    master.connect(audioCtx.destination);
    audioNodes.master = master;

    const drone = audioCtx.createOscillator();
    drone.type = 'sine'; drone.frequency.value = 82.4;
    const dg = audioCtx.createGain(); dg.gain.value = 0.22;
    const lfo = audioCtx.createOscillator(); lfo.frequency.value = 0.06;
    const lg = audioCtx.createGain(); lg.gain.value = 0.07;
    lfo.connect(lg); lg.connect(dg.gain); lfo.start();

    const drone2 = audioCtx.createOscillator();
    drone2.type = 'sine'; drone2.frequency.value = 164.8;
    const dg2 = audioCtx.createGain(); dg2.gain.value = 0.05;

    const irBuf = audioCtx.createBuffer(2, audioCtx.sampleRate * 3, audioCtx.sampleRate);
    for (let c = 0; c < 2; c++) {
      const ch = irBuf.getChannelData(c);
      for (let i = 0; i < ch.length; i++) ch[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / ch.length, 3);
    }
    const conv = audioCtx.createConvolver(); conv.buffer = irBuf;
    const cg = audioCtx.createGain(); cg.gain.value = 0.25;

    drone.connect(dg); dg.connect(conv); dg.connect(master);
    drone2.connect(dg2); dg2.connect(master);
    conv.connect(cg); cg.connect(master);
    drone.start(); drone2.start();

    function drop() {
      if (!audioPlaying) return;
      const t = audioCtx.currentTime;
      const freqs = [261.6, 329.6, 392, 523.2, 659.2, 783.9];
      const freq = freqs[Math.floor(Math.random() * freqs.length)];
      const o = audioCtx.createOscillator();
      o.type = Math.random() > 0.7 ? 'triangle' : 'sine';
      o.frequency.setValueAtTime(freq, t);
      o.frequency.exponentialRampToValueAtTime(freq * 0.55, t + 1.5);
      const g = audioCtx.createGain();
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.055, t + 0.025);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 1.8);
      o.connect(g); g.connect(master);
      o.start(t); o.stop(t + 2);
      setTimeout(drop, 2500 + Math.random() * 8000);
    }
    audioNodes.drop = drop;
  }

  document.getElementById('audio-toggle').addEventListener('click', () => {
    if (!audioCtx) initAudio();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    audioPlaying = !audioPlaying;
    const btn = document.getElementById('audio-toggle');
    if (audioPlaying) {
      audioNodes.master.gain.setTargetAtTime(0.14, audioCtx.currentTime, 2);
      btn.classList.add('playing');
      audioNodes.drop();
    } else {
      audioNodes.master.gain.setTargetAtTime(0, audioCtx.currentTime, 2);
      btn.classList.remove('playing');
    }
  });

  setTimeout(() => document.getElementById('audio-toggle').classList.add('vis'), 3000);

  // ── Visual canvas layer ────────────────────────────────────────────────────
  (function () {
    const canvas = document.getElementById('visual-layer');
    const ctx = canvas.getContext('2d');
    let W, H, t = 0;

    function rng(seed) {
      let s = seed;
      return function () {
        s = (s * 1664525 + 1013904223) & 0xffffffff;
        return (s >>> 0) / 0xffffffff;
      };
    }

    const R = rng(42);
    const THREADS = [], FRACTURES = [], NODES = [];

    function buildElements() {
      THREADS.length = 0; FRACTURES.length = 0; NODES.length = 0;

      for (let i = 0; i < 18; i++) {
        THREADS.push({
          ax: R(), ay: R(), bx: R(), by: R(),
          cx: R(), cy: R(), dx: R(), dy: R(),
          speed: 0.00018 + R() * 0.00014,
          phase: R() * Math.PI * 2,
          amp: 0.06 + R() * 0.1,
          opacity: 0.055 + R() * 0.07,
          width: 0.4 + R() * 0.6,
          warm: R() > 0.5,
        });
      }

      for (let i = 0; i < 16; i++) {
        let ox, oy;
        const edge = R();
        if (edge < 0.25) { ox = R() * 0.22; oy = R(); }
        else if (edge < 0.5) { ox = 0.78 + R() * 0.22; oy = R(); }
        else if (edge < 0.75) { ox = R(); oy = R() * 0.2; }
        else { ox = R(); oy = 0.8 + R() * 0.2; }

        const angle = R() * Math.PI * 2;
        const len = 0.012 + R() * 0.035;
        const branches = R() > 0.6 ? 1 : 0;
        const branchData = [];
        for (let b = 0; b < branches; b++) {
          branchData.push({
            t: 0.35 + R() * 0.4,
            angle: angle + (R() - 0.5) * 1.2,
            len: len * (0.2 + R() * 0.35),
          });
        }
        FRACTURES.push({ ox, oy, angle, len, branches: branchData, opacity: 0.03 + R() * 0.04, width: 0.25 + R() * 0.35 });
      }

      for (let i = 0; i < 12; i++) {
        NODES.push({
          x: R(), y: R(),
          r: 0.6 + R() * 1.2,
          opacity: 0.04 + R() * 0.05,
          drift: { x: (R() - 0.5) * 0.00008, y: (R() - 0.5) * 0.00006 },
          px: 0, py: 0,
        });
      }
    }

    function resize() {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    }

    function draw(timestamp) {
      t = timestamp * 0.001;
      ctx.clearRect(0, 0, W, H);
      const dim = Math.min(W, H);

      for (const th of THREADS) {
        const drift = Math.sin(t * th.speed * 1000 + th.phase) * th.amp;
        const drift2 = Math.cos(t * th.speed * 800 + th.phase + 1) * th.amp * 0.5;
        ctx.beginPath();
        ctx.moveTo((th.ax + drift * 0.3) * W, (th.ay + drift2 * 0.2) * H);
        ctx.bezierCurveTo(
          (th.bx + drift * 0.5) * W, (th.by - drift2 * 0.4) * H,
          (th.cx - drift * 0.4) * W, (th.cy + drift2 * 0.3) * H,
          (th.dx + drift * 0.2) * W, (th.dy - drift2 * 0.15) * H
        );
        ctx.strokeStyle = th.warm ? `rgba(195,170,120,${th.opacity})` : `rgba(160,165,185,${th.opacity})`;
        ctx.lineWidth = th.width;
        ctx.lineCap = 'round';
        ctx.stroke();
      }

      for (const fr of FRACTURES) {
        const fx = fr.ox * W, fy = fr.oy * H;
        const flen = fr.len * dim;
        ctx.strokeStyle = `rgba(200,190,175,${fr.opacity})`;
        ctx.lineWidth = fr.width;
        ctx.lineCap = 'square';
        ctx.beginPath();
        ctx.moveTo(fx, fy);
        ctx.lineTo(fx + Math.cos(fr.angle) * flen, fy + Math.sin(fr.angle) * flen);
        ctx.stroke();
        for (const br of fr.branches) {
          const bx = fx + Math.cos(fr.angle) * flen * br.t;
          const by = fy + Math.sin(fr.angle) * flen * br.t;
          ctx.beginPath();
          ctx.moveTo(bx, by);
          ctx.lineTo(bx + Math.cos(br.angle) * br.len * dim, by + Math.sin(br.angle) * br.len * dim);
          ctx.stroke();
        }
      }

      for (const nd of NODES) {
        nd.px = ((nd.x + nd.drift.x * t * 60) % 1) * W;
        nd.py = ((nd.y + nd.drift.y * t * 60) % 1) * H;
        const pulse = 0.7 + 0.3 * Math.sin(t * 0.4 + nd.x * 10);
        ctx.beginPath();
        ctx.arc(nd.px, nd.py, nd.r * pulse, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(190,175,140,${nd.opacity * pulse})`;
        ctx.fill();
      }

      requestAnimationFrame(draw);
    }

    window.addEventListener('resize', resize);
    resize();
    buildElements();
    requestAnimationFrame(draw);
  })();

  // ── Boot ───────────────────────────────────────────────────────────────────
  showPage('home');

})();
