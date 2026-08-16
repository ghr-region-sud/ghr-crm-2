# GHR CRM V9.0 — correctif accès délégués

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


## Correctif V9.0

- Le bouton **Activer l’accès** rattache automatiquement un ancien délégué à un utilisateur Supabase Auth qui existe déjà avec le même email.
- Si aucun utilisateur Auth n’existe, il est créé normalement.
- L’identifiant métier historique du délégué est conservé afin de garder ses entreprises, adhésions, paiements et reporting.
- L’erreur brute `email_exists` n’est plus bloquante.


## Correctif V9.0
- Rattachement automatique des anciens délégués à une identité Supabase Auth existante.
- Mise à jour du profil `app_users` par ID métier au lieu de tenter un doublon.
- Protection stricte : un compte administrateur ne peut jamais être réaffecté à un délégué.
- Réparation automatique du cas historique où le profil admin avait été déplacé sur l’ID d’un délégué.
- Conservation du parcours « Mot de passe oublié » de la V8.7.


## V9.0 — Sélecteur de contexte administrateur
- Le profil en haut à droite est cliquable pour les administrateurs.
- Recherche et accès direct aux espaces des délégués actifs sans déconnexion.
- La session Supabase reste celle de l’administrateur : seul le contexte d’affichage change.
- Retour à l’administration depuis le même menu ou le bandeau Mode administrateur.
- Le sélecteur est inaccessible aux délégués.
