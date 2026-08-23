# GHR CRM — V15.1 — Refonte UX espace délégué

## Intention produit
Cette version ne cherche pas à ajouter des modules. Elle recentre le CRM sur le travail quotidien du délégué GHR : **prospecter → suivre → adhérer → encaisser → renouveler**.

## Architecture délégué
Navigation volontairement limitée à 4 entrées :
- Accueil
- Suivi commercial
- Entreprises
- Contacts

Les adhésions, paiements, documents, tâches, notes et historiques ne deviennent pas des menus supplémentaires : ils restent accessibles dans le contexte de la fiche entreprise.

## Accueil repensé
- priorité aux actions du jour et en retard ;
- mise en avant des prospects chauds ;
- renouvellements à surveiller ;
- liste des entreprises récemment suivies ;
- KPI secondaires et contextualisés plutôt qu’un dashboard statistique lourd.

## Entreprises
Pour le délégué, la liste a été ramenée aux informations réellement utiles :
- entreprise ;
- contact principal ;
- situation ;
- adhésion active ;
- prochaine action.

Recherche unifiée entreprise/contact/ville et filtres statut + activité.

## Contacts
- véritable annuaire indépendant ;
- recherche instantanée nom / entreprise / téléphone / email ;
- cartes compactes modernes ;
- ouverture de la fiche latérale existante (appel, WhatsApp, email, modification, entreprise).

## Fiche entreprise 360°
Conservation des 5 espaces métier :
- Entreprise
- Suivi
- Adhésions
- Paiements
- Documents

Le frontend est allégé : moins de cadres imbriqués, navigation plus discrète, timeline plus lisible et hiérarchie visuelle plus proche d’une application SaaS moderne.

## Design system V15.1
Direction : application grand public premium / SaaS 2026–2027.
- surfaces ouvertes et fond gris très clair ;
- bordures très légères ;
- ombres faibles ;
- rayons cohérents ;
- typographie plus hiérarchisée ;
- moins de « cartes dans des cartes » ;
- sidebar plus sobre ;
- responsive conservé.

## Technique / préservation
- base : V14 ;
- Supabase, Auth et distinction Admin/Délégué conservés ;
- aucune migration SQL requise ;
- espace administrateur et fonctionnalités métier existantes conservés ;
- Google Agenda / Rendez-vous restent supprimés comme demandé en V14.
