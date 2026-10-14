# Pullmark

**Focusringlabels voor focuspullers.** Web-app om labels voor je focusring te maken uit Tilta-lensbestanden (`.tl`), of door een lens zelf in te meten. Voor de Tilta ARRI-ring en de originele Tilta-ring op de Nucleus-M II, en voor de ARRI WCU-4. Voorheen heette de app Focusringlabels.

**Openen:** https://stefanspoelstra.github.io/focusringlabels/

**Taal:** Nederlands of Engels. Kies met het wereldbolletje rechtsboven in de app.

> **English:** Pullmark is a web app that makes focus ring labels from Tilta lens files (`.tl`), or from a lens you measure yourself, for the Tilta ARRI ring and the original Tilta ring on the Nucleus-M II and the ARRI WCU-4. Open the link above; it starts in English unless your browser is set to Dutch. Switch language with the globe at the top right.

## Installeren op de Mac (Chrome)

1. Open de link hierboven in Chrome.
2. Klik op **Installeren als app** in de app zelf, of op het installatie-icoon rechts in de adresbalk.
3. De app staat daarna in Launchpad en werkt ook zonder internet. Sleep hem naar je Dock.

Je lenzen en instellingen blijven op je eigen Mac. Ze staan niet in deze repository. Onder **Export → Bewaren** kun je de bibliotheek koppelen aan een bestand, dan wordt elke wijziging daar automatisch in bewaard.

## Hoe ∞ wordt bepaald (Tilta ARRI-ring)

Een `.tl`-bestand zegt per afstand welke motorwaarde (0–10.000) erbij hoort, maar niet waar die op de ring ligt. Het profiel Tilta ARRI-ring heeft daarvoor één vaste meting: ∞ van de Dulens 21 mm (motorwaarde 9707) ligt 7,2 mm onder het midden van de nudge, bij 24,5 mm per 1000. Elke andere lens, van elk merk, volgt daaruit met zijn eigen `.tl`-waarden. Opnieuw meten kan per lens onder **Schaal nameten**. Het profiel ARRI WCU-4-ring is apart en werkt zoals voorheen.

**Originele Tilta-ring** (de kleinere ring die bij de Nucleus-M II zit): label 11 × 225 mm, dat begint tegen de onderkant van de nudge. Gemeten op de Dulens 21 mm: ∞ op 80,4 mm, schaal 21,88 mm per 1000 (24,5 × 225/252: hetzelfde wiel, een kleinere ring). De schaal loopt rond de nudge door, dus de korte afstanden staan bovenaan, en het brandpunt staat in het gat tussen de kortste afstand en ∞.

## Lens inmeten (zonder lensbestand)

Voor een lens zonder `.tl`-bestand, of een ander follow-focussysteem dan de Nucleus-M II: kies **Lens inmeten**. Print het meetlabel, plak het om de ring en lees per afstand op de lens af hoeveel mm hij van de nudge ligt. De app zet de streepjes precies op die plekken en rekent de tussenstreepjes ertussen uit (lineair in 1/afstand). Omdat je op de ring zelf meet, maken het systeem, de lensdata en de motorwaarden niet uit. De metingen horen wel bij de ring waarop je ze deed.

## Mal voor de Tilta ARRI-ring

`mal/Pullmark_mal_Tilta-ARRI-ring.stl`: 3D-printbare mal om het label recht op de Tilta ARRI-ring te zetten. De nok past in de uitsparing van 4 × 3,3 mm. Print hem plat, zonder support, in PLA of PETG. Leg het label met de lijmkant boven in de goot en de uitsparing over de nok.

## Bestanden

- `index.html`: de complete app (één bestand)
- `manifest.webmanifest`, `sw.js`, `icons/`: maken er een installeerbare app van die offline werkt
- `mal/`: de mal (STL) en een voorbeeldafbeelding
- Lettertypen: Barlow en Barlow Condensed (SIL Open Font License, zie `LICENSE-fonts.txt`)
