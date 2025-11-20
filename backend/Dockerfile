FROM node:22.21.0-alpine3.21
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
EXPOSE 5000
# Attendu: un script "start" dans package.json (ex: node server.js)
CMD ["npm","start"]