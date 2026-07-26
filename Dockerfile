# Node 24 (LTS) to match the development machine. pnpm 11 also requires
# >= 22.13 — it loads node:sqlite, which Node 20 does not have.
FROM node:24-alpine AS base

# pnpm is only needed to install and build — the runtime image stays without it.
FROM base AS pnpm-base
RUN apk add --no-cache libc6-compat
# Pinned to the same version as the `packageManager` field in package.json, so
# a Docker build resolves exactly what a developer's machine resolves.
RUN npm install -g pnpm@11.6.0

# Install dependencies only when needed
FROM pnpm-base AS deps
WORKDIR /app

# pnpm-workspace.yaml carries the allowBuilds settings, so it has to be present
# for sharp / unrs-resolver to be allowed to run their install scripts.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
# Generous fetch timeout/retries: the Next.js tarballs are large and a slow
# link otherwise aborts the whole install.
RUN pnpm install --frozen-lockfile \
      --fetch-timeout 600000 \
      --fetch-retries 5 \
      --network-concurrency 4

# Rebuild the source code only when needed
FROM pnpm-base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
ENV MONGO_URI=mongodb://localhost:27017/pstu_it_carnival

# NEXT_PUBLIC_* values are inlined into the browser bundle during `next build`,
# so this has to arrive as a build arg — setting it only at runtime leaves it
# undefined in the browser. Empty by default, which keeps Turnstile off.
# It is a public site key, not a secret; the secret half stays server-side.
ARG NEXT_PUBLIC_TURNSTILE_SITE_KEY=""
ENV NEXT_PUBLIC_TURNSTILE_SITE_KEY=$NEXT_PUBLIC_TURNSTILE_SITE_KEY

RUN pnpm build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
