FROM node:18-alpine

WORKDIR /app

COPY api/package*.json ./

RUN npm install --legacy-peer-deps && \
    npm install --save-dev @types/swagger-ui-express @types/swagger-jsdoc @types/express @types/node @types/cors @types/morgan @types/cookie-parser @types/express-session @types/passport @types/passport-local @types/connect-redis --legacy-peer-deps

COPY api/ .

# Build TypeScript to JavaScript
RUN npm run build

ENV NODE_OPTIONS="--max-old-space-size=4096"
ENV PORT=5000

EXPOSE 5000

# Run the compiled JavaScript instead of ts-node
CMD ["node", "dist/server.js"]
