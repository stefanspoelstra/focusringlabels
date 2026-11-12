#!/usr/bin/env python3
"""Bouwt index.html uit de bronnen in src/. Gebruik: python3 tools/build.py
Zet daarna in sw.js een nieuwe VERSION, anders blijven browsers de oude versie tonen."""
import os, hashlib, re
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
src = lambda n: open(os.path.join(ROOT, 'src', n), encoding='utf-8').read()
html = f"""<!doctype html>
<html lang="nl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>Pullmark</title>
<meta name="description" content="Pullmark: focusringlabels uit Tilta-lensbestanden, voor de WCU-4-ring en de Tilta-ringen op de Nucleus-M II.">
<link rel="manifest" href="manifest.webmanifest">
<link rel="icon" href="icons/favicon.svg" type="image/svg+xml">
<link rel="icon" href="icons/icon-192.png" sizes="192x192" type="image/png">
<link rel="apple-touch-icon" href="icons/apple-touch-icon.png">
<meta name="theme-color" content="#ffffff">
<!-- Gebouwd door tools/build.py uit src/. Niet met de hand bewerken. -->
</head>
<body>
{src('fonts.html')}<style>
{src('app.css')}</style>
{src('app.html')}<script>
{src('engine.js')}</script>
<script>
{src('glyphs.js')}</script>
<script>
{src('labelfonts.js')}</script>
<script>
{src('app.js')}</script>
</body>
</html>
"""
open(os.path.join(ROOT, 'index.html'), 'w', encoding='utf-8').write(html)
# de service worker krijgt de vingerafdruk van deze build: zo haalt elke browser de nieuwe versie op
sw_path = os.path.join(ROOT, 'sw.js'); sw = open(sw_path, encoding='utf-8').read()
ver = hashlib.sha256(html.encode('utf-8')).hexdigest()[:10]
sw = re.sub(r"const VERSION = '[^']*';", "const VERSION = '" + ver + "';", sw, count=1)
open(sw_path, 'w', encoding='utf-8').write(sw)
print('index.html', len(html) // 1024, 'kB  ·  sw.js VERSION', ver)
