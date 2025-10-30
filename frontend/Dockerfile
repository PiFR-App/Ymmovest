FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
# Pour React (CRA). Si vous utilisez Vite, remplacez la sortie par "dist".
RUN npm run build

FROM nginx:1.25-alpine
# Copie du build dans le dossier statique Nginx
COPY --from=build /app/build /usr/share/nginx/html
# Config Nginx pour SPA (fallback sur index.html)
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx","-g","daemon off;"]