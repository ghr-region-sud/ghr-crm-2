# GHR CRM V15.3 — Refonte UX cohérente Admin + Délégué

Cette version poursuit la V15.2 en appliquant le même système UX à l'ensemble de l'application, et non uniquement à la navigation délégué.

## Architecture

### Délégué
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

### Administrateur
- Accueil
- Pilotage
  - Suivi commercial
  - Tâches & relances
- Réseau
  - Entreprises
  - Contacts
- Adhérents
  - Adhésions
  - Paiements
- Gestion
  - Historique
  - Reporting
  - Équipe
  - Notes
  - Paramètres

Les deux espaces utilisent désormais la même logique de navigation modulaire et le même langage visuel.

## Refonte UX
- En-têtes de pages simplifiés : titre + contrôles utiles uniquement.
- Tables, filtres, boutons, modales, drawers et cartes harmonisés.
- Titres de tableaux sticky lors du scroll.
- Modales scrollables avec actions toujours accessibles.
- Fiche entreprise avec identité et navigation fixes.
- Éditeur d'adhésion maintenu dans un panneau contextuel et scrollable au lieu de remplacer la page.
- Suppression de toute référence visuelle à la température commerciale dans les vues délégué.

## Tâches & relances
- Toute la ligne est maintenant cliquable.
- Ouverture d'un drawer latéral avec : échéance, entreprise, contact, commentaire.
- Actions : marquer comme fait, modifier, voir la fiche entreprise, supprimer.
- Modification directe du type, objet, date, heure, contact et commentaire.
- Les actions du dashboard renvoient maintenant vers l'espace Tâches & relances au lieu d'ouvrir arbitrairement une entreprise.

## Design system
- Même sidebar bleue modulaire pour Admin et Délégué.
- Surfaces plus ouvertes, moins de « cartes dans des cartes ».
- Bordures plus fines, rayons cohérents, ombres réduites.
- Contrôles plus compacts et constants.
- Drawers et modales cohérents sur tout le produit.
- Responsive desktop/mobile conservé.

## Technique
- Base : V15.2.
- Supabase, authentification, rôles et structure de données conservés.
- Aucune migration SQL supplémentaire requise.
