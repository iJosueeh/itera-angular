# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Instalar http-server para servir la aplicación
RUN npm install -g http-server

COPY --from=builder /app/dist/itera-angular ./dist

EXPOSE 4200

# Servir la aplicación Angular compilada
CMD ["http-server", "dist", "-p", "4200", "--cors", "-g"]
