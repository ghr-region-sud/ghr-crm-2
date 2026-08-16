# GHR CRM V11 — suivi commercial, contacts, actions & Google Agenda

Cette version part de la V10 et conserve l'authentification Supabase, le mot de passe oublié, le mode administrateur, le multi-adhésions et les paiements par adhésion.

## Évolutions principales

- Statut entreprise séparé du suivi commercial : `Prospect`, `Client actif`, `Client perdu`.
- Étape commerciale réservée aux prospects : `Nouveau prospect`, `À contacter`, `En échange`, `Intéressé`, `Adhésion en cours`, `À revoir plus tard`.
- Température séparée : `Chaud`, `Tiède`, `Froid`.
- Les relances sont désormais de vraies actions datées, et non un statut.
- Fiche entreprise : en-tête, actions et onglets fixes ; seul le contenu de la fiche défile.
- Bouton `Ajouter` accessible en haut de la fiche pour activité, action, rendez-vous, contact, adhésion, paiement ou document.
- Nouvel onglet global `Contacts` avec recherche et fiche latérale : appel, WhatsApp, email, modification et accès à l'entreprise.
- Nouvel onglet `Actions à réaliser` avec relances, tâches et adhésions à valider.
- Nouvel onglet `Rendez-vous` avec vue calendrier mensuelle.
- Connexion Google Agenda individuelle par utilisateur via OAuth 2.0.
- Lors de la création d'un rendez-vous, le CRM tente de créer automatiquement l'événement dans l'agenda Google du délégué concerné s'il a connecté son compte.
- En-têtes de tableaux renforcés en sticky dans toutes les vues listes.

## Mise à jour Supabase requise

Exécuter le bloc V11 ajouté à `supabase-setup.sql` pour créer `public.google_calendar_connections`.
Cette table contient les jetons Google côté serveur. Elle ne doit jamais être exposée au navigateur.

## Variables Vercel

Déjà prévues :
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`

Conserver aussi toutes les variables existantes (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SESSION_SECRET`, etc.).

## Google OAuth

URI de callback attendue :
`https://crm-app-ghr-region-sud.vercel.app/api/google-calendar/callback`

Si l'application OAuth Google est encore en mode test, ajouter les comptes Google des délégués comme utilisateurs de test avant qu'ils tentent la connexion.
