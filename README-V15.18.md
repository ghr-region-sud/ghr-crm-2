# V15.18

Correctif ciblé sur la création d’une adhésion depuis une fiche entreprise.

- suppression de la course entre la mise à jour du state et l’ouverture de l’éditeur ;
- l’adhésion est d’abord réellement injectée dans le state ;
- l’éditeur ne s’ouvre qu’après confirmation que l’ID existe dans l’entreprise ;
- évite l’écran d’erreur / adhésion introuvable après « + Adhésion ».
