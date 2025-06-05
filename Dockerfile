FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY api/package*.json ./

# Install ALL dependencies (including dev) first
RUN npm install

# Copy source files
COPY api/ .

# Build TypeScript to JavaScript
RUN npm run build

# Remove dev dependencies after build
RUN npm prune --omit=dev

# Set memory limit and other optimizations
ENV NODE_OPTIONS="--max-old-space-size=512"
ENV PORT=5000

EXPOSE 5000

# Run the compiled JavaScript instead of ts-node
CMD ["node", "dist/server.js"]
