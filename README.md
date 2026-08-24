# GHR Région Sud — CRM V15.24.3

Version de déploiement nettoyée.

## Corrections de build
- correction de `app/api/bulletin/route.js` (template string `Content-Disposition` valide) ;
- suppression automatique des anciens fichiers Next.js/Presty pouvant rester dans GitHub après un upload par-dessus une ancienne version ;
- suppression explicite du vieux `app/page.tsx` qui importait `@/components/PrestyApp` ;
- conservation du point d'entrée GHR actuel `app/page.jsx` -> `components/GhrApp.jsx` ;
- nettoyage des README historiques dans le ZIP.

## Déploiement
Les variables d'environnement existantes restent inchangées. Après remplacement des fichiers du dépôt, Vercel exécute `npm run build`.

Important : le script `scripts/cleanup-legacy.mjs` est volontaire. Il protège le build lorsque GitHub conserve des fichiers d'anciennes versions qui ne sont pas présents dans ce ZIP.
