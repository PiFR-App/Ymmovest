FROM node:22.21.0-alpine3.21
WORKDIR /app
COPY package*.json ./
RUN npm i
RUN npm ci
COPY . .
EXPOSE 5000
CMD ["npm","start"]