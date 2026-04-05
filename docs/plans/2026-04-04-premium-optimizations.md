# Plan d'Implémentation : Optimisations Premium & Corrections UX (2026-04-04)

**Objectif :** Affiner l'expérience utilisateur, corriger les bugs de classement et enrichir la section "Comme au resto" avec des fonctionnalités natives iPhone (Maps/Plans) et des badges informatifs.

## 🛠️ Tâches à accomplir

### 1. Loupe dynamique & Chronomètre
- **Fichier :** `src/components/BottomNav/BottomNav.tsx`
- **Action :** Remplacer `<SearchIcon />` par un indicateur de temps si `activeTimer` est présent.
- **Logique :** Utiliser `useTimer` context.
- **Test :** Lancer un timer sur une recette et vérifier que la loupe devient un chronomètre dans le dock mini et complet.

### 2. Navigation Gestuelle (Swipe-to-Back)
- **Fichier :** `src/app/page.tsx`
- **Action :** Ajouter la détection de swipe de gauche à droite sur le conteneur principal quand une catégorie est active.
- **Logique :** `onTouchStart/End` avec seuil de 100px.
- **Test :** Swiper depuis le bord gauche en vue catégorie pour revenir à l'accueil.

### 3. Corrections de Données & Filtres Stricts
- **Fichier :** `src/app/page.tsx`
- **Action 1 :** Corriger `isEntree` (Regex pour "œuf" vs "bœuf").
- **Action 2 :** Durcir `isIceCream` (uniquement glaces et sorbets).
- **Action 3 :** Durcir `isBeverage` (boissons, cocktails, alcool uniquement).
- **Test :** Vérifier que le Filet de Bœuf Rossini n'est plus dans "Entrées" et que les catégories thématiques sont pures.

### 4. Refonte UI "Comme au Resto"
- **Fichier :** `src/components/RecipeDetails/RecipeDetails.tsx`
- **Action 1 :** Supprimer le doublon de description (si `category === 'restaurant'`).
- **Action 2 :** Ajouter la fonction `parseRestaurantInfo` pour extraire (Prix, Terrasse, Parking, Foot).
- **Action 3 :** Intégrer les boutons Maps/Plans officiels.
- **Test :** Ouvrir une fiche restaurant et vérifier la présence des nouveaux badges et des liens de navigation.

## 🚀 Commits Prévus
1. `fix: correct beef classification and strict category filtering`
2. `feat: implement swipe-to-back for categories`
3. `feat: dynamic timer replacement for search icon`
4. `feat: enhanced restaurant UI with maps and feature badges`
