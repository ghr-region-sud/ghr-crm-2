# GHR CRM V10 — UX commercial simplifiée

Base : V9 UX commercial.

## Changements
- Pipeline commercial simplifié et adapté au développement syndical : Nouveau prospect, À contacter, En échange, Intéressé, Adhésion en cours, Adhérent, À revoir plus tard, Non intéressé.
- Température indépendante du statut : Chaud / Tiède / Froid.
- Suivi commercial en Kanban par défaut avec vue Liste et filtres étape/température/recherche.
- Onglet distinct « Actions à réaliser » avec Relances, Tâches et Adhésions à valider.
- En-têtes des tableaux conservés en sticky dans les zones de scroll internes.
- Conservation du shell V9 : sidebar fixe, déconnexion en bas, contenu interne scrollable.
- Conservation du sélecteur administrateur permanent permettant de passer directement d'un espace délégué à un autre sans se déconnecter.
- Conservation du modèle 1 entreprise -> plusieurs adhésions -> plusieurs paiements par adhésion.

## Déploiement
Conserver les variables d'environnement Supabase/Vercel déjà configurées. Aucun secret n'est inclus dans cette archive.
