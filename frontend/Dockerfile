# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci

# Set build argument for API URL so Vite can bake it into the code
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Install serve to run the built app
RUN npm install -g serve

# Copy built assets from builder stage
COPY --from=builder /app/dist ./dist

# Expose the correct port
EXPOSE 5173

# Health check updated to match the new port
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost:5173 || exit 1

# Run the application on the correct port
CMD ["serve", "-s", "dist", "-l", "5173"]
