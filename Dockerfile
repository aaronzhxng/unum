FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache python3 make g++ bash curl

COPY package*.json ./
COPY app ./app
COPY components ./components
COPY constants ./constants
COPY scripts ./scripts
COPY assets ./assets
COPY tsconfig.json expo-env.d.ts app.json eas.json .eslintrc.js ./

EXPOSE 8081 19000 19001

<<<<<<< HEAD
CMD ["sh", "-c", "npm ci --legacy-peer-deps 2>/dev/null || true && npm start"]
=======
# Default command starts Expo dev server
CMD ["npx", "expo", "npm", "start"]
>>>>>>> 1829adbde856f4240b1d808235fed6a82b894a56
