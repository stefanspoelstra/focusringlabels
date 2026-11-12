#!/usr/bin/env python3
"""Zet open lettertypen (OFL) om naar de contourtabellen die de Pullmark-rekenkern tekent.

Gebruik:  python3 tools/make_fonts.py <map met @fontsource-pakketten>  >  src/labelfonts.js
Elk lettertype wordt geschaald naar kapitaalhoogte 700 op 1000 eenheden, net als de standaardletter.
Lettertypen met bredere cijfers dan de standaardletter worden iets verkleind, zodat de schaal blijft passen.
Een lettertype met een voorbehouden naam (OFL, "Reserved Font Name") heet in de app anders: Mono, Classic, Art deco
en Script. De makers en licenties staan in LICENSE-fonts.txt.
"""
import sys, os, json
from fontTools.ttLib import TTFont
from fontTools.pens.basePen import BasePen
from fontTools.pens.boundsPen import BoundsPen
from fontTools.pens.transformPen import TransformPen

# sleutel, naam in de app, pakket, gewichten (normaal, vet), bijzonderheid ('mono' = vaste breedte, 'apache' = Apache-licentie), groep
FONTS = [
    ('barlow-condensed', 'Barlow Condensed', 'barlow-condensed', (400, 700), '', 'strak'),
    ('oswald', 'Oswald', 'oswald', (400, 700), '', 'strak'),
    ('bebas', 'Bebas Neue', 'bebas-neue', (400, 400), '', 'strak'),
    ('dosis', 'Dosis', 'dosis', (400, 700), '', 'strak'),
    ('mono', 'Mono', 'share-tech-mono', (400, 400), 'mono', 'strak'),
    ('marker', 'Permanent Marker', 'permanent-marker', (400, 400), 'apache', 'apart'),
    ('patrick', 'Patrick Hand', 'patrick-hand', (400, 400), '', 'apart'),
    ('courier', 'Courier Prime', 'courier-prime', (400, 700), 'mono', 'apart'),
    ('vt323', 'VT323', 'vt323', (400, 400), 'mono', 'apart'),
    ('chakra', 'Chakra Petch', 'chakra-petch', (400, 700), '', 'apart'),
    ('rokkitt', 'Rokkitt', 'rokkitt', (400, 700), '', 'apart'),
    ('abril', 'Classic', 'abril-fatface', (400, 400), '', 'apart'),
    ('righteous', 'Art deco', 'righteous', (400, 400), '', 'apart'),
    ('fredoka', 'Fredoka', 'fredoka', (400, 700), '', 'apart'),
    ('bangers', 'Bangers', 'bangers', (400, 400), '', 'apart'),
    ('lobster', 'Script', 'lobster', (400, 400), '', 'apart'),
    ('saira-stencil', 'Saira Stencil One', 'saira-stencil-one', (400, 400), '', 'apart'),
]
# tekens die op een label voorkomen; een teken dat hier niet bij zit, tekent de app in de standaardletter
CHARS = [chr(c) for c in range(0x20, 0x7F)] + list('°×·½¼¾ÄÉÈËÖÜäéèëêïöüçñ–’′″')
BASE_DIGITS = {400: 4440, 700: 4530}   # breedte van 0-9 in de standaardletter (Barlow), bij kapitaalhoogte 700
MAX_WIDER = 1.12                       # zoveel breder dan de standaardletter mag; daarboven verkleinen


class PathPen(BasePen):
    def __init__(self, glyphset, k):
        super().__init__(glyphset); self.k = k; self.out = []
    def p(self, pt): return '%d %d' % (round(pt[0] * self.k), round(pt[1] * self.k))
    def _moveTo(self, pt): self.out.append('M' + self.p(pt))
    def _lineTo(self, pt): self.out.append('L' + self.p(pt))
    def _qCurveToOne(self, a, b): self.out.append('Q' + self.p(a) + ' ' + self.p(b))
    def _curveToOne(self, a, b, c): self.out.append('C' + self.p(a) + ' ' + self.p(b) + ' ' + self.p(c))
    def _closePath(self): self.out.append('Z')
    def _endPath(self): self.out.append('Z')


TIGHT, PAD = ".,:'\"", 75


def table(path, weight, tight=False):
    f = TTFont(path); gs = f.getGlyphSet(); cmap = f.getBestCmap(); hmtx = f['hmtx']
    bp = BoundsPen(gs); gs[cmap[ord('H')]].draw(bp); cap = bp.bounds[3]
    bx = BoundsPen(gs); gs[cmap[ord('x')]].draw(bx)
    # hoogte: de cijfers bepalen het beeld op een label; wijken ze af van de kapitalen, dan gaan de cijfers voor
    tops = []
    for d in '0123456789':
        dp = BoundsPen(gs); gs[cmap[ord(d)]].draw(dp); tops.append(dp.bounds[3])
    dig = sorted(tops)[len(tops) // 2]
    if 0.85 <= dig / cap <= 1.2: cap = dig / 1.008
    k = 700.0 / cap
    g = {}
    for ch in CHARS:
        name = cmap.get(ord(ch))
        if not name: continue
        adv, dx = hmtx[name][0], 0
        if tight and ch in TIGHT:
            # vaste breedte: punt en komma nemen anders een hele cijferbreedte in, dat leest slecht in 1.5 of 2.35
            tb = BoundsPen(gs); gs[name].draw(tb)
            if tb.bounds: dx = PAD / k - tb.bounds[0]; adv = (tb.bounds[2] - tb.bounds[0]) + 2 * PAD / k
        pen = PathPen(gs, k); gs[name].draw(TransformPen(pen, (1, 0, 0, 1, dx, 0)))
        g[ch] = [round(adv * k), ''.join(pen.out)]
    digits = sum(g[d][0] for d in '0123456789')
    fit = max(1.0, digits / (BASE_DIGITS[weight] * MAX_WIDER))
    note = [n.toUnicode() for n in f['name'].names if n.nameID == 0][:1]
    return {'upm': 1000, 'cap': round(700 * fit), 'xh': round(bx.bounds[3] * k), 'g': g}, digits, fit, ' '.join((note[0] if note else '').split())


def main(root):
    out, notes = [], []
    only = set(sys.argv[2].split(',')) if len(sys.argv) > 2 else None
    for key, label, pkg, (w4, w7), opt, group in FONTS:
        if only and key not in only: continue
        d = os.path.join(root, '@fontsource', pkg, 'files')
        t4, d4, f4, n = table(os.path.join(d, '%s-latin-%d-normal.woff2' % (pkg, w4)), 400, opt == 'mono')
        t7, d7, f7, _ = table(os.path.join(d, '%s-latin-%d-normal.woff2' % (pkg, w7)), 700, opt == 'mono')
        fit = max(f4, f7); t4['cap'] = t7['cap'] = round(700 * fit)
        notes.append('// %s (%s): %s (%s)' % (label, pkg, n, 'Apache License 2.0' if opt == 'apache' else 'SIL Open Font License 1.1'))
        out.append('Engine.addFont(%s,%s,%s,%s);' % (json.dumps(key), json.dumps(label), json.dumps({'400': t4, '700': t7}, ensure_ascii=False, separators=(',', ':')), json.dumps(group)))
        sys.stderr.write('%-26s glyphs %3d  cijfers %4d/%4d  verkleind x%.3f  %5.0f kB\n' % (label, len(t4['g']), d4, d7, 1 / fit, len(out[-1]) / 1000))
    print('// Lettertypen voor op het label, als contouren. Gemaakt met tools/make_fonts.py; niet met de hand aanpassen.')
    print('\n'.join(notes))
    print('\n'.join(out))


if __name__ == '__main__':
    main(sys.argv[1])
