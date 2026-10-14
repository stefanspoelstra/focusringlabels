# Pullmark

**Focusringlabels voor focuspullers.** Web-app om labels voor je focusring te maken uit Tilta-lensbestanden (`.tl`), of door een lens zelf in te meten. Kant-en-klaar voor de Tilta ARRI-ring en de originele Tilta-ring op de Nucleus-M II; elke andere ring (bijvoorbeeld de ARRI WCU-4) meet je zelf in met het meetlabel. Voorheen heette de app Focusringlabels.

**Openen:** https://stefanspoelstra.github.io/focusringlabels/

**Taal:** Nederlands of Engels. Kies met het wereldbolletje rechtsboven in de app.

> **English:** Pullmark is a web app that makes focus ring labels from Tilta lens files (`.tl`), or from a lens you measure yourself, ready to go for the Tilta ARRI ring and the original Tilta ring on the Nucleus-M II; any other ring (the ARRI WCU-4, for example) you measure yourself with the calibration label. Open the link above; it starts in English unless your browser is set to Dutch. Switch language with the globe at the top right.

## Installeren op de Mac (Chrome)

1. Open de link hierboven in Chrome.
2. Klik op **Installeren als app** in de app zelf, of op het installatie-icoon rechts in de adresbalk.
3. De app staat daarna in Launchpad en werkt ook zonder internet. Sleep hem naar je Dock.

Je lenzen en instellingen blijven op je eigen Mac. Ze staan niet in deze repository. Onder **Export → Bewaren** kun je de bibliotheek koppelen aan een bestand, dan wordt elke wijziging daar automatisch in bewaard.

## Hoe ∞ wordt bepaald (Tilta ARRI-ring)

Een `.tl`-bestand zegt per afstand welke motorwaarde (0–10.000) erbij hoort, maar niet waar die op de ring ligt. Het profiel Tilta ARRI-ring heeft daarvoor één vaste meting: ∞ van de Dulens 21 mm (motorwaarde 9707) ligt 7,2 mm onder het midden van de nudge, bij 24,5 mm per 1000. Elke andere lens, van elk merk, volgt daaruit met zijn eigen `.tl`-waarden. Opnieuw meten kan per lens onder **Schaal nameten**.

**Originele Tilta-ring** (de kleinere ring die bij de Nucleus-M II zit): label 11 × 225 mm, dat begint tegen de onderkant van de nudge. Gemeten op de Dulens 21 mm: ∞ op 80,4 mm, schaal 21,88 mm per 1000 (24,5 × 225/252: hetzelfde wiel, een kleinere ring). De schaal loopt rond de nudge door, dus de korte afstanden staan bovenaan, en het brandpunt staat in het gat tussen de kortste afstand en ∞.

## Eigen ring

Voor elke andere ring of handunit, bijvoorbeeld de ARRI WCU-4: kies het profiel **Eigen ring (zelf inmeten)**. Meet de hoogte van de ring en de lengte van de nudge rondom tot de andere kant van de nudge, en vul die in bij Label. Print daarna het meetlabel (0 tegen de nudge) en meet ∞ en de schaal in met **Schaal nameten**, of meet je lenzen helemaal in. De app levert alleen maten mee die zelf aan een ring zijn gemeten.

## Lens inmeten (zonder lensbestand)

Voor een lens zonder `.tl`-bestand, of een ander follow-focussysteem dan de Nucleus-M II: kies **Lens inmeten**. Print het meetlabel, plak het om de ring en lees per afstand op de lens af hoeveel mm hij van de nudge ligt. De app zet de streepjes precies op die plekken en rekent de tussenstreepjes ertussen uit (lineair in 1/afstand). Omdat je op de ring zelf meet, maken het systeem, de lensdata en de motorwaarden niet uit. De metingen horen wel bij de ring waarop je ze deed.

## Lensdoppen

Onder **Opmaak › Lensdoppen** print je ook ronde stickers voor je lensdoppen: het brandpunt groot, met de T-stop en de lensnaam, in dezelfde kleuren als de stroken van die map. Kies de doorsnede (20 tot 100 mm) en 1 of 2 stickers per lens (voor- en achterdop). Ze komen op een eigen vel na de stroken. Rond knippen gaat het snelst met een cirkelpons van dezelfde maat.

## Mal voor de Tilta ARRI-ring

`mal/Pullmark_mal_Tilta-ARRI-ring.stl`: 3D-printbare mal om het label recht op de Tilta ARRI-ring te zetten. De nok past in de uitsparing van 4 × 3,3 mm. Print hem plat, zonder support, in PLA of PETG. Leg het label met de lijmkant boven in de goot en de uitsparing over de nok.

## Bestanden

- `index.html`: de complete app (één bestand)
- `manifest.webmanifest`, `sw.js`, `icons/`: maken er een installeerbare app van die offline werkt
- `mal/`: de mal (STL) en een voorbeeldafbeelding
- Lettertypen: Barlow en Barlow Condensed (SIL Open Font License, zie `LICENSE-fonts.txt`)
