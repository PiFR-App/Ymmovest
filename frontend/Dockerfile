FROM node:20-alpine AS build

RUN apk add --no-cache wget

WORKDIR /app

COPY package*.json .

RUN npm i

RUN --mount=type=cache,target=/root/.npm npm ci

COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
#RUN npm run build

