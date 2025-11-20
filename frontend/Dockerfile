FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json .

RUN npm i

RUN --mount=type=cache,target=/root/.npm npm ci

COPY . .

RUN npm run build

