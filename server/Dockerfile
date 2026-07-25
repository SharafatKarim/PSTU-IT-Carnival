# ---- PSTU IT Carnival — Express API ----
FROM node:20-alpine

# dumb-init gives us proper signal handling (clean Ctrl+C / docker stop)
RUN apk add --no-cache dumb-init

ENV NODE_ENV=production
WORKDIR /app

# Install production dependencies first (better layer caching)
COPY package*.json ./
RUN npm ci --omit=dev

# Application source
COPY src ./src

# Run as the built-in unprivileged user
USER node

EXPOSE 5000

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "src/server.js"]
