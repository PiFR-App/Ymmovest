FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
# Attendu: un script "worker" dans package.json (ex: node worker.js)
CMD ["npm","run","worker"]