# Etapa 1: Build de la aplicación Angular
FROM node:20.14.0-bullseye-slim AS build-step

ARG GEMINI_KEY_ARG

# Crear directorio de trabajo
WORKDIR /app

# Copiar dependencias
COPY front-end/package*.json ./
RUN npm install

# Copiar el resto de la app y construirla
COPY front-end/. .
RUN sed -i "s|GEMINI_API_KEY_PLACEHOLDER|$GEMINI_KEY_ARG|g" src/app/environments/environment.ts
RUN npm run build

# Etapa 2: Servir con Nginx
FROM nginx:alpine

# Copiar artefactos de build
COPY --from=build-step /app/dist/front-end/browser /usr/share/nginx/html

# Copiar configuración personalizada de Nginx
COPY deployment/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]