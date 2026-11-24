FROM node:20-alpine

WORKDIR /app

# Install system dependencies
RUN apk add --no-cache python3 make g++ bash

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy application code
COPY . .

# Build TypeScript
RUN npm run build

# Expose backend port (adjust if your backend uses a different port)
EXPOSE 3000

# Start the backend server
CMD ["npm", "start"]
