FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json .
RUN npm ci
COPY . .
ARG REACT_APP_API_URL
ENV REACT_APP_API_URL=$REACT_APP_API_URL
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
# nginx.conf — шаблон с ${PORT}. Railway задаёт PORT; локально по умолчанию 80.
COPY nginx.conf /etc/nginx/templates/default.conf.template
ENV PORT=80
# envsubst скоупим только на ${PORT}, чтобы не тронуть nginx-переменные ($uri и т.п.).
CMD ["/bin/sh", "-c", "envsubst '${PORT}' < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf && exec nginx -g 'daemon off;'"]
