# GHR CRM — V15.9

Version de stabilisation UX et interaction.

- Correction du crash Pipeline/Liste provoqué par la portée de `effectiveStage` (écran “This page couldn’t load”).
- Pipeline : défilement horizontal natif sans animation concurrente ; chaque colonne conserve son défilement vertical indépendant.
- Logo officiel GHR Région Sud utilisé dans la sidebar, suppression du doublon texte/logo.
- Modales métier harmonisées : tâches, opportunités et contacts avec hiérarchie, marges et actions cohérentes.
- Tâches : contact référent, téléphone/email, Appeler/WhatsApp/Message, modification, validation et suppression.
- Fiche entreprise : clic sur une carte contact = aperçu central, puis actions et modification.
- Paiements d’adhésion : remplacement du tableau horizontal par des cards responsives ; clic sur un paiement pour le modifier ou le supprimer.
- Paiements entreprise : cards responsives, plus de tableau nécessitant un scroll horizontal.
- Export PDF statistiques : première page avec tableau mensuel sur la période sélectionnée + deuxième page avec détail par commercial.
- Réduction des marges verticales en haut des fiches et de la barre utilitaire.

La syntaxe JSX est validée via le parseur TypeScript local (0 erreur de parsing).
