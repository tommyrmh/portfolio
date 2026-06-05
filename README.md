# Portfolio Tommy RAMIHOATRARIVO

Portfolio professionnel avec formulaire de contact fonctionnel.

## Structure

```
portfolio/
├── index.html          # Page principale
├── style.css           # Styles
├── script.js           # JavaScript
├── Dockerfile          # Docker frontend (Nginx)
├── nginx.conf          # Configuration Nginx
├── docker-compose.yml  # Orchestration Docker
└── backend/
    ├── server.js       # Serveur Express
    ├── package.json    # Dependances
    ├── Dockerfile      # Docker backend
    └── .env            # Configuration email
```

## Deploiement avec Docker

### 1. Cloner le repository

```bash
git clone https://github.com/Tshitho/portfolio.git
cd portfolio
```

### 2. Configurer l'email

Creer le fichier `.env` a la racine :

```bash
EMAIL_USER=tommyramihoatrarivo@gmail.com
EMAIL_PASS=votre_mot_de_passe_application
CONTACT_TO=tommyramihoatrarivo@gmail.com
```

### 3. Lancer avec Docker Compose

```bash
docker-compose up -d --build
```

Le portfolio sera accessible sur `http://localhost` (port 80)

### 4. Arreter

```bash
docker-compose down
```

## Configuration Gmail

Pour que le formulaire de contact fonctionne :

1. Activer la validation en 2 etapes sur Gmail
2. Creer un mot de passe d'application :
   - https://myaccount.google.com/apppasswords
3. Utiliser ce mot de passe dans `.env`
4. Laisser `EMAIL_USER` et `CONTACT_TO` sur votre adresse Gmail si vous voulez recevoir les messages sur cette meme boite

## Developpement local

```bash
# Frontend
# Ouvrir index.html dans un navigateur

# Backend
cd backend
npm install
npm start
```

## Verification du backend

Le backend expose une route de sante:

```bash
http://localhost:3000/api/health
```

Elle retourne aussi `emailConfigured: true` quand la configuration email est bien detectee.

## Deploiement GitHub Pages + Render

GitHub Pages ne peut publier que le frontend statique. Le backend Node.js doit etre deploye separement sur Render.

### 1. Frontend sur GitHub Pages

Le depot contient deja le workflow GitHub Pages:

- [deploy-pages.yml](./.github/workflows/deploy-pages.yml)

Actions a faire sur GitHub:

1. pousser le depot sur GitHub
2. aller dans `Settings > Pages`
3. choisir `GitHub Actions` comme source de deployment
4. verifier que la branche de publication est `main`

### 2. Backend sur Render

Le depot contient deja la configuration Render:

- [render.yaml](./render.yaml)

Actions a faire sur Render:

1. creer un nouveau `Blueprint` ou `Web Service` depuis ce depot
2. valider le service `portfolio-contact-api`
   si ce nom est deja pris sur Render, renommez simplement le service
3. definir les variables d'environnement:

```bash
EMAIL_USER=tommyramihoatrarivo@gmail.com
EMAIL_PASS=votre_mot_de_passe_application
CONTACT_TO=tommyramihoatrarivo@gmail.com
ALLOWED_ORIGINS=https://votre-compte.github.io
```

Pour un site GitHub Pages de type projet `https://votre-compte.github.io/nom-du-repo`,
la bonne origine CORS reste le domaine Pages:

```bash
ALLOWED_ORIGINS=https://votre-compte.github.io
```

### 3. Lier le frontend au backend Render

Mettre a jour [config.js](./config.js):

```js
window.PORTFOLIO_CONFIG = {
  apiBaseUrl: "https://portfolio-contact-api.onrender.com"
};
```

Remplacez l'URL par celle fournie par Render.

### 4. Republier le frontend

Une fois `config.js` mis a jour:

```bash
git add config.js
git commit -m "Configure Render API URL"
git push
```

GitHub Pages redeploiera automatiquement le site.

## Technologies

- Frontend : HTML5, CSS3, JavaScript
- Backend : Node.js, Express, Nodemailer
- Deploiement : Docker, Nginx

## Auteur

Tommy RAMIHOATRARIVO - Developpeur Full Stack
