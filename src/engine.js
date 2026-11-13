// Pullmark-rekenkern. Overgenomen uit versie 1 (index.html, v47) op 12-11-2026, met drie wijzigingen:
// afstanden in voet en inch, het gemeten profiel 'wcu4' en de kopregel op het vel.
// Pullmark (voorheen Focusringlabels) — rekenkern (geen DOM). Alle maten in mm.
// Lokale strookcoördinaten: u = dwars (0 = linkerrand), v = langs (0 = midden nudge, + naar beneden).
var Engine = (function () {
  'use strict';
  // taal van de teksten op het vel ('nl' of 'en'); de app zet dit bij het starten
  var LANG = 'nl';
  function setLang(l) { LANG = l === 'en' ? 'en' : 'nl'; }
  function say(nl, en) { return LANG === 'en' ? en : nl; }
  var RING_EN = { 'wcu4': 'WCU-4 ring on Nucleus-M II', 'tilta-nucleus': 'Tilta ARRI ring on Nucleus-M II (via ARRI adapter)', 'tilta-orig': 'Tilta ring Nucleus-M II (original)',
    'custom': 'Own ring (measure it yourself)', 'arri-wcu4': 'ARRI WCU-4 ring (own measurements)' };

  var RINGS = {
    // Eigen ring: de app levert hier geen vaste maten. Het label begint tegen de nudge (kant van ∞) en loopt rond
    // tot de andere kant van de nudge. Hoogte, lengte, schaal en ∞ meet je zelf in met het meetlabel,
    // of je meet je lenzen helemaal in met Lens inmeten. De getallen hieronder zijn alleen een begin.
    'custom': {
      label: 'Eigen ring (zelf inmeten)',
      W: 19, top: 0, length: 240, corner: 0.9,
      notch: { h: 0, depth: 0, fillet: 0 },
      mmPer1000: 24.5, offset: 30, radius: 0, endZone: 0, zeroRef: 'bottom', infMode: 'lens', circ: true, textInGap: true
    },
    // Tilta ARRI-ring: ARRI-maat ring op de Tilta ARRI-adapter van de Nucleus-M II (niet de originele Nucleus-ring).
    // Volgens Stefan: 252 mm sluit het mooist, recht; nudge 4 mm diep en 3,3 mm breed, ingang zonder afronding;
    // beste resultaat op Dulens 21 mm: schaal 24,5 en ∞ 7,2 mm vanaf het midden van de nudge.
    // Die meting legt één punt van de ring vast: motorwaarde 9707 (∞ van de Dulens 21) ligt 7,2 mm onder de nudge.
    // Elke andere lens, van elk merk, volgt daaruit met zijn eigen .tl-waarden (gecontroleerd op Dulens, ARRI en Thypoch).
    // Daarom staat ∞ hier altijd per lens (lockInf) en hoort de meting vast bij dit profiel.
    'tilta-nucleus': {
      label: 'Tilta ARRI-ring op Nucleus-M II (via ARRI-adapter)',
      W: 19.39, top: -9.48, length: 252, corner: 0.9,
      notch: { h: 1.65, depth: 4.0, fillet: 0 },
      mmPer1000: 24.5, offset: 7.2, radius: 0, endZone: 10, zeroRef: 'center', infMode: 'lens',
      anchorFv: 9707, anchorLabel: 'Dulens 21 mm', lockInf: true
    },
    // WCU-4-ring (ARRI-maat, 3D-geprint) op de Nucleus-M II. Nagemeten op 12-11-2026 met het meetlabel:
    // omtrek 254,5 mm; de ∞-aanslag (motorwaarde 10000) ligt op het midden van de nudge; schaal 24,5 mm per 1000
    // (lijn door acht afstanden van de Dulens 43 mm: 24,5 ± 0,1). Uitsparing in de ring 4,0 × 5,0 mm.
    // Het label loopt bijna rond (254 mm), zodat ook de kortste afstanden (tot 245 mm) erop passen.
    'wcu4': {
      label: 'WCU-4-ring op Nucleus-M II',
      W: 19.39, top: -8.5, length: 254, corner: 0.9,
      notch: { h: 2.0, depth: 5.0, fillet: 0 },
      mmPer1000: 24.5, offset: 0, radius: 0, endZone: 0, zeroRef: 'center', infMode: 'lens',
      anchorFv: 10000, anchorLabel: 'de ∞-aanslag', lockInf: true
    },
    // Originele Tilta-ring van de Nucleus-M II (de kleinere ring die erbij zit). Gemeten door Stefan op de Dulens 21 mm,
    // vanaf de onderkant van de nudge: ∞ 81, 2 m 102, 1,5 m 110, 0,75 m 145, 0,30 m 61 mm (rondom). Het label (11 × 225 mm)
    // begint tegen de nudge, zonder uitsparing. De schaal loopt rond de nudge door (circ = omtrek): de korte afstanden
    // komen bovenaan, tussen de nudge en ∞. Schaal = 24,5 × 225/252: hetzelfde wiel, een kleinere ring (past op alle vijf metingen).
    'tilta-orig': {
      label: 'Tilta-ring Nucleus-M II (origineel)',
      W: 11, top: 0, length: 225, corner: 0.9,
      notch: { h: 0, depth: 0, fillet: 0 },
      mmPer1000: 21.88, offset: 80.4, radius: 0, endZone: 0, zeroRef: 'bottom', infMode: 'lens',
      anchorFv: 9707, anchorLabel: 'Dulens 21 mm', lockInf: true, circ: 225, textInGap: true
    }
  };
  // Oude profielen voor de ARRI WCU-4. De app levert daar geen maten meer voor (zelf inmeten met het meetlabel);
  // dit is alleen nog een huls zodat opgeslagen profielen blijven werken: hun eigen maten staan in het profiel zelf.
  // De vorm volgt de Tilta ARRI-ring (zelfde ARRI-maat ring), zonder vaste ∞-meting.
  RINGS['arri-wcu4'] = (function (t) {
    return { label: 'ARRI WCU-4-ring (eigen maten)', W: t.W, top: t.top, length: t.length, corner: t.corner,
      notch: { h: t.notch.h, depth: t.notch.depth, fillet: t.notch.fillet },
      mmPer1000: t.mmPer1000, offset: t.offset, radius: 0, endZone: t.endZone, legacy: true };
  })(RINGS['tilta-nucleus']);

  var L = {
    rCap: 3.65, rSup: 2.3, lCap: 3.7, lSup: 2.3,
    lineMajor: 0.5, lineMinor: 0.22, lineShort: 0.25,
    tickPastBand: 3.89, labelPastBand: 4.14, leftLabelLift: 0.2,
    rightMargin: 1.0, baseGap: 0.47, lineOver: 0.25,
    gapR: 0.45, gapL: 0.5, lineClear: 0.3,
    minorGap: 2.4, minorMax: 3,
    infH: 1.52, infRight: 0.76, infGap: 1.0, infLineEnd: 0.68,
    focalCap: 4.15, focalTop: 1.8, focalShift: 0.3, tstopCap: 2.6, tstopMin: 2.2, tstopGap: 0.9, textEdge: 0.9, textBandGap: 0.5,
    nameCap: 1.55, nameRight: 0.9, nameBottom: 3.0, nameTrack: 0.35
  };

  var PAGE = { W: 210, H: 297, stripTop: 22.0, firstX: 14.8, pitch: 26.4, perPage: 7 };

  // ---------- stijlen ----------
  var ZONES = ['bandL', 'left', 'right', 'bandR'];
  function solid(c) { return { mode: 'solid', c: [c, c, c, c] }; }
  function makeStyle(label, band, left, right, ink) {
    return {
      label: label, ink: ink, bandL: 1.61, split: 11.27, bandR: 0,
      zones: { bandL: solid(band), left: solid(left), right: solid(right), bandR: solid(band) }
    };
  }
  // o: { band, left, right, ink, bandL, bandR, bandRc, split, zones }
  function S(label, group, o) {
    var st = makeStyle(label, o.band, o.left, o.right, o.ink || '#111111');
    st.group = group;
    if (o.bandL !== undefined) st.bandL = o.bandL;
    if (o.bandR !== undefined) st.bandR = o.bandR;
    if (o.split !== undefined) st.split = o.split;
    if (o.bandRc) st.zones.bandR = solid(o.bandRc);
    if (o.zones) for (var k in o.zones) st.zones[k] = o.zones[k];
    if (o.fullFill) st.fullFill = true;
    if (o.stripes) st.stripes = o.stripes.map(function (t) { return { u0: t[0], u1: t[1], c: t[2] }; });
    return st;
  }
  function yg(a, b) { return { mode: 'y', c: [a, a, b, b] }; }
  function xg(a, b) { return { mode: 'x', c: [a, b, a, b] }; }
  // verloop langs het label door meerdere kleuren, gelijk verdeeld
  function ys(list) {
    return { mode: 'y', c: [list[0], list[0], list[list.length - 1], list[list.length - 1]],
      stops: list.map(function (c, i) { return [i / (list.length - 1), c]; }) };
  }
  function xy(a, b, c, d) { return { mode: 'xy', c: [a, b, c, d] }; }
  // Volgorde = volgorde in de app. Groepen: effen (per lensset een kleur), speciaal, donker, verloop.
  var STYLES = {
    'teal-geel': S('Teal / geel', 'Effen', { band: '#0bb4ae', left: '#f5f6c7', right: '#ede834' }),
    'oranje': S('Oranje', 'Effen', { band: '#e2621b', left: '#fff4e6', right: '#ffc066' }),
    'rood': S('Rood', 'Effen', { band: '#c8102e', left: '#fff1f1', right: '#ff9f9f', ink: '#1a0606' }),
    'roze': S('Roze', 'Effen', { band: '#d43f7a', left: '#fff0f5', right: '#ffb8d2', ink: '#1a0d12' }),
    'paars': S('Paars', 'Effen', { band: '#6a3fb5', left: '#f5f0ff', right: '#cdb8ff', ink: '#140c24' }),
    'blauw': S('Blauw', 'Effen', { band: '#2259b8', left: '#eef3ff', right: '#b8d0ff', ink: '#0d1324' }),
    'mint': S('Mint', 'Effen', { band: '#10a37f', left: '#f0fbf7', right: '#a7f0d6', ink: '#062b20' }),
    'groen': S('Groen', 'Effen', { band: '#2e8b3e', left: '#f0f8ec', right: '#bfe3a6', ink: '#0f1a10' }),
    'olijf': S('Olijf', 'Effen', { band: '#556b2f', left: '#f6f7ee', right: '#cfd9a6', ink: '#1a1f0d' }),
    'geel-zwart': S('Geel / zwart', 'Effen', { band: '#111111', left: '#fffbe0', right: '#ffd400' }),
    'grijs': S('Grijs', 'Effen', { band: '#5a6066', left: '#f4f5f6', right: '#d2d6da' }),
    'zwart-wit': S('Zwart / wit', 'Effen', { band: '#1d1d1b', left: '#ffffff', right: '#e9e9e6' }),

    'hoog-contrast': S('Hoog contrast', 'Speciaal', { band: '#000000', left: '#ffffff', right: '#ffffff', ink: '#000000', bandR: 1.2, bandRc: '#000000' }),
    'dubbele-rand': S('Dubbele rand', 'Speciaal', { band: '#e2621b', left: '#fff7ef', right: '#ffe0c2', bandL: 3.0, bandR: 1.6, bandRc: '#e2621b' }),
    'minimaal': S('Minimaal', 'Speciaal', { band: '#ffffff', left: '#ffffff', right: '#eef0f2', bandL: 0 }),
    'rechts-accent': S('Accent rechts', 'Speciaal', { band: '#2259b8', left: '#ffffff', right: '#ffffff', bandL: 0, bandR: 2.2, bandRc: '#2259b8' }),

    'nacht': S('Nacht', 'Donker', { band: '#22d3ee', left: '#0f1b2d', right: '#1d3557', ink: '#ffffff' }),
    'grafiet': S('Grafiet', 'Donker', { band: '#ffb000', left: '#1f1f1f', right: '#363636', ink: '#ffffff' }),
    'bordeaux': S('Bordeaux', 'Donker', { band: '#ff6f91', left: '#2a0d16', right: '#4a1426', ink: '#ffffff' }),

    'verloop': S('Verloop', 'Verloop', { band: '#0bb4ae', left: '#fbfbe8', right: '#ede834',
      zones: { right: yg('#ede834', '#f39a2e'), left: xg('#e3f6f3', '#fbfbe8') } }),
    'zonsondergang': S('Zonsondergang', 'Verloop', { band: '#5b2a86', left: '#fff3ea', right: '#ffb347', ink: '#1a0d12',
      zones: { right: yg('#ffc46b', '#ff6f91') } }),
    'oceaan': S('Oceaan', 'Verloop', { band: '#0b3c5d', left: '#eef8ff', right: '#8fe3f0', ink: '#071a2b',
      zones: { right: yg('#9feaf3', '#6aa6f0') } }),
    'koper': S('Koper', 'Verloop', { band: '#6b3e1f', left: '#fbf3ec', right: '#d58a55', ink: '#1a0f08',
      zones: { right: xg('#d58a55', '#f3c39b') } }),
    'aurora': S('Aurora', 'Verloop', { band: '#1d3557', left: '#f2fbf8', right: '#a7f0d6', ink: '#0b1622',
      zones: { right: { mode: 'xy', c: ['#a7f0d6', '#c9b8ff', '#c9b8ff', '#ffd1e8'] } } }),
    // één verloop over het hele label, van boven naar onder
    'heel-zomer': S('Heel label: zomer', 'Heel label', { band: '#0bb4ae', left: '#fffbd6', right: '#fffbd6',
      zones: { left: yg('#fffbd6', '#ffb347') } }),
    'heel-lagune': S('Heel label: lagune', 'Heel label', { band: '#0b3c5d', left: '#f1fbff', right: '#f1fbff', ink: '#071a2b',
      zones: { left: yg('#f1fbff', '#7fb8f2') } }),
    'heel-roos': S('Heel label: roos', 'Heel label', { band: '#b0305c', left: '#fff5f8', right: '#fff5f8', ink: '#1a0d12',
      zones: { left: yg('#fff5f8', '#ff9cc0') } }),
    'heel-nacht': S('Heel label: nacht', 'Heel label', { band: '#22d3ee', left: '#24456b', right: '#24456b', ink: '#ffffff',
      zones: { left: yg('#2c5a8a', '#0d1726') } }),

    // creatief: meerkleurige verlopen en sierstrepen (strepen = [van mm, tot mm, kleur], vanaf de linkerrand)
    'neon': S('Neon', 'Creatief', { band: '#ff2e88', left: '#120c24', right: '#120c24', ink: '#ffffff', bandL: 1.8, bandR: 1.0, bandRc: '#00e5ff', fullFill: true,
      zones: { left: ys(['#1d0f3d', '#120c24', '#081a33']) }, stripes: [[2.1, 2.35, '#00e5ff']] }),
    'cyber': S('Cyber', 'Creatief', { band: '#f9f002', left: '#0b0f1a', right: '#0b1f2e', ink: '#f4f4f4', bandL: 2.0,
      zones: { left: xg('#0b0f1a', '#121a2c'), right: yg('#1c0b33', '#0b2433') }, stripes: [[2.0, 2.3, '#ff2a6d']] }),
    'retro': S('Retro 70', 'Creatief', { band: '#8c3b12', left: '#fff4dc', right: '#fff4dc', ink: '#2b1608', bandL: 0, fullFill: true,
      zones: { left: yg('#fff4dc', '#ffe2b0') }, stripes: [[0, 0.9, '#8c3b12'], [0.9, 1.8, '#e8590c'], [1.8, 2.7, '#f59f00']] }),
    'race': S('Racestreep', 'Creatief', { band: '#111111', left: '#ffffff', right: '#ffd400', ink: '#111111', bandL: 3.0, bandR: 0.9, bandRc: '#e10600',
      stripes: [[0.8, 1.1, '#ffffff'], [1.6, 1.9, '#ffffff']] }),
    'avondrood': S('Avondrood', 'Creatief', { band: '#4a1d6b', left: '#ffe29a', right: '#ffe29a', ink: '#1d0b22', fullFill: true,
      zones: { left: ys(['#ffe29a', '#ffb36b', '#ff8a8f', '#d08ad8']) } }),
    'regenboog': S('Pastel regenboog', 'Creatief', { band: '#2b2d42', left: '#ffd1d1', right: '#ffd1d1', ink: '#141414', bandL: 1.2, fullFill: true,
      zones: { left: ys(['#ffd1d1', '#ffe1b8', '#fff6b3', '#d4f7c5', '#c9e6ff', '#e2d4ff']) } }),
    'holo': S('Holografisch', 'Creatief', { band: '#8c99a6', left: '#ffc8e6', right: '#ffc8e6', ink: '#121212', fullFill: true,
      zones: { left: xy('#ffc8e6', '#b5f2ff', '#d9c8ff', '#c8ffe0') }, stripes: [[0.6, 0.85, '#ffffff']] }),
    'lava': S('Lava', 'Creatief', { band: '#ff8a00', left: '#3a0a0a', right: '#3a0a0a', ink: '#ffffff', bandL: 1.8, fullFill: true,
      zones: { left: ys(['#3a0a0a', '#6b130c', '#a3230c']) }, stripes: [[1.8, 2.05, '#ffd000']] }),
    'jungle': S('Jungle', 'Creatief', { band: '#1f5e3a', left: '#f1fadc', right: '#f1fadc', ink: '#0c1f0c', bandL: 1.8, fullFill: true,
      zones: { left: ys(['#f1fadc', '#c9eb94', '#8fd18a']) }, stripes: [[1.8, 2.05, '#f2c14e']] }),
    'goud': S('Goud', 'Creatief', { band: '#6e4f0e', left: '#fff2c2', right: '#fff2c2', ink: '#1a1205', fullFill: true,
      zones: { left: ys(['#fff2c2', '#e9c766', '#fff0bd', '#d9ae45', '#f7e19a']) } }),
    'chroom': S('Chroom', 'Creatief', { band: '#22282f', left: '#f4f6f8', right: '#f4f6f8', ink: '#0d1117', fullFill: true,
      zones: { left: ys(['#f4f6f8', '#c3cbd3', '#eef1f4', '#a9b4bf', '#e6eaee']) }, stripes: [[1.61, 1.86, '#e10600']] }),
    'ijs': S('IJs', 'Creatief', { band: '#2f6fd1', left: '#ffffff', right: '#ffffff', ink: '#0b1b33', bandL: 2.2, fullFill: true,
      zones: { left: ys(['#ffffff', '#e3f4ff', '#b9e0ff']) }, stripes: [[1.2, 1.45, '#ffffff']] }),
    'citrus': S('Citrus', 'Creatief', { band: '#ff7a00', left: '#f4ffd1', right: '#ffe066', ink: '#1a1300',
      zones: { left: xg('#f4ffd1', '#fffbd0'), right: yg('#ffe066', '#ffb347') }, stripes: [[1.61, 1.86, '#7ac943']] }),
    'pastel-duo': S('Pastel duo', 'Creatief', { band: '#ff8fab', left: '#ffd6e0', right: '#cfe7ff', ink: '#1b1b1b', bandR: 0.8, bandRc: '#7fb8ff' })
  };

  ['heel-zomer', 'heel-lagune', 'heel-roos', 'heel-nacht'].forEach(function (k) { STYLES[k].fullFill = true; });

  function isHex(c) { return typeof c === 'string' && /^#[0-9a-fA-F]{6}$/.test(c); }
  // maakt elke (ook oude v1-)stijl compleet en geldig
  function normalizeStyle(s) {
    s = s || {};
    var base = STYLES['teal-geel'];
    var out = { label: s.label || '', ink: isHex(s.ink) ? s.ink : base.ink,
      bandL: num(s.bandL, base.bandL), split: num(s.split, base.split), bandR: num(s.bandR, base.bandR), zones: {},
      fullFill: !!s.fullFill };   // true = één vlak over de hele breedte, geen splitsing links/rechts
    ZONES.forEach(function (z) {
      var p = s.zones && s.zones[z];
      if (!p && z === 'bandL' && isHex(s.band)) p = solid(s.band);
      if (!p && z === 'left' && isHex(s.left)) p = solid(s.left);
      if (!p && z === 'right' && isHex(s.right)) p = solid(s.right);
      if (!p && z === 'bandR' && isHex(s.band)) p = solid(s.band);
      if (!p) p = base.zones[z];
      var mode = ['solid', 'x', 'y', 'xy'].indexOf(p.mode) > -1 ? p.mode : 'solid';
      var c = (p.c || []).slice(0, 4);
      while (c.length < 4) c.push(c[0] || '#ffffff');
      var zo = { mode: mode, c: c.map(function (x) { return isHex(x) ? x : '#ffffff'; }) };
      // verloop langs het label met meer dan twee kleuren: stops = [[0..1, kleur], ...]
      if (mode === 'y' && Array.isArray(p.stops)) {
        var st = p.stops.filter(function (q) { return Array.isArray(q) && isFinite(Number(q[0])) && isHex(q[1]); })
          .map(function (q) { return [clamp(Number(q[0]), 0, 1), q[1]]; })
          .sort(function (a, b) { return a[0] - b[0]; }).slice(0, 8);
        if (st.length > 2) { zo.stops = st; zo.c = [st[0][1], st[0][1], st[st.length - 1][1], st[st.length - 1][1]]; }
      }
      out.zones[z] = zo;
    });
    // smalle sierstrepen over de volle lengte (u in mm vanaf de linkerrand)
    out.stripes = (Array.isArray(s.stripes) ? s.stripes : []).slice(0, 8).map(function (t) {
      var a = clamp(num(t && t.u0, 0), 0, 40), b = clamp(num(t && t.u1, a + 0.4), 0, 40);
      return { u0: Math.min(a, b), u1: Math.max(a, b), c: isHex(t && t.c) ? t.c : '#111111' };
    }).filter(function (t) { return t.u1 - t.u0 >= 0.05; });
    // v30 had de hoeken in de opmaak; die gaan bij het laden naar het ringprofiel (zie migr31 in de app)
    if (s.corners) out.corners = { top: clamp(num(s.corners.top, 0.9), 0, 13), bottom: clamp(num(s.corners.bottom, 0.9), 0, 13) };
    var o = s.outline || {};
    out.outline = { on: !!o.on, width: clamp(num(o.width, 0.4), 0.05, 3), color: isHex(o.color) ? o.color : '#111111',
      pos: ['in', 'center', 'out'].indexOf(o.pos) > -1 ? o.pos : 'in' };
    return out;
  }
  function num(v, d) { v = Number(v); return isFinite(v) ? v : d; }
  function clamp(x, a, b) { return Math.max(a, Math.min(b, x)); }

  // ---------- merken ----------
  var BRANDS = {
    'ARRI': 'ARRI', 'DULENS': 'Dulens', 'LAOWA': 'Laowa', 'VENUS': 'Laowa', 'ZEISS': 'Zeiss', 'CARLZEISS': 'Zeiss',
    'COOKE': 'Cooke', 'CANON': 'Canon', 'SIGMA': 'Sigma', 'LEICA': 'Leica', 'LEITZ': 'Leitz', 'TOKINA': 'Tokina',
    'ATLAS': 'Atlas', 'SIRUI': 'Sirui', 'ANGENIEUX': 'Angénieux', 'ANGÉNIEUX': 'Angénieux', 'FUJINON': 'Fujinon',
    'FUJIFILM': 'Fujinon', 'SCHNEIDER': 'Schneider', 'PANAVISION': 'Panavision', 'SAMYANG': 'Samyang',
    'ROKINON': 'Rokinon', 'XEEN': 'Xeen', 'DZOFILM': 'DZOFilm', 'DZO': 'DZOFilm', 'IRIX': 'Irix', 'VILTROX': 'Viltrox',
    'MEIKE': 'Meike', '7ARTISANS': '7Artisans', 'TTARTISAN': 'TTArtisan', 'BLAZAR': 'Blazar', 'VAZEN': 'Vazen',
    'KOWA': 'Kowa', 'HAWK': 'Hawk', 'VANTAGE': 'Vantage', 'NISI': 'NiSi', 'TILTA': 'Tilta', 'SONY': 'Sony',
    'NIKON': 'Nikon', 'PANASONIC': 'Panasonic', 'LOMO': 'LOMO', 'MITAKON': 'Mitakon', 'ZHONGYI': 'Zhongyi',
    'HELIOS': 'Helios', 'GREATJOY': 'Great Joy', 'SLRMAGIC': 'SLR Magic', 'IBERIT': 'Iberit', 'ARRIZEISS': 'ARRI Zeiss',
    'THYPOCH': 'Thypoch', 'SUPERBLACK': 'Superblack', 'NANOMORPH': 'Nanomorph', 'CINEMAWORKS': 'Cineworks',
    'GL OPTICS': 'GL Optics', 'GLOPTICS': 'GL Optics', 'P+S': 'P+S Technik', 'PSTECHNIK': 'P+S Technik',
    'ULTRAPRIME': 'ARRI', 'MASTERPRIME': 'ARRI', 'SIGNATUREPRIME': 'ARRI'
  };
  function prettyBrand(raw, filename) {
    var s = String(raw || '').trim();
    if (!s && filename) s = String(filename).replace(/\.[^.]+$/, '').split(/[\s_\-]+/)[0] || '';
    if (!s) return say('Zonder merk', 'No brand');
    var key = s.toUpperCase().replace(/[\s._\-]+/g, '');
    if (BRANDS[key]) return BRANDS[key];
    return s.split(/\s+/).map(function (w) {
      if (w.length <= 4 && w === w.toUpperCase()) return w;
      return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
    }).join(' ');
  }
  function brandKey(name) { return String(name || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, ''); }

  // ---------- glyphs ----------
  var GL = null, gcache = {};
  // BASE = de standaardletter (ook voor de tekst op het vel zelf); FONTS = extra letters voor op het label
  var BASE = null, FONTS = {}, LABEL = null;
  function addFont(key, label, table, group) { FONTS[key] = { key: key, label: label, group: group || '', GL: table, cache: {} }; if (gcache['inf']) FONTS[key].cache['inf'] = gcache['inf']; }
  function setLabelFont(key) { LABEL = FONTS[key] || null; }
  function fontList() { return Object.keys(FONTS).map(function (k) { return { key: k, label: FONTS[k].label, group: FONTS[k].group }; }); }
  // fn tekenen met een gekozen letter (of met de letter voor het label als er geen key is)
  function withFont(f, fn) {
    if (!f || GL === f.GL) return fn();
    var g0 = GL, c0 = gcache; GL = f.GL; gcache = f.cache;
    try { return fn(); } finally { GL = g0; gcache = c0; }
  }
  function onLabel(fn) { return function () { var self = this, args = arguments; return withFont(LABEL, function () { return fn.apply(self, args); }); }; }
  // voorbeeldtekst als SVG-pad, voor de keuzelijst in de app
  function fontSample(key, s, w, cap) {
    return withFont(FONTS[key] || { GL: BASE, cache: baseCache }, function () {
      return { d: dOf([textContours(s, w, cap, 0, function (fx, fy) { return [fx, cap - fy]; })]), w: textWidth(s, w, cap, 0) };
    });
  }
  var baseCache = null;
  function setGlyphs(g) {
    GL = g; gcache = {}; BASE = g; baseCache = gcache;
    if (g.inf) {
      var k = 1000 / g.inf.upm;
      var cmds = parseD(g.inf.d).map(function (c) {
        return [c[0]].concat(c.slice(1).map(function (n) { return n * k; }));
      });
      var bb = g.inf.bbox.map(function (n) { return n * k; });
      gcache['inf'] = { adv: bb[1] + 90, cmds: cmds, bbox: bb };
      Object.keys(FONTS).forEach(function (k) { FONTS[k].cache['inf'] = gcache['inf']; });
    }
  }
  function parseD(d) {
    var out = [], re = /([MLQCZ])([^MLQCZ]*)/g, m;
    while ((m = re.exec(d))) {
      var t = m[2].trim();
      out.push([m[1]].concat(t ? t.split(/\s+/).map(Number) : []));
    }
    return out;
  }
  function glyph(w, ch) {
    if (ch === '∞') return gcache['inf'];
    var key = w + '|' + ch;
    if (gcache[key]) return gcache[key];
    var f = GL[w], g = f.g[ch];
    if (!g && GL !== BASE && BASE[w].g[ch]) {
      // dit teken zit niet in de gekozen letter: neem het uit de standaardletter, op dezelfde hoogte
      var b = BASE[w], k = f.cap / b.cap;
      return (gcache[key] = { adv: b.g[ch][0] * k, cmds: parseD(b.g[ch][1]).map(function (c) { return [c[0]].concat(c.slice(1).map(function (n) { return n * k; })); }) });
    }
    g = g || f.g['?'];
    return (gcache[key] = { adv: g[0], cmds: parseD(g[1]) });
  }
  function textWidth(s, w, cap, track) {
    var sc = cap / GL[w].cap, x = 0;
    for (var i = 0; i < s.length; i++) x += glyph(w, s[i]).adv * sc + (i < s.length - 1 ? (track || 0) : 0);
    return x;
  }
  function textContours(s, w, cap, track, place) {
    var sc = cap / GL[w].cap, x = 0, out = [];
    for (var i = 0; i < s.length; i++) {
      var g = glyph(w, s[i]);
      var gx = x;
      g.cmds.forEach(function (c) {
        if (c[0] === 'Z') { out.push(['Z']); return; }
        var r = [c[0]];
        for (var j = 1; j < c.length; j += 2) {
          var p = place(gx + c[j] * sc, c[j + 1] * sc);
          r.push(p[0], p[1]);
        }
        out.push(r);
      });
      x += g.adv * sc + (track || 0);
    }
    return out;
  }

  // ---------- lensdata ----------
  function parseLensFile(text, filename) {
    var j;
    try { j = JSON.parse(String(text).replace(/^﻿/, '')); }
    catch (e) { throw new Error((filename || say('Bestand', 'File')) + say(' is geen leesbaar lensbestand (geen geldige JSON).', ' is not a readable lens file (not valid JSON).')); }
    if (!j || !Array.isArray(j.focus) || !Array.isArray(j.fv))
      throw new Error((filename || say('Bestand', 'File')) + say(' mist de lijsten "focus" en "fv". Is dit een Tilta .tl-bestand?', ' is missing the "focus" and "fv" lists. Is this a Tilta .tl file?'));
    if (j.focus.length !== j.fv.length)
      throw new Error((filename || say('Bestand', 'File')) + say(': "focus" en "fv" zijn niet even lang (', ': "focus" and "fv" differ in length (') + j.focus.length + say(' tegen ', ' vs ') + j.fv.length + ').');
    var brand = String(j.brand || '').trim(), series = String(j.series || '').trim(), focal = String(j.focal_length || '').trim();
    if (!focal && filename) { var m = String(filename).match(/(\d+(?:[.,]\d+)?)\s*mm|\b(\d{2,3})\b/i); if (m) focal = (m[1] || m[2]).replace(',', '.'); }
    var pb = prettyBrand(brand, filename);
    return {
      id: 'l' + Math.random().toString(36).slice(2, 9),
      brand: brand, brandName: pb, series: series, focal: focal, tstop: tstopFrom(j.iris),
      unit: j.unit === 1 ? 'ft' : 'm',
      focus: j.focus.map(String), fv: j.fv.map(Number),
      topText: '', bottomText: '',   // leeg = automatisch
      overrides: {}, include: true, source: filename || ''
    };
  }
  // laagste T-waarde uit de iris-lijst = volle opening
  function tstopFrom(iris) {
    if (!Array.isArray(iris)) return '';
    var n = iris.map(function (x) { var v = parseFloat(String(x).replace(/^\s*[TtFf]\s*/, '').replace(',', '.')); return isFinite(v) && v > 0.5 && v < 64 ? v : null; })
      .filter(function (v) { return v !== null; }).sort(function (a, b) { return a - b; });
    return n.length ? String(Math.round(n[0] * 10) / 10) : '';
  }
  function cleanT(t) { return String(t || '').trim().replace(/^[TtFf]\s*/, '').replace(',', '.'); }
  function autoBottom(lens) {
    var f = lens.focal ? lens.focal + 'MM' : '', t = cleanT(lens.tstop) ? 'T' + cleanT(lens.tstop) : '';
    return [lens.brand || lens.brandName, lens.series, f, t].filter(Boolean).join(' ').toUpperCase();
  }
  function autoTop(lens, extra) {
    if (extra === false) return String(lens.focal || '');
    return (lens.focal ? String(lens.focal) : '') + (cleanT(lens.tstop) ? ' T' + cleanT(lens.tstop) : '');
  }

  function distOf(t) {
    var s = String(t).trim().toUpperCase();
    if (s === 'INF' || s === '∞' || s === 'INFINITY') return Infinity;
    var fi = s.match(/^(\d+)\s*'\s*(\d+(?:[.,]\d+)?)?\s*"?$/);   // voet en inch, bv. 2'10"
    if (fi) return Number(fi[1]) + (fi[2] ? Number(fi[2].replace(',', '.')) / 12 : 0);
    var n = parseFloat(s.replace(',', '.'));
    return isFinite(n) ? n : NaN;
  }
  function decimals(t) { var m = String(t).match(/\.(\d+)/); return m ? m[1].length : 0; }

  // ---------- zelf ingemeten lens (zonder lensbestand) ----------
  // lens.measured = { ref: 'center' | 'top' | 'bottom', rows: [{ t: '∞' | '1.5' | 2'6", mm: '81.5' }] }
  // mm = afgelezen op het meetlabel van de ring, vanaf ref van de nudge; werkt dus met elk systeem en elke lens.
  function distText(t) {
    var s = String(t === undefined || t === null ? '' : t).trim().replace(',', '.');
    if (/^(inf|infinity|∞|oneindig)$/i.test(s)) return 'INF';
    var ft = s.match(/^(\d+)\s*'\s*(\d+(?:\.\d+)?)?\s*(?:"|'')?$/);   // voet en duim, bijv. 2'6"
    if (ft) return String(Math.round((Number(ft[1]) + (ft[2] ? Number(ft[2]) / 12 : 0)) * 100) / 100);
    s = s.replace(/\s*(m|ft)$/i, '');
    if (!/^\d*\.?\d+$/.test(s)) return '';
    var n = Number(s);
    return n > 0 ? String(n) : '';
  }
  // punten op de strook: fv = -positie (mm vanaf de bovenkant van de nudge-as), zodat de gewone opbouw werkt
  function measuredPts(lens, ring) {
    var M = lens.measured || {}, h = ring.notch.h, C = ring.circ || 0;
    var z = M.ref === 'top' ? -h : M.ref === 'bottom' ? h : 0;
    var rows = [], seen = {}, dupes = [];
    (M.rows || []).forEach(function (r) {
      var t = distText(r.t), mm = parseFloat(String(r.mm === undefined || r.mm === null ? '' : r.mm).replace(',', '.'));
      if (!t || !isFinite(mm)) return;
      if (seen[t]) { dupes.push(t); return; }
      seen[t] = 1;
      rows.push({ text: t, d: distOf(t), mm: mm });
    });
    rows.sort(function (a, b) { return b.d - a.d; });          // ∞ eerst, dan steeds dichterbij
    var prev = -Infinity, back = [], pts = [];
    rows.forEach(function (p) {
      var raw = z + p.mm;
      if (C) { while (raw < prev - 0.5) raw += C; }            // rondlopende ring: na de rand van het meetlabel weer vanaf 0
      else if (raw < prev - 0.05) back.push(p.text);           // dichterbij hoort verder van ∞ te liggen
      prev = Math.max(prev, raw);
      pts.push({ text: p.text, d: p.d, fv: -raw, mm: p.mm });
    });
    return { pts: pts, dupes: dupes, back: back, hasInf: rows.some(function (p) { return p.d === Infinity; }), count: rows.length };
  }

  // ---------- ring + transform ----------
  // rs = instellingen van de gebruiker; geeft complete ringmaten terug
  // oude sleutels uit eerdere versies
  var ALIAS = { 'wcu4-tilta': 'arri-wcu4', 'wcu4-tilta-recht': 'tilta-nucleus' };
  function presetKey(k) {
    k = ALIAS[k] || k;
    if (!RINGS[k] && /^arri-/.test(String(k))) k = 'arri-wcu4';   // oudere sleutel voor dezelfde ARRI-ring
    return RINGS[k] ? k : 'tilta-nucleus';
  }
  // alle maten expliciet vastleggen (voor een ringprofiel, zonder verborgen standaardwaarden)
  function snapshotRing(rs) {
    var r = ringFor(rs);
    return { preset: r.preset, zeroRef: r.zeroRef, offset: r.offsetInput, length: r.length, width: r.W,
      infMode: r.infMode, anchorFv: r.anchorFv, anchorLabel: r.anchorLabel,
      notchDepth: r.notch.depth, notchWidth: r.notch.h * 2, notchFilletTop: r.notch.ft, notchFilletBottom: r.notch.fb,
      mmPer1000: r.mmPer1000, radius: r.radius, endZone: r.endZone, cornerTop: r.cornerTop, cornerBottom: r.cornerBottom };
  }
  function ringFor(rs) {
    rs = rs || {};
    var key = presetKey(rs.preset), base = RINGS[key];
    var bf = base.notch.fillet;
    var r = { label: LANG === 'en' ? (RING_EN[key] || base.label) : base.label, W: base.W, top: base.top, length: base.length, corner: base.corner,
      notch: { h: base.notch.h, depth: base.notch.depth, ft: base.notch.ft !== undefined ? base.notch.ft : bf, fb: base.notch.fb !== undefined ? base.notch.fb : bf },
      mmPer1000: base.mmPer1000, offset: base.offset, radius: base.radius, endZone: base.endZone, zeroRef: base.zeroRef || 'center', preset: key };
    if (rs.name) r.label = String(rs.name);
    // ∞-plek: 'same' = elke lens op dezelfde plek; 'lens' = volgens de INF-waarde in het lensbestand,
    // gemeten ten opzichte van een referentielens (anchorFv = INF-waarde van die lens)
    r.infMode = rs.infMode === 'lens' || rs.infMode === 'same' ? rs.infMode : (base.infMode || 'same');
    r.anchorFv = (rs.anchorFv !== null && rs.anchorFv !== undefined && rs.anchorFv !== '' && isFinite(Number(rs.anchorFv))) ? Number(rs.anchorFv) : null;
    r.anchorLabel = rs.anchorLabel ? String(rs.anchorLabel) : '';
    if (base.lockInf) r.infMode = 'lens';
    r.lockInf = !!base.lockInf;
    if (r.anchorFv === null && base.anchorFv !== undefined) { r.anchorFv = base.anchorFv; r.anchorLabel = base.anchorLabel || ''; }
    function pick(k, lo, hi) {
      if (rs[k] === undefined || rs[k] === null || rs[k] === '') return null;
      var v = Number(rs[k]); return isFinite(v) ? clamp(v, lo, hi) : null;
    }
    var v;
    if (['center', 'top', 'bottom'].indexOf(rs.zeroRef) > -1) r.zeroRef = rs.zeroRef;
    if ((v = pick('radius', 0, 1e6)) !== null) r.radius = v < 50 ? 0 : v;
    if ((v = pick('endZone', 0, 60)) !== null) r.endZone = v;
    if ((v = pick('mmPer1000', 1, 100)) !== null) r.mmPer1000 = v;
    if ((v = pick('length', 150, 320)) !== null) r.length = v;
    if ((v = pick('width', 8, 30)) !== null) r.W = v;
    r.circ = base.circ ? r.length : 0;          // schaal loopt rond: periode = lengte van het label
    r.textInGap = !!base.textInGap;
    // afgeronde hoeken van het label (straal in mm), boven = kant van de nudge; cornerRadii begrenst ze
    r.cornerTop = (v = pick('cornerTop', 0, 13)) !== null ? v : r.corner;
    r.cornerBottom = (v = pick('cornerBottom', 0, 13)) !== null ? v : r.corner;
    if ((v = pick('notchDepth', 0, 12)) !== null) r.notch.depth = v;
    if ((v = pick('notchWidth', 0, 8)) !== null) r.notch.h = v / 2;
    if ((v = pick('notchFillet', 0, 4)) !== null) { r.notch.ft = v; r.notch.fb = v; }
    if ((v = pick('notchFilletTop', 0, 4)) !== null) r.notch.ft = v;
    if ((v = pick('notchFilletBottom', 0, 4)) !== null) r.notch.fb = v;
    r.notch.h = r.notch.depth > 0 ? Math.min(r.notch.h, r.notch.depth) : r.notch.h;
    r.notch.ft = Math.max(0, Math.min(r.notch.ft, r.notch.depth - r.notch.h, -r.top - r.corner - r.notch.h - 0.2));
    r.notch.fb = Math.max(0, Math.min(r.notch.fb, r.notch.depth - r.notch.h));
    r.notch.fillet = Math.max(r.notch.ft, r.notch.fb);
    r.notch.square = !!rs.notchSquare;   // rechte uitsparing: makkelijk te snijden, en hij valt overal buiten de ronde uitsparing van de ring
    // nulpunt voor de ∞-afstand: midden, bovenrand (kant van de tekst bovenaan) of onderrand (kant van ∞)
    r.zeroV = r.zeroRef === 'top' ? -r.notch.h : r.zeroRef === 'bottom' ? r.notch.h : 0;
    // ringen die rondlopen (originele Tilta-ring) hebben ∞ ver van de nudge; anders blijft de oude grens
    if ((v = r.circ ? pick('offset', 0, r.length) : pick('offset', -20, 60)) !== null) r.offset = r.zeroV + v;
    r.offsetInput = r.offset - r.zeroV;
    r.bottom = r.top + r.length;
    r.unit = r.mmPer1000 / 1000;
    return r;
  }
  function makeT(x0, y0, R) {
    if (!R) return function (u, v) { return [x0 + u, y0 + v]; };
    var cx = x0 - R;
    return function (u, v) {
      var r = R + u, a = v / R;
      return [cx + r * Math.cos(a), y0 + r * Math.sin(a)];
    };
  }
  function mapContour(cmds, T) {
    return cmds.map(function (c) {
      if (c[0] === 'Z') return c;
      var r = [c[0]];
      for (var j = 1; j < c.length; j += 2) { var p = T(c[j], c[j + 1]); r.push(p[0], p[1]); }
      return r;
    });
  }
  function polyCmds(pts) {
    var out = [['M', pts[0][0], pts[0][1]]];
    for (var i = 1; i < pts.length; i++) out.push(['L', pts[i][0], pts[i][1]]);
    out.push(['Z']);
    return out;
  }
  function arcPts(cx, cy, r, a0, a1, n) {
    var pts = [];
    for (var i = 0; i <= n; i++) {
      var a = (a0 + (a1 - a0) * i / n) * Math.PI / 180;
      pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
    }
    return pts;
  }
  function linePts(u0, v0, u1, v1, step) {
    var len = Math.hypot(u1 - u0, v1 - v0), n = Math.max(1, Math.ceil(len / step)), pts = [];
    for (var i = 1; i <= n; i++) pts.push([u0 + (u1 - u0) * i / n, v0 + (v1 - v0) * i / n]);
    return pts;
  }
  // werkelijke hoekstralen: nooit breder dan het label, en bovenaan niet tot in de nudge
  function cornerRadii(ring) {
    var t = ring.cornerTop !== undefined ? ring.cornerTop : ring.corner, b = ring.cornerBottom !== undefined ? ring.cornerBottom : ring.corner;
    var maxT = ring.notch.depth > 0 ? Math.max(0, Math.min(ring.W / 2, -ring.top - ring.notch.h - ring.notch.ft - 0.2)) : ring.W / 2;
    return { top: clamp(t, 0, maxT), bottom: clamp(b, 0, ring.W / 2), maxTop: maxT, maxBottom: ring.W / 2 };
  }
  // hoe ver tekst van de bovenkant (of onderkant) af moet om binnen een hoek met straal r te blijven,
  // als hij m mm van de zijkant begint
  function cornerDepth(r, m) {
    if (r <= 0 || m >= r) return 0;
    if (m <= 0) return r;
    return r - Math.sqrt(r * r - (r - m) * (r - m));
  }
  function outlineLocal(ring, radii) {
    var W = ring.W, T = ring.top, B = ring.bottom, h = ring.notch.h, D = ring.notch.depth, rfB = ring.notch.fb, rfT = ring.notch.ft;
    var rt = radii ? radii.top : ring.corner, rb = radii ? radii.bottom : ring.corner;
    var nt = Math.max(6, Math.ceil(rt * 5)), nb = Math.max(6, Math.ceil(rb * 5));
    if (!(D > 0)) {   // geen uitsparing: gewone afgeronde rechthoek
      var q = [[rt, T]];
      q = q.concat(linePts(rt, T, W - rt, T, 3), arcPts(W - rt, T + rt, rt, -90, 0, nt), linePts(W, T + rt, W, B - rb, 2),
        arcPts(W - rb, B - rb, rb, 0, 90, nb), linePts(W - rb, B, rb, B, 3), arcPts(rb, B - rb, rb, 90, 180, nb),
        linePts(0, B - rb, 0, T + rt, 2), arcPts(rt, T + rt, rt, 180, 270, nt));
      q.pop();
      return q;
    }
    var p = [[rt, T]];
    p = p.concat(linePts(rt, T, W - rt, T, 3));
    p = p.concat(arcPts(W - rt, T + rt, rt, -90, 0, nt));
    p = p.concat(linePts(W, T + rt, W, B - rb, 2));
    p = p.concat(arcPts(W - rb, B - rb, rb, 0, 90, nb));
    p = p.concat(linePts(W - rb, B, rb, B, 3));
    p = p.concat(arcPts(rb, B - rb, rb, 90, 180, nb));
    p = p.concat(linePts(0, B - rb, 0, h + rfB, 2));
    if (rfB > 0) p = p.concat(arcPts(rfB, h + rfB, rfB, 180, 270, 12));
    p = p.concat(linePts(rfB, h, D - h, h, 1));
    if (ring.notch.square) p = p.concat(linePts(D - h, h, D, h, 1), linePts(D, h, D, -h, 1), linePts(D, -h, D - h, -h, 1));
    else p = p.concat(arcPts(D - h, 0, h, 90, -90, 18));
    p = p.concat(linePts(D - h, -h, rfT, -h, 1));
    if (rfT > 0) p = p.concat(arcPts(rfT, -h - rfT, rfT, 90, 180, 12));
    p = p.concat(linePts(0, -h - rfT, 0, T + rt, 2));
    p = p.concat(arcPts(rt, T + rt, rt, 180, 270, nt));
    p.pop();
    return p;
  }
  function rectLocal(u0, u1, v0, v1, step) {
    var p = [[u0, v0]];
    p = p.concat(linePts(u0, v0, u1, v0, 50));
    p = p.concat(linePts(u1, v0, u1, v1, step || 4));
    p = p.concat(linePts(u1, v1, u0, v1, 50));
    p = p.concat(linePts(u0, v1, u0, v0, step || 4));
    p.pop();
    return p;
  }

  // ---------- schaal + labelindeling ----------
  // smal label (bijv. de originele Tilta-ring, 11 mm): tekst iets kleiner, en links/rechts mogen elkaar niet raken
  function withScale(ring, fn) {
    var k = Math.max(0.75, Math.min(1, ring.W / 19.39 + 0.2));
    if (L.__k || k >= 0.999) return fn();
    var L0 = L, sc = {};
    ['rCap', 'rSup', 'lCap', 'lSup', 'focalCap', 'focalTop', 'tstopCap', 'tstopMin', 'nameCap', 'infH', 'tickPastBand', 'labelPastBand'].forEach(function (key) { sc[key] = L0[key] * k; });
    L = Object.assign({}, L0, sc, { __k: k });
    try { return fn(); } finally { L = L0; }
  }
  function layoutLens(lens, ring, lopts) { return withScale(ring, function () { return layoutLens0(lens, ring, lopts); }); }
  function layoutLens0(lens, ring, lopts) {
    var narrow = ring.W < 16, blocks = (lopts && lopts.block) || [];
    var lX = lopts && lopts.labelX !== undefined ? lopts.labelX : 6, rE = lopts && lopts.rEdge !== undefined ? lopts.rEdge : ring.W - 1;
    // botsen = zowel verticaal als horizontaal overlappen (vakken: [boven, onder, links, rechts])
    var hits = function (a0, a1, u0, u1, list, m) {
      for (var i = 0; i < list.length; i++) { var b = list[i]; if (a1 + m > b[0] && a0 - m < b[1] && u1 + 0.3 > b[2] && u0 - 0.3 < b[3]) return true; }
      return false;
    };
    var rightBoxes = [];
    var pts = [];
    if (lens.measured) pts = measuredPts(lens, ring).pts;   // zelf ingemeten: fv = -positie in mm
    else for (var i = 0; i < lens.focus.length; i++) {
      var d = distOf(lens.focus[i]);
      if (isNaN(d) || !isFinite(lens.fv[i])) continue;
      pts.push({ text: String(lens.focus[i]).trim(), d: d, fv: lens.fv[i] });
    }
    pts.sort(function (a, b) { return b.fv - a.fv; });
    var inf = pts.filter(function (p) { return p.d === Infinity; })[0];
    var own = inf ? inf.fv : (pts[0] ? pts[0].fv : 10000);
    var anchor = ring.infMode === 'lens' && ring.anchorFv !== null ? ring.anchorFv : own;
    var vOf = lens.measured ? function (fv) { return -fv; } : function (fv) { return ring.offset + (anchor - fv) * ring.unit; };
    var vLimit = ring.bottom - ring.endZone;
    var C = ring.circ || 0;
    // rondlopende schaal: voorbij het eind van het label verder bovenaan (tot vlak voor ∞)
    var wrapMax = inf ? vOf(inf.fv) - L.lineMajor / 2 - L.infGap - L.infH - 1.0 : ring.bottom;
    // brandpunt in het gat boven ∞: houd daar ruimte voor vrij, anders botsen de rondgelopen cijfers met de tekst
    if (ring.textInGap && inf) wrapMax = Math.min(wrapMax, vOf(inf.fv) - L.lineMajor / 2 - L.infGap - L.infH - 0.8 - L.focalCap - 1.0 - L.lCap / 2);
    pts.forEach(function (p) {
      p.raw = vOf(p.fv); p.v = p.raw; p.wrap = false;
      if (C && p.d !== Infinity && p.raw > ring.bottom - 0.5) { p.v = p.raw - C; p.wrap = true; }
    });
    var onLabel = function (p) { return p.wrap ? (p.v > ring.top + 2 && p.v < wrapMax) : (p.v <= vLimit && p.v > ring.top + 2); };
    var data = pts.filter(function (p) { return p.d !== Infinity && onLabel(p); });
    var cut = pts.filter(function (p) { return p.d !== Infinity && !onLabel(p) && (p.wrap || p.v > vLimit); });

    var res = { inf: inf ? { v: inf.v } : null, data: [], minors: [], cut: cut, vLimit: vLimit, vOf: vOf, wrapTop: null };
    var lastLong = inf ? inf.v : -Infinity;
    var leftBoxes = [], lastLeftBottom = -Infinity;
    var ov = lens.overrides || {};
    // eerst het rondgelopen stuk bovenaan (van boven naar beneden), dan vanaf ∞ naar beneden
    var wrapped = data.filter(function (p) { return p.wrap; }).sort(function (a, b) { return a.v - b.v; });
    var order = wrapped.concat(data.filter(function (p) { return !p.wrap; }));
    if (wrapped.length) lastLong = -Infinity;
    var placed = {};

    order.forEach(function (p, idx) {
      if (wrapped.length && idx === wrapped.length) { lastLong = inf ? inf.v : -Infinity; leftBoxes = []; lastLeftBottom = -Infinity; }
      var rTop = p.v - L.lineMajor / 2 - L.baseGap - L.rCap;
      var lTop = p.v - L.leftLabelLift - L.lCap / 2, lBot = lTop + L.lCap;
      var spl = narrow ? splitLabel(p.text) : null;
      var wR = narrow ? textWidth(spl.big, 700, L.rCap, 0.05) + (spl.sup ? textWidth(spl.sup, 700, L.rSup, 0.03) + 0.1 : 0) : 0;
      var wL = narrow ? textWidth(spl.big, 400, L.lCap, 0.05) + (spl.sup ? textWidth(spl.sup, 400, L.lSup, 0.03) + 0.1 : 0) : 0;
      function fitsRight() {
        if (rTop < lastLong + L.lineMajor / 2 + L.gapR) return false;
        if (narrow && (hits(rTop, p.v, rE - wR, rE, blocks, 0.4) || hits(rTop, p.v, rE - wR, rE, leftBoxes.map(function (b) { return [b.top, b.bottom, b.u0, b.u1]; }), 0.3))) return false;
        for (var k = 0; k < leftBoxes.length; k++) {
          var b = leftBoxes[k];
          if (p.v + L.lineMajor / 2 + L.lineClear > b.top && p.v - L.lineMajor / 2 - L.lineClear < b.bottom) return false;
        }
        return true;
      }
      function fitsLeft() {
        if (lTop < lastLong + L.lineMajor / 2 + L.lineClear) return false;
        if (lTop < lastLeftBottom + L.gapL) return false;
        if (lBot > ring.bottom - 1) return false;
        if (narrow && (hits(lTop, lBot, lX, lX + wL, rightBoxes, 0.3) || hits(lTop, lBot, lX, lX + wL, blocks, 0.4))) return false;
        return true;
      }
      var want = ov[p.text], place = 'none', conflict = false;
      if (want === 'right' || want === 'left' || want === 'none') {
        place = want;
        if (want === 'right') conflict = !fitsRight();
        if (want === 'left') conflict = !fitsLeft();
      } else {
        var prefer = decimals(p.text) >= 2 ? ['left', 'right'] : ['right', 'left'];
        for (var k = 0; k < prefer.length; k++) {
          if (prefer[k] === 'right' ? fitsRight() : fitsLeft()) { place = prefer[k]; break; }
        }
      }
      if (place === 'right') { lastLong = p.v; rightBoxes.push([rTop, p.v - L.lineMajor / 2, rE - wR, rE]); }
      if (place === 'left') { leftBoxes.push({ top: lTop, bottom: lBot, u0: lX, u1: lX + wL }); lastLeftBottom = lBot; }
      placed[p.text] = { text: p.text, d: p.d, fv: p.fv, v: p.v, place: place, auto: !want, conflict: conflict, wrap: p.wrap };
      if (p.wrap) res.wrapTop = Math.max(res.wrapTop === null ? -Infinity : res.wrapTop, place === 'left' ? Math.max(lBot, p.v + L.lineMajor / 2) : p.v + L.lineMajor / 2);
    });
    data.forEach(function (p) { res.data.push(placed[p.text]); });   // volgorde blijft van ver naar dichtbij

    // tussenstreepjes: interpolatie lineair in 1/afstand tussen de lenspunten
    var STEPS = [10, 5, 2, 1, 0.5, 0.25, 0.1, 0.05, 0.025, 0.01];
    var dataD = pts.filter(function (p) { return p.d !== Infinity; }).map(function (p) { return p.d; });
    var seq = data.concat(cut.slice(0, 1));
    for (var i2 = 0; i2 + 1 < seq.length; i2++) {
      var a = seq[i2], b = seq[i2 + 1];
      if (!(a.d > b.d)) continue;
      var best = null;
      for (var s = 0; s < STEPS.length; s++) {
        var st = STEPS[s], cand = [];
        var k0 = Math.floor(b.d / st + 1e-9) + 1, k1 = Math.ceil(a.d / st - 1e-9) - 1;
        if (k1 - k0 + 1 > 40) break;
        for (var kk = k0; kk <= k1; kk++) {
          var val = Math.round(kk * st * 1e6) / 1e6;
          if (val <= b.d + 1e-9 || val >= a.d - 1e-9) continue;
          if (dataD.some(function (x) { return Math.abs(x - val) < 1e-9; })) continue;
          var t = (1 / val - 1 / a.d) / (1 / b.d - 1 / a.d);
          var vr = a.raw + t * (b.raw - a.raw);
          if (C && vr > ring.bottom - 0.5) { vr -= C; if (vr <= ring.top + 1 || vr >= wrapMax) continue; }
          cand.push({ d: val, v: vr, r: a.raw + t * (b.raw - a.raw) });
        }
        if (!cand.length) continue;
        if (cand.length > L.minorMax) break;
        var vs = [a.raw].concat(cand.map(function (c) { return c.r; })).concat([b.raw]).sort(function (x, y) { return x - y; });
        var ok = true;
        for (var q = 1; q < vs.length; q++) if (vs[q] - vs[q - 1] < L.minorGap) { ok = false; break; }
        if (ok) { best = cand; break; }
      }
      if (best) best.forEach(function (c) { if (c.v <= vLimit) res.minors.push({ d: c.d, v: c.v }); });
    }
    return res;
  }

  function splitLabel(t) {
    var m = String(t).match(/^(\d*)(\.\d+)$/);
    if (m) return { big: m[1] || '0', sup: m[2] };
    return { big: String(t), sup: '' };
  }

  // ---------- kleurvlakken ----------
  function hexRGB(hex) {
    var h = String(hex || '#ffffff').replace('#', '');
    return [parseInt(h.substr(0, 2), 16) / 255, parseInt(h.substr(2, 2), 16) / 255, parseInt(h.substr(4, 2), 16) / 255];
  }
  // geometrie van de vlakken, met grenzen binnen de strook
  function zoneGeom(style, ring) {
    var W = ring.W;
    var bl = clamp(style.bandL, 0, W / 2), br = clamp(style.bandR, 0, W / 2);
    var sp = clamp(style.split * W / 19.39, bl + 0.5, W - br - 0.5);   // grens in verhouding tot een standaardlabel
    if (style.fullFill) return { bandL: bl, bandR: br, split: W, full: true,
      zones: [
        { key: 'left', u0: -1, u1: W + 1, ua: 0, ub: W },
        { key: 'bandL', u0: -1, u1: bl, ua: 0, ub: bl, skip: bl <= 0 },
        { key: 'bandR', u0: W - br, u1: W + 1, ua: W - br, ub: W, skip: br <= 0 }
      ] };
    return { bandL: bl, bandR: br, split: sp,
      zones: [
        { key: 'left', u0: -1, u1: W + 1, ua: bl, ub: sp },
        { key: 'bandL', u0: -1, u1: bl, ua: 0, ub: bl, skip: bl <= 0 },
        { key: 'right', u0: sp, u1: W + 1, ua: sp, ub: W - br },
        { key: 'bandR', u0: W - br, u1: W + 1, ua: W - br, ub: W, skip: br <= 0 }
      ] };
  }
  function corners(p) {
    var c = p.c.map(hexRGB);
    if (p.mode === 'x') return [c[0], c[1], c[0], c[1]];
    if (p.mode === 'y') return [c[0], c[0], c[2] || c[1], c[2] || c[1]];
    if (p.mode === 'xy') return c;
    return [c[0], c[0], c[0], c[0]];
  }
  function zoneItem(z, paint, ring, T) {
    var v0 = ring.top - 1, v1 = ring.bottom + 1;
    if (paint.mode === 'solid')
      return { fill: paint.c[0], contours: [mapContour(polyCmds(rectLocal(z.u0, z.u1, v0, v1)), T)] };
    var K = corners(paint);
    var STOPS = paint.mode === 'y' && paint.stops ? paint.stops.map(function (q) { return [q[0], hexRGB(q[1])]; }) : null;
    var cols = [z.u0];
    if (paint.mode !== 'y') { if (z.ua > z.u0 + 1e-6) cols.push(z.ua); if (z.ub < z.u1 - 1e-6 && z.ub > z.ua) cols.push(z.ub); }
    cols.push(z.u1);
    var step = paint.mode === 'x' ? 16 : 2;
    var rows = [v0, ring.top];
    var n = Math.max(1, Math.ceil(ring.length / step));
    for (var i = 1; i < n; i++) rows.push(ring.top + ring.length * i / n);
    rows.push(ring.bottom, v1);
    if (STOPS) {
      STOPS.forEach(function (q) { rows.push(ring.top + ring.length * q[0]); });
      rows.sort(function (a, b) { return a - b; });
      rows = rows.filter(function (v, i) { return i === 0 || v - rows[i - 1] > 1e-6; });
    }
    var span = Math.max(1e-6, z.ub - z.ua);
    function colorAt(u, v) {
      var s = clamp((u - z.ua) / span, 0, 1), t = clamp((v - ring.top) / ring.length, 0, 1);
      if (STOPS) {
        if (t <= STOPS[0][0]) return STOPS[0][1].slice();
        for (var i = 1; i < STOPS.length; i++) {
          if (t <= STOPS[i][0]) {
            var a = STOPS[i - 1], b = STOPS[i], f = (t - a[0]) / Math.max(1e-6, b[0] - a[0]);
            return [0, 1, 2].map(function (k) { return a[1][k] + (b[1][k] - a[1][k]) * f; });
          }
        }
        return STOPS[STOPS.length - 1][1].slice();
      }
      return [0, 1, 2].map(function (k) {
        var top = K[0][k] + (K[1][k] - K[0][k]) * s, bot = K[2][k] + (K[3][k] - K[2][k]) * s;
        return top + (bot - top) * t;
      });
    }
    var mesh = rows.map(function (v) {
      return cols.map(function (u) { var p = T(u, v), c = colorAt(u, v); return [p[0], p[1], c[0], c[1], c[2]]; });
    });
    return { mesh: mesh, mode: paint.mode, stops: !!STOPS };
  }

  // ---------- strook opbouwen ----------
  // dikte van de streepjes: k = 1 is standaard (lange streep 0,5 mm); de indeling rekent met de gekozen dikte
  function withLines(k, fn) {
    k = Number(k); if (!isFinite(k) || Math.abs(k - 1) < 0.01) return fn();
    k = clamp(k, 0.4, 3);
    var L0 = L; L = Object.assign({}, L0, { lineMajor: L0.lineMajor * k, lineMinor: L0.lineMinor * k, lineShort: L0.lineShort * k });
    try { return fn(); } finally { L = L0; }
  }
  function buildStrip(lens, ring, style, x0, y0, opts) { return withLines(opts && opts.lineScale, function () { return withScale(ring, function () { return buildStrip0(lens, ring, style, x0, y0, opts); }); }); }
  function buildStrip0(lens, ring, style, x0, y0, opts) {
    opts = opts || {};
    style = normalizeStyle(style);
    var T = makeT(x0, y0, ring.radius);
    var zg0 = zoneGeom(style, ring), nameR0 = Math.max(L.nameRight, zg0.bandR + 0.6);
    var nameStr0 = opts.lensText === false ? '' : (String(lens.bottomText || '').trim() || autoBottom(lens)), block = [];
    if (nameStr0) {   // waar de lensnaam onderaan komt: op een smal label blijven de getallen daar weg
      var nl0 = textWidth(nameStr0, 400, L.nameCap, L.nameTrack), vS0 = ring.bottom - Math.max(L.nameBottom, cornerDepth(cornerRadii(ring).bottom, nameR0 - 0.3));
      block.push([vS0 - nl0 - 0.6, vS0 + 0.6, ring.W - nameR0 - L.nameCap, ring.W - nameR0]);
    }
    var lay = layoutLens0(lens, ring, { block: block, labelX: zg0.bandL + L.labelPastBand, rEdge: ring.W - Math.max(L.rightMargin, zg0.bandR + 0.6) });
    var W = ring.W, items = [], ink = style.ink;
    var radii = cornerRadii(ring);
    var outline = mapContour(polyCmds(outlineLocal(ring, radii)), T);
    var zg = zoneGeom(style, ring);
    zg.zones.forEach(function (z) { if (!z.skip) items.push(zoneItem(z, style.zones[z.key], ring, T)); });
    style.stripes.forEach(function (sp) {
      if (sp.u0 >= W) return;
      items.push({ fill: sp.c, contours: [mapContour(polyCmds(rectLocal(sp.u0, Math.min(sp.u1, W + 1), ring.top - 1, ring.bottom + 1)), T)] });
    });

    var tickShort = zg.bandL + L.tickPastBand, labelX = zg.bandL + L.labelPastBand;
    var rEdge = W - Math.max(L.rightMargin, zg.bandR + 0.6);
    var shapes = [];
    function tick(v, len, th) {
      shapes.push(mapContour(polyCmds([[-0.5, v - th / 2], [len, v - th / 2], [len, v + th / 2], [-0.5, v + th / 2]]), T));
    }
    function text(s, w, cap, u, base, track) {
      shapes.push(mapContour(textContours(s, w, cap, track || 0, function (fx, fy) { return [u + fx, base - fy]; }), T));
    }

    var nameRange = null, nameR = Math.max(L.nameRight, zg.bandR + 0.6);
    var nameStr = opts.lensText === false ? '' : (String(lens.bottomText || '').trim() || autoBottom(lens));
    if (nameStr) {
      var nl = textWidth(nameStr, 400, L.nameCap, L.nameTrack);
      var vStart = ring.bottom - Math.max(L.nameBottom, cornerDepth(radii.bottom, nameR - 0.3)), uBase = W - nameR;
      nameRange = [vStart - nl - 0.6, vStart + 0.6];
      shapes.push(mapContour(textContours(nameStr, 400, L.nameCap, L.nameTrack, function (fx, fy) { return [uBase - fy, vStart - fx]; }), T));
    }
    function rightEdgeFor(top, bottom) {
      if (nameRange && bottom > nameRange[0] && top < nameRange[1]) return W - nameR - L.nameCap - 0.6;
      return rEdge;
    }

    var top = String(lens.topText || '').trim(), topBase0 = ring.top + L.focalTop + L.focalCap, topBase = topBase0;
    // blok van x0 tot x1: zo ver omlaag dat het binnen de afgeronde hoeken blijft
    var dropFor = function (x0, x1) { return topBase0 + Math.max(0, cornerDepth(radii.top, Math.min(x0, W - x1) - 0.3) - L.focalTop); };
    // rondlopende schaal: het blok komt midden in het gat tussen het laatste rondgelopen getal en het ∞-teken
    var gapLo = (lay.wrapTop !== null ? lay.wrapTop : ring.top) + 1.0;
    var gapHi = lay.inf ? lay.inf.v - L.lineMajor / 2 - L.infGap - L.infH - 0.8 : ring.top + 20;
    var baseFor = function (x0, x1, h) {
      if (!ring.textInGap) return dropFor(x0, x1);
      return (gapLo + gapHi) / 2 - h / 2 + L.focalCap;
    };
    if (top) {
      var tw = textWidth(top, 700, L.focalCap, 0.1), tx0 = W / 2 + L.focalShift - tw / 2;
      topBase = baseFor(tx0, tx0 + tw, L.focalCap);
      text(top, 700, L.focalCap, tx0, topBase, 0.1);
    } else if (lens.focal) {
      // automatisch: groot brandpunt met de T-stop erachter (zonder "mm").
      // Binnen vaste marges (rand van het label / kleurband). Past het niet: eerst de T-stop
      // iets kleiner, dan het blok iets opschuiven, en pas als laatste op een tweede regel.
      var extra = opts.topExtra !== false, big = String(lens.focal);
      var tsS = extra && cleanT(lens.tstop) ? 'T' + cleanT(lens.tstop) : '';
      var wb = textWidth(big, 700, L.focalCap, 0.1), gT = L.tstopGap;
      var cx = W / 2 + L.focalShift - zg.bandR / 2;
      var lim0 = Math.max(zg.bandL + L.textBandGap, L.textEdge), lim1 = W - Math.max(zg.bandR + L.textBandGap, L.textEdge);
      var place = function (w) { return Math.min(Math.max(cx - w / 2, lim0), lim1 - w); };
      var sCap = L.tstopCap, wt = tsS ? textWidth(tsS, 700, sCap, 0.04) : 0;
      while (tsS && wb + gT + wt > lim1 - lim0 && sCap > L.tstopMin + 1e-9) {
        sCap = Math.max(L.tstopMin, sCap - 0.2); wt = textWidth(tsS, 700, sCap, 0.04);
      }
      if (!tsS || wb + gT + wt <= lim1 - lim0) {
        var one = wb + (tsS ? gT + wt : 0), x = place(one);
        topBase = baseFor(x, x + one, L.focalCap);
        text(big, 700, L.focalCap, x, topBase, 0.1);
        if (tsS) text(tsS, 700, sCap, x + wb + gT, topBase, 0.04);
      } else {
        var xb = place(wb), mid = xb + wb / 2;
        topBase = baseFor(xb, xb + wb, L.focalCap + 0.8 + L.tstopMin);
        text(big, 700, L.focalCap, xb, topBase, 0.1);
        sCap = L.tstopMin; wt = textWidth(tsS, 700, sCap, 0.04);
        text(tsS, 700, sCap, mid - wt / 2, topBase + 0.8 + sCap, 0.04);
      }
    }

    if (lay.inf) {
      var v = lay.inf.v;
      tick(v, W - Math.max(L.infLineEnd, zg.bandR), L.lineMajor);
      var g = glyph(700, '∞'), bb = g.bbox, sc = L.infH / (bb[3] - bb[2]);
      var right = W - Math.max(L.infRight, zg.bandR + 0.6), bottom = v - L.lineMajor / 2 - L.infGap;
      var ux = right - bb[1] * sc;
      shapes.push(mapContour(g.cmds.map(function (c) {
        if (c[0] === 'Z') return c;
        var r = [c[0]];
        for (var j = 1; j < c.length; j += 2) r.push(ux + c[j] * sc, bottom - (c[j + 1] - bb[2]) * sc);
        return r;
      }), T));
    }

    lay.data.forEach(function (m) {
      var sp = splitLabel(m.text);
      if (m.place === 'right') {
        var base = m.v - L.lineMajor / 2 - L.baseGap;
        var bw = textWidth(sp.big, 700, L.rCap, 0.05), sw = sp.sup ? textWidth(sp.sup, 700, L.rSup, 0.03) + 0.1 : 0;
        var re = rightEdgeFor(base - L.rCap, base);
        var u0 = re - bw - sw;
        text(sp.big, 700, L.rCap, u0, base, 0.05);
        if (sp.sup) text(sp.sup, 700, L.rSup, u0 + bw + 0.1, base - (L.rCap - L.rSup), 0.03);
        tick(m.v, u0 + bw + L.lineOver, L.lineMajor);
      } else {
        tick(m.v, tickShort, L.lineShort);
        if (m.place === 'left') {
          var cBase = m.v - L.leftLabelLift + L.lCap / 2;
          var bw2 = textWidth(sp.big, 400, L.lCap, 0.05);
          text(sp.big, 400, L.lCap, labelX, cBase, 0.05);
          if (sp.sup) text(sp.sup, 400, L.lSup, labelX + bw2 + 0.1, cBase - (L.lCap - L.lSup), 0.03);
        }
      }
    });
    if (opts.minors !== false) lay.minors.forEach(function (m) { tick(m.v, tickShort, L.lineMinor); });

    items.push({ fill: ink, contours: shapes });
    return { clip: outline, items: items, layout: lay, T: T };
  }

  // ---------- pagina's ----------
  // job = { ring: ringinstellingen, style, name, lenses, minors, lensText }
  function fmt(n, d) { return LANG === 'en' ? n.toFixed(d) : n.toFixed(d).replace('.', ','); }
  // controle-liniaal onderaan elk vel: 0 tot 10 cm, zodat je ziet of er op ware grootte is geprint
  function rulerShapes(shapes) {
    var rx = PAGE.firstX, ry = 281;
    shapes.push(polyCmds([[rx - 0.06, ry], [rx + 100.06, ry], [rx + 100.06, ry + 0.2], [rx - 0.06, ry + 0.2]]));
    for (var i = 0; i <= 100; i++) {
      (function (i) {
        var hgt = i % 10 === 0 ? 3.0 : i % 5 === 0 ? 2.0 : 1.2, x = rx + i;
        shapes.push(polyCmds([[x - 0.06, ry], [x + 0.06, ry], [x + 0.06, ry + hgt], [x - 0.06, ry + hgt]]));
        if (i % 10 === 0) {
          var s = String(i / 10);
          var off = textWidth(s, 400, 1.6, 0.05) / 2;
          shapes.push(textContours(s, 400, 1.6, 0.05, function (fx, fy) { return [x - off + fx, ry + 3.0 + 2.3 - fy]; }));
        }
      })(i);
    }
    shapes.push(textContours('CM', 400, 1.6, 0.05, function (fx, fy) { return [rx + 101.2 + fx, ry + 5.3 - fy]; }));
    shapes.push(textContours(say('PRINT OP 100% (WERKELIJKE GROOTTE)', 'PRINT AT 100% (ACTUAL SIZE)'), 400, 1.6, 0.1, function (fx, fy) { return [rx + 110 + fx, ry + 2.3 - fy]; }));
    shapes.push(textContours(say('0 TOT 10 OP DE LINIAAL = PRECIES 100 MM', '0 TO 10 ON THE RULER = EXACTLY 100 MM'), 400, 1.6, 0.1, function (fx, fy) { return [rx + 110 + fx, ry + 5.3 - fy]; }));
  }

  // ---------- lensdoppen: ronde stickers met het brandpunt, in de opmaak van de map ----------
  // De sticker is een ingezoomde strook: dezelfde vlakken, banden en strepen als op het label (19,39 mm breed),
  // geschaald tot de cirkel. Zo hoort een dop zichtbaar bij de lensset. Daarop het brandpunt, de T-stop en de lensnaam.
  // vierkant met afgeronde hoeken: r = 0 is een scherp vierkant, r = R is een cirkel; grow = rand erbij (afloop)
  function capShape(cx, cy, R, r, grow) {
    var h = R + grow, rr = r > 0 ? Math.min(h, r + grow) : 0, pts = [];
    if (rr <= 1e-6) return [[cx - h, cy - h], [cx + h, cy - h], [cx + h, cy + h], [cx - h, cy + h]];
    var n = Math.max(6, Math.ceil(rr * 1.6)), cs = [[cx + h - rr, cy - h + rr, -0.5], [cx + h - rr, cy + h - rr, 0], [cx - h + rr, cy + h - rr, 0.5], [cx - h + rr, cy - h + rr, 1]];
    cs.forEach(function (c) {
      for (var i = 0; i <= n; i++) { var a = (c[2] + i / n * 0.5) * Math.PI; pts.push([c[0] + rr * Math.cos(a), c[1] + rr * Math.sin(a)]); }
    });
    return pts;
  }
  // effen achtergrond voor lensdop of lenslijst: 'white' = wit, 'solid' = één gekozen kleur, anders de kleuren van de set
  function flatBg(bg, color) { return bg === 'white' ? '#ffffff' : bg === 'solid' && isHex(color) ? color : null; }
  // eigen rand voor lensdop of lenslijst: undefined = zoals het label, false = geen rand, anders { width, color, pos }
  function outlineOf(o, fallback) {
    if (o === undefined || o === null) return fallback;
    if (!o) return { on: false, width: fallback.width, color: fallback.color, pos: fallback.pos };
    return { on: o.on !== false, width: clamp(num(o.width, 0.4), 0.05, 3), color: isHex(o.color) ? o.color : '#111111', pos: ['in', 'center', 'out'].indexOf(o.pos) > -1 ? o.pos : 'in' };
  }
  function inkOn(hex) {
    var n = parseInt(String(hex).slice(1), 16), c = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map(function (v) { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); });
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2] > 0.32 ? '#111111' : '#ffffff';
  }
  function buildCap(lens, style, cx, cy, D, opts) {
    opts = opts || {};
    var Wv = 19.39, k = D / Wv, R = D / 2, r = clamp(Number(opts.round) || 0, 0, 1) * R, bleed = opts.bleed || 0;
    var vring = { W: Wv, top: -Wv / 2, length: Wv, bottom: Wv / 2 };
    var T = function (u, v) { return [cx + (u - Wv / 2) * k, cy + v * k]; };
    var cut = polyCmds(capShape(cx, cy, R, r, 0));
    var clip = bleed > 0 ? polyCmds(capShape(cx, cy, R, r, bleed)) : cut;
    var items = [];
    var vr = bleed > 0 ? { W: Wv, top: vring.top - bleed / k, length: vring.length + 2 * bleed / k, bottom: vring.bottom + bleed / k } : vring;
    var flat = flatBg(opts.bg, opts.color);
    if (flat) items.push({ fill: flat, contours: [polyCmds(capShape(cx, cy, R, 0, bleed + 1))] });
    else {
    var zg = zoneGeom(style, vring);
    zg.zones.forEach(function (z) {
      if (z.skip) return;
      // de buitenste vlakken lopen door tot in de afloop
      var zz = bleed > 0 ? Object.assign({}, z, { u0: z.u0 <= 0 ? -1 - bleed / k : z.u0, u1: z.u1 >= Wv ? Wv + 1 + bleed / k : z.u1 }) : z;
      items.push(zoneItem(zz, style.zones[z.key], vr, T));
    });
    style.stripes.forEach(function (sp) {
      if (sp.u0 >= Wv) return;
      items.push({ fill: sp.c, contours: [mapContour(polyCmds(rectLocal(sp.u0, Math.min(sp.u1, Wv + 1), vr.top - 1, vr.bottom + 1)), T)] });
    });
    }
    // tekst: lensnaam klein bovenaan, brandpunt groot, T-stop eronder; alles binnen de vorm
    var big = String(lens.focal || lens.topText || '').trim() || '?';
    var ts = opts.topExtra !== false && cleanT(lens.tstop) ? 'T' + cleanT(lens.tstop) : '';
    var nm = opts.lensText === false ? '' : [lens.brand || lens.brandName, lens.series].filter(Boolean).join(' ').toUpperCase();
    var capB = 0.34 * D, capT = 0.12 * D, capN = 0.068 * D, gap = 0.055 * D;
    var wB = textWidth(big, 700, capB, 0.02 * capB);
    if (wB > 0.74 * D) { capB *= 0.74 * D / wB; }
    var H = (nm ? capN + gap : 0) + capB + (ts ? gap * 1.3 + capT : 0), y = cy - H / 2;
    var shapes = [];
    // halve breedte van de vorm op hoogte dy vanaf het midden
    function halfW(dy) { dy = Math.abs(dy); if (dy <= R - r) return R; var e = dy - (R - r); return e >= r ? 0 : (R - r) + Math.sqrt(r * r - e * e); }
    function line(s, w, cap, track, base) {
      var hw = Math.min(halfW(base - cy), halfW(base - cap - cy)), maxW = 2 * hw - 0.14 * D;
      var tw = textWidth(s, w, cap, track);
      if (tw > maxW && tw > 0) { var f = maxW / tw; cap *= f; track *= f; tw = textWidth(s, w, cap, track); }
      var x = cx - tw / 2;
      shapes.push(textContours(s, w, cap, track, function (fx, fy) { return [x + fx, base - fy]; }));
    }
    if (nm) { line(nm, 400, capN, 0.12 * capN, y + capN); y += capN + gap; }
    line(big, 700, capB, 0.02 * capB, y + capB); y += capB;
    if (ts) line(ts, 700, capT, 0.04 * capT, y + gap * 1.3 + capT);
    items.push({ fill: flat ? inkOn(flat) : style.ink, contours: shapes });
    return { clip: clip, cut: cut, items: items };
  }
  // instellingen voor de lensdoppen uit de opdracht van een map
  function capConfig(job) {
    var style = normalizeStyle(job.style), ol = outlineOf(job.capOutline, style.outline);
    var D = clamp(Number(job.capD) || 40, 15, 120), per = Number(job.capCount) === 2 ? 2 : 1;
    // afronding 0..100 (%): 0 = vierkant, 100 = rond; oudere instelling 'shape' telt nog mee
    var roundPct = job.capRound !== undefined && job.capRound !== null && isFinite(Number(job.capRound)) ? Number(job.capRound) : (job.capShape === 'round' ? 100 : 0);
    var round = clamp(roundPct, 0, 100) / 100;
    var gap = job.capGap !== undefined && job.capGap !== null && isFinite(Number(job.capGap)) ? clamp(Number(job.capGap), 0, 15) : 4;
    // met ruimte ertussen loopt de kleur 1 mm door voorbij de snijlijn: een kleine afwijking bij het snijden valt dan niet op
    var bleed = job.noBleed ? 0 : (!ol.on && gap >= 2 ? Math.min(1, gap / 2 - 0.5) : 0);
    var list = [];
    (job.lenses || []).filter(function (l) { return l.include !== false; }).forEach(function (l) { for (var i = 0; i < per; i++) list.push(l); });
    return { style: style, ol: ol, D: D, round: round, gap: gap, bleed: bleed, list: list, lensText: job.lensText !== false, topExtra: job.topExtra !== false, bg: job.capBg, color: job.capColor };
  }
  function capSizeTxt(cfg) { return (cfg.round >= 1 ? 'Ø ' + fmt(cfg.D, 1) : fmt(cfg.D, 1) + ' × ' + fmt(cfg.D, 1)) + ' MM'; }
  function capHowTxt(cfg) {
    var how = cfg.gap < 0.5 && cfg.round === 0 ? say('SNIJ LANGS DE LIJNEN: EERST DE LANGE SNEDEN, DAN DE KORTE', 'CUT ALONG THE LINES: LONG CUTS FIRST, THEN THE SHORT ONES')
      : cfg.round >= 1 ? say('KNIP LANGS DE GRIJZE LIJN, OF GEBRUIK EEN CIRKELPONS VAN DEZE MAAT', 'CUT ALONG THE GREY LINE, OR USE A CIRCLE PUNCH OF THIS SIZE')
      : say('SNIJ LANGS DE GRIJZE LIJN', 'CUT ALONG THE GREY LINE');
    if (cfg.ol && cfg.ol.on) how = how.replace('GRIJZE LIJN', 'RAND').replace('GREY LINE', 'BORDER');
    return how;
  }
  // één sticker op een vel zetten (met omlijning of snijlijn); cap: true zodat de app weet dat het geen strook is
  function placeCap(page, lens, cx, cy, cfg) {
    var cap = buildCap(lens, cfg.style, cx, cy, cfg.D, { lensText: cfg.lensText, topExtra: cfg.topExtra, round: cfg.round, bleed: cfg.bleed, bg: cfg.bg, color: cfg.color });
    var ol = cfg.ol, citems = cap.items.slice();
    if (ol.on && ol.pos === 'out') page.items.push({ stroke: ol.color, width: ol.width * 2, contours: [cap.cut] });
    if (ol.on && ol.pos === 'in') citems.push({ stroke: ol.color, width: ol.width * 2, contours: [cap.cut] });
    page.items.push({ clip: cap.clip, items: citems, lensId: lens.id, cap: true });
    if (ol.on && ol.pos === 'center') page.items.push({ stroke: ol.color, width: ol.width, contours: [cap.cut] });
    if (!ol.on) page.items.push({ stroke: cfg.bleed > 0 ? '#7a7a7a' : '#bbbbbb', width: 0.1, contours: [cap.cut] });   // snijlijn
  }
  // stickers in een rechthoek [x0, x1] × [y0, y1] zetten; geeft terug hoeveel er pasten
  function fillCaps(page, list, cfg, x0, x1, y0, y1, center) {
    var D = cfg.D, gap = cfg.gap;
    var cols = Math.floor((x1 - x0 + gap) / (D + gap)), rows = Math.floor((y1 - y0 + gap) / (D + gap));
    if (cols < 1 || rows < 1) return 0;
    var nFit = Math.min(list.length, cols * rows);
    var left = center ? x0 + ((x1 - x0) - (cols * D + (cols - 1) * gap)) / 2 : x0;
    for (var i = 0; i < nFit; i++) {
      var c = i % cols, r = Math.floor(i / cols);
      placeCap(page, list[i], left + D / 2 + c * (D + gap), y0 + D / 2 + r * (D + gap), cfg);
    }
    return nFit;
  }
  // center = stickers midden op het vel; komt de lenslijst eronder, dan links uitgelijnd (zelfde linkerrand)
  function capPages(list, cfg, job, opts, center) {
    var top = 22, bottom = 274, pages = [];
    var cols = Math.max(1, Math.floor((210 - 2 * PAGE.firstX + cfg.gap) / (cfg.D + cfg.gap)));
    var rows = Math.max(1, Math.floor((bottom - top + cfg.gap) / (cfg.D + cfg.gap)));
    var perPage = cols * rows, n = Math.ceil(list.length / perPage);
    for (var p = 0; p < n; p++) {
      var page = { items: [], strips: [], caps: true }, shapes = [];
      var hdr = [job.name || 'Ringlabels', say('LENSDOPPEN', 'LENS CAPS'), capSizeTxt(cfg), opts.date || '', n > 1 ? say('VEL ', 'SHEET ') + (p + 1) + '/' + n : '']
        .filter(Boolean).join('   ·   ').toUpperCase();
      shapes.push(textContours(hdr, 400, 1.9, 0.12, function (fx, fy) { return [PAGE.firstX + fx, 12 - fy]; }));
      var how = capHowTxt(cfg);
      if (cfg.bleed > 0) how += say('   ·   DE KLEUR LOOPT ' + fmt(cfg.bleed, 1) + ' MM DOOR, ZODAT EEN KLEINE AFWIJKING NIET OPVALT', '   ·   THE COLOUR RUNS ' + fmt(cfg.bleed, 1) + ' MM PAST IT, SO A SMALL MISS DOES NOT SHOW');
      shapes.push(textContours(how, 400, 1.9, 0.12, function (fx, fy) { return [PAGE.firstX + fx, 15.2 - fy]; }));
      rulerShapes(shapes);
      page.items.push({ fill: '#222222', contours: shapes });
      var chunk = list.slice(p * perPage, (p + 1) * perPage);
      fillCaps(page, chunk, cfg, PAGE.firstX, 210 - PAGE.firstX, top, bottom, center !== false);
      page.capY1 = top + Math.ceil(chunk.length / cols) * (cfg.D + cfg.gap);   // onderkant van de stickers: daaronder is ruimte voor de lenslijst
      pages.push(page);
    }
    return pages;
  }
  function buildCapPages(job, opts) {
    var cfg = capConfig(job);
    return cfg.list.length ? capPages(cfg.list, cfg, job, opts || {}) : [];
  }
  // ---------- lenslijst: kaartje met alle lenzen van de map en hun T-stop, voor op de camera ----------
  // Zelfde aanpak als de lensdop: de achtergrond is een ingezoomde strook, zodat het kaartje zichtbaar bij de lensset hoort
  // (of wit met zwarte tekst). Links het brandpunt (vet), rechts de T-stop. De app kiest zelf 1, 2 of 3 kolommen:
  // de indeling die de grootste letters geeft.
  function listConfig(job) {
    var o = job.lensList || {}, style = normalizeStyle(job.style);
    var lenses = (job.lenses || []).filter(function (l) { return l.include !== false; });
    return { S: clamp(Number(o.size) || 50, 30, 90), n: Number(o.n) === 2 ? 2 : 1, flat: flatBg(o.bg, o.color), style: style, ol: outlineOf(o.outline, style.outline),
      corner: o.corner !== undefined && o.corner !== null && isFinite(Number(o.corner)) ? clamp(Number(o.corner), 0, 12) : 2.5,
      lenses: lenses, name: String(job.name || '').trim(), gap: 4, bleed: job.noBleed || outlineOf(o.outline, style.outline).on ? 0 : 1 };
  }
  function listSizeTxt(cfg) { var d = cfg.S % 1 ? 1 : 0; return fmt(cfg.S, d) + ' × ' + fmt(cfg.S, d) + ' MM'; }
  function buildLensList(cfg, x0, y0) {
    var S = cfg.S, k = S / 50, R = S / 2, cx = x0 + R, cy = y0 + R, r = (cfg.corner === undefined ? 2.5 : cfg.corner) * k, bleed = cfg.bleed, style = cfg.style;
    var cut = polyCmds(capShape(cx, cy, R, r, 0)), clip = bleed > 0 ? polyCmds(capShape(cx, cy, R, r, bleed)) : cut;
    var items = [], ink = cfg.flat ? inkOn(cfg.flat) : style.ink;
    if (cfg.flat) items.push({ fill: cfg.flat, contours: [polyCmds(capShape(cx, cy, R, 0, bleed + 1))] });
    else {
      var Wv = 19.39, kz = S / Wv, vring = { W: Wv, top: -Wv / 2, length: Wv, bottom: Wv / 2 };
      var vr = bleed > 0 ? { W: Wv, top: vring.top - bleed / kz, length: vring.length + 2 * bleed / kz, bottom: vring.bottom + bleed / kz } : vring;
      var T = function (u, v) { return [cx + (u - Wv / 2) * kz, cy + v * kz]; };
      zoneGeom(style, vring).zones.forEach(function (z) {
        if (z.skip) return;
        var zz = bleed > 0 ? Object.assign({}, z, { u0: z.u0 <= 0 ? -1 - bleed / kz : z.u0, u1: z.u1 >= Wv ? Wv + 1 + bleed / kz : z.u1 }) : z;
        items.push(zoneItem(zz, style.zones[z.key], vr, T));
      });
      style.stripes.forEach(function (sp) {
        if (sp.u0 >= Wv) return;
        items.push({ fill: sp.c, contours: [mapContour(polyCmds(rectLocal(sp.u0, Math.min(sp.u1, Wv + 1), vr.top - 1, vr.bottom + 1)), T)] });
      });
    }
    var m = 3.2 * k, left = x0 + m, right = x0 + S - m, W = right - left, y = y0 + m, bottom = y0 + S - m, shapes = [];
    // naam van de map bovenaan, met een lijn eronder
    if (cfg.name) {
      var nm = cfg.name.toUpperCase(), capN = 2.3 * k, trN = 0.14 * capN, twN = textWidth(nm, 700, capN, trN);
      if (twN > W) { var fN = W / twN; capN *= fN; trN *= fN; twN = textWidth(nm, 700, capN, trN); }
      var xN = cx - twN / 2, bN = y + capN;
      shapes.push(textContours(nm, 700, capN, trN, function (fx, fy) { return [xN + fx, bN - fy]; }));
      y = bN + 1.5 * k;
      shapes.push(polyCmds([[left, y], [right, y], [right, y + 0.25 * k], [left, y + 0.25 * k]]));
      y += 0.25 * k + 1.7 * k;
    }
    var rows = cfg.lenses.map(function (l) {
      return { f: String(l.focal || l.topText || '').trim() || '?', t: cleanT(l.tstop) ? 'T' + cleanT(l.tstop) : '' };
    });
    // indeling bij een aantal kolommen: de letterhoogte volgt uit de regelhoogte en uit de breedte van de breedste regel
    function fit(cols) {
      var per = Math.ceil(rows.length / cols), colGap = 3 * k, cw = (W - (cols - 1) * colGap) / cols, pitch = (bottom - y) / per;
      var cap = Math.min(0.62 * pitch, 6 * k);
      function widths(c) {
        var wf = 0, wt = 0;
        rows.forEach(function (q) { wf = Math.max(wf, textWidth(q.f, 700, c, 0.02 * c)); if (q.t) wt = Math.max(wt, textWidth(q.t, 400, c, 0.03 * c)); });
        return { wf: wf, wt: wt, g: wt ? 0.6 * c : 0 };
      }
      var w = widths(cap), tot = w.wf + w.g + w.wt;
      if (tot > cw && tot > 0) { cap *= cw / tot; w = widths(cap); }
      return { cols: cols, per: per, cw: cw, colGap: colGap, pitch: pitch, cap: cap, w: w };
    }
    if (rows.length) {
      var L = fit(1);
      for (var c = 2; c <= 3 && c <= rows.length; c++) { var L2 = fit(c); if (L2.cap > L.cap * 1.08) L = L2; }
      var tot = L.w.wf + L.w.g + L.w.wt;
      rows.forEach(function (q, i) {
        var col = Math.floor(i / L.per), row = i % L.per;
        var bx = left + col * (L.cw + L.colGap) + (L.cw - tot) / 2, base = y + row * L.pitch + (L.pitch + L.cap) / 2;
        var xf = bx + L.w.wf - textWidth(q.f, 700, L.cap, 0.02 * L.cap);
        shapes.push(textContours(q.f, 700, L.cap, 0.02 * L.cap, function (fx, fy) { return [xf + fx, base - fy]; }));
        if (q.t) { var xt = bx + L.w.wf + L.w.g; shapes.push(textContours(q.t, 400, L.cap, 0.03 * L.cap, function (fx, fy) { return [xt + fx, base - fy]; })); }
      });
      for (var cc = 1; cc < L.cols; cc++) {   // dunne lijn tussen de kolommen
        var xs = left + cc * (L.cw + L.colGap) - L.colGap / 2;
        shapes.push(polyCmds([[xs - 0.1 * k, y], [xs + 0.1 * k, y], [xs + 0.1 * k, bottom], [xs - 0.1 * k, bottom]]));
      }
    }
    items.push({ fill: ink, contours: shapes });
    return { clip: clip, cut: cut, items: items };
  }
  function placeList(page, cfg, x0, y0) {
    var card = buildLensList(cfg, x0, y0), ol = cfg.ol, citems = card.items.slice();
    if (ol.on && ol.pos === 'out') page.items.push({ stroke: ol.color, width: ol.width * 2, contours: [card.cut] });
    if (ol.on && ol.pos === 'in') citems.push({ stroke: ol.color, width: ol.width * 2, contours: [card.cut] });
    page.items.push({ clip: card.clip, items: citems, list: true });
    if (ol.on && ol.pos === 'center') page.items.push({ stroke: ol.color, width: ol.width, contours: [card.cut] });
    if (!ol.on) page.items.push({ stroke: '#7a7a7a', width: 0.1, contours: [card.cut] });   // snijlijn
  }
  // kaartjes in een rechthoek zetten, met een regel uitleg erboven (y0 = bovenkant van die regel); geeft terug hoeveel er pasten
  function fillLists(page, cfg, count, x0, x1, y0, y1) {
    var S = cfg.S, gap = cfg.gap, top = y0 + 4;
    var cols = Math.floor((x1 - x0 + gap) / (S + gap)), rws = Math.floor((y1 - top + gap) / (S + gap));
    if (cols < 1 || rws < 1) return 0;
    var n = Math.min(count, cols * rws);
    var t = say('LENSLIJST', 'LENS LIST') + '  ·  ' + listSizeTxt(cfg) + '  ·  ' + (cfg.ol && cfg.ol.on ? say('SNIJ LANGS DE RAND', 'CUT ALONG THE BORDER') : say('SNIJ LANGS DE GRIJZE LIJN', 'CUT ALONG THE GREY LINE')), cap = 1.6, tw = textWidth(t, 400, cap, 0.1);
    if (tw > x1 - x0) cap *= (x1 - x0) / tw;
    page.items.push({ fill: '#222222', contours: [textContours(t, 400, cap, 0.1, function (fx, fy) { return [x0 + fx, y0 + 1.6 - fy]; })] });
    for (var i = 0; i < n; i++) placeList(page, cfg, x0 + (i % cols) * (S + gap), top + Math.floor(i / cols) * (S + gap));
    return n;
  }
  function listPages(cfg, count, job, opts) {
    var pages = [], left = count, guard = 0;
    while (left > 0 && guard++ < 4) {
      var page = { items: [], strips: [], caps: true, listOnly: true }, shapes = [];
      var hdr = [job.name || 'Ringlabels', say('LENSLIJST', 'LENS LIST'), listSizeTxt(cfg), opts.date || ''].filter(Boolean).join('   ·   ').toUpperCase();
      shapes.push(textContours(hdr, 400, 1.9, 0.12, function (fx, fy) { return [PAGE.firstX + fx, 12 - fy]; }));
      rulerShapes(shapes);
      page.items.push({ fill: '#222222', contours: shapes });
      var got = fillLists(page, cfg, left, PAGE.firstX, 210 - PAGE.firstX, 18, 274);
      if (!got) break;
      left -= got; pages.push(page);
    }
    return pages;
  }
  // stroken plus lensdoppen en lenslijst: wat past, komt naast de stroken op het laatste vel; de rest op eigen vellen
  // alles wat op het label, de lensdop en de lenslijst staat, in de gekozen letter; de tekst op het vel blijft de standaardletter
  layoutLens = onLabel(layoutLens); buildStrip = onLabel(buildStrip); buildCap = onLabel(buildCap); buildLensList = onLabel(buildLensList);
  function buildSheets(job, opts) {
    opts = opts || {};
    var pages = buildPages(job, opts), free = null;
    var last = pages[pages.length - 1];
    // vrije ruimte rechts van de laatste strook; used = er staat al iets in (dan komt de uitleg direct eronder)
    if (last && last.strips.length) {
      var st = last.strips[last.strips.length - 1];
      free = { page: last, x0: st.x0 + st.ring.W + 6, x1: 210 - PAGE.firstX, y0: 22, y1: 274, used: false };
    }
    // lensdoppen en lenslijst krijgen dezelfde linkerrand, zodat je die in één snede meeneemt.
    // Past de lenslijst net niet naast de stroken, dan schuiven beide 3 mm naar de laatste strook toe.
    var lc = job.lensList && job.lensList.on ? listConfig(job) : null;
    if (lc && !lc.lenses.length) lc = null;
    var xLeft = free ? (lc && lc.S > free.x1 - free.x0 ? free.x0 - 3 : free.x0) : 0;
    if (job.caps) {
      var cfg = capConfig(job), list = cfg.list;
      if (list.length && free) {
        var x0 = xLeft, x1 = free.x1;
        var nFit = fillCaps(last, list, cfg, x0, x1, free.y0, free.y1, false);
        if (nFit) {
          last.capsIn = nFit;
          // korte uitleg boven de stickers, passend in de vrije ruimte
          var t = say('LENSDOPPEN', 'LENS CAPS') + '  ·  ' + capSizeTxt(cfg) + '  ·  ' + capHowTxt(cfg), cap = 1.6, tw = textWidth(t, 400, cap, 0.1);
          if (tw > x1 - x0) { cap *= (x1 - x0) / tw; }
          last.items.push({ fill: '#222222', contours: [textContours(t, 400, cap, 0.1, function (fx, fy) { return [x0 + fx, 19.6 - fy]; })] });
          list = list.slice(nFit);
          var ccols = Math.floor((x1 - x0 + cfg.gap) / (cfg.D + cfg.gap));
          free.y0 += Math.ceil(nFit / ccols) * (cfg.D + cfg.gap) + 1.5; free.used = true;
        }
      }
      if (list.length) {
        var cp = capPages(list, cfg, job, opts, !lc), lp = cp[cp.length - 1];
        pages = pages.concat(cp);
        if (lp) free = { page: lp, x0: PAGE.firstX, x1: 210 - PAGE.firstX, y0: lp.capY1 + 1.5, y1: 274, used: true };
      }
    }
    if (lc) {
      var got = free ? fillLists(free.page, lc, lc.n, free.page.caps ? free.x0 : xLeft, free.x1, free.used ? free.y0 : free.y0 - 4, free.y1) : 0;
      if (got) free.page.listIn = got;
      if (got < lc.n) pages = pages.concat(listPages(lc, lc.n - got, job, opts));
    }
    return pages;
  }

  // Afbeeldingen voor een snijmachine (bijvoorbeeld Cricut Print Then Cut): alleen de labels zelf, zonder tekst, liniaal en
  // snijlijnen, strak bijgesneden. De vorm van elk label is precies de snijlijn; de machine volgt de rand van de afbeelding.
  // Het snijvlak van Print Then Cut is geen volle rechthoek: in de vier hoeken staan de markeringen. Een hoge afbeelding mag
  // daarom niet ook breed zijn. Dus: de stroken (hoog) blijven smal, hooguit maxW breed, en de lensdoppen en de lenslijst
  // komen in een eigen, lage afbeelding. box = [x, y, breedte, hoogte] in mm.
  function buildCutSheets(job, opts) {
    opts = opts || {};
    var j = {}, out = [], k; for (k in job) j[k] = job[k];
    j.noBleed = true;
    var maxW = opts.maxW || 120, maxH = opts.maxH || 269.8;
    // Het snijvlak is een trapvorm: hoe hoger de afbeelding, hoe smaller hij moet zijn. area = [[breedte, hoogte], ...] in mm.
    var area = opts.area || [[maxW, maxH]];
    function fits(w, h) { return area.some(function (t) { return w <= t[0] + 0.01 && h <= t[1] + 0.01; }); }
    var ring = ringFor(j.ring), gap = opts.gap || 4, pitch = ring.W + gap;
    var per = Math.max(1, Math.min(opts.per || 99, Math.floor((maxW - ring.W + 0.05) / pitch) + 1));
    function finish(pageItems) {
      var items = pageItems.filter(function (it) { return it.clip; });
      if (!items.length) return;
      var x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
      items.forEach(function (it) { it.clip.forEach(function (c) { for (var i = 1; i + 1 < c.length; i += 2) { x0 = Math.min(x0, c[i]); x1 = Math.max(x1, c[i]); y0 = Math.min(y0, c[i + 1]); y1 = Math.max(y1, c[i + 1]); } }); });
      // wit onder elk label: zo zit er nergens een doorzichtige naad tussen twee kleurvlakken
      var cut = items.map(function (it) { return { clip: it.clip, items: [{ fill: '#ffffff', contours: [it.clip] }].concat(it.items) }; });
      // maatstrook onder de labels: 0 tot 10 cm, om na het printen en snijden de schaal na te meten.
      // Hij wordt als los stukje uitgesneden. Past hij niet meer binnen maxH, dan blijft hij weg.
      var ruler = false, RH = 8, RGAP = 3, bw0 = x1 - x0, bh0 = y1 - y0;
      // maatstrook eronder als dat binnen het snijvlak past, anders ernaast, anders weg
      var below = fits(Math.max(bw0, 110), bh0 + RGAP + RH), beside = !below && fits(bw0 + RGAP + RH, Math.max(bh0, 110));
      function dsNote(bw, bh) {
        // het formaat van deze afbeelding, in cm zoals Design Space het vraagt: dat zijn de getallen die je bij Formaat invult
        return say('0 TOT 10 = 100 MM', '0 TO 10 = 100 MM') + '   ·   ' + say('IN DESIGN SPACE: B ', 'IN DESIGN SPACE: W ') + fmt(bw / 10, 2) + ' × H ' + fmt(bh / 10, 2) + ' CM';
      }
      if (opts.ruler && beside) {
        // hoge afbeelding (de stroken): maatstrook rechtop ernaast, zodat de afbeelding niet hoger wordt dan de stroken zelf.
        // Het snijvlak is hoog al krap; in de breedte is ruimte genoeg.
        var rx = x1 + RGAP, sv = [], clipV = polyCmds([[rx, y0], [rx + RH, y0], [rx + RH, y0 + 110], [rx, y0 + 110]]);
        for (var tv = 0; tv <= 100; tv++) {
          var hv = tv % 10 === 0 ? 3.0 : tv % 5 === 0 ? 2.0 : 1.2, ty = y0 + 5 + tv;
          sv.push(polyCmds([[rx, ty - 0.06], [rx + hv, ty - 0.06], [rx + hv, ty + 0.06], [rx, ty + 0.06]]));
          if (tv % 10 === 0) (function (ty, lab) {
            sv.push(textContours(lab, 400, 1.6, 0.05, function (fx, fy) { return [rx + 3.5 + fx, ty + 0.8 - fy]; }));
          })(ty, String(tv / 10));
        }
        var bwV = rx + RH - x0, bhV = Math.max(y1 - y0, 110);
        // tekst van boven naar onder, met de bovenkant van de letters naar buiten
        sv.push(textContours(dsNote(bwV, bhV), 700, 1.3, 0.06, function (fx, fy) { return [rx + 6.3 + fy, y0 + 5 + fx]; }));
        cut.push({ clip: clipV, items: [{ fill: '#ffffff', contours: [clipV] }, { fill: '#111111', contours: sv }] });
        x1 = rx + RH; y1 = Math.max(y1, y0 + 110); ruler = true;
      } else if (opts.ruler && below) {
        // lage afbeelding (lensdoppen, lenslijst): maatstrook eronder
        var ry = y1 + RGAP, sh = [], clip = polyCmds([[x0, ry], [x0 + 110, ry], [x0 + 110, ry + RH], [x0, ry + RH]]);
        for (var t = 0; t <= 100; t++) {
          var hgt = t % 10 === 0 ? 3.0 : t % 5 === 0 ? 2.0 : 1.2, tx = x0 + 5 + t;
          sh.push(polyCmds([[tx - 0.06, ry], [tx + 0.06, ry], [tx + 0.06, ry + hgt], [tx - 0.06, ry + hgt]]));
          if (t % 10 === 0) (function (tx, lab) {
            var off = textWidth(lab, 400, 1.6, 0.05) / 2;
            sh.push(textContours(lab, 400, 1.6, 0.05, function (fx, fy) { return [tx - off + fx, ry + 5.6 - fy]; }));
          })(tx, String(t / 10));
        }
        sh.push(textContours(dsNote(Math.max(x1 - x0, 110), ry + RH - y0), 700, 1.3, 0.06, function (fx, fy) { return [x0 + 5 + fx, ry + 7.5 - fy]; }));
        cut.push({ clip: clip, items: [{ fill: '#ffffff', contours: [clip] }, { fill: '#111111', contours: sh }] });
        x1 = Math.max(x1, x0 + 110); y1 = ry + RH; ruler = true;
      }
      out.push({ items: cut, ruler: ruler, box: [x0, y0, x1 - x0, y1 - y0], fits: fits(x1 - x0, y1 - y0),
        strips: items.filter(function (it) { return !it.cap && !it.list; }).length,
        caps: items.filter(function (it) { return it.cap; }).length, lists: items.filter(function (it) { return it.list; }).length });
    }
    // 1. stroken: smal en hoog
    buildPages(j, { perPage: per, pitch: pitch }).forEach(function (p) { finish(p.items); });
    // 2. lensdoppen en lenslijst: in een eigen afbeelding, ook hooguit maxW breed
    var caps = j.caps ? capConfig(j) : null, list = caps ? caps.list.slice() : [];
    var lc = j.lensList && j.lensList.on ? listConfig(j) : null, left = lc && lc.lenses.length ? lc.n : 0;
    var room = maxH - (opts.ruler ? 12 : 0), guard = 0;
    while ((list.length || left > 0) && guard++ < 12) {
      var page = { items: [], strips: [] }, y = 0;
      if (list.length) {
        var cols = Math.max(1, Math.floor((maxW + caps.gap) / (caps.D + caps.gap)));
        var n = fillCaps(page, list, caps, 0, Math.max(maxW, caps.D), 0, room, false);
        if (!n) { list = []; } else { list = list.slice(n); y = Math.ceil(n / cols) * (caps.D + caps.gap); }
      }
      if (!list.length && left > 0) {
        var got = fillLists(page, lc, left, 0, Math.max(maxW, lc.S), y - 4, room);
        if (!got && !page.items.length) left = 0; else left -= got;
      }
      finish(page.items);
    }
    return out;
  }

  function buildPages(job, opts) {
    opts = opts || {};
    var ring = ringFor(job.ring);
    var style = normalizeStyle(job.style);
    var lenses = (job.lenses || []).filter(function (l) { return l.include !== false; });
    // smalle labels: dichter op elkaar en meer per vel (standaardlabel: 7 per vel, zoals altijd)
    var pitch = ring.W >= 19 ? PAGE.pitch : Math.max(ring.W + 7, 12);
    var perPage = ring.W >= 19 ? PAGE.perPage : Math.max(1, Math.floor((210 - 2 * PAGE.firstX + (pitch - ring.W)) / pitch));
    if (opts.pitch) pitch = Math.max(ring.W + 1, opts.pitch);
    if (opts.perPage) perPage = Math.max(1, Math.min(opts.pitch ? 99 : perPage, Math.floor(opts.perPage)));
    var pages = [], n = Math.max(1, Math.ceil(lenses.length / perPage));
    var dateStr = opts.date || '';
    for (var p = 0; p < n; p++) {
      var page = { items: [], strips: [] };
      var ink = '#222222', shapes = [];
      var hdr = [job.name || 'Ringlabels', ring.label, ((LANG === 'en' ? { center: 'NUDGE–∞ ', top: 'TOP OF NUDGE–∞ ', bottom: 'BOTTOM OF NUDGE–∞ ' } : { center: 'NUDGE–∞ ', top: 'BOVENRAND NUDGE–∞ ', bottom: 'ONDERRAND NUDGE–∞ ' })[ring.zeroRef] + fmt(ring.offsetInput, 2) + ' MM').replace(/^.*$/, function (t) { return ring.anchorFv === 10000 && !ring.offsetInput ? say('∞-AANSLAG OP HET MIDDEN VAN DE NUDGE', '∞ END STOP AT THE CENTER OF THE NUDGE') : t; }), say('LENGTE ', 'LENGTH ') + fmt(ring.length, 1) + ' MM', dateStr, n > 1 ? say('VEL ', 'SHEET ') + (p + 1) + '/' + n : '']
        .filter(Boolean).join('   ·   ').toUpperCase();
      shapes.push(textContours(hdr, 400, 1.9, 0.12, function (fx, fy) { return [PAGE.firstX + fx, 12 - fy]; }));
      // tweede regel: hoe ∞ en de schaal zijn berekend, zodat je op elk geprint vel ziet welke instelling is gebruikt
      var infTxt = ring.infMode === 'lens'
        ? (ring.anchorFv !== null ? say('∞ PER LENS, GEMETEN OP ', '∞ PER LENS, MEASURED ON ') + (ring.anchorLabel || 'INF ' + ring.anchorFv) : say('∞ OP DEZELFDE PLEK  (GEEN REFERENTIELENS GEKOZEN)', '∞ AT THE SAME SPOT  (NO REFERENCE LENS CHOSEN)'))
        : say('∞ OP DEZELFDE PLEK VOOR ELKE LENS', '∞ AT THE SAME SPOT FOR EVERY LENS');
      var hdr2 = (infTxt + say('   ·   SCHAAL ', '   ·   SCALE ') + fmt(ring.mmPer1000, 2) + ' MM PER 1000').toUpperCase();
      shapes.push(textContours(hdr2, 400, 1.9, 0.12, function (fx, fy) { return [PAGE.firstX + fx, 15.2 - fy]; }));
      rulerShapes(shapes);
      page.items.push({ fill: ink, contours: shapes });

      lenses.slice(p * perPage, (p + 1) * perPage).forEach(function (lens, k) {
        var x0 = PAGE.firstX + k * pitch, y0 = PAGE.stripTop - ring.top;
        var st = buildStrip(lens, ring, style, x0, y0, { minors: job.minors !== false, lensText: job.lensText !== false, topExtra: job.topExtra !== false, lineScale: job.lineScale });
        // omlijning: binnen = op het label, center = half op de snijlijn, out = buiten het label
        var ol = style.outline, sitems = st.items.slice();
        if (ol.on && ol.pos === 'out') page.items.push({ stroke: ol.color, width: ol.width * 2, contours: [st.clip] });
        if (ol.on && ol.pos === 'in') sitems.push({ stroke: ol.color, width: ol.width * 2, contours: [st.clip] });
        page.items.push({ clip: st.clip, items: sitems, lensId: lens.id });
        if (ol.on && ol.pos === 'center') page.items.push({ stroke: ol.color, width: ol.width, contours: [st.clip] });
        page.strips.push({ lensId: lens.id, x0: x0, y0: y0, clip: st.clip, layout: st.layout, T: st.T, ring: ring });
      });
      pages.push(page);
    }
    return pages;
  }

  // ---------- meetlabel: mm-schaal, 0 = midden van de nudge ----------
  function buildCalibPages(rs, opts) {
    opts = opts || {};
    var ring = ringFor(rs), W = ring.W, page = { items: [], strips: [] }, ink = '#111111';
    var hs = [];
    var EN = LANG === 'en';
    var refTxt = (EN ? { center: 'the center of the nudge', top: 'the top edge of the nudge (side of the number at the top)', bottom: 'the bottom edge of the nudge (side of \u221e)' }
      : { center: 'het midden van de nudge', top: 'de bovenrand van de nudge (kant van het getal bovenaan)', bottom: 'de onderrand van de nudge (kant van \u221e)' })[ring.zeroRef];
    var title = (EN ? 'CALIBRATION LABEL   ·   0 = ' + ({ center: 'CENTER OF', top: 'TOP OF', bottom: 'BOTTOM OF' })[ring.zeroRef] + ' NUDGE   ·   '
      : 'MEETLABEL   ·   0 = ' + ({ center: 'MIDDEN', top: 'BOVENRAND', bottom: 'ONDERRAND' })[ring.zeroRef] + ' NUDGE   ·   ')
      + ring.label.toUpperCase() + say('   ·   LENGTE ', '   ·   LENGTH ') + fmt(ring.length, 1) + ' MM' + (ring.radius ? '' : say(' (RECHT)', ' (STRAIGHT)')) + (opts.date ? '   ·   ' + opts.date : '');
    hs.push(textContours(title, 400, 1.9, 0.12, function (fx, fy) { return [PAGE.firstX + fx, 12 - fy]; }));
    var tx = PAGE.firstX + 3 * PAGE.pitch + 6, ty = 34, lh = 6.2;
    var lines = EN ? [
      [700, 3.0, 'How to measure the nudge to infinity'],
      [400, 0, ''],
      [400, 2.2, '1. Cut out a strip along the line.'],
      [400, 2.2, ring.notch.depth > 0 ? '2. Stick it on the ring, with the cutout around the nudge.' : '2. Stick it on the ring, with 0 against the nudge.'],
      [400, 2.2, '3. Turn the lens to infinity (\u221e).'],
      [400, 2.2, '4. Read the scale at the index mark of your hand unit.'],
      [400, 2.2, '5. Enter that number at "Nudge to \u221e line".'],
      [400, 0, ''],
      [400, 1.9, '0 is ' + refTxt.split(' (')[0] + '.'],
      [400, 1.9, ring.zeroRef === 'center' ? 'The edges of the nudge are at -' + fmt(ring.notch.h, 2) + ' and +' + fmt(ring.notch.h, 2) + ' mm.' : refTxt.indexOf('(') > -1 ? 'That is the ' + refTxt.split('(')[1].replace(')', '') + '.' : ''],
      [400, 1.9, 'The app is currently set up the same way.'],
      [400, 0, ''],
      [700, 2.2, 'Checking the scale'],
      [400, 1.9, 'Also read at the closest distance (MOD) of the lens.'],
      [400, 1.9, 'The difference from infinity, compared with "From \u221e"'],
      [400, 1.9, 'in the app, shows whether the scale is right for this ring.'],
      [400, 0, ''],
      [700, 2.2, 'Lens without a lens file'],
      [400, 1.9, 'Choose "Measure a lens" in the app. Set the lens to every'],
      [400, 1.9, 'distance marked on it and enter what you read here.']
    ] : [
      [700, 3.0, 'Zo meet je de nudge tot oneindig'],
      [400, 0, ''],
      [400, 2.2, '1. Knip een strook uit langs de lijn.'],
      [400, 2.2, ring.notch.depth > 0 ? '2. Plak hem op de ring, met de uitsparing om de nudge.' : '2. Plak hem op de ring, met 0 tegen de nudge.'],
      [400, 2.2, '3. Draai de lens naar oneindig (\u221e).'],
      [400, 2.2, '4. Lees de schaal af bij het indexstreepje van je handunit.'],
      [400, 2.2, '5. Vul dat getal in bij "Nudge tot \u221e-lijn".'],
      [400, 0, ''],
      [400, 1.9, '0 is ' + refTxt.split(' (')[0] + '.'],
      [400, 1.9, ring.zeroRef === 'center' ? 'De randen van de nudge liggen op -' + fmt(ring.notch.h, 2) + ' en +' + fmt(ring.notch.h, 2) + ' mm.' : refTxt.indexOf('(') > -1 ? 'Dat is de ' + refTxt.split('(')[1].replace(')', '') + '.' : ''],
      [400, 1.9, 'Zo staat de app nu ook ingesteld.'],
      [400, 0, ''],
      [700, 2.2, 'Controle van de schaal'],
      [400, 1.9, 'Lees ook af bij de kortste afstand (MOD) van de lens.'],
      [400, 1.9, 'Het verschil met oneindig, vergeleken met "Vanaf \u221e"'],
      [400, 1.9, 'in de app, laat zien of de schaal klopt voor deze ring.'],
      [400, 0, ''],
      [700, 2.2, 'Lens zonder lensbestand'],
      [400, 1.9, 'Kies "Lens inmeten" in de app. Zet de lens op elke afstand'],
      [400, 1.9, 'die erop staat en vul in wat je hier afleest.']
    ];
    var yy = ty;
    lines.forEach(function (l) {
      if (!l[1]) { yy += 3; return; }
      var base = yy;
      hs.push(textContours(l[2], l[0], l[1], 0.04, function (fx, fy) { return [tx + fx, base - fy]; }));
      yy += l[1] >= 2.2 ? lh : 4.6;
    });
    var rx = PAGE.firstX, ry = 281;
    hs.push(polyCmds([[rx - 0.06, ry], [rx + 100.06, ry], [rx + 100.06, ry + 0.2], [rx - 0.06, ry + 0.2]]));
    for (var i = 0; i <= 100; i++) {
      var hgt = i % 10 === 0 ? 3.0 : i % 5 === 0 ? 2.0 : 1.2, x = rx + i;
      hs.push(polyCmds([[x - 0.06, ry], [x + 0.06, ry], [x + 0.06, ry + hgt], [x - 0.06, ry + hgt]]));
      if (i % 10 === 0) {
        var s0 = String(i / 10), off = textWidth(s0, 400, 1.6, 0.05) / 2;
        hs.push(textContours(s0, 400, 1.6, 0.05, function (fx, fy) { return [x - off + fx, ry + 5.3 - fy]; }));
      }
    }
    hs.push(textContours(say('PRINT OP 100% · 0 TOT 10 = PRECIES 100 MM', 'PRINT AT 100% · 0 TO 10 = EXACTLY 100 MM'), 400, 1.6, 0.1, function (fx, fy) { return [rx + 110 + fx, ry + 2.3 - fy]; }));
    page.items.push({ fill: '#222222', contours: hs });

    var n = opts.count || 3;
    for (var k = 0; k < n; k++) {
      var x0 = PAGE.firstX + k * PAGE.pitch, y0 = PAGE.stripTop - ring.top;
      var T = makeT(x0, y0, ring.radius), clip = mapContour(polyCmds(outlineLocal(ring, cornerRadii(ring))), T);
      var items = [
        { fill: '#ffffff', contours: [mapContour(polyCmds(rectLocal(-1, W + 1, ring.top - 1, ring.bottom + 1)), T)] },
        { fill: '#0bb4ae', contours: [mapContour(polyCmds(rectLocal(-1, 1.2, ring.top - 1, ring.bottom + 1)), T)] }
      ];
      var sh = [];
      var tick = function (v, len, th) {
        sh.push(mapContour(polyCmds([[-0.5, v - th / 2], [len, v - th / 2], [len, v + th / 2], [-0.5, v + th / 2]]), T));
        sh.push(mapContour(polyCmds([[W - len, v - th / 2], [W + 0.5, v - th / 2], [W + 0.5, v + th / 2], [W - len, v + th / 2]]), T));
      };
      var z0 = ring.zeroV;
      for (var q = Math.ceil((ring.top + 0.4 - z0) * 2); q <= Math.floor((ring.bottom - 0.4 - z0) * 2); q++) {
        var mm = q / 2, whole = q % 2 === 0, vv = z0 + mm;
        if (!whole && mm > 40) continue;
        if (mm % 10 === 0) tick(vv, 6.0, 0.25);
        else if (mm % 5 === 0) tick(vv, 4.6, 0.2);
        else if (whole) tick(vv, 2.8, 0.14);
        else tick(vv, 1.6, 0.1);
        if (whole && mm >= 0 && mm % 5 === 0) {
          var big = mm % 10 === 0, cap = big ? 2.5 : 1.9, wgt = big ? 700 : 400, str2 = String(mm);
          var tw = textWidth(str2, wgt, cap, 0.05);
          (function (vb) { sh.push(mapContour(textContours(str2, wgt, cap, 0.05, function (fx, fy) { return [W / 2 - tw / 2 + fx, vb + cap / 2 - fy]; }), T)); })(vv);
        }
      }
      items.push({ fill: ink, contours: sh });
      page.items.push({ clip: clip, items: items });
      page.items.push({ stroke: '#555555', width: 0.15, contours: [clip] });
    }
    return [page];
  }

  // ---------- uitvoer: SVG ----------
  function n3(x) { return (Math.round(x * 1000) / 1000).toString(); }
  function dOf(contours) {
    var s = [];
    contours.forEach(function (c) {
      c.forEach(function (cm) {
        if (cm[0] === 'Z') { s.push('Z'); return; }
        s.push(cm[0] + cm.slice(1).map(n3).join(' '));
      });
    });
    return s.join('');
  }
  function hex3(c) {
    return '#' + c.map(function (x) { var v = Math.round(clamp(x, 0, 1) * 255).toString(16); return v.length < 2 ? '0' + v : v; }).join('');
  }
  function avg(a, b) { return [(a[2] + b[2]) / 2, (a[3] + b[3]) / 2, (a[4] + b[4]) / 2]; }
  function ext(p, from, d) { // verleng punt p weg van 'from' met d mm
    var dx = p[0] - from[0], dy = p[1] - from[1], l = Math.hypot(dx, dy) || 1;
    return [p[0] + dx / l * d, p[1] + dy / l * d];
  }
  // tekent een verloopvlak als rij stroken met lineaire SVG-verlopen
  function meshSVG(it, nextId) {
    var M = it.mesh, out = [], R = M.length, C = M[0].length, OV = 0.06;
    function quad(rA, rB, cA, cB) { // polygoon over rijen rA..rB, kolommen cA..cB
      var pts = [];
      for (var r = rA; r <= rB; r++) pts.push([M[r][cA][0], M[r][cA][1]]);
      var last = pts.length - 1;
      if (rB < R - 1) pts[last] = ext(pts[last], pts[last - 1], OV);
      var right = [];
      for (var r2 = rA; r2 <= rB; r2++) right.push([M[r2][cB][0], M[r2][cB][1]]);
      if (rB < R - 1) right[right.length - 1] = ext(right[right.length - 1], right[right.length - 2], OV);
      if (cB < C - 1) right = right.map(function (q, i) { return ext(q, pts[i], OV); });
      return 'M' + pts.concat(right.reverse()).map(function (q) { return n3(q[0]) + ' ' + n3(q[1]); }).join('L') + 'Z';
    }
    function grad(x1, y1, x2, y2, c1, c2) {
      var id = nextId();
      out.push('<linearGradient id="' + id + '" gradientUnits="userSpaceOnUse" x1="' + n3(x1) + '" y1="' + n3(y1) + '" x2="' + n3(x2) + '" y2="' + n3(y2) + '"><stop offset="0" stop-color="' + hex3(c1) + '"/><stop offset="1" stop-color="' + hex3(c2) + '"/></linearGradient>');
      return 'url(#' + id + ')';
    }
    function same(a, b) { return Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) + Math.abs(a[2] - b[2]) < 0.004; }
    if (it.mode === 'y') {
      var CH = it.stops ? 1 : 8;
      for (var r0 = 0; r0 < R - 1; r0 += CH) {
        var r1 = Math.min(R - 1, r0 + CH);
        var tA = M[r0][0], tB = M[r0][C - 1], bA = M[r1][0], bB = M[r1][C - 1];
        var ca = avg(tA, tB), cb = avg(bA, bB);
        var fill = same(ca, cb) ? hex3(ca) : grad((tA[0] + tB[0]) / 2, (tA[1] + tB[1]) / 2, (bA[0] + bB[0]) / 2, (bA[1] + bB[1]) / 2, ca, cb);
        out.push('<path fill="' + fill + '" d="' + quad(r0, r1, 0, C - 1) + '"/>');
      }
    } else {
      for (var r = 0; r < R - 1; r++) {
        for (var c = 0; c < C - 1; c++) {
          var L0 = M[r][c], L1 = M[r + 1][c], R0 = M[r][c + 1], R1 = M[r + 1][c + 1];
          var cl = avg(L0, L1), cr = avg(R0, R1);
          var f = same(cl, cr) ? hex3(cl) : grad((L0[0] + L1[0]) / 2, (L0[1] + L1[1]) / 2, (R0[0] + R1[0]) / 2, (R0[1] + R1[1]) / 2, cl, cr);
          out.push('<path fill="' + f + '" d="' + quad(r, r + 1, c, c + 1) + '"/>');
        }
      }
    }
    return out.join('');
  }
  function pageSVG(page, opts) {
    opts = opts || {};
    var id = opts.idPrefix || 'p', out = [], cid = 0;
    var vb = opts.viewBox || [0, 0, 210, 297];
    var size = opts.fluid ? '' : opts.size ? ' width="' + opts.size[0] + '" height="' + opts.size[1] + '"' : ' width="' + vb[2] + 'mm" height="' + vb[3] + 'mm"';
    out.push('<svg xmlns="http://www.w3.org/2000/svg" viewBox="' + vb.join(' ') + '"' + size + '>');
    if (opts.background !== false) out.push('<rect x="' + vb[0] + '" y="' + vb[1] + '" width="' + vb[2] + '" height="' + vb[3] + '" fill="#ffffff"/>');
    function nextId() { return id + 'g' + (cid++); }
    function emit(items) {
      items.forEach(function (it) {
        if (it.clip) {
          var c = id + 'c' + (cid++);
          out.push('<clipPath id="' + c + '"><path d="' + dOf([it.clip]) + '"/></clipPath>');
          out.push('<g clip-path="url(#' + c + ')"' + (it.lensId ? ' data-lens="' + it.lensId + '"' : '') + (it.cap ? ' data-cap="1"' : '') + '>');
          emit(it.items);
          out.push('</g>');
          if (opts.highlight && it.lensId === opts.highlight)
            out.push('<path d="' + dOf([it.clip]) + '" fill="none" stroke="' + (opts.hlColor || '#ff3b30') + '" stroke-width="' + (opts.hlWidth || 0.6) + '" pointer-events="none"/>');
        } else if (it.mesh) {
          out.push(meshSVG(it, nextId));
        } else if (it.stroke) {
          out.push('<path fill="none" stroke="' + it.stroke + '" stroke-width="' + n3(it.width) + '" stroke-linejoin="round" d="' + dOf(it.contours) + '"/>');
        } else {
          out.push('<path fill="' + it.fill + '" d="' + dOf(it.contours) + '"/>');
        }
      });
    }
    emit(page.items);
    out.push('</svg>');
    return out.join('');
  }

  // ---------- uitvoer: PDF (vector, mm-nauwkeurig, sRGB) ----------
  function rgbStr(hex) { return hexRGB(hex).map(function (x) { return x.toFixed(4); }).join(' '); }
  function pdfPath(contours) {
    var s = [], cx = 0, cy = 0;
    contours.forEach(function (c) {
      c.forEach(function (cm) {
        switch (cm[0]) {
          case 'M': s.push(n3(cm[1]) + ' ' + n3(cm[2]) + ' m'); cx = cm[1]; cy = cm[2]; break;
          case 'L': s.push(n3(cm[1]) + ' ' + n3(cm[2]) + ' l'); cx = cm[1]; cy = cm[2]; break;
          case 'Q':
            var qx = cm[1], qy = cm[2], x = cm[3], y = cm[4];
            s.push([cx + 2 / 3 * (qx - cx), cy + 2 / 3 * (qy - cy), x + 2 / 3 * (qx - x), y + 2 / 3 * (qy - y), x, y].map(n3).join(' ') + ' c');
            cx = x; cy = y; break;
          case 'C': s.push(cm.slice(1).map(n3).join(' ') + ' c'); cx = cm[5]; cy = cm[6]; break;
          case 'Z': s.push('h'); break;
        }
      });
    });
    return s.join('\n');
  }
  // Gouraud-driehoeken (shading type 4), 32-bit coördinaten, 16-bit kleur
  function meshBytes(M) {
    var R = M.length, C = M[0].length, tris = (R - 1) * (C - 1) * 2;
    var buf = new Uint8Array(tris * 3 * 15), dv = new DataView(buf.buffer), o = 0;
    function vtx(p) {
      dv.setUint8(o, 0); o += 1;
      dv.setUint32(o, Math.round(clamp(p[0] / 210, 0, 1) * 4294967295), false); o += 4;
      dv.setUint32(o, Math.round(clamp(p[1] / 297, 0, 1) * 4294967295), false); o += 4;
      for (var k = 2; k < 5; k++) { dv.setUint16(o, Math.round(clamp(p[k], 0, 1) * 65535), false); o += 2; }
    }
    for (var r = 0; r < R - 1; r++) for (var c = 0; c < C - 1; c++) {
      var a = M[r][c], b = M[r][c + 1], d = M[r + 1][c], e = M[r + 1][c + 1];
      vtx(a); vtx(b); vtx(d); vtx(b); vtx(e); vtx(d);
    }
    return buf;
  }
  function pageContent(page, cs) {
    var k = 72 / 25.4, s = ['q', n3(k) + ' 0 0 ' + n3(-k) + ' 0 ' + n3(297 * k) + ' cm'], meshes = [];
    function fill(hex) { return cs ? '/CS0 cs ' + rgbStr(hex) + ' scn' : rgbStr(hex) + ' rg'; }
    function emit(items) {
      items.forEach(function (it) {
        if (it.clip) {
          s.push('q', pdfPath([it.clip]), 'W n');
          emit(it.items);
          s.push('Q');
        } else if (it.mesh) {
          s.push('/Sh' + meshes.length + ' sh');
          meshes.push(it.mesh);
        } else if (it.stroke) {
          s.push('q', '1 j', n3(it.width) + ' w', cs ? '/CS0 CS ' + rgbStr(it.stroke) + ' SCN' : rgbStr(it.stroke) + ' RG', pdfPath(it.contours), 'S', 'Q');
        } else {
          s.push(fill(it.fill), pdfPath(it.contours), 'f');
        }
      });
    }
    emit(page.items);
    s.push('Q');
    return { text: s.join('\n'), meshes: meshes };
  }
  // compress: optioneel fn(Uint8Array)->Promise<Uint8Array> (zlib); icc: optioneel sRGB-profiel (Uint8Array)
  function buildPDF(pages, title, compress, icc) {
    var enc = new TextEncoder();
    var pcs = pages.map(function (p) { return pageContent(p, !!icc); });
    var streams = [];
    pcs.forEach(function (pc) {
      pc.si = streams.length; streams.push(enc.encode(pc.text));
      pc.mi = pc.meshes.map(function (m) { streams.push(meshBytes(m)); return streams.length - 1; });
    });
    var iccIndex = -1;
    if (icc) { iccIndex = streams.length; streams.push(icc); }
    var doZ = compress ? Promise.all(streams.map(compress)) : Promise.resolve(streams);
    return doZ.then(function (zs) {
      var parts = [], offs = [], size = 0, next = 1;
      function add(b) { if (typeof b === 'string') b = enc.encode(b); parts.push(b); size += b.length; }
      function stream(n, dict, data) {
        offs[n] = size; add(n + ' 0 obj\n<< ' + dict + ' /Length ' + data.length + (compress ? ' /Filter /FlateDecode' : '') + ' >>\nstream\n');
        add(data); add('\nendstream\nendobj\n');
      }
      function obj(n, body) { offs[n] = size; add(n + ' 0 obj\n' + body + '\nendobj\n'); }
      add('%PDF-1.6\n');
      add(new Uint8Array([37, 226, 227, 207, 211, 10]));
      var CAT = next++, PAGES = next++, INFO = next++, ICC = icc ? next++ : 0;
      var pageObjs = pcs.map(function (pc) {
        var o = { page: next++, content: next++, meshes: pc.mi.map(function () { return next++; }) };
        return o;
      });
      var total = next - 1;
      obj(CAT, '<< /Type /Catalog /Pages ' + PAGES + ' 0 R >>');
      obj(PAGES, '<< /Type /Pages /Count ' + pages.length + ' /Kids [' + pageObjs.map(function (o) { return o.page + ' 0 R'; }).join(' ') + '] >>');
      var t = String(title || 'Ringlabels').replace(/[^\x20-\x7e]/g, '').replace(/[()\\]/g, '');
      obj(INFO, '<< /Title (' + t + ') /Producer (Pullmark) >>');
      if (icc) stream(ICC, '/N 3 /Alternate /DeviceRGB', zs[iccIndex]);
      var csRef = icc ? '[/ICCBased ' + ICC + ' 0 R]' : '/DeviceRGB';
      pcs.forEach(function (pc, i) {
        var o = pageObjs[i], res = [];
        if (icc) res.push('/ColorSpace << /CS0 ' + csRef + ' >>');
        if (o.meshes.length) res.push('/Shading << ' + o.meshes.map(function (n, j) { return '/Sh' + j + ' ' + n + ' 0 R'; }).join(' ') + ' >>');
        obj(o.page, '<< /Type /Page /Parent ' + PAGES + ' 0 R /MediaBox [0 0 595.2756 841.8898] /Contents ' + o.content + ' 0 R /Resources << ' + res.join(' ') + ' >> >>');
        stream(o.content, '', zs[pc.si]);
        o.meshes.forEach(function (n, j) {
          stream(n, '/ShadingType 4 /ColorSpace ' + csRef + ' /BitsPerCoordinate 32 /BitsPerComponent 16 /BitsPerFlag 8 /Decode [0 210 0 297 0 1 0 1 0 1]', zs[pc.mi[j]]);
        });
      });
      var xref = size;
      var x = ['xref', '0 ' + (total + 1), '0000000000 65535 f '];
      for (var n = 1; n <= total; n++) x.push(String(offs[n]).padStart(10, '0') + ' 00000 n ');
      add(x.join('\n') + '\ntrailer\n<< /Size ' + (total + 1) + ' /Root ' + CAT + ' 0 R /Info ' + INFO + ' 0 R >>\nstartxref\n' + xref + '\n%%EOF\n');
      var out = new Uint8Array(size), pos = 0;
      parts.forEach(function (b) { out.set(b, pos); pos += b.length; });
      return out;
    });
  }

  return {
    RINGS: RINGS, STYLES: STYLES, ZONES: ZONES, PAGE: PAGE, L: L,
    setGlyphs: setGlyphs, parseLensFile: parseLensFile, ringFor: ringFor, snapshotRing: snapshotRing, presetKey: presetKey, normalizeStyle: normalizeStyle, zoneGeom: zoneGeom,
    prettyBrand: prettyBrand, brandKey: brandKey, autoBottom: autoBottom, autoTop: autoTop, tstopFrom: tstopFrom,
    layoutLens: layoutLens, buildStrip: buildStrip, buildPages: buildPages,
    pageSVG: pageSVG, buildPDF: buildPDF, textWidth: textWidth, distOf: distOf, buildCalibPages: buildCalibPages,
    setLang: setLang, lang: function () { return LANG; }, cornerRadii: cornerRadii,
    addFont: addFont, setLabelFont: setLabelFont, fontList: fontList, fontSample: fontSample,
    distText: distText, measuredPts: measuredPts, buildCapPages: buildCapPages, buildSheets: buildSheets, buildCutSheets: buildCutSheets
  };
})();
if (typeof module !== 'undefined') module.exports = Engine;

