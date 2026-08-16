# GHR CRM V12 — Rendez-vous Presty + Google Agenda

Cette version reprend V11 et corrige l'expérience Agenda :

- Vue Rendez-vous remplacée par une vue agenda jour-par-jour inspirée de Presty/Calendly.
- Filtres : Aujourd'hui, Demain, 7 jours, À venir, Passés, Date.
- Rendez-vous regroupés par date avec heure, entreprise, contact, lieu et actions directes.
- État Google Agenda explicite : « Google Agenda connecté » + compte + action Déconnecter.
- Synchronisation Google indiquée au niveau du rendez-vous.
- Correction OAuth en mode administrateur : lorsqu'un admin consulte l'espace d'un délégué, la connexion Google est rattachée au délégué consulté et le statut lit la même connexion.
- Retour OAuth vers la page Rendez-vous.

Variables Vercel nécessaires : GOOGLE_CLIENT_ID et GOOGLE_CLIENT_SECRET (déjà configurées sur le projet existant).
Le SQL V11 `supabase-v11-google-calendar.sql` reste celui à utiliser pour la table de connexions Google.
