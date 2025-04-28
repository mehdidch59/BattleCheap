# BattleCheap

Une application de jeu de bataille navale en ligne utilisant React, Firebase et Socket.io.

## Technologies utilisées

- React
- React Router
- Firebase Authentication
- Firebase Firestore
- Socket.io
- Express

## Structure du projet

```
BattleCheap/
├── public/             # Fichiers statiques
├── src/                # Code source React
│   ├── assets/         # Images et ressources
│   ├── components/     # Composants React réutilisables
│   ├── context/        # Contextes React (AuthContext)
│   ├── firebase/       # Configuration Firebase
│   ├── hooks/          # Hooks personnalisés
│   └── pages/          # Pages de l'application
├── .env                # Variables d'environnement
├── .gitignore          # Fichiers ignorés par Git
├── server.js           # Serveur Express + Socket.io
└── package.json        # Dépendances
```

## Installation

1. Clonez le dépôt
2. Installez les dépendances avec `npm install`
3. Configurez votre projet Firebase et ajoutez les variables d'environnement dans le fichier `.env`
4. Lancez l'application avec `npm run dev`

## Fonctionnalités

- Authentification utilisateur
- Création et jointure de salles de jeu
- Placement des bateaux sur la grille
- Jeu de bataille navale en temps réel
- Chat en jeu
- Historique des parties jouées

## Déploiement

### Déploiement sur un serveur standard

Pour déployer l'application en production sur votre propre serveur :

```
npm run build
npm start
```

### Déploiement sur GitHub Pages

Pour déployer la partie frontend sur GitHub Pages, suivez ces étapes :

1. Modifiez la propriété `homepage` dans le fichier `package.json` en remplaçant "VOTRE-USERNAME" par votre nom d'utilisateur GitHub.

2. Créez un fichier `.env.production` à la racine du projet avec les variables d'environnement suivantes :
   ```
   REACT_APP_SERVER_URL=https://votre-serveur-backend.com
   ```
   (Remplacez par l'URL de votre serveur backend déployé)

3. Exécutez la commande suivante pour déployer sur GitHub Pages :
   ```
   npm run deploy
   ```

> **Note importante** : GitHub Pages ne peut héberger que la partie frontend de l'application. Pour que le jeu fonctionne complètement, vous devrez déployer le serveur backend (fichier `server.js`) sur une plateforme comme Heroku, Render, ou autre service qui permet d'exécuter du code côté serveur.
