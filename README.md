# Focusringlabels

Web-app om focusringlabels te maken uit Tilta-lensbestanden (`.tl`), voor de Tilta ARRI-ring op de Nucleus-M II en voor de ARRI WCU-4.

**Openen:** https://stefanspoelstra.github.io/focusringlabels/

## Installeren op de Mac (Chrome)

1. Open de link hierboven in Chrome.
2. Klik op **Installeren als app** in de app zelf, of op het installatie-icoon rechts in de adresbalk.
3. De app staat daarna in Launchpad en werkt ook zonder internet. Sleep hem naar je Dock.

Je lenzen en instellingen blijven op je eigen Mac. Ze staan niet in deze repository. Onder **Export → Bewaren** kun je de bibliotheek koppelen aan een bestand, dan wordt elke wijziging daar automatisch in bewaard.

## Mal voor de Tilta ARRI-ring

`mal/Focusringlabels_mal_Tilta-ARRI-ring.stl`: 3D-printbare mal om het label recht op de Tilta ARRI-ring te zetten. De nok past in de uitsparing van 4 × 3,3 mm. Print hem plat, zonder support, in PLA of PETG. Leg het label met de lijmkant boven in de goot en de uitsparing over de nok.

## Bestanden

- `index.html`: de complete app (één bestand)
- `manifest.webmanifest`, `sw.js`, `icons/`: maken er een installeerbare app van die offline werkt
- `mal/`: de mal (STL) en een voorbeeldafbeelding
- Lettertypen: Barlow en Barlow Condensed (SIL Open Font License, zie `LICENSE-fonts.txt`)
