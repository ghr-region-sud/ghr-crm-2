# GHR CRM — V15.5

Version de raffinement UX construite à partir de la V15.4.

## Principales évolutions
- Sidebar : hover compact bleu, jamais de gros bloc blanc hors état actif.
- Pipeline : hiérarchie des cartes renforcée, contact principal + téléphone visibles, tâche secondaire plus discrète.
- Tâches : modèle simplifié en 2 vues seulement — À réaliser / Adhésions à valider.
- Adhésions à valider : clic ouvre directement le drawer de l’adhésion au lieu de renvoyer vers la fiche entreprise.
- Fiche entreprise > Suivi : les tâches sont cliquables et ouvrent le même drawer de détail/modification que la vue globale.
- Fiche entreprise > Adhésions : remplacement du tableau dense par des cartes synthétiques responsives.
- Paiements : depuis la fiche entreprise ou le registre global, « Voir l’adhésion » ouvre directement l’onglet Paiements du drawer.
- Statut adhésion : présentation simplifiée avec regroupement À préparer / En cours / Active / À renouveler / Expirée / Annulée.
- Statistiques : période précise personnalisable via date début/date fin, export Excel + PDF pour admin et délégué.
- Paramètres délégué : ajout d’un espace Mon compte et modification sécurisée du mot de passe via Supabase Auth.
- Responsive : ajustements pipeline, cartes adhésion, filtres reporting et paramètres.
