/* Taptanita — drag seeds into the pozos to build numbers in base 10 or any base 2–9.
   Places are numbered 0 (lowest shown) to PLACES − 1. By default corn = ×1, beans = ×b,
   peas = ×b², lupins = ×b³ (red-brown frejol = tens and green haba = hundreds in the SEIBE guide). In base 10 the learner can give any place any seed, and
   the lowest place can be tenths, hundredths or thousandths (S.low).
   All on-screen text lives in i18n.js (English and Spanish).
   Created by Edutorium of Excellence LLC. © 2026 Edutorium of Excellence LLC. All rights reserved. */
(function () {
  'use strict';

  var $ = function (s) { return document.querySelector(s); };
  var PLACES = 4; // 3 (SIMPLE / TO ×b²) or 4 places (place dropdown)
  // How each seed looks; its name comes from i18n.js
  var SEEDS = [
    { cls: 'corn', w: 22, h: 25, dot: '#ffd21f', tc: 't-yellow' },
    { cls: 'bean', w: 29, h: 19, dot: '#d23a44', tc: 't-red' },
    { cls: 'pea', w: 21, h: 21, dot: '#7dff4a', tc: 't-green' },
    // lupin (chocho in Ecuador): Andean lupini bean, creamy white to tan
    { cls: 'lupin', w: 23, h: 20, dot: '#f3e6c4', tc: 't-cream' }
  ];
  var SUB = '₀₁₂₃₄₅₆₇₈₉';

  /* ---------- language ---------- */
  var TEXT = window.TAPTI_TEXT, LANG = 'en';
  // also reads 'taptinita-lang', the key used before the app was renamed Taptanita
  try { if ((localStorage.getItem('taptanita-lang') || localStorage.getItem('taptinita-lang')) === 'es') LANG = 'es'; } catch (e) { /* storage blocked */ }
  function t(key, a) { var v = TEXT[LANG][key]; return typeof v === 'function' ? v(a || {}) : v; }
  // The seed used for place i: the learner's choice in base 10, the default order otherwise
  function seedIdx(i) { return S.base === 10 ? S.seedOf[i] : i; }
  function sn(i) { return TEXT[LANG].seeds[seedIdx(i)]; }
  // Place i's name ({one, many, g}); TEXT.places runs from thousandths (0) to thousands (6)
  function pn(i) { return TEXT[LANG].places[i + S.low + 3]; }
  // What trade and break messages call place i: its place name in base 10, its seed otherwise
  function unitName(i) { return S.base === 10 ? pn(i) : sn(i); }

  // Figure geometry, in a 220 x H viewBox (H = 310 in base 10)
  var G = {
    choza: { x: 110, y: 60, r: 36 },
    hub: { x: 110, y: 208, r: 40 },
    killa: { x: 110, y: 134 },
    bot: { x: 110, y: 208 },
    ring: 70,
    body: 98,
    H: 310,
    pr: 19
  };
  // Fewer pozos, smaller body: the ring, hub and body shrink to fit the pozos,
  // while the head, Killa and pozos (and so the seeds) keep their size
  var RING = [0, 48, 52, 56, 60, 66];
  function setGeom() {
    var n = S.base - 1;
    G.ring = n >= 6 ? 70 : RING[n];
    G.hub.r = G.ring - 30;
    G.body = G.ring + 28;
    G.bot.y = G.hub.y = 110 + G.body;
    G.H = G.bot.y + G.body + 4;
  }

  var S = {
    base: 10, places: [], sel: 0, mode: 'free', digits: 2, task: null, taskDone: false,
    view: 'all', show: true, muted: true, way: 'take', saved: [], done: false,
    low: 0, seedOf: [0, 1, 2, 3], // lowest place's power of 10; seed for each place (base 10)
    stats: { saved: 0, tasks: 0, correct: 0, trades: 0, breaks: 0, asked: 0, askRight: 0 }
  };

  var boardsEl = $('#boards'), strip = $('#strip'), cups = $('#cups');
  var sc = 1, bw = 0, bh = 0, busy = false, drag = null, toastTimer = null;
  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- model ---------- */
  // p = pozos; k = a seed resting in the Killa (only after breaking a bigger seed);
  // x = extra seeds waiting on the hub (breaking while some of the lower seed are still there)
  function blank() { var p = []; for (var i = 0; i < S.base - 1; i++) p.push(false); return { p: p, k: false, x: 0 }; }
  function resetBoard() { S.places = []; for (var i = 0; i < PLACES; i++) S.places.push(blank()); }
  function cnt(i) { var pl = S.places[i]; return pl.p.filter(Boolean).length + (pl.k ? 1 : 0) + pl.x; }
  // Hub seeds, then the Killa seed, move into pozos as soon as they are free
  function settle() {
    S.places.forEach(function (pl) {
      for (var e = pl.p.indexOf(false); e >= 0 && (pl.x || pl.k); e = pl.p.indexOf(false)) {
        pl.p[e] = true;
        if (pl.x) pl.x--; else pl.k = false;
      }
    });
  }
  // Seeds always fill the pozos clockwise from the top right, so taking one out
  // shortens the run from its end instead of leaving a gap
  function take(src) {
    var pl = S.places[src.place];
    if (src.slot === 'k') { pl.k = false; return; }
    if (String(src.slot).charAt(0) === 'x') { pl.x--; return; }
    var n = pl.p.filter(Boolean).length - 1;
    pl.p = pl.p.map(function (_, j) { return j < n; });
  }
  function full(i) { return S.places[i].p.every(Boolean); }
  function value() { var v = 0; for (var i = PLACES - 1; i >= 0; i--) v = v * S.base + cnt(i); return v; }
  // Values are whole numbers counted in the lowest place (2.35 with hundredths = 235),
  // so decimals never meet floating-point rounding; fmt() puts the decimal point in.
  function pv(i) { return Math.pow(S.base, i); }
  // Place i's label without the ×: 1000 … 1, 0.1, 0.01, 0.001
  function plv(i) { return S.base === 10 ? fmt(pv(i)) : String(pv(i)); }
  function dec(n, low) {
    if (low >= 0) return String(n);
    var s = String(n), d = -low;
    while (s.length <= d) s = '0' + s;
    return s.slice(0, -d) + t('decSep') + s.slice(-d);
  }
  // 2.30 → 2.3, 4.00 → 4
  function fmtDec(n, low) {
    var s = dec(n, low);
    return low < 0 ? s.replace(/0+$/, '').replace(/[.,]$/, '') : s;
  }
  function sub(b) { return String(b).split('').map(function (d) { return SUB[d]; }).join(''); }
  function fmt(n, html) {
    if (S.base === 10) return fmtDec(n, S.low);
    var b = n.toString(S.base);
    return html ? b + '<sub>' + S.base + '</sub>' : b + sub(S.base);
  }
  function placeWord(i, n) {
    if (S.base === 10) return n + ' ' + pn(i)[n === 1 ? 'one' : 'many'];
    return n + '×' + pv(i);
  }
  function breakdown(v) {
    var parts = [];
    for (var i = PLACES - 1; i >= 0; i--) {
      var d = Math.floor(v / pv(i)) % S.base;
      if (d) parts.push(placeWord(i, d));
    }
    return parts.join(' + ') || '0';
  }
  function setValue(v) {
    resetBoard();
    for (var i = 0; i < PLACES; i++) {
      var d = Math.floor(v / pv(i)) % S.base;
      for (var j = 0; j < d; j++) S.places[i].p[j] = true;
    }
  }
  function firstEmpty(i) { return S.places[i].p.indexOf(false); }

  function pozos(n) {
    var span = n > 1 ? Math.min(260, (n - 1) * Math.max(36, 150 / (n - 1))) : 0, out = [];
    for (var i = 0; i < n; i++) {
      var a = (n === 1 ? 180 : 180 - span / 2 + i * span / (n - 1)) * Math.PI / 180;
      out.push({ x: G.bot.x + G.ring * Math.sin(a), y: G.bot.y - G.ring * Math.cos(a) });
    }
    return out;
  }
  function slotPos(slot, place) {
    if (slot === 'k') return G.killa;
    if (String(slot).charAt(0) === 'x') return hubPos(+slot.slice(1), S.places[place].x);
    return pozos(S.base - 1)[slot];
  }
  // Seed n of m waiting on the hub, in a small grid centred on it
  function hubPos(n, m) {
    var cols = Math.ceil(Math.sqrt(m)), rows = Math.ceil(m / cols);
    var c = n % cols, r = Math.floor(n / cols);
    return { x: G.hub.x + (c - (cols - 1) / 2) * 22, y: G.hub.y + (r - (rows - 1) / 2) * 20 };
  }
  function dist(x, y, p) { return Math.hypot(x - p.x, y - p.y); }
  function fullHint(i) {
    return i === PLACES - 1 ? t('stopsAt', { v: plv(i) }) : t('pozosFull', { s: sn(i) });
  }

  /* ---------- drawing ---------- */
  function figureSVG(i, mini) {
    var pl = S.places[i], P = pozos(S.base - 1), s = '', dot = mini ? SEEDS[seedIdx(i)].dot : '';
    var body = '<circle cx="110" cy="66" r="60"/><circle cx="110" cy="' + G.bot.y + '" r="' + G.body + '"/>';
    s += '<svg viewBox="0 0 220 ' + G.H + '" aria-hidden="true">';
    s += '<g class="fig-out">' + body + '</g>';
    s += '<g class="fig-in">' + body + '</g>';
    s += '<circle class="choza" cx="' + G.choza.x + '" cy="' + G.choza.y + '" r="' + G.choza.r + '"/>';
    s += '<circle class="hub" cx="' + G.hub.x + '" cy="' + G.hub.y + '" r="' + G.hub.r + '"/>';
    s += '<path class="killa" data-zone="k" d="M72 116 A38 38 0 0 0 148 116 Z"/>';
    P.forEach(function (q, j) {
      s += '<circle class="pozo" data-zone="' + j + '" cx="' + q.x.toFixed(1) + '" cy="' + q.y.toFixed(1) + '" r="' + G.pr + '"/>';
      if (!mini) s += '<path class="pozo-gloss" d="M' + (q.x + 6).toFixed(1) + ' ' + (q.y - 13).toFixed(1) + ' a13 13 0 0 1 7 9"/>';
      if (mini && pl.p[j]) s += '<circle fill="' + dot + '" cx="' + q.x.toFixed(1) + '" cy="' + q.y.toFixed(1) + '" r="13"/>';
    });
    if (mini && pl.k) s += '<circle fill="' + dot + '" cx="' + G.killa.x + '" cy="' + G.killa.y + '" r="13"/>';
    for (var n = 0; mini && n < pl.x; n++) {
      var h = hubPos(n, pl.x);
      s += '<circle fill="' + dot + '" cx="' + h.x + '" cy="' + h.y + '" r="9"/>';
    }
    if (i === 'all') {
      s += '<text class="choza-dig all" x="110" y="62">' + (S.show ? fmt(value()) : '?') + '</text>';
    } else if (!mini) {
      s += '<text class="choza-dig" x="110" y="62">' + (S.show ? cnt(i).toString(S.base) : '?') + '</text>';
      s += '<text class="hub-lbl" x="110" y="' + G.hub.y + '" style="font-size:' + Math.min(14, G.hub.r * 0.6) + 'px">×' + plv(i) + '</text>';
    }
    return s + '</svg>';
  }

  function rot(i, slot) { return ((i * 7 + slot * 37) % 50) - 25; }

  // type = the place the seed belongs to; its look comes from that place's seed
  function seedEl(type, x, y, r, scale, cls) {
    var d = document.createElement('div'), s = SEEDS[seedIdx(type)];
    d.className = 'seed ' + s.cls + (cls ? ' ' + cls : '');
    d.style.width = (s.w * scale) + 'px';
    d.style.height = (s.h * scale) + 'px';
    d.style.left = x + 'px';
    d.style.top = y + 'px';
    d.style.setProperty('--r', r + 'deg');
    return d;
  }

  // ONE view: the selected place's seeds. ALL view: one Taptanita where each pozo
  // can hold one seed of every kind at the same time.
  var ALL_OFF3 = [[0, 8], [8, -6], [-8, -6]], ALL_OFF4 = [[-7, 7], [7, 7], [-7, -7], [7, -7]];
  var ALL_OFF = ALL_OFF3, ALL_SCALE = 0.7;
  function boardOf() { return boardsEl.querySelector('.board'); }
  function seedPos(slot, place) {
    var p = slotPos(slot, place);
    if (S.view !== 'all') return p;
    return { x: p.x + ALL_OFF[place][0], y: p.y + ALL_OFF[place][1] };
  }
  function onBoard(place) { return S.view === 'all' || place === S.sel; }

  function renderBoards(pop) {
    var all = S.view === 'all', shown = [S.sel];
    if (all) for (var n = 0, shown = []; n < PLACES; n++) shown.push(n);
    var b = document.createElement('div');
    var ready = shown.some(function (i) { return full(i) && !S.places[i].k && i < PLACES - 1; });
    b.className = 'board' + (ready ? ' trade-ready' : '') + (all ? ' all' : '');
    b.dataset.drop = 'board';
    b.style.width = bw + 'px';
    b.style.height = bh + 'px';
    b.innerHTML = figureSVG(all ? 'all' : S.sel, false);
    shown.forEach(function (i) {
      var slots = [];
      S.places[i].p.forEach(function (on, j) { if (on) slots.push(j); });
      if (S.places[i].k) slots.push('k');
      for (var n = 0; n < S.places[i].x; n++) slots.push('x' + n);
      slots.forEach(function (j, q) {
        var p = seedPos(j, i);
        var d = seedEl(i, p.x * sc, p.y * sc, rot(i, typeof j === 'number' ? j : q), sc * (all ? ALL_SCALE : 1), pop && pop.place === i && pop.slot === j ? 'pop' : '');
        d.dataset.slot = j;
        d.dataset.place = i;
        b.appendChild(d);
      });
    });
    boardsEl.innerHTML = '';
    boardsEl.appendChild(b);
    if (!all) markNext(S.sel);
  }

  // Glow the pozo where place i's next seed must go
  function markNext(i) {
    var e = firstEmpty(i), b = boardOf();
    var pz = e >= 0 && b && b.querySelector('.pozo[data-zone="' + e + '"]');
    if (pz) pz.classList.add('next');
  }

  function renderStrip() {
    var h = '';
    for (var i = PLACES - 1; i >= 0; i--) {
      h += '<button class="card-pl' + (i === S.sel ? ' on' : '') + '" data-drop="card" data-place="' + i + '" aria-pressed="' + (i === S.sel) + '">' +
        figureSVG(i, true) +
        '<span class="pl-info"><span class="pl-lbl">×' + plv(i) + '</span>' +
        '<span class="pl-name">' + sn(i).label + '</span>' +
        '<span class="pl-dig">' + (S.show ? cnt(i).toString(S.base) : '?') + '</span></span></button>';
    }
    strip.innerHTML = h;
    cups.querySelectorAll('.cup').forEach(function (c) { c.classList.toggle('on', +c.dataset.type === S.sel); });
  }

  function renderReadout() {
    var v = value();
    $('#readNum').innerHTML = S.show ? fmt(v, true) : '?';
    // the finished count-on answer takes the base-10 line's space
    var answered = S.task && S.task.on && S.taskDone;
    $('#readDec').textContent = S.show && S.base !== 10 && !answered ? t('inBase10', { v: v }) : '';
    $('#btnEye').textContent = S.show ? t('hide') : t('show');
    $('#btnEye').setAttribute('aria-pressed', String(S.show));
    // count on: how much has been added so far, then the finished subtraction
    var tk = S.task, add = $('#readAdd');
    add.hidden = !(tk && tk.on);
    if (tk && tk.on) {
      var dd = v - tk.b;
      add.className = 'add' + (S.taskDone ? ' done' : '');
      add.innerHTML = S.taskDone ? fmt(tk.a, true) + ' − ' + fmt(tk.b, true) + ' = <b>' + fmt(tk.a - tk.b, true) + '</b>'
        : t('added') + ' ' + (S.show ? (dd < 0 ? '−' : '+') + fmt(Math.abs(dd), true) : '?');
    }
    $('#saved').innerHTML = S.mode === 'free' ? S.saved.slice(-6).map(function (s) { return '<span>' + s + '</span>'; }).join('') : '';
  }

  function setPrompt(html, cls) {
    var p = $('#prompt');
    p.innerHTML = html;
    p.className = cls || '';
  }
  function taskPrompt() {
    var tk = S.task;
    if (S.mode === 'free') {
      var parts = [];
      for (var i = 0; i < PLACES; i++) parts.push(sn(i).short + ' ×' + plv(i));
      return setPrompt(t('pBuild', { parts: parts.join(', ') }));
    }
    if (S.mode === 'make') {
      return setPrompt(S.base === 10 ? t('pMake10', { n: fmt(tk.target) }) : t('pMakeB', { n: tk.target, b: S.base }));
    }
    if (S.mode === 'add') return setPrompt(t('boardShows') + ' <b>' + fmt(tk.a) + '</b>. ' + t('pAdd', { n: fmt(tk.b) }));
    // SUB shares the row with the −B / B+? switch, so it uses the short wording
    renderWay();
    setPrompt(t('boardShort') + ' <b>' + fmt(tk.on ? tk.b : tk.a) + '</b>. ' + (tk.on ? t('pOn', { n: fmt(tk.a) }) : t('pSub', { n: fmt(tk.b) })));
  }
  // SUB can be done two ways: take B away from A, or start at B and count on to A
  function renderWay() {
    var n = fmt(S.task.b);
    document.querySelectorAll('#waySeg button').forEach(function (x) {
      var on = x.dataset.way === S.way;
      x.classList.toggle('on', on);
      x.setAttribute('aria-pressed', String(on));
      x.textContent = x.dataset.way === 'take' ? '−' + n : n + '+?';
      x.setAttribute('aria-label', t(x.dataset.way === 'take' ? 'wayTakeLabel' : 'wayOnLabel', { n: n }));
    });
  }

  function render(pop) {
    settle();
    renderStrip();
    renderBoards(pop);
    renderReadout();
  }

  function layout() {
    var st = $('#stage'), side = $('.side');
    var h = st.clientHeight - 12, w = st.clientWidth - side.offsetWidth - 34;
    // scale from the full base-10 figure so pozos and seeds are the same size in every base
    bh = h; bw = bh * 220 / 310;
    if (bw > w) { bw = w; bh = bw * 310 / 220; }
    sc = bw / 220;
    setGeom();
    bh = G.H * sc;
    renderBoards();
  }

  function buildCups() {
    var spots = [[14, 26], [32, 22], [50, 27], [23, 12], [42, 10]];
    cups.innerHTML = '';
    for (var i = PLACES - 1; i >= 0; i--) {
      var c = document.createElement('button');
      c.className = 'cup';
      c.dataset.drop = 'cup';
      c.dataset.type = i;
      c.setAttribute('aria-label', t('cupLabel', { s: sn(i) }));
      var pile = document.createElement('span');
      pile.className = 'cup-seeds';
      pile.setAttribute('aria-hidden', 'true');
      spots.forEach(function (p, k) { pile.appendChild(seedEl(i, p[0], p[1], (k * 41) % 80 - 40, 0.8)); });
      c.appendChild(pile);
      var l = document.createElement('span');
      l.className = 'cup-lbl';
      l.textContent = sn(i).label;
      c.appendChild(l);
      cups.appendChild(c);
    }
  }

  /* ---------- feedback ---------- */
  function toast(msg) {
    var el = $('#toast');
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.classList.remove('show'); }, 2800);
  }

  var actx = null;
  // type = waveform; f2 = slide to this pitch over the note
  function beep(f, d, type, f2, delay) {
    if (S.muted) return;
    try {
      actx = actx || new (window.AudioContext || window.webkitAudioContext)();
      var o = actx.createOscillator(), g = actx.createGain(), t0 = actx.currentTime + (delay || 0);
      o.type = type || 'square';
      o.frequency.setValueAtTime(f, t0);
      if (f2) o.frequency.exponentialRampToValueAtTime(f2, t0 + d);
      // sine and triangle are softer than square and sawtooth, so they get a little more volume
      g.gain.setValueAtTime(o.type === 'sine' || o.type === 'triangle' ? 0.12 : 0.05, t0);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + d);
      o.connect(g); g.connect(actx.destination);
      o.start(t0); o.stop(t0 + d);
    } catch (e) { /* no audio available */ }
  }

  // Every place has its own sound: bigger places are lower, decimals higher, all on a
  // C major chord (thousands G4 … ones G5 … thousandths G6), each with its own waveform.
  // Indexed by power: thousandths (−3) … thousands (3).
  var UNIT_SOUND = [
    [1568, 'sine'], [1319, 'sawtooth'], [1047, 'triangle'],
    [784, 'square'], [659, 'triangle'], [523, 'sawtooth'], [392, 'sine']
  ];
  // 'add' plays the place's note; 'remove' slides it down; 'big' rings it twice (a trade or break lands)
  function unitBeep(i, how) {
    var s = UNIT_SOUND[i + S.low + 3] || UNIT_SOUND[3];
    if (how === 'remove') return beep(s[0], 0.12, s[1], s[0] * 0.6);
    if (how === 'big') { beep(s[0], 0.12, s[1]); return beep(s[0], 0.22, s[1], 0, 0.13); }
    beep(s[0], 0.1, s[1]);
  }

  function pulseCard(i) {
    var c = strip.querySelector('[data-place="' + i + '"]');
    if (c) c.classList.add('pulse');
  }

  /* ---------- trade: one more seed in the red Killa ---------- */
  // Why a trade at place i can't happen right now, or '' when it can
  function tradeBlock(i) {
    if (i >= PLACES - 1) return fullHint(i);
    if (S.places[i].k) return t('killaBusy', { s: sn(i) });
    for (var j = i + 1; j < PLACES; j++) {
      if (S.places[j].k) return t('takeFirst', { s: sn(j) });
      if (!full(j)) return '';
    }
    return t('needPlace', { v: plv(PLACES - 1) });
  }

  /* ---------- break: a seed dropped on the Killa becomes b seeds of the place below ---------- */
  function breakSeed(d, src) {
    var lo = src.place - 1, pl = S.places[lo];
    // the lower seeds already there may stay: the b new ones fill the pozos and the
    // Killa, and the ones already there wait on the hub. Only a full Killa blocks it.
    if (pl.k) {
      toast(t('takeFirst', { s: sn(lo) }));
      return goBack(d);
    }
    take(src);
    unitBeep(src.place, 'remove');
    var p = boardPoint('k', src.place);
    fly(d.g, p.x, p.y, false, function () {
      var had = cnt(lo);
      for (var j = 0; j < S.base - 1; j++) pl.p[j] = true;
      pl.k = true;
      pl.x = had;
      S.stats.breaks++;
      if (S.view === 'one') S.sel = lo;
      render();
      pulseCard(lo);
      unitBeep(lo, 'big');
      toast(t(had ? 'brokeExtra' : 'broke', { s: unitName(lo), s2: unitName(src.place), b: S.base }));
      if (S.mode !== 'free' && !S.taskDone) taskPrompt();
    });
  }

  // The b-th seed lands in the Killa: ask a question, then trade
  function fillKilla(i) {
    S.places[i].k = true;
    render();
    ask(i, function () { trade(i); });
  }

  // Place i holds b seeds (every pozo + the Killa): they become 1 seed of the next place
  function trade(i) {
    busy = true;
    var finish = function () {
      var nx = i + 1;
      S.places[i] = blank();
      S.stats.trades++;
      busy = false;
      unitBeep(nx, 'big');
      toast(t('traded', { s: unitName(i), s2: unitName(nx), b: S.base }));
      pulseCard(nx);
      if (full(nx)) {
        // carry: the next place now has b seeds too, so it gets its own question and trade
        S.places[nx].k = true;
        if (S.view === 'one') S.sel = nx;
        render();
        pulseCard(nx);
        return ask(nx, function () { trade(nx); });
      }
      S.places[nx].p[firstEmpty(nx)] = true;
      render();
      pulseCard(nx);
      if (S.mode !== 'free' && !S.taskDone) taskPrompt();
      reachedOn();
    };
    if (onBoard(i) && !reduced) {
      boardOf().querySelectorAll('.seed[data-place="' + i + '"]').forEach(function (d) {
        d.style.left = (G.killa.x * sc) + 'px';
        d.style.top = (G.killa.y * sc) + 'px';
        d.style.opacity = '0.25';
      });
      setTimeout(finish, 420);
    } else finish();
  }

  /* ---------- question before a trade ---------- */
  function ask(i, done) {
    var b = S.base, lo = sn(i), hi = sn(i + 1);
    var after = function (first) { if (first) S.stats.askRight++; S.stats.asked++; done(); };
    if (Math.random() < 0.5) {
      quiz(t('askTitle'), t('askCount', { s: lo }), b, [b - 1, b, b + 1], t('hintCount', { n: b - 1, s: lo }), String, after);
    } else {
      quiz(t('askTitle'), t('askTrade', { s: lo, s2: hi, b: b }), 1, [1, b, b * b], t('hintTrade', { s: lo, s2: hi, b: b }), String, after);
    }
  }

  // A multiple-choice card: a wrong answer gives the hint and another try;
  // after two misses the right answer lights up. done(firstTry) runs on the right one.
  function quiz(title, q, ans, opts, hint, show, done) {
    busy = true;
    var tries = 0, box = $('#askBtns');
    $('#askTitle').textContent = title;
    $('#askQ').textContent = q;
    $('#askHint').textContent = '';
    box.innerHTML = '';
    opts.sort(function () { return Math.random() - 0.5; });
    opts.forEach(function (o) {
      var btn = document.createElement('button');
      btn.className = 'btn';
      btn.textContent = show(o);
      btn.dataset.v = o;
      btn.addEventListener('click', function () {
        tries++;
        if (o === ans) {
          beep(784, 0.15);
          $('#askOv').hidden = true;
          busy = false;
          return done(tries === 1);
        }
        beep(200, 0.15);
        btn.disabled = true;
        btn.classList.add('wrong');
        $('#askHint').textContent = t('notQuite') + hint;
        if (tries >= 2) box.querySelector('[data-v="' + ans + '"]').classList.add('btn-green');
      });
      box.appendChild(btn);
    });
    $('#askOv').hidden = false;
    box.querySelector('button').focus();
  }

  // Count on: the board reached A, so ask how much was added to B
  function askOn() {
    var tk = S.task, d = tk.a - tk.b, b = S.base, pool = [d + 1, d + b, d - 1, d - b].filter(function (x) { return x > 0; });
    pool.sort(function () { return Math.random() - 0.5; });
    var a = { a: fmt(tk.a), b: fmt(tk.b), d: fmt(d) };
    quiz(t('onTitle'), t('askOn', a), d, [d].concat(pool.slice(0, 2)), t('hintOn', a), function (n) { return fmt(n); }, function () {
      if (!S.taskDone) { S.taskDone = true; S.stats.correct++; }
      S.show = true;
      render();
      setPrompt(t('yesOn', a), 'good');
    });
  }
  // The question opens by itself once the board reaches the number counted on to
  function reachedOn() {
    var tk = S.task;
    if (!tk || !tk.on || S.taskDone || value() !== tk.a) return;
    setTimeout(function () {
      if (!busy && S.task === tk && !S.taskDone && value() === tk.a) askOn();
    }, 350);
  }

  // Add one seed to place i's first empty pozo; returns the slot, or null when full
  function addTo(i) {
    var e = firstEmpty(i);
    if (e >= 0) { S.places[i].p[e] = true; return e; }
    return null;
  }

  /* ---------- drag & drop ---------- */
  function startDrag(e, src, srcEl) {
    if (busy || drag) return;
    e.preventDefault();
    var sd = SEEDS[seedIdx(src.type)], s = Math.max(sc, 0.9) * 1.2;
    var g = document.createElement('div');
    g.className = 'seed ghost ' + sd.cls;
    g.style.width = (sd.w * s) + 'px';
    g.style.height = (sd.h * s) + 'px';
    g.style.setProperty('--r', (srcEl && srcEl.style.getPropertyValue('--r')) || '0deg');
    document.body.appendChild(g);
    drag = { src: src, g: g, el: srcEl, x0: e.clientX, y0: e.clientY, moved: false, hot: null };
    if (srcEl) srcEl.classList.add('lifting');
    if (S.view === 'all' && src.from === 'cup') markNext(src.type);
    moveGhost(e.clientX, e.clientY);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onCancel);
  }

  function moveGhost(x, y) { drag.g.style.left = x + 'px'; drag.g.style.top = y + 'px'; }

  function hotTarget(x, y) {
    var el = document.elementFromPoint(x, y);
    if (!el) return null;
    var zone = el.closest('[data-zone]');
    if (zone && zone.closest('.board')) return zone;
    return el.closest('[data-drop]');
  }

  function onMove(e) {
    if (!drag) return;
    if (Math.hypot(e.clientX - drag.x0, e.clientY - drag.y0) > 6) drag.moved = true;
    moveGhost(e.clientX, e.clientY);
    var tg = hotTarget(e.clientX, e.clientY);
    if (tg !== drag.hot) {
      if (drag.hot) drag.hot.classList.remove('hot');
      if (tg && !tg.classList.contains('board')) tg.classList.add('hot');
      drag.hot = tg;
    }
  }

  function endDrag() {
    window.removeEventListener('pointermove', onMove);
    window.removeEventListener('pointerup', onUp);
    window.removeEventListener('pointercancel', onCancel);
    if (drag && drag.hot) drag.hot.classList.remove('hot');
    var d = drag;
    drag = null;
    return d;
  }

  function onCancel() {
    var d = endDrag();
    d.g.remove();
    render();
  }

  // Fly the ghost to a screen point, then run cb
  function fly(g, x, y, fade, cb) {
    if (reduced) { g.remove(); if (cb) cb(); return; }
    busy = true;
    g.style.transition = 'left .16s ease-out, top .16s ease-out, opacity .16s';
    requestAnimationFrame(function () {
      g.style.left = x + 'px'; g.style.top = y + 'px';
      if (fade) g.style.opacity = '0';
    });
    setTimeout(function () { g.remove(); busy = false; if (cb) cb(); }, 170);
  }

  function boardPoint(slot, place) {
    var r = boardOf().getBoundingClientRect(), p = seedPos(slot, place);
    return { x: r.left + p.x * sc, y: r.top + p.y * sc };
  }
  function centerOf(el) { var r = el.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; }
  function cupEl(type) { return cups.querySelector('[data-type="' + type + '"]'); }

  function goBack(d) {
    var p = d.src.from === 'board' ? boardPoint(d.src.slot, d.src.place) : centerOf(cupEl(d.src.type));
    fly(d.g, p.x, p.y, d.src.from !== 'board', function () { render(); });
  }

  function placed(d, place, slot) {
    unitBeep(place);
    var vis = onBoard(place);
    var p = vis ? boardPoint(slot, place) : centerOf(strip.querySelector('[data-place="' + place + '"]'));
    fly(d.g, p.x, p.y, !vis, function () {
      render(vis ? { place: place, slot: slot } : undefined);
      if (!vis) pulseCard(place);
      afterChange(place);
    });
  }

  function intoKilla(d, place) {
    unitBeep(place);
    var p = boardPoint('k', place);
    fly(d.g, p.x, p.y, false, function () { fillKilla(place); });
  }

  // Place i is full: the new seed (tapped, or dropped anywhere for that place) goes to the Killa by itself
  function toKilla(d, i) {
    var why = tradeBlock(i);
    if (why) { toast(why); render(); return goBack(d); }
    if (S.view === 'one') S.sel = i;
    render();
    intoKilla(d, i);
  }

  function afterChange(place) {
    if (full(place) && !S.places[place].k && place < PLACES - 1) toast(fullHint(place));
    if (S.mode !== 'free' && !S.taskDone) taskPrompt();
    reachedOn();
  }

  // Take a board seed off the Taptanita; it flies back to its cup and fades
  function removeSeed(d) {
    take(d.src);
    unitBeep(d.src.place, 'remove');
    var c = centerOf(cupEl(d.src.type));
    fly(d.g, c.x, c.y, true, function () { render(); afterChange(d.src.place); });
  }

  // Two quick taps on the same seed remove it
  var lastTap = null;
  function isDoubleTap(src) {
    var now = Date.now(), dbl = lastTap && lastTap.place === src.place && now - lastTap.t < 400;
    lastTap = dbl ? null : { place: src.place, t: now };
    return dbl;
  }

  function wrongPlace(type, place) {
    toast(t('wrongPlace', { s: sn(type), v: plv(type), w: plv(place) }));
  }

  function onUp(e) {
    var d = endDrag();
    if (!d) return;
    var src = d.src, x = e.clientX, y = e.clientY;

    // A tap on a cup picks that place and adds one seed
    if (!d.moved) {
      if (src.from === 'cup') {
        S.sel = src.type;
        var s0 = addTo(src.type);
        if (s0 === null) return toKilla(d, src.type);
        S.places[S.sel].p[s0] = false;
        render();
        S.places[S.sel].p[s0] = true;
        return placed(d, S.sel, s0);
      }
      if (isDoubleTap(src)) return removeSeed(d);
      // a single tap leaves the seed where it is (no fly, so a second tap isn't blocked)
      d.g.remove();
      return render();
    }

    var tg = hotTarget(x, y);
    var drop = tg && (tg.dataset.zone !== undefined ? 'board' : tg.dataset.drop);

    // A seed dragged off the Taptanita (to a cup, a card or anywhere else) is removed
    if (src.from === 'board' && drop !== 'board') return removeSeed(d);

    if (drop === 'card') {
      var q = +tg.dataset.place;
      if (src.type !== q) { wrongPlace(src.type, q); return goBack(d); }
      var s1 = addTo(q);
      if (s1 === null) return toKilla(d, q);
      return placed(d, q, s1);
    }

    if (drop === 'board') {
      var bEl = tg.closest('.board'), r = bEl.getBoundingClientRect();
      var bx = (x - r.left) / sc, by = (y - r.top) / sc;
      // in ALL view the seed's own type decides its place
      var i = S.view === 'all' ? src.type : S.sel, pl = S.places[i];
      if (src.from === 'cup' && src.type !== i) { wrongPlace(src.type, i); return goBack(d); }
      var onKilla = by > 108 && by < 160 && Math.abs(bx - 110) < 44;
      // a pea or bean already on the board, dropped on the Killa, breaks into the place below
      if (src.from === 'board' && onKilla && src.place > 0) return breakSeed(d, src);
      // seeds on the Taptanita stay put; they leave only to a cup or the Killa
      if (src.from === 'board') return goBack(d);

      if (full(i)) {
        return toKilla(d, i);
      }

      // only the next pozo clockwise from the top right takes a seed
      var next = firstEmpty(i);
      if (dist(bx, by, pozos(S.base - 1)[next]) > G.pr + 14) {
        toast(t(onKilla ? 'fillFirst' : 'clockwise'));
        return goBack(d);
      }
      pl.p[next] = true;
      return placed(d, i, next);
    }

    // A cup seed dropped somewhere else goes back to its cup
    goBack(d);
  }

  boardsEl.addEventListener('pointerdown', function (e) {
    var s = e.target.closest('.seed');
    if (!s) return;
    var i = +s.dataset.place;
    startDrag(e, { from: 'board', type: i, place: i, slot: /^\d+$/.test(s.dataset.slot) ? +s.dataset.slot : s.dataset.slot }, s);
  });
  cups.addEventListener('pointerdown', function (e) {
    var c = e.target.closest('.cup');
    if (c) startDrag(e, { from: 'cup', type: +c.dataset.type }, null);
  });
  cups.addEventListener('keydown', function (e) {
    var c = e.target.closest('.cup');
    if (!c || (e.key !== 'Enter' && e.key !== ' ') || busy) return;
    e.preventDefault();
    var i = +c.dataset.type;
    S.sel = i;
    var s = addTo(i);
    if (s !== null) { unitBeep(i); render({ place: i, slot: s }); afterChange(i); }
    else if (!tradeBlock(i)) fillKilla(i);
    else { render(); toast(tradeBlock(i)); }
  });
  // In base 10 a place card opens the seed palette (in ONE view it also shows that place);
  // in other bases it switches to that place as before
  strip.addEventListener('click', function (e) {
    var c = e.target.closest('.card-pl');
    if (!c || drag || busy) return;
    var i = +c.dataset.place;
    if (S.base === 10) {
      if (S.view === 'one') { S.sel = i; render(); }
      return openPalette(i);
    }
    S.sel = i;
    if (S.view === 'all') setView('one'); else render();
  });

  /* ---------- seed palette: which seed each place uses (base 10) ---------- */
  var pal = $('#palette');
  function openPalette(i) {
    var box = $('#palBtns');
    $('#palQ').textContent = t('pickSeed', { p: pn(i) });
    box.innerHTML = '';
    SEEDS.forEach(function (sd, k) {
      var b = document.createElement('button');
      b.className = 'pal-seed' + (S.seedOf[i] === k ? ' on' : '');
      b.setAttribute('aria-pressed', String(S.seedOf[i] === k));
      var ico = document.createElement('span');
      ico.className = 'pal-ico';
      var s = document.createElement('span');
      s.className = 'seed ' + sd.cls;
      s.style.cssText = 'width:' + sd.w + 'px;height:' + sd.h + 'px;left:50%;top:50%';
      ico.appendChild(s);
      b.appendChild(ico);
      b.appendChild(document.createTextNode(TEXT[LANG].seeds[k].label));
      b.addEventListener('click', function () { pickSeed(i, k); });
      box.appendChild(b);
    });
    pal.style.top = (strip.getBoundingClientRect().bottom - $('#app').getBoundingClientRect().top + 4) + 'px';
    pal.hidden = false;
    box.querySelector('.on').focus();
  }
  function closePalette() { pal.hidden = true; }
  // Give place i seed k; a place already using k takes place i's old seed
  function pickSeed(i, k) {
    var j = S.seedOf.indexOf(k);
    if (j !== i) S.seedOf[j] = S.seedOf[i];
    S.seedOf[i] = k;
    closePalette();
    buildCups();
    renderHelp();
    if (S.mode === 'free') taskPrompt();
    render();
    toast(t('seedSet', { s: TEXT[LANG].seeds[k], p: pn(i) }));
  }
  document.addEventListener('pointerdown', function (e) {
    if (!pal.hidden && !pal.contains(e.target) && !e.target.closest('.card-pl')) closePalette();
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closePalette(); });

  function markView(v) {
    S.view = v;
    document.querySelectorAll('#viewSeg button').forEach(function (x) {
      x.classList.toggle('on', x.dataset.view === v);
      x.setAttribute('aria-pressed', String(x.dataset.view === v));
    });
  }
  function setView(v) {
    markView(v);
    render();
  }

  /* ---------- tasks ---------- */
  function rnd(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); }

  // True when some digit of B is bigger than the same digit of A, so a seed must be broken
  function needsBreak(A, B, b) {
    for (; B > 0; A = Math.floor(A / b), B = Math.floor(B / b)) if (B % b > A % b) return true;
    return false;
  }

  // Every subtraction needs at least one break. At the 1-digit size it's a teen
  // number minus a 1-digit number (13 − 7), since 1-digit minus 1-digit never needs one.
  function subPair(b, d, min, max) {
    if (d === 1) {
      var A1 = rnd(b, 2 * b - 2);
      return [A1, rnd(A1 % b + 1, b - 1)];
    }
    for (var n = 0; n < 400; n++) {
      var A = rnd(min, max), B = rnd(n < 200 ? min : 1, A);
      if (needsBreak(A, B, b)) return [A, B];
    }
    return [min, 1];
  }

  // keep = reuse the current subtraction (when switching between take away and count on)
  function newTask(keep) {
    var b = S.base, d = S.digits, max = Math.pow(b, d) - 1, min = d === 1 ? 1 : Math.pow(b, d - 1);
    S.taskDone = false;
    resetBoard();
    if (S.mode === 'make') {
      S.task = { target: rnd(min, max) };
      S.stats.tasks++;
    } else if (S.mode === 'add') {
      var A, B, cap = Math.pow(b, PLACES) - 1;
      if (2 * max > cap) {
        // numbers as big as the Taptanita: keep the sum inside it
        var hi = cap - min >= min ? cap - min : cap - 1;
        A = rnd(min, hi);
        B = rnd(Math.min(min, cap - A), cap - A);
      } else { A = rnd(min, max); B = rnd(min, max); }
      S.task = { a: A, b: B, target: A + B };
      setValue(A);
      S.stats.tasks++;
    } else if (S.mode === 'sub') {
      var AB = keep && S.task && S.task.b ? [S.task.a, S.task.b] : subPair(b, d, min, max);
      if (!keep) S.stats.tasks++;
      if (S.way === 'on') {
        // count on: start at B and add seeds up to A (the same pairs need a trade on the way)
        S.task = { a: AB[0], b: AB[1], target: AB[0], on: true };
        setValue(AB[1]);
        toast(t('tipOn', { a: fmt(AB[0]), b: fmt(AB[1]) }));
      } else {
        S.task = { a: AB[0], b: AB[1], target: AB[0] - AB[1] };
        setValue(AB[0]);
      }
    } else S.task = null;
    taskPrompt();
    render();
  }

  function check() {
    if (S.mode === 'free') {
      var v0 = value();
      if (!v0) return toast(t('putSeeds'));
      S.saved.push(fmt(v0));
      S.stats.saved++;
      beep(660, 0.12);
      toast(t('saved', { n: fmt(v0) }));
      return renderReadout();
    }
    var v = value(), tg = S.task.target;
    taskPrompt();
    var base = S.mode === 'sub' ? (S.task.on ? t('pOn', { n: fmt(S.task.a) }) : t('pSub', { n: fmt(S.task.b) }))
      : $('#prompt').innerHTML.replace(t('boardShows'), t('boardShort'));
    if (v === tg && S.task.on) return askOn();
    if (v === tg) {
      if (!S.taskDone) { S.taskDone = true; S.stats.correct++; }
      beep(784, 0.2);
      setPrompt(t('yes', { t: fmt(tg), parts: breakdown(tg) }), 'good');
    } else {
      beep(200, 0.15);
      setPrompt(t(v < tg ? 'needMore' : 'tooMany') + base, 'warn');
    }
  }

  /* ---------- controls ---------- */
  function setMode(m) {
    S.mode = m;
    S.show = m === 'free';
    markView('all'); // every mode starts with all seeds together; ONE is still a tap away
    document.querySelectorAll('#modeSeg button').forEach(function (b) { b.classList.toggle('on', b.dataset.mode === m); });
    $('#digitSeg').hidden = m === 'free';
    $('#waySeg').hidden = m !== 'sub';
    $('#app').classList.toggle('sub', m === 'sub');
    $('#btnNext').hidden = m === 'free';
    $('#btnCheck').textContent = m === 'free' ? t('save') : t('check');
    newTask();
  }

  $('#modeSeg').addEventListener('click', function (e) {
    var b = e.target.closest('button');
    if (b) setMode(b.dataset.mode);
  });
  $('#waySeg').addEventListener('click', function (e) {
    var b = e.target.closest('button');
    if (!b || b.dataset.way === S.way) return;
    S.way = b.dataset.way;
    newTask(true);
  });
  $('#digitSeg').addEventListener('click', function (e) {
    var b = e.target.closest('button');
    if (!b) return;
    S.digits = +b.dataset.d;
    document.querySelectorAll('#digitSeg button').forEach(function (x) { x.classList.toggle('on', x === b); });
    newTask();
  });

  var sel = $('#baseSel');
  function baseOptions() {
    sel.innerHTML = '<option value="10">BASE 10</option><optgroup label="' + t('advanced') + '">' +
      [2, 3, 4, 5, 6, 7, 8, 9].map(function (b) { return '<option value="' + b + '">BASE ' + b + '</option>'; }).join('') + '</optgroup>';
    sel.value = String(S.base);
  }
  sel.addEventListener('change', function () {
    S.base = +sel.value;
    S.saved = [];
    closePalette();
    // decimal places and seed choices are base 10 only
    if (S.base !== 10) S.low = 0;
    placeOptions();
    sizeLabels();
    buildCups();
    renderHelp();
    newTask();
    layout();
    toast(t('baseToast', { b: S.base, n: S.base - 1, s: sn(0), s2: sn(1) }));
  });

  // Which places the Taptanita has (value "low:places"). Base 10, named by place-value words:
  // whole numbers by the biggest place, decimals by the smallest. HUNDREDS (hundreds, tens, ones),
  // THOUSANDS (thousands–ones), TENTHS (hundreds–tenths), HUNDREDTHS (tens–hundredths),
  // THOUSANDTHS (ones–thousandths). Other bases: up to ×b² or ×b³.
  var RANGES = [[0, 3, 'rHundreds'], [0, 4, 'rThousands'], [-1, 4, 'rTenths'], [-2, 4, 'rHundredths'], [-3, 4, 'rThousandths']];
  var placeSel = $('#placeSel');
  function placeOptions() {
    if (S.base === 10) {
      placeSel.innerHTML = RANGES.map(function (r) {
        return '<option value="' + r[0] + ':' + r[1] + '">' + t(r[2]) + '</option>';
      }).join('');
    } else {
      placeSel.innerHTML = '<option value="0:3">' + t('placeTo') + ' ×' + pv(2) + '</option><option value="0:4">' + t('placeTo') + ' ×' + pv(3) + '</option>';
    }
    placeSel.value = S.low + ':' + PLACES;
  }
  // Size buttons show the biggest number of each size (9 / 99 / 999). With decimals that would be
  // 0.009 / 0.099 …, too wide for a phone next to the prompt, so they show the digit count instead.
  function sizeLabels() {
    document.querySelectorAll('#digitSeg button').forEach(function (b) {
      var d = +b.dataset.d;
      b.textContent = S.base === 10 && S.low < 0 ? String(d) : new Array(d + 1).join('9');
    });
  }
  function renderHelp() {
    var parts = [];
    for (var i = PLACES - 1; i >= 0; i--) parts.push('<b class="' + SEEDS[seedIdx(i)].tc + '">' + sn(i).many + '</b> ×' + plv(i));
    $('#helpList').innerHTML = t('helpHtml', { parts: parts.join(', ') });
    $('#aboutText').innerHTML = t('aboutHtml');
  }
  placeSel.addEventListener('change', function () {
    var r = placeSel.value.split(':');
    S.low = +r[0];
    PLACES = +r[1];
    closePalette();
    sizeLabels();
    renderHelp();
    applyPlaces();
    S.saved = [];
    buildCups();
    newTask();
    layout();
    if (S.base !== 10) return toast(t('rangeToast', { lo: plv(0), hi: plv(PLACES - 1), n: PLACES }));
    var names = [];
    for (var i = PLACES - 1; i >= 0; i--) names.push(pn(i).many);
    toast(t('placesToast', { names: names }));
  });
  // Layout that depends on 3 or 4 places
  function applyPlaces() {
    ALL_OFF = PLACES === 4 ? ALL_OFF4 : ALL_OFF3;
    ALL_SCALE = PLACES === 4 ? 0.6 : 0.7;
    if (S.sel >= PLACES) S.sel = PLACES - 1;
    $('#app').classList.toggle('four', PLACES === 4);
    $('#digitSeg [data-d="4"]').hidden = PLACES < 4;
    if (S.digits > PLACES) {
      S.digits = PLACES;
      document.querySelectorAll('#digitSeg button').forEach(function (x) { x.classList.toggle('on', +x.dataset.d === S.digits); });
    }
  }

  // Every fixed label in index.html carries data-t (text) or data-t-label (aria-label)
  function applyLanguage() {
    document.documentElement.lang = LANG;
    document.querySelectorAll('[data-t]').forEach(function (el) { el.textContent = t(el.dataset.t); });
    document.querySelectorAll('[data-t-label]').forEach(function (el) { el.setAttribute('aria-label', t(el.dataset.tLabel)); });
    document.querySelectorAll('#digitSeg button').forEach(function (b) { b.setAttribute('aria-label', t('digits', { n: +b.dataset.d })); });
    renderHelp();
    sizeLabels();
    closePalette();
    $('#btnSound').textContent = S.muted ? t('soundOff') : t('soundOn');
    $('#btnCheck').textContent = S.mode === 'free' ? t('save') : t('check');
    document.querySelectorAll('#langSeg button').forEach(function (b) {
      b.classList.toggle('on', b.dataset.lang === LANG);
      b.setAttribute('aria-pressed', String(b.dataset.lang === LANG));
    });
    baseOptions();
    placeOptions();
    buildCups();
    // keep the same problem, just reword it
    if (S.mode === 'free' || !S.taskDone) taskPrompt();
    else setPrompt(t('yes', { t: fmt(S.task.target), parts: breakdown(S.task.target) }), 'good');
    render();
  }

  $('#langSeg').addEventListener('click', function (e) {
    var b = e.target.closest('button');
    if (!b || busy || drag || b.dataset.lang === LANG) return;
    LANG = b.dataset.lang;
    try { localStorage.setItem('taptanita-lang', LANG); } catch (err) { /* storage blocked */ }
    applyLanguage();
  });

  $('#btnClear').addEventListener('click', function () {
    if (S.mode === 'add' || S.mode === 'sub') setValue(S.task.a); else resetBoard();
    if (S.mode !== 'free') taskPrompt();
    render();
  });
  $('#btnCheck').addEventListener('click', check);
  $('#btnNext').addEventListener('click', function () { newTask(); });
  $('#btnEye').addEventListener('click', function () { S.show = !S.show; render(); });
  $('#viewSeg').addEventListener('click', function (e) {
    var b = e.target.closest('button');
    if (b && !drag && !busy) setView(b.dataset.view);
  });
  $('#btnSound').addEventListener('click', function () {
    S.muted = !S.muted;
    this.textContent = S.muted ? t('soundOff') : t('soundOn');
    this.setAttribute('aria-pressed', String(!S.muted));
    beep(660, 0.08);
  });
  $('#btnHelp').addEventListener('click', function () { $('#helpOv').hidden = false; });
  $('#btnFinish').addEventListener('click', function () {
    var st = S.stats, lines = [];
    if (st.saved) lines.push(t('sumBuilt') + st.saved);
    if (st.tasks) lines.push(t('sumCorrect', { n: st.correct, m: st.tasks }));
    lines.push(t('sumTrades') + st.trades);
    if (st.breaks) lines.push(t('sumBreaks') + st.breaks);
    if (st.asked) lines.push(t('sumAsk', { n: st.askRight, m: st.asked }));
    $('#summary').innerHTML = lines.join('<br>');
    $('#finishOv').hidden = false;
    if (!S.done) {
      S.done = true;
      console.log("Interaction Complete");
    }
  });
  document.querySelectorAll('[data-close]').forEach(function (b) {
    b.addEventListener('click', function () { b.closest('.ov').hidden = true; });
  });

  window.addEventListener('resize', layout);

  /* ---------- start ---------- */
  applyPlaces();
  setMode('free');
  applyLanguage();
  layout();
})();
