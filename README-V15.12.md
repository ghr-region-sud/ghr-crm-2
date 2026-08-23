# V15.12 — correction accès aux fiches entreprises

Cause identifiée : le composant `CompanyDetail` appelait `QuickAddMenu`, mais ce composant n’existait plus dans le bundle. Toute ouverture d’une fiche entreprise déclenchait donc une erreur JavaScript au rendu, quel que soit le point d’entrée (Entreprises, Pipeline, Contacts, tâches).

Correction : réintégration de `QuickAddMenu` avec les actions Activité, Relance / tâche, Contact, Adhésion, Paiement et Document. Le correctif porte sur le composant de fiche lui-même et non sur les liens d’ouverture.
