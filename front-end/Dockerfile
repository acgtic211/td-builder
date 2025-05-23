# Etapa 1: Build de la aplicación Angular
FROM node:20.14.0-alpine AS build-step

# Crear directorio de trabajo
WORKDIR /app

# Copiar dependencias
COPY front-end/package*.json ./
RUN npm install

# Copiar el resto de la app y construirla
COPY front-end/. .
RUN npm run build --prod

# Etapa 2: Servir con Nginx
FROM nginx:alpine

COPY --from=build-step /app/dist/front-end/browser /usr/share/nginx/html

# Copiar configuración personalizada de Nginx
COPY deployment/nginx.conf /etc/nginx/conf.d/default.conf

CMD ["nginx", "-g", "daemon off;"]
