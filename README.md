# Calculatrice 3D Interactive avec Environnement Dynamique

Une calculatrice 3D réaliste avec un environnement de bureau interactif, des cycles jour/nuit et des effets météo.

## Fonctionnalités

### Calculatrice

- Interface 3D réaliste d'une calculatrice de bureau
- Calculatrice entièrement fonctionnelle avec opérations arithmétiques
- Touches animées avec retour tactile
- Mémoire fonctionnelle (MR, M+, M-, MC)
- Affichage LCD avec effet de lueur

### Environnement de Bureau

- **Objets interactifs** :
  - **Tasse de café** - Cliquez pour activer/désactiver la vapeur
  - **Crayon** - Cliquez pour le faire pivoter/déplacer
  - **Cahier** - Cliquez pour l'ouvrir et tourner les pages
  - Sous-main qui change de couleur selon l'heure du jour

- **Lampe de bureau** :
  - Interrupteur fonctionnel pour allumer/éteindre la lampe
  - Ombres dynamiques projetées par la lampe

### Effets d'environnement

- **Cycle jour/nuit** :
  - Transitions automatiques entre aube, jour, crépuscule et nuit
  - Éclairage qui s'adapte à l'heure du jour
  - Contrôles pour changer manuellement l'heure

- **Effets météorologiques** :
  - Ciel clair, nuageux ou pluvieux
  - Nuages animés et pluie dynamique
  - Contrôles pour changer manuellement la météo

- **Fenêtre avec vue extérieure** :
  - Vue sur un paysage simple avec arbre et maison
  - Effets de condensation sur la vitre
  - Gouttes de pluie ruisselant sur la vitre quand il pleut
  - Lumière dans la maison qui s'allume la nuit

## Comment interagir

1. **Navigation** : Utilisez la souris pour orbiter, zoomer et vous déplacer dans la scène
2. **Calculatrice** : Cliquez sur les boutons pour effectuer des calculs
3. **Environnement** :
   - Cliquez sur la lampe pour l'allumer/éteindre
   - Interagissez avec les objets de bureau (tasse, crayon, cahier)
   - Utilisez les contrôles en bas à gauche pour changer l'heure et la météo

## Technologies utilisées

- React et TypeScript
- Three.js pour les graphiques 3D
- React Three Fiber comme wrapper React pour Three.js
- React Three Drei pour des composants et helpers utiles
- React Spring pour les animations fluides

## Installation et Démarrage

```bash
# Installer les dépendances
npm install

# Démarrer le serveur de développement
npm run dev

# Construire pour la production
npm run build
```

## Crédits

Développé avec ❤️ en utilisant Three.js et React.

# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type aware lint rules:

- Configure the top-level `parserOptions` property like this:

```js
export default tseslint.config({
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

- Replace `tseslint.configs.recommended` to `tseslint.configs.recommendedTypeChecked` or `tseslint.configs.strictTypeChecked`
- Optionally add `...tseslint.configs.stylisticTypeChecked`
- Install [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react) and update the config:

```js
// eslint.config.js
import react from 'eslint-plugin-react'

export default tseslint.config({
  // Set the react version
  settings: { react: { version: '18.3' } },
  plugins: {
    // Add the react plugin
    react,
  },
  rules: {
    // other rules...
    // Enable its recommended rules
    ...react.configs.recommended.rules,
    ...react.configs['jsx-runtime'].rules,
  },
})
```

# 3dCalculcator
