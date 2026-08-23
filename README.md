# GHR CRM V15.4 — Refonte UX cohérente et responsive

Cette version reprend la V15.3 et corrige les incohérences signalées sur l'espace Délégué et l'espace Administrateur.

## Principes produit

- Une seule logique visuelle pour Admin et Délégué.
- Navigation latérale compacte : plus de grands espaces ou de tuile Accueil surdimensionnée.
- Les pages de pilotage affichent des indicateurs et graphiques ; les pages opérationnelles affichent des listes/actions.
- Une action cliquée ouvre un contexte (drawer/modal) sans changer arbitrairement de page.
- Mobile : les tableaux métiers passent en cartes empilées quand l'espace manque.

## Modifications principales

### Accueil Délégué
- filtre de période directement dans le dashboard ;
- 6 indicateurs clés ;
- graphique d'évolution annuelle ;
- tâches et relances ;
- reporting de la période ;
- suppression du bloc redondant « Accès rapides / entreprises récentes ».

### Statistiques & exports
- nouvel accès Délégué et Admin ;
- choix année / année complète / janvier-juin / juillet-décembre ;
- synthèse en tête ;
- détail mensuel repliable ;
- export Excel ;
- PDF conservé côté Admin.

### Pipeline
- toutes les étapes restent sur UNE ligne horizontale ;
- scroll horizontal au lieu de renvoyer « Adhésion active » / « À revoir plus tard » sur une seconde ligne.

### Tâches & relances
- correction du drawer : il est désormais réellement fixé à droite au-dessus de la page ;
- clic sur toute la ligne ;
- détail, modification, clôture, suppression et accès entreprise.

### Fiche entreprise / Suivi
- le suivi n'est plus une longue page cumulant tâches + notes + historique ;
- sous-navigation locale : À faire / Notes / Historique.

### Adhésions
- filtre supplémentaire : Tous / À encaisser / Soldé ;
- ligne entière cliquable ;
- responsive mobile sous forme de cartes ;
- drawer d'édition moins large et plus dense.

### Paiements
- un paiement n'ouvre plus directement l'éditeur complet d'adhésion ;
- clic = drawer Paiement dédié ;
- bouton explicite « Voir l'adhésion » ;
- responsive mobile.

### Documents
- suppression du doublon « Ajouter un document » + « Importer » : une seule action d'import reste visible.

### Changement d'espace Admin
- le menu se ferme immédiatement au clic ; la synchronisation de l'espace se fait ensuite.

### Paramètres Admin
- suppression du bloc statique « Référentiel activités GHR » ;
- paramètre Organisation réellement modifiable et sauvegardable ;
- structure secondaire prête pour Notifications / Sécurité.

## Validation réalisée

- parsing JSX/TypeScript : 0 erreur de syntaxe ;
- contrôle statique des composants JSX effectué ;
- `npm install` n'a pas terminé dans l'environnement d'exécution (timeout réseau), donc le build Next/Vercel reste la validation de déploiement.

## V15.5
Voir `README-V15.5.md`.
