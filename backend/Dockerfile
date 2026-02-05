FROM node:22.21.0-alpine3.21

# Installer les dépendances nécessaires pour compiler bcrypt
RUN apk add --no-cache python3 make g++

WORKDIR /app

COPY package*.json ./

# Nettoyer le cache et installer les dépendances
RUN npm cache clean --force && \
    rm -rf node_modules && \
    npm ci --only=production

COPY . .

EXPOSE 5000

CMD ["npm","start"]
