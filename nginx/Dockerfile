FROM nginx:alpine3.22

COPY --from=ymmovest-frontend /app/dist /usr/share/nginx/html
COPY nginx-config/default.conf /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

ENTRYPOINT ["nginx", "-c", "/etc/nginx/nginx.conf"]
CMD ["-g", "daemon off;"]