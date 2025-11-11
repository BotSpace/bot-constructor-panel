# Build Stage
FROM node:22-alpine AS builder
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy project files and build Next.js application
COPY . .
RUN npm run build

# Production Stage
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copy built application and node modules from the builder stage
COPY --from=builder /app ./

# Expose port (default for Next.js)
EXPOSE 3000

# Start the Next.js application
CMD ["npm", "start"]
