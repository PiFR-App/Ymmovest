FROM node:22.21.0-alpine3.21

# Installer les dépendances nécessaires pour compiler bcrypt
RUN apk add --no-cache python3 make g++

WORKDIR /app

COPY package*.json ./

# Nettoyer le cache et installer les dépendances
RUN npm i

COPY . .

EXPOSE 5000

CMD ["npm","start"]
