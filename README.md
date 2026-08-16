# GHR CRM V8.5 — dépôt propre

Cette archive doit être utilisée dans un **nouveau dépôt GitHub vide**.
Ne pas la superposer à l'ancien dépôt `crm-app`, qui contient des fichiers PRESTY hérités (PrestyApp, instituts, handlers legacy, etc.).

## Architecture attendue
- `app/`
- `components/GhrApp.jsx`
- `lib/`
- `public/`
- `package.json`
- `supabase-setup.sql`

## Variables Vercel
- `SUPABASE_URL` ou `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SESSION_SECRET`
- `GHR_SETUP_KEY`

## Déploiement
1. Créer un nouveau dépôt GitHub privé et vide.
2. Importer uniquement le contenu de cette archive.
3. Importer ce dépôt dans Vercel comme nouveau projet, ou reconnecter le projet Vercel GHR à ce nouveau dépôt.
4. Réattribuer ensuite le domaine habituel au nouveau projet si nécessaire.
