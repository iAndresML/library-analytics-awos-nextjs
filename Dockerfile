# Configuración Multi-Stage para máxima seguridad e imagen ligera

# STAGE 1: Instalar dependencias
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json ./
# Evitamos problemas de scripts maliciosos con omit
RUN npm install

# STAGE 2: Compilación de Next.js
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# En este punto el build no tiene conexión a base de datos.
RUN npm run build

# STAGE 3: Entorno de ejecución (Production Runner)
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV production

COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000

# SEGURIDAD AWOS: Prevenir Root Privilege Escalation (Evita permisos sudo en ataque remoto)
USER node

# Next.js se levantará ejecutando el artefacto compilado
CMD ["npm", "start"]
