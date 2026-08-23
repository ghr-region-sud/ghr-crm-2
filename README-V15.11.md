# GHR CRM — V15.11

## Correctif ciblé : ouverture des fiches depuis Communauté > Entreprises

- remplacement des lignes HTML `<button>` du répertoire Entreprises par des lignes neutres accessibles (`role="button"`) afin d’éviter tout comportement natif parasite du navigateur ;
- blocage explicite de la navigation native avec `preventDefault()` / `stopPropagation()` ;
- validation de l’identifiant entreprise avant ouverture ;
- ouverture conservée entièrement côté React via `onOpenCompany`, identique au mécanisme déjà stable depuis Pipeline et Contacts ;
- support clavier Entrée / Espace maintenu.

Aucune modification du fonctionnement Pipeline / Contacts / fiche entreprise.
