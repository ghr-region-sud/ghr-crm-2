# GHR CRM V15.20 — intégration bulletin d’adhésion

## Ajout principal
Le bouton **Vérifier & générer** de la fiche adhésion est maintenant relié au kit bulletin GHR validé.

### Fonctionnement
1. Les données de l’entreprise, du contact référent et de l’adhésion sont envoyées à `/api/bulletin`.
2. Le serveur hydrate le template officiel du bulletin.
3. Le logo et le CSS sont intégrés directement au document afin d’éviter les ressources manquantes.
4. Le bulletin s’ouvre dans un nouvel onglet et la boîte d’impression PDF s’ouvre automatiquement.
5. Le CRM enregistre `bulletinGeneratedAt` et fait passer un brouillon / dossier à compléter en `En cours`.

### Données reliées
- établissement / société / adresse / téléphone / e-mail
- SIRET / NAF / statut juridique / activité / salariés / chambres / classement / licence
- contact référent
- nouvelle adhésion ou renouvellement
- année et montant de cotisation
- options et autorisations
- mode de règlement
- mandat SEPA

### Coordonnées GHR intégrées
- 830 Boulevard de Léry - 83140 Six Fours Les Plages
- www.ghr-regionsud.fr
- contact@ghr-region-sud.fr
- IBAN : FR76 1027 8097 1100 0206 6909 976
- BIC : CMCIFR2A

## Important
Cette version génère le bulletin imprimable depuis le navigateur afin de conserver fidèlement le template HTML/CSS validé, sans superposition ou patch PDF.
