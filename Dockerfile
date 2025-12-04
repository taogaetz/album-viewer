FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production image
FROM node:22-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --omit=dev

# Copy built application from builder
COPY --from=builder /app/build ./build

# Copy drizzle config for migrations
COPY --from=builder /app/drizzle.config.ts ./drizzle.config.ts

# Copy schema for migrations
COPY --from=builder /app/src/lib/server/db/schema.ts ./src/lib/server/db/schema.ts


# Create directory for SQLite database
RUN mkdir -p /app/data

# Set environment variable for database location
ENV DATABASE_URL=/app/data/local.db

# Expose port
EXPOSE 3000

# Start the application
CMD ["node", "build"]

