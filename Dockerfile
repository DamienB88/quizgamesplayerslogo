# Development Dockerfile for Privacy Social App
FROM node:18-alpine

# Install dependencies for Expo
RUN apk add --no-cache \
    git \
    bash \
    curl \
    python3 \
    make \
    g++

# Set working directory
WORKDIR /app

# Install Expo CLI globally
RUN npm install -g expo-cli @expo/ngrok

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy project files
COPY . .

# Expose Expo dev server ports
EXPOSE 19000 19001 19002 8081

# Default command
CMD ["npm", "start"]
