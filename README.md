# Readout / BenchmarkPC

Configurateur PC statique hébergable sur GitHub Pages : profils d'utilisation, propositions tarifaires indicatives, comparateur, vidéos de référence et BuildLab WebGL.

## Structure
- `index.html` : page principale et métadonnées.
- `css/styles.css` : styles généraux et responsive.
- `css/compatibility.css` : précontrôle et comparateur.
- `js/data.js` : catalogue des écrans, dimensions natives et données de démonstration.
- `js/app.js` : parcours, compositions, simulation FPS et interactions BuildLab.
- `js/buildlab-reference.js`, `js/buildlab-v17.js` : maillages mécaniques.
- `js/compatibility.js` : précontrôle indicatif et comparaison.
- `assets/images/` : photos de référence locales.
- `tests/` : tests sans dépendance.

## Lancer et tester
Exécuter `python3 -m http.server 8080` puis ouvrir `http://localhost:8080`.
Vérifier avec `node --test tests/*.test.mjs`.

## Limites
Les FPS, l'utilisation CPU/GPU et les courbes sont des **simulations**. Les vidéos intégrées n'ont pas été enregistrées sur les configurations proposées. Les prix sont indicatifs sauf lorsqu'un relevé marchand est daté. Les vérifications CPU, mémoire, boîtier et alimentation sont des précontrôles : BIOS, QVL, câbles et dégagements des références exactes restent à valider. Les objets 3D sont des reconstructions de présentation, pas les fichiers CAO officiels.

Publication envisagée : GitHub Pages depuis `main`, dossier racine `/`.
