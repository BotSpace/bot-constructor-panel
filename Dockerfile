# Build Stage
FROM node:24 AS builder
WORKDIR /app

RUN npm i -g pnpm

COPY package*.json ./
RUN pnpm install --ignore-scripts

COPY . .

RUN pnpm run build

# Production Stage
FROM node:24 AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN npm i -g pnpm

RUN apt update && apt install curl

COPY --from=builder /app ./

EXPOSE 3000

CMD ["pnpm", "start"]
