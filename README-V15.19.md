# GHR CRM V15.19

Correctif création d’adhésion depuis une fiche entreprise.

## Cause racine corrigée
Le composant `NewMembershipModal` était appelé par la fiche entreprise mais n’existait plus dans le bundle. Au clic sur `+ Adhésion`, React évaluait ce composant absent et déclenchait l’écran `This page couldn’t load`.

## Correctifs
- restauration d’un `NewMembershipModal` complet ;
- création d’une adhésion normalisée avec un ID avant ouverture de la fiche ;
- sécurisation du `MembershipEditor` pour éviter un changement d’ordre des hooks lorsqu’une adhésion n’est pas encore disponible dans l’état.
