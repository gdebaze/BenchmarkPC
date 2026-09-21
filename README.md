# BenchmarkPC / Readout

Configurateur PC interactif, comparateur de configurations et prototype de benchmark.

## Structure

```text
BenchmarkPC/
├── index.html
├── css/
│   └── styles.css
├── js/
│   ├── data.js
│   └── app.js
├── assets/
│   └── images/
├── .gitignore
├── .nojekyll
└── README.md
```

## Fichiers principaux

- `index.html` : structure de l'interface.
- `css/styles.css` : styles visuels et responsive.
- `js/data.js` : données principales (écrans, builds, jeux, réglages).
- `js/app.js` : logique du configurateur, benchmark, comparaison et BuildLab 3D.
- `assets/images/` : images locales auparavant encodées en base64 dans le JavaScript.

## Lancer en local

Le projet est statique. Pour éviter les restrictions du protocole `file://`, lance un petit serveur local depuis le dossier du projet :

```bash
python3 -m http.server 8080
```

Puis ouvre `http://localhost:8080`.

## GitHub Pages

Le dépôt est compatible avec GitHub Pages depuis la branche `main` et le dossier racine `/`.

## Maintenance

Pour garder le projet lisible :

1. ajouter les nouvelles images dans `assets/images/` au lieu de les encoder en base64 ;
2. mettre les données de catalogue dans `js/data.js` ;
3. garder la logique d'interface et de benchmark dans `js/app.js` ;
4. éviter de remettre CSS et JavaScript directement dans `index.html`.
