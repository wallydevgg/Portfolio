# Stage 1: Build
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --ignore-scripts
COPY . .
ARG VITE_TURNSTILE_SITE_KEY
ENV VITE_TURNSTILE_SITE_KEY=$VITE_TURNSTILE_SITE_KEY
RUN npm run messages:extract && npm run compile
RUN npm run build

# Stage 2: Serve
FROM nginx:alpine
# Copiar configuración de Nginx para SPA
COPY nginx.conf /etc/nginx/conf.d/default.conf
# Copiar build artifacts
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
