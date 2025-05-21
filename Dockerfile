FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY api/package*.json ./
RUN npm install --omit=dev

# Copy source files
COPY api/ .

# Install dev dependencies including all type definitions
RUN npm install --save-dev \
    typescript \
    ts-node \
    @types/node \
    @types/cookie-parser \
    @types/cors \
    @types/morgan \
    @types/express-session \
    @types/swagger-ui-express \
    @types/express \
    @types/passport \
    @types/passport-local

# Build TypeScript
RUN npm run build

# Remove dev dependencies to save space
RUN npm prune --omit=dev

# Set memory limit and other optimizations
ENV NODE_OPTIONS="--max-old-space-size=512"
ENV PORT=5000

EXPOSE 5000

# Use the built files instead of ts-node
CMD ["node", "dist/server.js"]
