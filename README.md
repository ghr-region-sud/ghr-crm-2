# CRM GHR Région Sud — v15.24.5

Version propre prête pour Vercel.

## Correctif bulletin PDF
- suppression des grands masques blancs qui coupaient les libellés et les pointillés ;
- repositionnement exact des cases d'activité, notamment Hôtel 5* ;
- conservation des champs Nombre de salariés, Nombre de chambres, Classement, Type de licence, SIRET, Code NAF et Statut juridique ;
- suppression de la seconde année superposée sur « Montant de votre cotisation » ;
- cases Oui / Non et mode de règlement rendus avec un marquage net ;
- modèle PDF validé conservé comme fond maître, sur une seule page A4.

Déploiement : `npm install` puis `npm run build`.
