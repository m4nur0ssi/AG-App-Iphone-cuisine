# Plan d'implémentation : MagicFilterBar "Super-Pill" Unifié iOS 26

**Objectif** : Transformer la barre de filtres actuelle (2 docks séparés) en un composant unique, fluide et premium qui s'expanse intelligemment.

**Architecture** : 
- Un seul conteneur `framer-motion` avec `layoutId`.
- Les contrôles principaux (Catégories, Pays, Tendances) se transforment en indicateurs de contexte lors de l'expansion.
- Utilisation de SVGs vectoriels à la place des emojis pour un look professionnel.

**Stack technique** : Next.js, Framer Motion, CSS Modules.

---

## Tâches d'implémentation

### Tâche 1 : Préparation du système d'icônes SVG
- **Modifier** : `src/components/MagicFilterBar/MagicFilterBar.tsx`
- **Action** : Définir des constantes SVG pour chaque catégorie (Aperitifs, Entrees, Plats, etc.) afin de supprimer les emojis.
- **Tester** : Vérifier que les icônes s'affichent correctement dans le dock.
- **Commit** : `feat: replace emojis with professional SVGs in MagicFilterBar`

### Tâche 2 : Fusion des conteneurs (Unified Glass)
- **Modifier** : `src/components/MagicFilterBar/MagicFilterBar.module.css`
- **Action** : Créer une classe `.unifiedDock` qui servira de base commune. Supprimer `.wellDockSecondary`.
- **Modifier** : `src/components/MagicFilterBar/MagicFilterBar.tsx`
- **Action** : Envelopper le tout dans un seul `motion.div` avec `layout`.
- **Étape 1 (Test Fail)** : Tenter de fusionner sans `layoutId` -> saccades visuelles attendues.
- **Étape 2 (Implémentation)** : Utiliser `AnimatePresence` et `layout` pour gérer la transition de hauteur.
- **Commit** : `feat: unify filter bar containers into a single dynamic pill`

### Tâche 3 : Raffinement des micro-interactions
- **Modifier** : `src/components/MagicFilterBar/MagicFilterBar.tsx`
- **Action** : Ajouter un bouton "Fermer / Réinitialiser" fluide qui apparaît uniquement quand un groupe est ouvert.
- **Modifier** : `src/styles/ios26.css`
- **Action** : Ajouter des variables pour le blur "Super-Heavy" (80px+).
- **Tester** : Vérifier le scroll horizontal des sous-filtres à l'intérieur de la pilule unifiée.
- **Commit** : `polish: add heavy blur effects and fluid close interaction`

---

## Prochaines étapes
Une fois ce plan validé, nous commencerons par l'implémentation de la **Tâche 1**.
