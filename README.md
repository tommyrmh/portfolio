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

## Developpement local

```bash
# Frontend
# Ouvrir index.html dans un navigateur

# Backend
cd backend
npm install
npm start
```

## Technologies

- Frontend : HTML5, CSS3, JavaScript
- Backend : Node.js, Express, Nodemailer
- Deploiement : Docker, Nginx

## Auteur

Tommy RAMIHOATRARIVO - Developpeur Full Stack
