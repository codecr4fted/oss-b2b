# syntax=docker/dockerfile:1
FROM node:24-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

# Installation des dépendances de production uniquement
COPY package*.json ./
RUN npm ci --omit=dev

# Copie du code source et des assets
COPY server.js ./
COPY server/ ./server/
COPY css/ ./css/
COPY js/ ./js/
COPY index.html ./
COPY favicon.* ./

# Création du répertoire de persistance pour SQLite
RUN mkdir -p /app/data && chown -R node:node /app

USER node

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/api/v1/health || exit 1

CMD ["node", "server.js"]
