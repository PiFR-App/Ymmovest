#FROM node:20-alpine AS build
#
#RUN apk add --no-cache python3 make g++
#
#WORKDIR /app
#
#COPY package*.json .
#
#RUN npm i
#
#RUN --mount=type=cache,target=/root/.npm npm ci
#
#COPY . .
#
#EXPOSE 5173
#
#CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
##RUN npm run build
#
FROM node:20

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

RUN npm run build