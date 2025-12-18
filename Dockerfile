# 1. BAZA (Base) - Alpine o'rniga Slim ishlatamiz (Debian asosida)
# Eslatma: Node 24 hali chiqmagan bo'lishi mumkin (hozirgi LTS 22), 
# agar 24 ishlamasa 22-slim qilib ko'ring.
FROM node:22-slim AS base

# 2. DEPENDENCIES
FROM base AS deps
WORKDIR /app

# Slim versiyada apk o'rniga apt-get ishlatiladi
# Python va make ba'zi native modullar uchun kerak bo'lishi mumkin (ixtiyoriy)
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./

# sfw ni o'rnatamiz
RUN npm i -g sfw

# Endi bu yerda xato bermaydi, chunki slim versiyada glibc bor
RUN sfw npm i

# 3. BUILDER
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Next.js build
RUN npm run build

# 4. RUNNER (Yakuniy bosqich)
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# btop o'rnatish (apt-get orqali)
RUN apt-get update && apt-get install -y --no-install-recommends btop \
    && rm -rf /var/lib/apt/lists/*

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT 3000

CMD ["node", "server.js"]
