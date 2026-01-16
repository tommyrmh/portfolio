# Backend Node.js
FROM node:18-alpine

WORKDIR /app

# Copier les fichiers de dependances
COPY package*.json ./

# Installer les dependances
RUN npm install --production

# Copier le code source
COPY . .

# Exposer le port
EXPOSE 3000

# Demarrer le serveur
CMD ["npm", "start"]
