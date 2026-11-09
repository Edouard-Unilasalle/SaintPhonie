# SaintPhonie : prototype

Prototype de démonstration (PWA) de SaintPhonie (Saint-Glinglin dans le rapport), la plateforme qui ouvre les églises vides de Rouen aux musiciens.
L'interface est en anglais. Toutes les données sont fictives, sauf le nom, l'adresse et la position des églises, qui
viennent d'OpenStreetMap.

## Lancer en local

```bash
cd C:\dev\saint-glinglin
npm install
npm run dev
```

Ouvrir http://localhost:5173.

## Construire

```bash
npm run build
npm run preview
```

`npm run preview` sert la version finale sur http://localhost:4173, avec le service worker. C'est la seule façon de
tester le mode hors ligne en local.

## Déployer sur GitHub Pages (gratuit)

1. Créer un dépôt **public** vide sur github.com, par exemple `saint-glinglin`.
2. Dans le dossier du projet :
   ```bash
   git init -b main
   git add .
   git commit -m "Saint-Glinglin prototype"
   git remote add origin https://github.com/<ton-compte>/saint-glinglin.git
   git push -u origin main
   ```
3. Sur GitHub : **Settings > Pages > Build and deployment > Source : GitHub Actions**.
4. Le workflow `.github/workflows/deploy.yml` construit et publie l'application à chaque push. Après 1 à 2 minutes,
   l'adresse s'affiche dans l'onglet **Actions** : `https://<ton-compte>.github.io/saint-glinglin/`.
5. QR code pour la classe : coller cette adresse dans n'importe quel générateur de QR code, ou dans Chrome : menu
   « Partager > Créer un code QR ».

Alternative Vercel : importer le dépôt sur vercel.com, framework « Vite », aucun réglage à changer.

## Installer sur téléphone

- **iPhone (Safari)** : ouvrir le lien, bouton Partager, « Sur l'écran d'accueil ».
- **Android (Chrome)** : ouvrir le lien, menu ⋮, « Installer l'application » ou « Ajouter à l'écran d'accueil ».

Ouvrir l'application une fois avec du réseau, puis parcourir la carte : elle fonctionne ensuite hors ligne (les tuiles
de carte déjà vues sont gardées en cache).

## Parcours de démo (moins de 2 minutes)

Avant de commencer : **Settings > Reset demo data**, volume du son monté.

1. **Accueil** : lire l'accroche, cliquer **Musician**.
2. **Recherche** : cliquer le repère **Choir** sous le curseur de réverbération, la liste et la carte se filtrent en direct.
3. Ouvrir **Église Saint-Godard**. Montrer la jauge acoustique.
4. **Listen to the church > Compare** : le motif joue « dry », puis « in this church ».
5. Dans le calendrier, cliquer sur un bloc violet : message « Reserved for worship ». Puis choisir un créneau
   libre **aujourd'hui** (l'heure en cours ou la suivante), cliquer une deuxième heure pour l'étendre.
6. **Book this slot** : laisser « Sacred choral » (confirmé immédiatement), **Continue**.
7. Cocher l'accord, **signer** au doigt, **Sign and continue**, **Pay (simulated)**.
8. **Accès** : QR code et code à 6 chiffres. Si le créneau n'a pas commencé, **Jump to the start of the slot** :
   la porte passe en « Door unlocked ».
9. En haut à droite, passer sur **Parish** : le compteur **Maintenance fund** monte, avec « +€15 from new bookings ».
10. Bonus : approuver la demande « Gospel Normandie », ou désactiver un style dans la charte, ou ajouter une messe et
    voir le créneau se bloquer.

## Structure

- `src/data/churches.ts` : les 12 églises (+ la cathédrale, non disponible) et leurs sources OSM.
- `src/data/seed.ts` : offices, réservations, avis et fonds de départ (dates relatives au jour du lancement).
- `src/store.tsx` : état de l'application, enregistré dans `localStorage`.
- `src/lib/audio.ts` : synthèse du motif, réponse impulsionnelle et enregistrement micro.
- `src/pages/` : un fichier par écran.

## Crédits

Données des églises et fond de carte : © contributeurs OpenStreetMap (licence ODbL). Illustrations : dessins SVG
génériques. Projet étudiant UniLaSalle Rouen, sans lien avec un diocèse, une commune ou une entreprise.

## Identité visuelle

La planche de DA est dans `brand/saintphonie-da.png`. Le script `node brand/build-brand.mjs` en extrait le wordmark
et la clé de sol (`src/assets/`). `node brand/icon-variants.mjs` montre les variantes d'icône ; `node brand/icon-variants.mjs stripes`
écrit les icônes retenues dans `public/`. Palette : crème `#f5f4f0`,
noir `#121212`, lavande `#8799c6`, bordeaux `#7d0f43`, corail `#e07673`, sauge `#b8d895`. Police : Inter.
