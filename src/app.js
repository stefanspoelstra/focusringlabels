// Pullmark 2 — nieuwe opzet in drie stappen: lenzen, ring, printen.
// De rekenkern (Engine) is dezelfde als in versie 1; deze laag is alleen de bediening.
(function () {
  'use strict';
  var VERSION = '2.0 · 12-11-2026';
  var KEY = 'pullmark2';
  var $ = function (id) { return document.getElementById(id); };
  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text !== undefined && text !== null) e.textContent = text; return e; }
  var LANG = 'nl';
  try { LANG = localStorage.getItem('pm2lang') || ((navigator.language || 'nl').slice(0, 2) === 'nl' ? 'nl' : 'en'); } catch (e) {}
  function T(nl, en) { return LANG === 'en' ? en : nl; }
  Engine.setLang(LANG);

  // ---------- ringen ----------
  // Eén gemeten model voor de handunit: positie = schaal × (10000 − motorwaarde) / 1000, gerekend vanaf het midden van de nudge.
  var RINGS = [
    { key: 'wcu4', ok: true, nl: 'WCU-4-ring', en: 'WCU-4 ring',
      noteNl: 'Nagemeten op 12-11-2026 op de Nucleus-M II: schaal 24,5 mm per 1000, de ∞-aanslag ligt op het midden van de nudge. Omtrek 254,5 mm, uitsparing 4,0 × 5,0 mm.',
      noteEn: 'Measured on 2026-11-12 on the Nucleus-M II: scale 24.5 mm per 1000, the ∞ end stop sits at the center of the nudge. Circumference 254.5 mm, cutout 4.0 × 5.0 mm.' },
    { key: 'tilta-nucleus', ok: false, nl: 'Tilta ARRI-ring', en: 'Tilta ARRI ring',
      noteNl: 'Zelfde schaal, label 252 mm, uitsparing 3,3 × 4,0 mm. Nog niet nagemeten met het nieuwe meetlabel.',
      noteEn: 'Same scale, label 252 mm, cutout 3.3 × 4.0 mm. Not yet verified with the new calibration label.' },
    { key: 'tilta-orig', ok: false, nl: 'Tilta-ring (origineel)', en: 'Tilta ring (original)',
      noteNl: 'De kleinere ring die bij de Nucleus-M II zit. De schaal is omgerekend, niet gemeten.',
      noteEn: 'The smaller ring supplied with the Nucleus-M II. The scale is derived, not measured.' }
  ];
  var STYLE_KEYS = Object.keys(Engine.STYLES).filter(function (k) { return Engine.STYLES[k].group === 'Effen'; }).slice(0, 12);
  if (!STYLE_KEYS.length) STYLE_KEYS = Object.keys(Engine.STYLES).slice(0, 12);
  function sol(c) { return { mode: 'solid', c: [c, c, c, c] }; }
  function gy(stops) { var a = stops[0][1], z = stops[stops.length - 1][1]; return { mode: 'y', c: [a, a, z, z], stops: stops }; }
  function mk(label, o) {
    return { label: label, group: 'Op de set', ink: o.ink || '#111111', bandL: o.bandL === undefined ? 1.61 : o.bandL, split: o.split === undefined ? 11.27 : o.split,
      bandR: o.bandR || 0, fullFill: !!o.full, zones: { bandL: o.band, left: o.left, right: o.right || o.left, bandR: o.bandRc || o.band }, stripes: o.stripes || [] };
  }
  // eigen stijlen met een knipoog naar de set: klapbord, kleurbalken, false color, waveform en meer
  var EXTRA = {
    'set-klapbord': mk('Klapbord', { band: sol('#ffffff'), bandL: 2.4, left: sol('#111111'), right: sol('#1d1d1d'), ink: '#ffffff', stripes: [{ u0: 0.6, u1: 1.2, c: '#111111' }, { u0: 1.8, u1: 2.4, c: '#111111' }] }),
    'set-kleurbalken': mk('Kleurbalken', { band: sol('#c0c0c0'), bandL: 3.5, split: 11.6, left: sol('#f5f5f5'), right: sol('#e4e4e4'),
      stripes: ['#c0c0c0', '#c0c000', '#00c0c0', '#00c000', '#c000c0', '#c00000', '#0000c0'].map(function (c, i) { return { u0: i * 0.5, u1: i * 0.5 + 0.5, c: c }; }) }),
    'set-falsecolor': mk('False color', { band: gy([[0, '#6a2c91'], [0.16, '#1f5fd1'], [0.36, '#7d7d7d'], [0.5, '#3fae49'], [0.64, '#f08fb0'], [0.82, '#f6e04a'], [1, '#e2331f']]), bandL: 3.2, split: 11.6, left: sol('#f4f4f4'), right: sol('#dedede') }),
    'set-waveform': mk('Waveform', { band: sol('#39ff6a'), bandL: 1.2, left: sol('#0a0f0b'), right: sol('#111a13'), ink: '#8dffa6' }),
    'set-peaking': mk('Focus peaking', { band: sol('#ff2a2a'), bandL: 1.2, bandR: 0.8, left: sol('#161616'), right: sol('#232323'), ink: '#ffffff', stripes: [{ u0: 11.12, u1: 11.42, c: '#ff2a2a' }] }),
    'set-zebra': mk('Zebra', { band: sol('#ffffff'), bandL: 3.0, split: 11.6, left: sol('#fafafa'), right: sol('#ebebeb'), stripes: [{ u0: 0, u1: 0.5, c: '#111111' }, { u0: 1.0, u1: 1.5, c: '#111111' }, { u0: 2.0, u1: 2.5, c: '#111111' }] }),
    'set-kelvin': mk('Tungsten / daglicht', { band: gy([[0, '#ff9a3c'], [1, '#4f9dff']]), left: sol('#ffdcae'), right: sol('#bfdcff') }),
    'set-goudenuur': mk('Gouden uur', { band: sol('#b85c1e'), full: true, left: gy([[0, '#ffe7a6'], [0.5, '#ffb97f'], [1, '#ff9494']]), ink: '#2a1505' }),
    'set-blauwuur': mk('Blauw uur', { band: sol('#f2b56b'), full: true, left: gy([[0, '#16254f'], [0.55, '#27457f'], [1, '#3a6f9a']]), ink: '#ffffff' }),
    'set-greenscreen': mk('Greenscreen', { band: sol('#0d5a1a'), left: sol('#3ddc52'), right: sol('#2cc441'), ink: '#06210b' }),
    'set-tally': mk('Tally', { band: sol('#ff1a1a'), bandL: 2.2, left: sol('#141414'), right: sol('#1f1f1f'), ink: '#ffffff', stripes: [{ u0: 18.9, u1: 19.39, c: '#ff1a1a' }] }),
    'set-log': mk('Log', { band: sol('#8b8982'), left: sol('#bcbab3'), right: sol('#a8a69f'), ink: '#2b2b2b' })
  };
  var ALL = {}; Object.keys(Engine.STYLES).forEach(function (k) { ALL[k] = Engine.STYLES[k]; }); Object.keys(EXTRA).forEach(function (k) { ALL[k] = EXTRA[k]; });
  var GROUPS = [['Effen', 'Solid'], ['Donker', 'Dark'], ['Verloop', 'Gradient'], ['Heel label', 'Full label'], ['Speciaal', 'Special'], ['Creatief', 'Creative'], ['Op de set', 'On set']];
  function customStyle(c) { return { label: 'Eigen', ink: c.ink, bandL: 1.61, split: 11.27, bandR: 0, zones: { bandL: sol(c.band), left: sol(c.left), right: sol(c.right), bandR: sol(c.band) } }; }
  function styleOf(set) { return set.custom ? customStyle(set.custom) : (ALL[set.styleKey] || ALL[STYLE_KEYS[0]]); }
  function zoneCss(z) {
    if (!z) return '#ffffff';
    if (z.mode === 'y') return 'linear-gradient(180deg,' + (z.stops ? z.stops.map(function (q) { return q[1] + ' ' + Math.round(q[0] * 100) + '%'; }).join(',') : z.c[0] + ',' + z.c[2]) + ')';
    if (z.mode === 'x') return 'linear-gradient(90deg,' + z.c[0] + ',' + z.c[1] + ')';
    if (z.mode === 'xy') return 'linear-gradient(135deg,' + z.c[0] + ',' + z.c[3] + ')';
    return z.c[0];
  }
  // klein voorbeeld van een stijl: de vlakken, de sierstrepen en een streepje in de inktkleur
  function swatch(style, on, title, onclick) {
    var st = Engine.normalizeStyle(style), W = 19.39, b = el('button', 'sw' + (on ? ' on' : '')); b.type = 'button'; b.title = title;
    function part(u0, u1, css) { if (u1 <= u0) return; var i = el('i'); i.style.left = (u0 / W * 100) + '%'; i.style.width = ((u1 - u0) / W * 100) + '%'; i.style.background = css; b.appendChild(i); }
    var bl = st.bandL, br = st.bandR, sp = st.fullFill ? W - br : Math.max(bl, Math.min(W - br, st.split));
    part(bl, sp, zoneCss(st.zones.left)); if (!st.fullFill) part(sp, W - br, zoneCss(st.zones.right));
    part(0, bl, zoneCss(st.zones.bandL)); part(W - br, W, zoneCss(st.zones.bandR));
    st.stripes.forEach(function (s) { part(s.u0, Math.min(s.u1, W), s.c); });
    var k = el('em'); k.style.background = st.ink; b.appendChild(k);
    b.onclick = onclick; return b;
  }

  // ---------- bewaren ----------
  function fresh() {
    return { v: 2, sets: [], active: null, ring: 'wcu4',
      opts: { minors: true, lensText: true, topExtra: true, font: '', corner: 0.9,
        caps: { on: false, d: 40, n: 1, bg: 'set', shape: 'round' }, list: { on: false, size: 50, n: 1, bg: 'set', corner: 2.5 } } };
  }
  function load() {
    try { var j = JSON.parse(localStorage.getItem(KEY)); if (j && Array.isArray(j.sets) && j.opts) return j; } catch (e) {}
    return fresh();
  }
  var S = load(), msgs = [];
  function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} }
  function activeSet() { return S.sets.filter(function (s) { return s.id === S.active; })[0] || S.sets[0] || null; }
  function uid() { return 'x' + Math.random().toString(36).slice(2, 9); }
  function focalNum(l) { var m = String(l.focal || '').match(/\d+(?:\.\d+)?/); return m ? Number(m[0]) : 1e9; }
  function sortSet(s) { s.lenses.sort(function (a, b) { return focalNum(a) - focalNum(b) || String(a.focal).localeCompare(String(b.focal)); }); }

  // ---------- lenzen laden ----------
  function setNameFor(lens) { return String(lens.brandName || lens.brand || T('Lenzen', 'Lenses')).trim() || T('Lenzen', 'Lenses'); }
  function addLensText(text, filename) {
    var lens;
    try { lens = Engine.parseLensFile(text, filename); }
    catch (e) { msgs.push(String(e.message || e)); return; }
    if (!lens.fv.length) { msgs.push(filename + T(': er staan geen afstanden in dit bestand. Het is overgeslagen.', ': this file contains no distances. It was skipped.')); return; }
    var name = setNameFor(lens);
    var set = S.sets.filter(function (s) { return s.name.toLowerCase() === name.toLowerCase(); })[0];
    if (!set) { set = { id: uid(), name: name, styleKey: STYLE_KEYS[S.sets.length % STYLE_KEYS.length], lenses: [] }; S.sets.push(set); }
    // hetzelfde bestand opnieuw laden vervangt de oude lens, maar houdt de T-stop die je zelf invulde
    var same = set.lenses.filter(function (l) { return l.series === lens.series && String(l.focal) === String(lens.focal); })[0];
    if (same) { if (!lens.tstop && same.tstop) lens.tstop = same.tstop; lens.include = same.include; set.lenses[set.lenses.indexOf(same)] = lens; }
    else set.lenses.push(lens);
    sortSet(set);
    if (!S.active) S.active = set.id;
    return set;
  }
  function readFiles(files) {
    var list = Array.prototype.slice.call(files || []).filter(function (f) { return /\.(tl|json)$/i.test(f.name); });
    if (!list.length) { msgs.push(T('Geen .tl-bestanden gevonden.', 'No .tl files found.')); render(); return; }
    var first = null, left = list.length;
    list.forEach(function (f) {
      var r = new FileReader();
      r.onload = function () { var s = addLensText(String(r.result), f.name); if (s && !first) first = s; done(); };
      r.onerror = function () { msgs.push(f.name + T(': lezen mislukt.', ': could not be read.')); done(); };
      r.readAsText(f);
    });
    function done() { if (--left) return; if (first) S.active = first.id; save(); render(); }
  }
  // een gesleepte map doorlopen (Chrome/Safari)
  function entriesToFiles(items, cb) {
    var out = [], pending = 0, any = false;
    function walk(entry) {
      if (!entry) return;
      pending++;
      if (entry.isFile) entry.file(function (f) { out.push(f); fin(); }, fin);
      else if (entry.isDirectory) {
        var rd = entry.createReader();
        (function more() { rd.readEntries(function (es) { if (!es.length) return fin(); es.forEach(walk); more(); }, fin); })();
      } else fin();
    }
    function fin() { if (--pending === 0) cb(out); }
    for (var i = 0; i < items.length; i++) { var en = items[i].webkitGetAsEntry && items[i].webkitGetAsEntry(); if (en) { any = true; walk(en); } }
    return any;
  }

  // ---------- vellen ----------
  // de effen kleur voor lensdoppen en lenslijst: per set te kiezen, standaard de randkleur van de set
  function solidOf(set) {
    if (/^#[0-9a-f]{6}$/i.test(set.solid || '')) return set.solid;
    return Engine.normalizeStyle(styleOf(set)).zones.bandL.c[0];
  }
  // hoeken: 0 = recht (te snijden met mes en liniaal), anders de straal in mm
  function numOr(v, d) { return v === undefined || v === null || v === '' || !isFinite(Number(v)) ? d : Number(v); }
  var CAP_ROUND = { round: 100, soft: 25, square: 0 };
  var EDGES = { line: { on: true, pos: 'center', width: 0.15, color: '#8a8a8a' }, thin: { on: true, pos: 'in', width: 0.35, color: '#111111' } };
  function jobFor(set) {
    var o = S.opts, c = numOr(o.corner, 0.9);
    // rechte hoeken: dan is ook de uitsparing voor de nudge recht
    // rand om label, lensdop en lenslijst: een dunne grijze snijlijn, of een zwarte rand die op het label blijft staan
    var style = styleOf(set), ol = EDGES[o.edge];
    if (ol) { style = Object.assign({}, style); style.outline = ol; }
    return { ring: { preset: S.ring, cornerTop: c, cornerBottom: c, notchSquare: c === 0 }, style: style, name: set.name, lenses: set.lenses,
      minors: o.minors !== false, lensText: o.lensText !== false, topExtra: o.topExtra !== false,
      caps: !!o.caps.on, capD: o.caps.d, capCount: o.caps.n, capRound: CAP_ROUND[o.caps.shape] === undefined ? 100 : CAP_ROUND[o.caps.shape], capGap: 4, capBg: o.caps.bg || 'set', capColor: solidOf(set),
      lensList: { on: !!o.list.on, size: o.list.size, n: o.list.n, bg: o.list.bg, color: solidOf(set), corner: numOr(o.list.corner, 2.5) } };
  }
  function today() { var d = new Date(), p = function (n) { return (n < 10 ? '0' : '') + n; }; return LANG === 'en' ? d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()) : p(d.getDate()) + '-' + p(d.getMonth() + 1) + '-' + d.getFullYear(); }
  function pagesFor(set) { Engine.setLabelFont(S.opts.font || ''); return Engine.buildSheets(jobFor(set), { date: today() }); }
  function zlib(bytes) {
    var stream = new Blob([bytes]).stream().pipeThrough(new CompressionStream('deflate'));
    return new Response(stream).arrayBuffer().then(function (b) { return new Uint8Array(b); });
  }
  function downloadBlob(name, blob) {
    var a = el('a'); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 5000);
  }
  function safe(s) { return String(s).replace(/[^\w\-]+/g, '_').replace(/^_+|_+$/g, '') || 'labels'; }
  function makePdf(all) {
    var sets = all ? S.sets.filter(function (s) { return s.lenses.length; }) : [activeSet()].filter(Boolean);
    if (!sets.length) return;
    var pages = []; sets.forEach(function (s) { pages = pages.concat(pagesFor(s)); });
    var name = 'Pullmark_' + (all ? T('alle_sets', 'all_sets') : safe(sets[0].name)) + '.pdf';
    Engine.buildPDF(pages, all ? 'Pullmark' : sets[0].name, typeof CompressionStream !== 'undefined' ? zlib : null, null)
      .then(function (bytes) { downloadBlob(name, new Blob([bytes], { type: 'application/pdf' })); })
      .catch(function (e) { msgs.push(T('PDF maken mislukt: ', 'Making the PDF failed: ') + (e && e.message || e)); render(); });
  }
  function printNow() {
    var set = activeSet(); if (!set) return;
    $('printArea').innerHTML = pagesFor(set).map(function (p, i) { return Engine.pageSVG(p, { idPrefix: 'pr' + i }); }).join('');
    window.print();
  }

  // ---------- scherm ----------
  var raf = 0;
  function changed() { save(); if (!raf) raf = requestAnimationFrame(function () { raf = 0; renderStage(); renderTop(); }); }
  function render() { renderTop(); renderPanel(); renderStage(); }
  function ringInfo() { return RINGS.filter(function (r) { return r.key === S.ring; })[0] || RINGS[0]; }
  function renderTop() {
    var set = activeSet(), r = ringInfo();
    $('sub').textContent = T(r.nl, r.en) + (set ? '  ·  ' + set.name : '');
    $('btnLang').textContent = LANG === 'en' ? 'NL' : 'EN';
    $('btnLang').title = T('Switch to English', 'Naar Nederlands');
    $('btnPrint').textContent = T('Printen', 'Print');
    $('btnPdf').textContent = T('PDF downloaden', 'Download PDF');
    $('btnPrint').disabled = $('btnPdf').disabled = !(set && set.lenses.length);
    document.documentElement.lang = LANG;
  }
  function stepHead(n, title) { var h = el('h2'); h.appendChild(el('span', 'n', String(n))); h.appendChild(el('span', '', title)); return h; }
  function check(label, get, set) {
    var l = el('label', 'check'), c = el('input'); c.type = 'checkbox'; c.checked = !!get();
    c.onchange = function () { set(c.checked); changed(); renderPanel(); };
    l.appendChild(c); l.appendChild(document.createTextNode(label)); return l;
  }
  function numIn(get, set, min, max) {
    var i = el('input'); i.type = 'number'; i.min = min; i.max = max; i.step = 1; i.value = get();
    i.onchange = function () { var v = Math.max(min, Math.min(max, Number(i.value) || get())); i.value = v; set(v); changed(); };
    return i;
  }
  function selIn(opts, get, set) {
    var s = el('select'); opts.forEach(function (o) { var op = el('option', '', o[1]); op.value = o[0]; s.appendChild(op); });
    s.value = String(get()); s.onchange = function () { set(s.value); changed(); renderPanel(); }; return s;
  }

  function CORNERS(small, big) { return [['0', T('recht', 'straight')], [String(small), T('licht afgerond', 'slightly rounded')], [String(big), T('rond', 'round')]]; }
  function BGS() { return [['set', T('kleuren van de set', 'colors of the set')], ['white', T('wit', 'white')], ['solid', T('één effen kleur', 'one solid color')]]; }
  function renderPanel() {
    var P = $('panel'), keep = P.scrollTop, oldBox = P.querySelector('.swbox'), keepBox = oldBox ? oldBox.scrollTop : 0; P.textContent = '';
    var set = activeSet();

    // ---- 1. lenzen ----
    var s1 = el('section', 'step'); s1.appendChild(stepHead(1, T('Lenzen', 'Lenses')));
    var drop = el('div', 'drop'); drop.id = 'drop';
    drop.appendChild(el('p', '', T('Sleep je .tl-bestanden of een hele map hierheen.', 'Drag your .tl files or a whole folder here.')));
    var row = el('div', 'row center');
    var b1 = el('button', 'btn small', T('Bestanden kiezen', 'Choose files')); b1.type = 'button'; b1.onclick = function () { $('fileIn').click(); };
    var b2 = el('button', 'btn small', T('Map kiezen', 'Choose folder')); b2.type = 'button'; b2.onclick = function () { $('dirIn').click(); };
    row.appendChild(b1); row.appendChild(b2); drop.appendChild(row); s1.appendChild(drop);
    if (S.sets.length) {
      var chips = el('div', 'chips');
      S.sets.forEach(function (s) {
        var c = el('button', 'chip' + (set && s.id === set.id ? ' on' : '')); c.type = 'button';
        var dot = el('i'); dot.style.background = Engine.normalizeStyle(styleOf(s)).zones.bandL.c[0];
        c.appendChild(dot); c.appendChild(document.createTextNode(s.name)); c.appendChild(el('small', '', String(s.lenses.length)));
        c.onclick = function () { S.active = s.id; save(); render(); };
        chips.appendChild(c);
      });
      s1.appendChild(chips);
    }
    if (set) {
      var bar = el('div', 'setbar'), nm = el('input'); nm.value = set.name; nm.setAttribute('aria-label', T('Naam van de set', 'Name of the set'));
      nm.oninput = function () { set.name = nm.value || set.name; changed(); };
      nm.onchange = function () { renderPanel(); };
      var del = el('button', 'btn small', T('Set weghalen', 'Remove set')); del.type = 'button';
      del.onclick = function () { S.sets = S.sets.filter(function (s) { return s !== set; }); S.active = S.sets[0] ? S.sets[0].id : null; save(); render(); };
      bar.appendChild(nm); bar.appendChild(del); s1.appendChild(bar);
      var list = el('div');
      set.lenses.forEach(function (l) {
        var r = el('div', 'lens' + (l.include === false ? ' off' : ''));
        var c = el('input'); c.type = 'checkbox'; c.checked = l.include !== false; c.title = T('Meeprinten', 'Include on the sheet');
        c.onchange = function () { l.include = c.checked; changed(); renderPanel(); };
        var t = el('span', 't'); t.appendChild(document.createTextNode('T')); var ti = el('input'); ti.value = l.tstop || ''; ti.placeholder = '–';
        ti.setAttribute('aria-label', T('T-stop van ', 'T-stop of ') + l.focal + ' mm');
        ti.onchange = function () { l.tstop = ti.value.trim().replace(/^[TtFf]\s*/, '').replace(',', '.'); ti.value = l.tstop; changed(); };
        t.appendChild(ti);
        var x = el('button', 'x', '×'); x.type = 'button'; x.title = T('Lens weghalen', 'Remove lens');
        x.onclick = function () { set.lenses = set.lenses.filter(function (q) { return q !== l; }); save(); render(); };
        r.appendChild(c); r.appendChild(el('b', '', (l.focal || '?') + ' mm')); r.appendChild(t);
        r.appendChild(el('span', 'src', [l.series, l.unit === 'ft' ? 'ft' : 'm', l.fv.length + T(' afstanden', ' distances')].filter(Boolean).join(' · ')));
        r.appendChild(x); list.appendChild(r);
      });
      s1.appendChild(list);
    }
    if (msgs.length) {
      var mb = el('div', 'msgs'); msgs.forEach(function (m) { mb.appendChild(el('div', 'msg', m)); });
      var cl = el('button', 'linkbtn', T('Meldingen wissen', 'Clear messages')); cl.type = 'button'; cl.onclick = function () { msgs = []; renderPanel(); };
      mb.appendChild(cl); s1.appendChild(mb);
    }
    P.appendChild(s1);

    // ---- 2. ring ----
    var s2 = el('section', 'step'); s2.appendChild(stepHead(2, T('Ring', 'Ring')));
    RINGS.forEach(function (r) {
      var lab = el('label', 'ring' + (S.ring === r.key ? ' on' : '')), rb = el('input'); rb.type = 'radio'; rb.name = 'ring'; rb.checked = S.ring === r.key;
      rb.onchange = function () { S.ring = r.key; save(); render(); };
      var box = el('div'), st = el('strong', '', T(r.nl, r.en));
      st.appendChild(el('span', 'badge ' + (r.ok ? 'ok' : 'no'), r.ok ? T('nagemeten', 'verified') : T('niet nagemeten', 'not verified')));
      box.appendChild(st); box.appendChild(el('span', '', T(r.noteNl, r.noteEn)));
      lab.appendChild(rb); lab.appendChild(box); s2.appendChild(lab);
    });
    var ml = el('p', 'hint');
    ml.appendChild(document.createTextNode(T('Zelf nameten? Print het ', 'Want to check it yourself? Print the ')));
    var a = el('a', '', T('meetlabel voor de WCU-4-ring', 'calibration label for the WCU-4 ring')); a.href = 'meetlabel-wcu4-ring.pdf'; a.target = '_blank'; a.rel = 'noopener';
    ml.appendChild(a); ml.appendChild(document.createTextNode(T(' en lees af bij beide aanslagen.', ' and take a reading at both end stops.')));
    s2.appendChild(ml);
    P.appendChild(s2);

    // ---- 3. printen ----
    var s3 = el('section', 'step'); s3.appendChild(stepHead(3, T('Printen', 'Print')));
    if (set) {
      s3.appendChild(el('h3', '', T('Kleur van deze set', 'Color of this set')));
      var box = el('div', 'swbox');
      GROUPS.forEach(function (g) {
        var keys = Object.keys(ALL).filter(function (k) { return ALL[k].group === g[0]; }); if (!keys.length) return;
        box.appendChild(el('h4', '', T(g[0], g[1])));
        var sw = el('div', 'swatches');
        keys.forEach(function (k) {
          sw.appendChild(swatch(ALL[k], !set.custom && set.styleKey === k, ALL[k].label || k, function () { delete set.custom; set.styleKey = k; changed(); renderPanel(); }));
        });
        box.appendChild(sw);
      });
      s3.appendChild(box);
      // eigen kleuren: rand, links, rechts en inkt
      var cur = Engine.normalizeStyle(styleOf(set)), cu = el('div', 'custom');
      cu.appendChild(el('span', 'cl', T('Eigen kleuren', 'Your own colors')));
      [['band', T('rand', 'edge'), cur.zones.bandL.c[0]], ['left', T('links', 'left'), cur.zones.left.c[0]], ['right', T('rechts', 'right'), cur.fullFill ? cur.zones.left.c[0] : cur.zones.right.c[0]], ['ink', T('inkt', 'ink'), cur.ink]].forEach(function (q) {
        var lab = el('label'), ci = el('input'); ci.type = 'color'; ci.value = /^#[0-9a-f]{6}$/i.test(q[2]) ? q[2] : '#888888'; ci.setAttribute('data-k', q[0]);
        ci.oninput = function () {
          var c = {}; Array.prototype.forEach.call(cu.querySelectorAll('input[type=color]'), function (x) { c[x.getAttribute('data-k')] = x.value; });
          set.custom = c; changed();
        };
        ci.onchange = function () { renderPanel(); };
        lab.appendChild(ci); lab.appendChild(document.createTextNode(q[1])); cu.appendChild(lab);
      });
      s3.appendChild(cu);
    }
    var o = S.opts;
    s3.appendChild(el('h3', '', T('Op het label', 'On the label')));
    s3.appendChild(check(T('Tussenstreepjes', 'Minor ticks'), function () { return o.minors; }, function (v) { o.minors = v; }));
    s3.appendChild(check(T('Lensnaam onderaan', 'Lens name at the bottom'), function () { return o.lensText; }, function (v) { o.lensText = v; }));
    s3.appendChild(check(T('T-stop bovenaan', 'T-stop at the top'), function () { return o.topExtra; }, function (v) { o.topExtra = v; }));
    var ch = el('div', 'sub flat'); ch.appendChild(document.createTextNode(T('Hoeken', 'Corners')));
    ch.appendChild(selIn(CORNERS(0.9, 3), function () { return numOr(o.corner, 0.9); }, function (v) { o.corner = Number(v); }));
    ch.appendChild(document.createTextNode(T('Rand', 'Border')));
    ch.appendChild(selIn([['', T('geen', 'none')], ['line', T('dunne snijlijn', 'thin cut line')], ['thin', T('zwarte rand', 'black border')]],
      function () { return o.edge || ''; }, function (v) { o.edge = v; }));
    s3.appendChild(ch);
    if (EDGES[o.edge]) s3.appendChild(el('p', 'hint', o.edge === 'line'
      ? T('Een dunne grijze lijn om het label, de lensdoppen en de lenslijst. Snij op de lijn.', 'A thin grey line around the label, the lens caps and the lens list. Cut on the line.')
      : T('Een zwarte rand om het label, de lensdoppen en de lenslijst. Snij langs de buitenkant: de rand blijft op het label staan.', 'A black border around the label, the lens caps and the lens list. Cut along the outside: the border stays on the label.')));
    if (numOr(o.corner, 0.9) === 0) s3.appendChild(el('p', 'hint', T('Ook de uitsparing voor de nudge is nu recht: drie rechte sneden.', 'The cutout for the nudge is straight as well: three straight cuts.')));
    s3.appendChild(el('h3', '', T('Lettertype', 'Font')));
    var fonts = [{ key: '', label: 'Barlow', group: 'strak' }].concat(Engine.fontList());
    var fontNl = { Classic: 'Klassiek', Script: 'Sierschrift' };
    // een lettertype dat niet meer bestaat valt terug op de standaard
    var curFont = fonts.some(function (f) { return f.key === o.font; }) ? o.font : '';
    [['strak', T('Strak', 'Clean')], ['apart', T('Apart', 'Quirky')]].forEach(function (g) {
      var list = fonts.filter(function (f) { return (f.group || 'strak') === g[0]; }); if (!list.length) return;
      s3.appendChild(el('h4', 'fgroup', g[1]));
      var fl = el('div', 'fonts');
      list.forEach(function (f) {
        var b = el('button', 'fbtn' + (curFont === f.key ? ' on' : '')); b.type = 'button';
        var sm = Engine.fontSample(f.key, '0123456789', 700, 13);
        b.innerHTML = '<svg viewBox="0 -1 ' + sm.w.toFixed(1) + ' 15" width="' + sm.w.toFixed(1) + '" height="15" aria-hidden="true"><path fill="currentColor" d="' + sm.d + '"/></svg>';
        b.appendChild(el('span', '', T(fontNl[f.label] || f.label, f.label) + (f.key ? '' : T(' (standaard)', ' (default)'))));
        b.onclick = function () { o.font = f.key; changed(); renderPanel(); };
        fl.appendChild(b);
      });
      s3.appendChild(fl);
    });
    s3.appendChild(el('h3', '', T('Extra op het vel', 'Extras on the sheet')));
    s3.appendChild(check(T('Stickers voor de lensdoppen', 'Stickers for the lens caps'), function () { return o.caps.on; }, function (v) { o.caps.on = v; }));
    if (o.caps.on) {
      var c1 = el('div', 'sub'); c1.appendChild(document.createTextNode(T('Doorsnede', 'Diameter'))); c1.appendChild(numIn(function () { return o.caps.d; }, function (v) { o.caps.d = v; }, 20, 100)); c1.appendChild(document.createTextNode('mm'));
      c1.appendChild(selIn([['1', T('1 per lens', '1 per lens')], ['2', T('2 per lens', '2 per lens')]], function () { return o.caps.n; }, function (v) { o.caps.n = Number(v); }));
      s3.appendChild(c1);
      var c1s = el('div', 'sub'); c1s.appendChild(document.createTextNode(T('Vorm', 'Shape')));
      c1s.appendChild(selIn([['round', T('rond', 'round')], ['soft', T('vierkant, ronde hoeken', 'square, rounded corners')], ['square', T('vierkant, recht', 'square, straight')]],
        function () { return o.caps.shape || 'round'; }, function (v) { o.caps.shape = v; }));
      s3.appendChild(c1s);
      var c1b = el('div', 'sub'); c1b.appendChild(document.createTextNode(T('Achtergrond', 'Background')));
      c1b.appendChild(selIn(BGS(), function () { return o.caps.bg || 'set'; }, function (v) { o.caps.bg = v; }));
      s3.appendChild(c1b);
    }
    s3.appendChild(check(T('Lenslijst voor op de camera', 'Lens list for the camera'), function () { return o.list.on; }, function (v) { o.list.on = v; }));
    if (o.list.on) {
      var c2 = el('div', 'sub'); c2.appendChild(document.createTextNode(T('Zijde', 'Side'))); c2.appendChild(numIn(function () { return o.list.size; }, function (v) { o.list.size = v; }, 30, 90)); c2.appendChild(document.createTextNode('mm'));
      c2.appendChild(selIn([['1', '1×'], ['2', '2×']], function () { return o.list.n; }, function (v) { o.list.n = Number(v); }));
      s3.appendChild(c2);
      var c2s = el('div', 'sub'); c2s.appendChild(document.createTextNode(T('Hoeken', 'Corners')));
      c2s.appendChild(selIn(CORNERS(2.5, 6), function () { return numOr(o.list.corner, 2.5); }, function (v) { o.list.corner = Number(v); }));
      s3.appendChild(c2s);
      var c2b = el('div', 'sub'); c2b.appendChild(document.createTextNode(T('Achtergrond', 'Background')));
      c2b.appendChild(selIn(BGS(), function () { return o.list.bg || 'set'; }, function (v) { o.list.bg = v; }));
      s3.appendChild(c2b);
    }
    // één effen kleur voor doppen en lijst, per set te kiezen
    if (set && ((o.caps.on && o.caps.bg === 'solid') || (o.list.on && o.list.bg === 'solid'))) {
      var cs = el('div', 'sub'); cs.style.marginLeft = '0'; cs.appendChild(document.createTextNode(T('Effen kleur voor ', 'Solid color for ') + set.name));
      var ci = el('input'); ci.type = 'color'; ci.value = solidOf(set); ci.setAttribute('aria-label', T('Effen kleur', 'Solid color'));
      ci.oninput = function () { set.solid = ci.value; changed(); };
      cs.appendChild(ci); s3.appendChild(cs);
    }
    var pn = el('div', 'printnote');
    pn.appendChild(el('b', '', T('Print op 100%', 'Print at 100%')));
    pn.appendChild(document.createTextNode(T('Kies in het printvenster "Vergroot/verklein: 100%", niet "Maak passend". Meet daarna de liniaal onderaan het vel na: 0 tot 10 hoort precies 100 mm te zijn.',
      'In the print dialog choose "Scale: 100%", not "Scale to fit". Then check the ruler at the bottom of the sheet: 0 to 10 should be exactly 100 mm.')));
    s3.appendChild(pn);
    if (S.sets.length > 1) {
      var allb = el('button', 'btn small', T('PDF van alle sets', 'PDF of all sets')); allb.type = 'button'; allb.style.marginTop = '12px'; allb.onclick = function () { makePdf(true); };
      s3.appendChild(allb);
    }
    P.appendChild(s3);

    var foot = el('div', 'foot');
    var ex = el('button', 'linkbtn', T('Bibliotheek bewaren', 'Save library')); ex.type = 'button';
    ex.onclick = function () { downloadBlob('Pullmark_bibliotheek.json', new Blob([JSON.stringify(S, null, 1)], { type: 'application/json' })); };
    var im = el('button', 'linkbtn', T('Bibliotheek openen', 'Open library')); im.type = 'button'; im.onclick = function () { $('libIn').click(); };
    var rs = el('button', 'linkbtn', T('Alles wissen', 'Clear everything')); rs.type = 'button';
    rs.onclick = function () { if (!S.sets.length || confirm(T('Alle lenzen en instellingen wissen?', 'Clear all lenses and settings?'))) { S = fresh(); msgs = []; save(); render(); } };
    foot.appendChild(ex); foot.appendChild(im); foot.appendChild(rs); foot.appendChild(el('span', '', 'Pullmark ' + VERSION));
    P.appendChild(foot);
    P.scrollTop = keep;
    var newBox = P.querySelector('.swbox'); if (newBox) newBox.scrollTop = keepBox;   // de kleurenlijst blijft staan waar hij stond
    wireDrop();
  }

  function renderStage() {
    var set = activeSet(), info = $('info'), box = $('pages');
    info.textContent = ''; box.textContent = '';
    if (!set || !set.lenses.length) {
      var e = el('div', 'empty'); e.appendChild(el('h1', '', T('Begin met je lenzen', 'Start with your lenses')));
      e.appendChild(el('p', '', T('Sleep je Tilta-lensbestanden (.tl) of de hele map naar het vak links. Elke lens wordt één strook, en lenzen van hetzelfde merk komen samen in een set.',
        'Drag your Tilta lens files (.tl) or the whole folder to the box on the left. Each lens becomes one strip, and lenses of the same brand are grouped into a set.')));
      box.appendChild(e); return;
    }
    var pages;
    try { pages = pagesFor(set); }
    catch (err) { info.appendChild(el('span', 'w', T('Vellen maken mislukt: ', 'Building the sheets failed: ') + (err && err.message || err))); return; }
    var nStrip = 0, cut = [];
    pages.forEach(function (p) { (p.strips || []).forEach(function (st) {
      nStrip++;
      var l = set.lenses.filter(function (q) { return q.id === st.lensId; })[0], c = st.layout && st.layout.cut || [];
      if (l && c.length) cut.push(l.focal + ' mm: ' + c.map(function (q) { return q.text; }).join(', '));
    }); });
    info.appendChild(el('b', '', set.name));
    var nSheets = pages.filter(function (p) { return p.strips && p.strips.length; }).length, nExtra = pages.length - nSheets;
    info.appendChild(el('span', '', nStrip + (nStrip === 1 ? T(' strook', ' strip') : T(' stroken', ' strips')) + T(' op ', ' on ') + nSheets + (nSheets === 1 ? T(' vel A4', ' A4 sheet') : T(' vellen A4', ' A4 sheets'))
      + (nExtra ? T(' · lensdoppen en lenslijst op ', ' · lens caps and lens list on ') + nExtra + (nExtra === 1 ? T(' extra vel', ' extra sheet') : T(' extra vellen', ' extra sheets')) : '')));
    if (cut.length) info.appendChild(el('span', 'w', T('Valt buiten het label: ', 'Falls outside the label: ') + cut.join('  ·  ')));
    pages.forEach(function (p, i) { var d = el('div', 'sheet'); d.innerHTML = Engine.pageSVG(p, { idPrefix: 'v' + i, fluid: true }); box.appendChild(d); });
  }

  // ---------- slepen en knoppen ----------
  function wireDrop() {
    var d = $('drop'); if (!d) return;
    ['dragenter', 'dragover'].forEach(function (ev) { d.addEventListener(ev, function (e) { e.preventDefault(); d.classList.add('over'); }); });
    ['dragleave', 'drop'].forEach(function (ev) { d.addEventListener(ev, function () { d.classList.remove('over'); }); });
  }
  window.addEventListener('dragover', function (e) { e.preventDefault(); });
  window.addEventListener('drop', function (e) {
    e.preventDefault();
    var dt = e.dataTransfer; if (!dt) return;
    if (dt.items && dt.items.length && entriesToFiles(dt.items, readFiles)) return;
    readFiles(dt.files);
  });
  $('fileIn').onchange = function () { readFiles(this.files); this.value = ''; };
  $('dirIn').onchange = function () { readFiles(this.files); this.value = ''; };
  $('libIn').onchange = function () {
    var f = this.files[0]; this.value = ''; if (!f) return;
    var r = new FileReader();
    r.onload = function () {
      try { var j = JSON.parse(String(r.result)); if (!j || !Array.isArray(j.sets) || !j.opts) throw new Error(T('dit is geen Pullmark-bibliotheek', 'this is not a Pullmark library')); S = j; msgs = []; save(); render(); }
      catch (e) { msgs.push(T('Openen lukte niet: ', 'Opening failed: ') + (e.message || e)); render(); }
    };
    r.readAsText(f);
  };
  $('btnPdf').onclick = function () { makePdf(false); };
  $('btnPrint').onclick = printNow;
  $('btnLang').onclick = function () { LANG = LANG === 'en' ? 'nl' : 'en'; try { localStorage.setItem('pm2lang', LANG); } catch (e) {} Engine.setLang(LANG); render(); };

  render();

  // offline: de app bewaart zichzelf in de browser; een nieuwe versie wordt bij de volgende keer openen geladen
  if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
    var hadCtrl = !!navigator.serviceWorker.controller, reloading = false;
    navigator.serviceWorker.addEventListener('controllerchange', function () {
      if (!hadCtrl) { hadCtrl = true; return; }
      if (reloading) return; reloading = true; save(); location.reload();
    });
    navigator.serviceWorker.register('sw.js').catch(function () {});
  }
})();
