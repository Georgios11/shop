FROM node:18-alpine

WORKDIR /app

# Install only production dependencies first
COPY api/package*.json ./
RUN npm ci --only=production

# Copy source files
COPY api/ .

# Build TypeScript
RUN npm install typescript ts-node @types/node --save-dev
RUN npm run build

# Remove dev dependencies to save space
RUN npm prune --production

# Set memory limit and other optimizations
ENV NODE_OPTIONS="--max-old-space-size=512"
ENV PORT=5000

EXPOSE 5000

# Use the built files instead of ts-node
CMD ["node", "dist/server.js"]
