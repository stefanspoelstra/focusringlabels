// Pullmark 2 — nieuwe opzet in drie stappen: lenzen, ring, printen.
// De rekenkern (Engine) is dezelfde als in versie 1; deze laag is alleen de bediening.
(function () {
  'use strict';
  var VERSION = '2.6 · 12-11-2026';
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
  function mk(label, o, group) {
    return { label: label, group: group || 'Op de set', ink: o.ink || '#111111', bandL: o.bandL === undefined ? 1.61 : o.bandL, split: o.split === undefined ? 11.27 : o.split,
      bandR: o.bandR || 0, fullFill: !!o.full, zones: { bandL: o.band, left: o.left, right: o.right || o.left, bandR: o.bandRc || o.band }, stripes: o.stripes || [] };
  }
  // eigen stijlen met een knipoog naar de set: klapbord, kleurbalken, false color, waveform en meer
  function bars(cols, u0, w) { return cols.map(function (c, i) { return { u0: u0 + i * w, u1: u0 + (i + 1) * w, c: c }; }); }
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
    'set-greenscreen': mk('Greenscreen', { band: sol('#0d5a1a'), bandL: 1.4, bandR: 0.7, left: sol('#3ddc52'), right: sol('#2cc441'), ink: '#06210b', stripes: [{ u0: 1.7, u1: 2.0, c: '#ff8a1f' }, { u0: 2.3, u1: 2.45, c: '#ff8a1f' }] }),
    'set-tally': mk('Tally', { band: sol('#ff1a1a'), bandL: 2.2, left: sol('#141414'), right: sol('#1f1f1f'), ink: '#ffffff', stripes: [{ u0: 18.9, u1: 19.39, c: '#ff1a1a' }] }),
    'set-log': mk('Grijskaart', { band: sol('#8b8982'), bandL: 2.7, split: 11.8, left: sol('#bcbab3'), right: sol('#a8a69f'), ink: '#1f1f1f', stripes: bars(['#151515', '#7b7b78', '#f4f4f1'], 0, 0.9) })
  };
  // retro: eigen ontwerpen in de sfeer van vroeger. De strepen zitten in de rand, zodat de cijfers vrij blijven.
  function rt(label, o) { return mk(label, o, 'Retro'); }
  var RETRO = {
    'retro-70': rt('Jaren 70', { band: sol('#f6ecd6'), bandL: 3.6, split: 11.8, left: sol('#f6ecd6'), right: sol('#ecdcb8'), ink: '#3b2414', stripes: bars(['#5a3420', '#d9662b', '#e2a72e'], 0, 0.95) }),
    'retro-ijssalon': rt('IJssalon', { band: sol('#fffaf0'), bandL: 4.0, split: 11.9, left: sol('#fffaf0'), right: sol('#fdeede'), ink: '#3a2a2a', stripes: bars(['#f59bb0', '#fbbf8f', '#f7df8a', '#9fdcbb'], 0, 0.9) }),
    'retro-cassette': rt('Cassette', { band: sol('#1a1a1a'), bandL: 3.7, split: 11.9, bandR: 0.8, left: sol('#fbf6ea'), right: sol('#efe6d2'), ink: '#1a1a1a', stripes: bars(['#e23b2e', '#f28c28', '#f6c445'], 1.0, 0.9) }),
    'retro-diner': rt('Diner', { band: sol('#d8232a'), bandL: 1.5, bandR: 0.9, left: sol('#e3f6ec'), right: sol('#c5ead9'), ink: '#1c2b2a', stripes: [{ u0: 1.5, u1: 1.85, c: '#ffffff' }, { u0: 1.85, u1: 2.15, c: '#d8232a' }] }),
    'retro-surf': rt('Surf', { band: sol('#ff6f59'), bandL: 1.6, left: sol('#fff3dc'), right: sol('#8fdcd5'), ink: '#143a3a', stripes: [{ u0: 1.6, u1: 2.0, c: '#1a8f8a' }, { u0: 2.3, u1: 2.5, c: '#1a8f8a' }] }),
    'retro-sepia': rt('Sepia', { band: sol('#6b4a2b'), bandL: 1.3, full: true, left: gy([[0, '#f6ead0'], [1, '#dcc396']]), ink: '#3a2614' }),
    'retro-bakeliet': rt('Bakeliet', { band: sol('#f1dfb8'), bandL: 1.2, left: sol('#3a2317'), right: sol('#4a2d1e'), ink: '#f6e7c8', stripes: [{ u0: 1.55, u1: 1.8, c: '#c9973b' }] }),
    'retro-zonsondergang': rt('Zonsondergang', { band: sol('#2a1030'), bandL: 1.3, full: true, left: gy([[0, '#ffe29a'], [0.35, '#ffb37a'], [0.7, '#ff8fa3'], [1, '#c9a0f0']]), ink: '#2a1030' }),
    'retro-disco': rt('Disco', { band: sol('#f2c14e'), bandL: 1.4, bandR: 0.8, full: true, left: gy([[0, '#3b1466'], [1, '#8a2394']]), ink: '#ffffff' }),
    'retro-vhs': rt('Videoband', { band: sol('#16161a'), bandL: 2.4, left: sol('#16161a'), right: sol('#22222b'), ink: '#ffffff', stripes: bars(['#19c2c2', '#e0409a', '#f5d547'], 0, 0.8) }),
    'retro-arcade': rt('Speelhal', { band: sol('#ff3c6f'), bandL: 1.2, bandR: 0.8, bandRc: sol('#3fe0ff'), left: sol('#0b1030'), right: sol('#141a4a'), ink: '#ffffff', stripes: [{ u0: 1.5, u1: 1.8, c: '#ffe14d' }] }),
    'retro-amber': rt('Amber scherm', { band: sol('#ffb000'), bandL: 1.0, left: sol('#120a00'), right: sol('#1e1200'), ink: '#ffb000' })
  };
  // nieuwe stijlen in dezelfde opzet als de retroset: één helder idee per stijl, een klein palet en strepen in de rand
  function nw(group, label, o) { return mk(label, o, group); }
  var MORE = {
    // rustig: weinig inkt, alle aandacht naar de cijfers
    'rustig-kantlijn': nw('Rustig', 'Kantlijn', { band: sol('#ffffff'), bandL: 0, left: sol('#ffffff'), right: sol('#fbfaf6'), ink: '#16181b', stripes: [{ u0: 1.0, u1: 1.22, c: '#e23b2e' }] }),
    'rustig-potlood': nw('Rustig', 'Potlood', { band: sol('#b4b8bd'), bandL: 1.0, left: sol('#fafafa'), right: sol('#eff0f2'), ink: '#3a3e45' }),
    // donker: de drie bestaande stijlen krijgen een bies, net als de nieuwe
    'nacht': nw('Donker', 'Nacht', { band: sol('#22d3ee'), bandL: 1.3, left: sol('#0f1b2d'), right: sol('#1d3557'), ink: '#ffffff', stripes: [{ u0: 1.6, u1: 1.85, c: '#f4f1de' }] }),
    'grafiet': nw('Donker', 'Grafiet', { band: sol('#ffb000'), bandL: 1.3, left: sol('#1f1f1f'), right: sol('#363636'), ink: '#ffffff', stripes: [{ u0: 1.6, u1: 1.85, c: '#ffe9b0' }] }),
    'bordeaux': nw('Donker', 'Bordeaux', { band: sol('#ff6f91'), bandL: 1.3, left: sol('#2a0d16'), right: sol('#4a1426'), ink: '#ffffff', stripes: [{ u0: 1.6, u1: 1.85, c: '#f2c14e' }] }),
    'donker-dennen': nw('Donker', 'Dennenbos', { band: sol('#b6f09c'), bandL: 1.3, left: sol('#0f2a1d'), right: sol('#17402b'), ink: '#ffffff', stripes: [{ u0: 1.6, u1: 1.85, c: '#f2c14e' }] }),
    'donker-petrol': nw('Donker', 'Petrol', { band: sol('#ff7a59'), bandL: 1.3, left: sol('#0d3038'), right: sol('#14464f'), ink: '#ffffff', stripes: [{ u0: 1.6, u1: 1.85, c: '#f6e7c8' }] }),
    'donker-inkt': nw('Donker', 'Inkt', { band: sol('#ffffff'), bandL: 1.1, bandR: 0.6, left: sol('#0c0c0c'), right: sol('#1c1c1c'), ink: '#ffffff' }),
    // verloop: één kleurfamilie per stijl, zodat ze echt van elkaar verschillen
    'heel-lagune': nw('Verloop', 'Lagune', { band: sol('#0b3c5d'), bandL: 1.3, full: true, left: gy([[0, '#eafff5'], [0.5, '#a8e6e0'], [1, '#6fb3ee']]), ink: '#071a2b' }),
    'verloop-koraal': nw('Verloop', 'Koraal', { band: sol('#b23a48'), bandL: 1.3, full: true, left: gy([[0, '#fff1e6'], [0.5, '#ffc9b0'], [1, '#ff9a9a']]), ink: '#2a0d12' }),
    'verloop-mist': nw('Verloop', 'Ochtendmist', { band: sol('#3d4a6b'), bandL: 1.3, full: true, left: gy([[0, '#f6f8fc'], [0.5, '#dbe5f3'], [1, '#cfcdee']]), ink: '#1b2238' }),
    // natuur
    'natuur-woestijn': nw('Natuur', 'Woestijn', { band: sol('#8a4b2a'), bandL: 1.4, full: true, left: gy([[0, '#fcebc9'], [0.5, '#f3cc90'], [1, '#e2a575']]), ink: '#3a1f10', stripes: [{ u0: 1.7, u1: 1.95, c: '#3f8f88' }] }),
    'natuur-lavendel': nw('Natuur', 'Lavendel', { band: sol('#5b4b8a'), bandL: 1.4, left: sol('#f5f1fc'), right: sol('#dcd0f4'), ink: '#221a3a', stripes: [{ u0: 1.7, u1: 1.95, c: '#8fbf7f' }] })
  };
  var ALL = {};
  [Engine.STYLES, EXTRA, MORE, RETRO].forEach(function (src) { Object.keys(src).forEach(function (k) { ALL[k] = src[k]; }); });
  // bestaande stijlen een betere plek of naam geven; 'Oud' = uit de lijst gehaald, maar een set die hem al gebruikt houdt hem
  function move(k, group, label) { var st = {}; Object.keys(ALL[k]).forEach(function (q) { st[q] = ALL[k][q]; }); st.group = group; if (label) st.label = label; ALL[k] = st; }
  move('minimaal', 'Rustig'); move('hoog-contrast', 'Rustig');
  move('heel-zomer', 'Verloop', 'Zomer'); move('heel-nacht', 'Verloop', 'Schemering');
  move('jungle', 'Natuur'); move('lava', 'Natuur'); move('ijs', 'Natuur'); move('citrus', 'Natuur');
  move('holo', 'Creatief', 'Parelmoer');
  ['dubbele-rand', 'rechts-accent', 'verloop', 'zonsondergang', 'koper', 'heel-roos', 'retro', 'avondrood', 'pastel-duo'].forEach(function (k) { move(k, 'Oud'); });
  var GROUPS = [['Effen', 'Solid'], ['Rustig', 'Calm'], ['Donker', 'Dark'], ['Verloop', 'Gradient'], ['Natuur', 'Nature'], ['Creatief', 'Creative'], ['Op de set', 'On set'], ['Retro', 'Retro']];
  function customStyle(c) { return { label: 'Eigen', ink: c.ink, bandL: 1.61, split: 11.27, bandR: 0, zones: { bandL: sol(c.band), left: sol(c.left), right: sol(c.right), bandR: sol(c.band) } }; }
  // set.edit = een stijl die je zelf hebt aangepast (kleurvlakken, verloop, strepen); anders de gekozen stijl uit de lijst
  function styleOf(set) { return set.edit || (set.custom ? customStyle(set.custom) : (ALL[set.styleKey] || ALL[STYLE_KEYS[0]])); }
  function editStyle(set) {
    if (!set.edit) {
      var n = Engine.normalizeStyle(styleOf(set));
      set.edit = { label: 'Eigen', ink: n.ink, bandL: n.bandL, split: n.split, bandR: n.bandR, fullFill: n.fullFill,
        zones: JSON.parse(JSON.stringify(n.zones)), stripes: JSON.parse(JSON.stringify(n.stripes)) };
      delete set.custom;
    }
    return set.edit;
  }
  function mixHex(a, b) {
    var x = parseInt(a.slice(1), 16), y = parseInt(b.slice(1), 16), o = '#';
    [16, 8, 0].forEach(function (sh) { var v = Math.round((((x >> sh) & 255) + ((y >> sh) & 255)) / 2).toString(16); o += v.length < 2 ? '0' + v : v; });
    return o;
  }
  // een kleurvlak lezen en schrijven als: soort (effen of verloop) met twee kleuren
  function zoneGet(z) { return { mode: z.mode, a: z.c[0], b: z.mode === 'y' ? z.c[2] : z.mode === 'x' ? z.c[1] : z.c[3] }; }
  function zoneSet(mode, a, b) {
    if (mode === 'y') return { mode: 'y', c: [a, a, b, b] };
    if (mode === 'x') return { mode: 'x', c: [a, b, a, b] };
    if (mode === 'xy') { var m = mixHex(a, b); return { mode: 'xy', c: [a, m, m, b] }; }
    return { mode: 'solid', c: [a, a, a, a] };
  }
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
  // welke kopjes open staan
  var UI = { open: { kleur: true } };
  try { var u0 = JSON.parse(localStorage.getItem('pm2ui')); if (u0 && u0.open) UI = u0; } catch (e) {}
  function saveUI() { try { localStorage.setItem('pm2ui', JSON.stringify(UI)); } catch (e) {} }
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
  // lensdoppen even breed als de lenslijst: n stickers naast elkaar (met 4 mm ertussen) zijn samen precies zo breed
  // als het kaartje, zodat ook de rechterrand in één snede meegaat. 0 = eigen maat.
  var CAP_GAP = 4;
  function listSize() { return Math.max(30, Math.min(90, Number(S.opts.list.size) || 50)); }
  function fitD(n) { return Math.round((listSize() - (n - 1) * CAP_GAP) / n * 100) / 100; }
  function capFit() {
    var o = S.opts, f = o.caps.fit === undefined ? '2' : String(o.caps.fit);
    if (!o.list.on || f === 'own') return 0;
    var n = Number(f); return n >= 1 && n <= 3 && fitD(n) >= 15 ? n : 0;
  }
  function capSize() { var n = capFit(); return n ? fitD(n) : S.opts.caps.d; }
  // vorm van het label: hoeken boven en onder apart, en de uitsparing voor de nudge rond of recht
  function shape() {
    var o = S.opts, c = numOr(o.corner, 0.9);
    return { top: numOr(o.cornerTop, c), bottom: numOr(o.cornerBottom, c), square: o.notch ? o.notch === 'square' : c === 0 };
  }
  // rand van lensdoppen of lenslijst: zoals het label (undefined), een eigen kleur, of geen rand (false)
  function ownEdge(q) {
    if (q.edge === 'none') return false;
    if (q.edge !== 'own') return undefined;
    var e = edge() || {};
    return { on: true, pos: e.pos && e.color !== '#8a8a8a' ? e.pos : 'in', width: numOr(S.opts.edgeW, 0.35), color: /^#[0-9a-f]{6}$/i.test(q.edgeColor || '') ? q.edgeColor : '#111111' };
  }
  function edgeRow(q, label) {
    var r = el('div', 'sub'); r.appendChild(document.createTextNode(T('Rand', 'Border')));
    r.appendChild(selIn([['same', T('zoals het label', 'same as the label')], ['own', T('eigen kleur', 'own color')], ['none', T('geen rand', 'no border')]],
      function () { return q.edge === 'own' || q.edge === 'none' ? q.edge : 'same'; }, function (v) { q.edge = v; }));
    if (q.edge === 'own') r.appendChild(colorIn(function () { return q.edgeColor || '#111111'; }, function (v) { q.edgeColor = v; }, label));
    return r;
  }
  function edge() {
    var o = S.opts;
    if (o.edge === 'line') return { on: true, pos: 'center', width: 0.15, color: '#8a8a8a' };
    if (o.edge === 'thin') return { on: true, pos: ['in', 'center', 'out'].indexOf(o.edgePos) > -1 ? o.edgePos : 'in', width: numOr(o.edgeW, 0.35), color: /^#[0-9a-f]{6}$/i.test(o.edgeColor || '') ? o.edgeColor : '#111111' };
    return null;
  }
  function jobFor(set) {
    var o = S.opts, f = shape();
    // rand om label, lensdop en lenslijst: een dunne grijze snijlijn, of een rand die op het label blijft staan
    var style = styleOf(set), ol = edge();
    if (ol) { style = Object.assign({}, style); style.outline = ol; }
    return { ring: { preset: S.ring, cornerTop: f.top, cornerBottom: f.bottom, notchSquare: f.square }, style: style, name: set.name, lenses: set.lenses,
      minors: o.minors !== false, lensText: o.lensText !== false, topExtra: o.topExtra !== false, lineScale: numOr(o.lineScale, 1),
      caps: !!o.caps.on, capD: capSize(), capCount: o.caps.n, capRound: CAP_ROUND[o.caps.shape] === undefined ? 100 : CAP_ROUND[o.caps.shape], capGap: CAP_GAP, capBg: o.caps.bg || 'set', capColor: solidOf(set), capOutline: ownEdge(o.caps),
      lensList: { on: !!o.list.on, size: o.list.size, n: o.list.n, bg: o.list.bg, color: solidOf(set), corner: numOr(o.list.corner, 2.5), outline: ownEdge(o.list) } };
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
  // ---------- snijmachine (Cricut) ----------
  // De opdracht voor de snijmachine: randen staan binnen de snijlijn, en de dunne grijze snijlijn vervalt (de machine snijdt zelf).
  var PTC = { w: 183, h: 269.8 };   // snijvlak van Print Then Cut op A4, in mm
  function cutJob(set) {
    var j = jobFor(set), o = S.opts;
    function inside(q) { if (!q || q.on === false) return q; var r = {}; Object.keys(q).forEach(function (k) { r[k] = q[k]; }); r.pos = 'in'; return r; }
    j.style = Object.assign({}, j.style);
    if (o.edge === 'line') delete j.style.outline; else if (j.style.outline) j.style.outline = inside(j.style.outline);
    if (j.capOutline) j.capOutline = inside(j.capOutline);
    j.lensList = Object.assign({}, j.lensList); if (j.lensList.outline) j.lensList.outline = inside(j.lensList.outline);
    return j;
  }
  // hoeveel stroken naast elkaar in één afbeelding: weinig, want een hoge afbeelding mag bij Print Then Cut niet ook breed zijn
  function cutPer() { var n = Number(S.opts.cutPer); return n >= 1 && n <= 6 ? Math.floor(n) : 5; }
  function cutSheets(set) {
    Engine.setLabelFont(S.opts.font || '');
    var W = Engine.ringFor({ preset: S.ring }).W, pitch = W >= 19 ? Engine.PAGE.pitch : Math.max(W + 7, 12);
    return Engine.buildCutSheets(cutJob(set), { ruler: S.opts.cutRuler !== false, maxH: PTC.h, maxW: (cutPer() - 1) * pitch + W + 0.1 });
  }
  function cm(v) { var t = (Math.round(v * 10) / 100).toFixed(2); return LANG === 'en' ? t : t.replace('.', ','); }
  function cutExport() {
    var set = activeSet(); if (!set) return;
    var sheets = cutSheets(set), i = 0;
    (function next() {
      if (i >= sheets.length) return;
      var sh = sheets[i], w = sh.box[2], h = sh.box[3];
      // zo scherp als kan, binnen wat elke browser als afbeelding aankan
      var dpi = Math.min(600, Math.floor(Math.sqrt(16e6 / ((w / 25.4) * (h / 25.4)))));
      var pw = Math.round(w / 25.4 * dpi), ph = Math.round(h / 25.4 * dpi);
      var svg = Engine.pageSVG({ items: sh.items }, { viewBox: sh.box, size: [pw, ph], background: false, idPrefix: 'cx' + i });
      var url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' })), img = new Image();
      var name = 'Pullmark_' + safe(set.name) + '_Cricut_' + (i + 1) + '_' + T('hoogte', 'height') + '-' + (Math.round(h * 10) / 100).toFixed(2) + 'cm.png';
      img.onload = function () {
        var c = document.createElement('canvas'); c.width = pw; c.height = ph; c.getContext('2d').drawImage(img, 0, 0, pw, ph); URL.revokeObjectURL(url);
        c.toBlob(function (b) {
          if (!b) { msgs.push(T('De afbeelding voor de Cricut maken mislukte.', 'Making the image for the Cricut failed.')); render(); return; }
          downloadBlob(name, b); i++; setTimeout(next, 500);
        }, 'image/png');
      };
      img.onerror = function () { URL.revokeObjectURL(url); msgs.push(T('De afbeelding voor de Cricut maken mislukte.', 'Making the image for the Cricut failed.')); render(); };
      img.src = url;
    })();
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
  // schuif met de waarde erachter; tijdens het slepen wordt alleen het vel opnieuw getekend
  function slider(label, get, set, min, max, step, fmtv) {
    var r = el('label', 'slide'), i = el('input'), out = el('output');
    i.type = 'range'; i.min = min; i.max = max; i.step = step; i.value = get();
    var show = function () { out.textContent = fmtv ? fmtv(Number(i.value)) : mm(Number(i.value)); }; show();
    i.oninput = function () { set(Number(i.value)); show(); changed(); };
    r.appendChild(el('span', '', label)); r.appendChild(i); r.appendChild(out); return r;
  }
  function mm(v) { var t = (Math.round(v * 100) / 100).toFixed(v % 1 && Math.round(v * 10) !== v * 10 ? 2 : 1); return (LANG === 'en' ? t : t.replace('.', ',')) + ' mm'; }
  function colorIn(get, set, label) {
    var c = el('input'); c.type = 'color'; c.value = /^#[0-9a-f]{6}$/i.test(get() || '') ? get() : '#888888'; if (label) c.setAttribute('aria-label', label);
    c.oninput = function () { set(c.value); changed(); }; return c;
  }
  // inklapbaar kopje; onthoudt of het open staat
  function group(parent, id, title, val) {
    var d = el('details', 'grp'), sm = el('summary'); d.open = !!UI.open[id];
    sm.appendChild(el('span', '', title)); if (val) sm.appendChild(el('small', '', val));
    d.appendChild(sm); d.addEventListener('toggle', function () { if (UI.open[id] !== d.open) { UI.open[id] = d.open; saveUI(); } });
    var b = el('div', 'gbody'); d.appendChild(b); parent.appendChild(d); return b;
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

    // ---- 3. opmaak ----
    var o = S.opts, s3 = el('section', 'step'); s3.appendChild(stepHead(3, T('Opmaak', 'Design')));
    var g;
    if (set) {
      var cur = Engine.normalizeStyle(styleOf(set)), own = !!(set.edit || set.custom);
      // kleur
      g = group(s3, 'kleur', T('Kleur', 'Color'), own ? T('eigen', 'custom') : (cur.label || ''));
      var box = el('div', 'swbox');
      GROUPS.forEach(function (gr) {
        var keys = Object.keys(ALL).filter(function (k) { return ALL[k].group === gr[0]; }); if (!keys.length) return;
        box.appendChild(el('h4', '', T(gr[0], gr[1])));
        var sw = el('div', 'swatches');
        keys.forEach(function (k) {
          sw.appendChild(swatch(ALL[k], !own && set.styleKey === k, ALL[k].label || k, function () { delete set.custom; delete set.edit; set.styleKey = k; changed(); renderPanel(); }));
        });
        box.appendChild(sw);
      });
      g.appendChild(box);
      var ik = el('div', 'sub flat'); ik.appendChild(document.createTextNode(T('Inkt voor cijfers en streepjes', 'Ink for numbers and ticks')));
      ik.appendChild(colorIn(function () { return cur.ink; }, function (v) { editStyle(set).ink = v; }, T('Inktkleur', 'Ink color')));
      g.appendChild(ik);
      if (own) g.appendChild(el('p', 'hint', T('Je hebt deze stijl zelf aangepast. Klik op een kleur hierboven om opnieuw te beginnen.', 'You changed this style yourself. Click a color above to start over.')));

      // kleurvlakken en verloop
      g = group(s3, 'vlakken', T('Kleurvlakken en verloop', 'Color areas and gradient'));
      g.appendChild(check(T('Eén vlak over het hele label', 'One area across the whole label'), function () { return cur.fullFill; }, function (v) { editStyle(set).fullFill = v; }));
      var MODES = [['solid', T('effen', 'solid')], ['y', T('verloop boven → onder', 'gradient top → bottom')], ['x', T('verloop links → rechts', 'gradient left → right')], ['xy', T('verloop schuin', 'diagonal gradient')]];
      [['bandL', T('Rand links', 'Left edge')], ['left', cur.fullFill ? T('Vlak', 'Area') : T('Links', 'Left')], ['right', T('Rechts', 'Right')], ['bandR', T('Rand rechts', 'Right edge')]].forEach(function (zq) {
        if (zq[0] === 'right' && cur.fullFill) return;
        var z = zoneGet(cur.zones[zq[0]]), row = el('div', 'zone');
        var put = function (mode, a, b2) { editStyle(set).zones[zq[0]] = zoneSet(mode, a, b2); };
        row.appendChild(el('span', '', zq[1]));
        row.appendChild(selIn(MODES, function () { return z.mode; }, function (v) { put(v, z.a, z.mode === 'solid' ? z.a : z.b); }));
        row.appendChild(colorIn(function () { return z.a; }, function (v) { z.a = v; put(z.mode, z.a, z.mode === 'solid' ? z.a : z.b); }, zq[1]));
        if (z.mode !== 'solid') {
          row.appendChild(colorIn(function () { return z.b; }, function (v) { z.b = v; put(z.mode, z.a, z.b); }, zq[1] + ' 2'));
          var flip = el('button', 'linkbtn', T('omkeren', 'flip')); flip.type = 'button';
          flip.onclick = function () { put(z.mode, z.b, z.a); changed(); renderPanel(); };
          row.appendChild(flip);
        }
        g.appendChild(row);
      });
      g.appendChild(slider(T('Breedte rand links', 'Left edge width'), function () { return cur.bandL; }, function (v) { editStyle(set).bandL = v; }, 0, 6, 0.1));
      if (!cur.fullFill) g.appendChild(slider(T('Grens links / rechts', 'Left / right boundary'), function () { return cur.split; }, function (v) { editStyle(set).split = v; }, 3, 17, 0.1));
      g.appendChild(slider(T('Breedte rand rechts', 'Right edge width'), function () { return cur.bandR; }, function (v) { editStyle(set).bandR = v; }, 0, 6, 0.1));

      // sierstrepen
      g = group(s3, 'strepen', T('Sierstrepen', 'Stripes'), cur.stripes.length ? String(cur.stripes.length) : '');
      g.appendChild(el('p', 'hint', T('Smalle strepen over de hele lengte, gemeten vanaf de linkerrand.', 'Narrow stripes along the full length, measured from the left edge.')));
      cur.stripes.forEach(function (sp, si) {
        var row = el('div', 'zone'), st = function () { return editStyle(set).stripes[si]; };
        var p1 = el('input'); p1.type = 'number'; p1.min = 0; p1.max = 19; p1.step = 0.1; p1.value = Math.round(sp.u0 * 100) / 100; p1.setAttribute('aria-label', T('Vanaf links (mm)', 'From the left (mm)'));
        var p2 = el('input'); p2.type = 'number'; p2.min = 0.1; p2.max = 6; p2.step = 0.1; p2.value = Math.round((sp.u1 - sp.u0) * 100) / 100; p2.setAttribute('aria-label', T('Breedte (mm)', 'Width (mm)'));
        var upd = function () { var a = Math.max(0, Number(p1.value) || 0), w = Math.max(0.1, Number(p2.value) || 0.3), q = st(); q.u0 = a; q.u1 = a + w; changed(); };
        p1.oninput = upd; p2.oninput = upd;
        var x = el('button', 'x', '×'); x.type = 'button'; x.title = T('Streep weghalen', 'Remove stripe');
        x.onclick = function () { editStyle(set).stripes.splice(si, 1); changed(); renderPanel(); };
        row.appendChild(el('span', '', T('vanaf', 'from'))); row.appendChild(p1); row.appendChild(el('span', '', T('breed', 'wide'))); row.appendChild(p2);
        row.appendChild(colorIn(function () { return sp.c; }, function (v) { st().c = v; }, T('Kleur van de streep', 'Stripe color'))); row.appendChild(x);
        g.appendChild(row);
      });
      if (cur.stripes.length < 8) {
        var add = el('button', 'btn small', T('+ Streep', '+ Stripe')); add.type = 'button';
        add.onclick = function () { var e = editStyle(set); e.stripes.push({ u0: 0.6 + e.stripes.length * 0.6, u1: 0.9 + e.stripes.length * 0.6, c: cur.ink }); changed(); renderPanel(); };
        g.appendChild(add);
      }
    }

    // lettertype
    var fonts = [{ key: '', label: 'Barlow', group: 'strak' }].concat(Engine.fontList());
    var fontNl = { Classic: 'Klassiek', Script: 'Sierschrift' };
    // een lettertype dat niet meer bestaat valt terug op de standaard
    var curFont = fonts.some(function (f) { return f.key === o.font; }) ? o.font : '';
    var cf = fonts.filter(function (f) { return f.key === curFont; })[0];
    g = group(s3, 'letter', T('Lettertype', 'Font'), T(fontNl[cf.label] || cf.label, cf.label));
    [['strak', T('Strak', 'Clean')], ['apart', T('Apart', 'Quirky')]].forEach(function (gr) {
      var list = fonts.filter(function (f) { return (f.group || 'strak') === gr[0]; }); if (!list.length) return;
      g.appendChild(el('h4', 'fgroup', gr[1]));
      var fl = el('div', 'fonts');
      list.forEach(function (f) {
        var b = el('button', 'fbtn' + (curFont === f.key ? ' on' : '')); b.type = 'button';
        var sm = Engine.fontSample(f.key, '0123456789', 700, 13);
        b.innerHTML = '<svg viewBox="0 -1 ' + sm.w.toFixed(1) + ' 15" width="' + sm.w.toFixed(1) + '" height="15" aria-hidden="true"><path fill="currentColor" d="' + sm.d + '"/></svg>';
        b.appendChild(el('span', '', T(fontNl[f.label] || f.label, f.label) + (f.key ? '' : T(' (standaard)', ' (default)'))));
        b.onclick = function () { o.font = f.key; changed(); renderPanel(); };
        fl.appendChild(b);
      });
      g.appendChild(fl);
    });

    // schaal en tekst
    g = group(s3, 'schaal', T('Schaal en tekst', 'Scale and text'));
    g.appendChild(check(T('Tussenstreepjes', 'Minor ticks'), function () { return o.minors; }, function (v) { o.minors = v; }));
    g.appendChild(check(T('Lensnaam onderaan', 'Lens name at the bottom'), function () { return o.lensText; }, function (v) { o.lensText = v; }));
    g.appendChild(check(T('T-stop bovenaan', 'T-stop at the top'), function () { return o.topExtra; }, function (v) { o.topExtra = v; }));
    g.appendChild(slider(T('Lijndikte van de streepjes', 'Thickness of the ticks'), function () { return numOr(o.lineScale, 1); }, function (v) { o.lineScale = v; }, 0.4, 2.4, 0.05, function (v) { return mm(0.5 * v); }));

    // vorm
    var f = shape();
    g = group(s3, 'vorm', T('Vorm van het label', 'Shape of the label'));
    g.appendChild(slider(T('Hoeken boven', 'Top corners'), function () { return f.top; }, function (v) { o.cornerTop = v; }, 0, 6, 0.1, function (v) { return v ? mm(v) : T('recht', 'straight'); }));
    g.appendChild(slider(T('Hoeken onder', 'Bottom corners'), function () { return f.bottom; }, function (v) { o.cornerBottom = v; }, 0, 9.5, 0.1, function (v) { return v ? mm(v) : T('recht', 'straight'); }));
    var nt = el('div', 'sub flat'); nt.appendChild(document.createTextNode(T('Uitsparing voor de nudge', 'Cutout for the nudge')));
    nt.appendChild(selIn([['round', T('rond', 'round')], ['square', T('recht', 'straight')]], function () { return f.square ? 'square' : 'round'; }, function (v) { o.notch = v; }));
    g.appendChild(nt);
    g.appendChild(el('p', 'hint', T('Niets om rondingen te snijden? Zet beide hoeken op 0 en de uitsparing op recht: dan zijn het alleen rechte sneden.', 'Nothing to cut curves with? Set both corners to 0 and the cutout to straight: then every cut is straight.')));

    // rand
    g = group(s3, 'rand', T('Rand om het label', 'Border around the label'), o.edge === 'line' ? T('snijlijn', 'cut line') : o.edge === 'thin' ? T('rand', 'border') : T('geen', 'none'));
    var ed = el('div', 'sub flat'); ed.appendChild(document.createTextNode(T('Rand', 'Border')));
    ed.appendChild(selIn([['', T('geen', 'none')], ['line', T('dunne snijlijn', 'thin cut line')], ['thin', T('rand in kleur', 'colored border')]], function () { return o.edge === 'line' || o.edge === 'thin' ? o.edge : ''; }, function (v) { o.edge = v; }));
    g.appendChild(ed);
    if (o.edge === 'thin') {
      g.appendChild(slider(T('Lijndikte', 'Thickness'), function () { return numOr(o.edgeW, 0.35); }, function (v) { o.edgeW = v; }, 0.1, 2, 0.05, function (v) { return mm(v); }));
      var e2 = el('div', 'sub flat'); e2.appendChild(document.createTextNode(T('Kleur', 'Color')));
      e2.appendChild(colorIn(function () { return o.edgeColor || '#111111'; }, function (v) { o.edgeColor = v; }, T('Kleur van de rand', 'Border color')));
      e2.appendChild(document.createTextNode(T('Plaats', 'Position')));
      e2.appendChild(selIn([['in', T('binnen de snijlijn', 'inside the cut line')], ['center', T('op de snijlijn', 'on the cut line')], ['out', T('buiten de snijlijn', 'outside the cut line')]], function () { return o.edgePos || 'in'; }, function (v) { o.edgePos = v; }));
      g.appendChild(e2);
    }
    if (o.edge) g.appendChild(el('p', 'hint', o.edge === 'line'
      ? T('Een dunne grijze lijn om het label, de lensdoppen en de lenslijst. Snij op de lijn.', 'A thin grey line around the label, the lens caps and the lens list. Cut on the line.')
      : T('De rand komt om het label, de lensdoppen en de lenslijst. Bij Lensdoppen en Lenslijst kun je daar een eigen kleur voor kiezen.', 'The border goes around the label, the lens caps and the lens list. Under Lens caps and Lens list you can pick a separate color.')));

    // lensdoppen
    g = group(s3, 'doppen', T('Lensdoppen', 'Lens caps'), o.caps.on ? T('aan', 'on') : T('uit', 'off'));
    g.appendChild(check(T('Stickers voor de lensdoppen', 'Stickers for the lens caps'), function () { return o.caps.on; }, function (v) { o.caps.on = v; }));
    if (o.caps.on) {
      var fitN = capFit(), c1 = el('div', 'sub');
      if (o.list.on) {
        // maat: gelijk met de lenslijst (standaard) of een eigen maat
        var fo = [];
        [1, 2, 3].forEach(function (n) {
          var d = fitD(n); if (d < 15) return;
          fo.push([String(n), (n === 1 ? T('even breed als de lijst', 'as wide as the list') : n + T(' naast elkaar, gelijk met de lijst', ' side by side, flush with the list')) + ' (' + mm(d) + ')']);
        });
        fo.push(['own', T('eigen maat', 'own size')]);
        var c0 = el('div', 'sub'); c0.appendChild(document.createTextNode(T('Maat', 'Size')));
        c0.appendChild(selIn(fo, function () { return fitN ? String(fitN) : 'own'; }, function (v) { o.caps.fit = v; }));
        g.appendChild(c0);
      }
      if (!fitN) { c1.appendChild(document.createTextNode(T('Doorsnede', 'Diameter'))); c1.appendChild(numIn(function () { return o.caps.d; }, function (v) { o.caps.d = v; }, 20, 100)); c1.appendChild(document.createTextNode('mm')); }
      c1.appendChild(selIn([['1', T('1 per lens', '1 per lens')], ['2', T('2 per lens', '2 per lens')]], function () { return o.caps.n; }, function (v) { o.caps.n = Number(v); }));
      g.appendChild(c1);
      var c1s = el('div', 'sub'); c1s.appendChild(document.createTextNode(T('Vorm', 'Shape')));
      c1s.appendChild(selIn([['round', T('rond', 'round')], ['soft', T('vierkant, ronde hoeken', 'square, rounded corners')], ['square', T('vierkant, recht', 'square, straight')]],
        function () { return o.caps.shape || 'round'; }, function (v) { o.caps.shape = v; }));
      g.appendChild(c1s);
      var c1b = el('div', 'sub'); c1b.appendChild(document.createTextNode(T('Achtergrond', 'Background')));
      c1b.appendChild(selIn(BGS(), function () { return o.caps.bg || 'set'; }, function (v) { o.caps.bg = v; }));
      if (set && o.caps.bg === 'solid') c1b.appendChild(colorIn(function () { return solidOf(set); }, function (v) { set.solid = v; }, T('Effen kleur', 'Solid color')));
      g.appendChild(c1b);
      g.appendChild(edgeRow(o.caps, T('Kleur van de rand om de lensdoppen', 'Border color of the lens caps')));
    }

    // lenslijst
    g = group(s3, 'lijst', T('Lenslijst voor op de camera', 'Lens list for the camera'), o.list.on ? T('aan', 'on') : T('uit', 'off'));
    g.appendChild(check(T('Lenslijst meeprinten', 'Print the lens list'), function () { return o.list.on; }, function (v) { o.list.on = v; }));
    if (o.list.on) {
      var c2 = el('div', 'sub'); c2.appendChild(document.createTextNode(T('Zijde', 'Side'))); c2.appendChild(numIn(function () { return o.list.size; }, function (v) { o.list.size = v; setTimeout(renderPanel, 0); }, 30, 90)); c2.appendChild(document.createTextNode('mm'));
      c2.appendChild(selIn([['1', '1×'], ['2', '2×']], function () { return o.list.n; }, function (v) { o.list.n = Number(v); }));
      g.appendChild(c2);
      var c2s = el('div', 'sub'); c2s.appendChild(document.createTextNode(T('Hoeken', 'Corners')));
      c2s.appendChild(selIn(CORNERS(2.5, 6), function () { return numOr(o.list.corner, 2.5); }, function (v) { o.list.corner = Number(v); }));
      g.appendChild(c2s);
      var c2b = el('div', 'sub'); c2b.appendChild(document.createTextNode(T('Achtergrond', 'Background')));
      c2b.appendChild(selIn(BGS(), function () { return o.list.bg || 'set'; }, function (v) { o.list.bg = v; }));
      if (set && o.list.bg === 'solid') c2b.appendChild(colorIn(function () { return solidOf(set); }, function (v) { set.solid = v; }, T('Effen kleur', 'Solid color')));
      g.appendChild(c2b);
      g.appendChild(edgeRow(o.list, T('Kleur van de rand om de lenslijst', 'Border color of the lens list')));
    }
    P.appendChild(s3);

    // ---- 4. printen ----
    var s4 = el('section', 'step'); s4.appendChild(stepHead(4, T('Printen', 'Print')));
    var pn = el('div', 'printnote');
    pn.appendChild(el('b', '', T('Print op 100%', 'Print at 100%')));
    pn.appendChild(document.createTextNode(T('Kies in het printvenster "Vergroot/verklein: 100%", niet "Maak passend". Meet daarna de liniaal onderaan het vel na: 0 tot 10 hoort precies 100 mm te zijn.',
      'In the print dialog choose "Scale: 100%", not "Scale to fit". Then check the ruler at the bottom of the sheet: 0 to 10 should be exactly 100 mm.')));
    s4.appendChild(pn);
    var prow = el('div', 'row'); prow.style.marginTop = '12px';
    var ready = !!(set && set.lenses.length);
    var bp = el('button', 'btn small', T('Printen', 'Print')); bp.type = 'button'; bp.disabled = !ready; bp.onclick = printNow;
    var bd = el('button', 'btn small primary', T('PDF downloaden', 'Download PDF')); bd.type = 'button'; bd.disabled = !ready; bd.onclick = function () { makePdf(false); };
    prow.appendChild(bp); prow.appendChild(bd);
    if (S.sets.length > 1) { var allb = el('button', 'btn small', T('PDF van alle sets', 'PDF of all sets')); allb.type = 'button'; allb.onclick = function () { makePdf(true); }; prow.appendChild(allb); }
    s4.appendChild(prow);
    // snijmachine
    if (ready) {
      var gc = group(s4, 'cricut', T('Snijden met een Cricut', 'Cutting with a Cricut'));
      gc.appendChild(el('p', 'hint', T('Een Cricut snijdt alleen wat je vanuit zijn eigen programma (Design Space) print. Daarvoor maakt Pullmark een afbeelding van alleen de labels, met een doorzichtige achtergrond. De Cricut snijdt langs de rand van elk label.',
        'A Cricut only cuts what you print from its own software (Design Space). For that, Pullmark makes an image of just the labels, with a transparent background. The Cricut cuts along the edge of each label.')));
      gc.appendChild(check(T('Maatstrook meesturen, om de schaal na te meten', 'Include a ruler strip, to check the scale'), function () { return S.opts.cutRuler !== false; }, function (v) { S.opts.cutRuler = v; }));
      var cp = el('div', 'sub flat'); cp.appendChild(document.createTextNode(T('Stroken per afbeelding', 'Strips per image')));
      cp.appendChild(selIn([['6', '6'], ['5', '5'], ['4', '4'], ['3', '3'], ['2', '2']], function () { return String(cutPer()); }, function (v) { S.opts.cutPer = Number(v); }));
      gc.appendChild(cp);
      gc.appendChild(el('p', 'hint', T('Het snijvlak van de Cricut is in de hoeken kleiner, omdat daar de markeringen staan. Een hoge afbeelding mag daarom niet te breed zijn. Zegt Design Space dat een afbeelding te groot is, kies hier dan minder stroken.',
        'The cutting area of the Cricut is smaller in the corners, because the marks are printed there. A tall image therefore cannot be too wide. If Design Space says an image is too large, pick fewer strips here.')));
      var sheets = cutSheets(set), ul = el('div', 'cutlist');
      sheets.forEach(function (sh, i) {
        var what = [sh.strips ? sh.strips + (sh.strips === 1 ? T(' strook', ' strip') : T(' stroken', ' strips')) : '', sh.caps ? sh.caps + (sh.caps === 1 ? T(' lensdop', ' lens cap') : T(' lensdoppen', ' lens caps')) : '', sh.lists ? T('lenslijst', 'lens list') : ''].filter(Boolean).join(', ');
        var row = el('div', 'cutrow'); row.appendChild(el('b', '', T('Afbeelding ', 'Image ') + (i + 1)));
        row.appendChild(el('span', '', what)); row.appendChild(el('strong', '', T('hoogte ', 'height ') + cm(sh.box[3]) + ' cm')); row.appendChild(el('span', '', T('breedte ', 'width ') + cm(sh.box[2]) + ' cm'));
        if (S.opts.cutRuler !== false && !sh.ruler) row.appendChild(el('span', 'w', T('Hier past de maatstrook niet meer onder. Meet een strook na.', 'The ruler strip does not fit below this one. Measure a strip instead.')));
        if (sh.box[2] > PTC.w + 0.05 || sh.box[3] > PTC.h + 0.05) row.appendChild(el('span', 'w', T('Te groot voor Print Then Cut op A4 (18,3 × 27,0 cm).', 'Too large for Print Then Cut on A4 (18.3 × 27.0 cm).')));
        ul.appendChild(row);
      });
      gc.appendChild(ul);
      var bc = el('button', 'btn small primary', T('Afbeelding voor Cricut downloaden', 'Download image for Cricut')); bc.type = 'button'; bc.onclick = cutExport;
      gc.appendChild(bc);
      var ol2 = el('ol', 'steps');
      [T('Open Design Space en kies Uploaden. Kies de afbeelding en bewaar hem als "Print Then Cut". De achtergrond is al doorzichtig; je hoeft niets weg te halen.', 'Open Design Space and choose Upload. Pick the image and save it as "Print Then Cut". The background is already transparent; there is nothing to remove.'),
        T('Zet de afbeelding op het werkblad. Laat het slotje dicht en vul bij Grootte de hoogte in die hierboven staat. Die maat staat ook in de bestandsnaam. Dit bepaalt of de schaal klopt.', 'Place the image on the canvas. Keep the lock closed and enter the height shown above under Size. It is also in the file name. This decides whether the scale is right.'),
        T('Meldt Design Space dat de afbeelding te groot is? Kies dan nooit "Automatisch aanpassen" (Auto-Resize): dat verkleint je labels en dan klopt de schaal niet meer. Kies hierboven minder stroken per afbeelding en exporteer opnieuw.', 'Does Design Space say the image is too large? Never choose "Auto-Resize": that shrinks your labels and the scale will be wrong. Pick fewer strips per image above and export again.'),
        T('Kies Maken en print vanuit Design Space op A4. Zet de systeemdialoog aan en print op 100%, niet passend gemaakt. Laat "afloop" (bleed) aan staan.', 'Choose Make and print from Design Space on A4. Turn on the system dialog and print at 100%, not scaled to fit. Leave "bleed" on.'),
        T('Leg het vel op de snijmat en laat de Cricut snijden.', 'Put the sheet on the cutting mat and let the Cricut cut.'),
        (sheets.length && sheets[0].ruler
          ? T('Meet de maatstrook na voor je plakt: van 0 tot 10 hoort precies 100 mm te zijn. Klopt dat niet, pas dan de hoogte in Design Space aan.', 'Measure the ruler strip before you stick anything on: 0 to 10 should be exactly 100 mm. If not, adjust the height in Design Space.')
          : T('Meet één label na voor je plakt: een strook hoort ', 'Measure one label before you stick it on: a strip should be ') + mm(Engine.ringFor({ preset: S.ring }).length) + T(' lang te zijn.', ' long.'))
      ].forEach(function (t) { ol2.appendChild(el('li', '', t)); });
      gc.appendChild(ol2);
      gc.appendChild(el('p', 'hint', T('Let op: dit is nog niet met een echte Cricut getest. Snij eerst één vel op gewoon papier.', 'Note: this has not been tested with a real Cricut yet. Cut one sheet of plain paper first.')));
    }
    P.appendChild(s4);

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
