# Multi-stage build for Angular application
# Stage 1: Build the Angular application
FROM node:20-alpine AS build
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source and build
COPY . .
# Using the output path specified in angular.json or defaulting to dist/itera
RUN npm run build -- --configuration production

# Stage 2: Serve the application using Nginx
FROM nginx:stable-alpine
# The directory name inside dist depends on the project name in angular.json ("itera")
COPY --from=build /app/dist/itera/browser /usr/share/nginx/html

# Copy custom nginx configuration if needed (optional)
# COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
