# GHR CRM — V15.2 Refonte produit / UX

Cette version corrige la V15.1 qui avait surtout modifié la présentation sans transformer suffisamment l'expérience.

## Architecture délégué
La navigation n'est plus une liste plate. Elle reprend une logique de modules inspirée des outils métier associatifs/réseaux :
- Accueil
- Suivi commercial
  - Pipeline
  - Tâches & relances
- Communauté
  - Entreprises
  - Contacts
- Adhésions
  - Adhésions
  - Paiements

## Accueil
Le tableau de bord retrouve son rôle de pilotage avec les chiffres métier : CA encaissé, nouvelles adhésions, renouvellements, adhésions actives, reste à encaisser et prospects en suivi. Les tâches en retard / aujourd'hui / à venir et les dossiers d'adhésion à traiter sont visibles au même endroit.

## Suivi commercial
Suppression totale de la température Chaud/Tiède/Froid. Les étapes sont : Nouveau prospect, À contacter, En échange, Intéressé, Pas intéressé, Adhésion en cours, Adhésion active, À revoir plus tard. Pipeline et liste restent disponibles.

## Tâches
Les tâches et relances disposent désormais d'une vraie entrée de navigation dans le module Suivi commercial. Une tâche créée depuis une entreprise est donc retrouvable transversalement.

## Adhésions
Les adhésions et paiements sont visibles depuis le module Adhésions. L'éditeur d'adhésion s'ouvre désormais en grand panneau contextuel superposé et scrollable au lieu de remplacer toute l'application. L'utilisateur conserve son contexte.

## Design
Refonte plus visible : sidebar délégué bleue et modulaire, navigation hiérarchique, surfaces plus légères, dashboard compact, réduction des cartes décoratives, tables/pipeline plus sobres, drawer d'adhésion et hiérarchie typographique renforcée.

Le backend Supabase, l'authentification, les données et la distinction Administrateur / Délégué sont conservés.
