# ---- PSTU IT Carnival — React client ----

# 1) Build the static assets with Vite
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
# VITE_API_URL is intentionally left unset so the app calls the relative
# "/api/v1" path, which nginx (below) reverse-proxies to the API server.
RUN npm run build

# 2) Serve the built assets with nginx (also proxies /api -> server)
FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
