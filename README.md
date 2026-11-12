# Pullmark

**Focusringlabels voor focuspullers.** Web-app die labels voor je focusring maakt uit Tilta-lensbestanden (`.tl`). Voorheen heette de app Focusringlabels.

**Openen:** https://stefanspoelstra.github.io/focusringlabels/

**Taal:** Nederlands of Engels. Kies met de knop NL/EN rechtsboven.

> **English:** Pullmark is a web app that makes focus ring labels from Tilta lens files (`.tl`). Three steps: load your lenses, pick your ring, print. Open the link above; it starts in English unless your browser is set to Dutch.

## Zo werkt het

1. **Lenzen.** Sleep je `.tl`-bestanden of een hele map in de app. Lenzen van hetzelfde merk komen samen in een set. Een T-stop die niet in het bestand staat, vul je zelf in.
2. **Ring.** Kies je ring. De WCU-4-ring is nagemeten; de twee Tilta-ringen nog niet met het nieuwe meetlabel.
3. **Printen.** Kies per set een kleur, het lettertype, de hoeken en eventueel een rand. Print of download de pdf.

Je lenzen en instellingen blijven in je eigen browser. Onderaan kun je de bibliotheek bewaren als bestand en weer openen.

## Printen op ware grootte

Kies in het printvenster **Vergroot/verklein: 100%**, niet "Maak passend". Meet daarna de liniaal onderaan het vel na: 0 tot 10 hoort precies 100 mm te zijn.

## De WCU-4-ring op de Nucleus-M II

Een `.tl`-bestand zegt per afstand welke motorwaarde (0 tot 10.000) erbij hoort. Waar die waarde op de ring ligt, is gemeten met het meetlabel (`meetlabel-wcu4-ring.pdf`):

- positie in mm onder het midden van de nudge = 24,5 × (10.000 − motorwaarde) / 1000
- de ∞-aanslag (motorwaarde 10.000) ligt op het midden van de nudge
- omtrek van de ring 254,5 mm, uitsparing 4,0 × 5,0 mm

De nudge van de Tilta-handunit is smaller dan de uitsparing in de ring. Daardoor heeft de ring ongeveer 0,7 mm speling. Druk de ring bij het plakken en het aflezen steeds tegen dezelfde kant.

## Extra's op het vel

- **Lensdoppen:** stickers met het brandpunt, de T-stop en de lensnaam. Rond, vierkant met ronde hoeken of vierkant en recht.
- **Lenslijst:** een kaartje (standaard 5 × 5 cm) met alle lenzen van de set en hun T-stop, voor op de camera.
- Voor beide kies je de kleuren van de set, wit of één effen kleur.

## Hoeken en rand

Heb je niets om rondingen te snijden, kies dan bij Hoeken **recht**. Ook de uitsparing voor de nudge wordt dan recht. Met **Rand** zet je een dunne snijlijn of een zwarte rand om het label, de lensdoppen en de lenslijst; handig bij een wit label.

## Zonder internet

Open de app één keer met internet. Daarna werkt hij ook zonder, bijvoorbeeld op de set. In Chrome kun je hem via de adresbalk installeren als app.

## Zelf bouwen

De app is één bestand, `index.html`, gebouwd uit de bronnen in `src/`:

```
python3 tools/build.py
```

Dat schrijft `index.html` en zet een nieuwe versie in `sw.js`. De lettertypen voor op het label (`src/labelfonts.js`) maak je met `tools/make_fonts.py`.

## Bestanden

- `index.html`: de complete app (één bestand)
- `src/`, `tools/`: de bronnen en het bouwscript
- `manifest.webmanifest`, `sw.js`, `icons/`: maken er een installeerbare app van die offline werkt
- `meetlabel-wcu4-ring.pdf`: het meetlabel voor de WCU-4-ring
- `mal/`: de mal (STL) voor de Tilta ARRI-ring uit de vorige versie
- Lettertypen: zie `LICENSE-fonts.txt` en `LICENSE-fonts-apache.txt`

De vorige versie van de app (versie 46) staat in de geschiedenis van deze repository.
