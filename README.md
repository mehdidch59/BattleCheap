# ProjetJS

## Ce projet va être fou !!

## Configuration de l'environnement

Créez un fichier `.env` à la racine du projet avec le contenu suivant :

```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=battlecheap
SESSION_SECRET=eb8fcc253281389225b4f7872f2336918ddc7f689e1fc41b64d5c4f378cdc438
PORT=8880
```

Adaptez les valeurs selon votre configuration.

## Qualité du code

Le projet utilise **ESLint** et **Prettier** pour garantir la qualité et la cohérence du code.

-   Pour vérifier le linting :
    ```bash
    npx eslint .
    ```
-   Pour formater le code automatiquement :
    ```bash
    npx prettier --write .
    ```
