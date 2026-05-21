FROM node:20-alpine

WORKDIR /app

# Install system dependencies needed for native modules
RUN apk add --no-cache python3 make g++ bash curl

# Copy package files
COPY package*.json ./

# Copy application code (without node_modules)
COPY . .

# Expose Expo dev server port
EXPOSE 8081 19000 19001

# Default command starts Expo dev server
CMD ["npm", "start"]
