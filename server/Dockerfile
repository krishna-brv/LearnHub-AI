FROM node:20-alpine

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install --production=false

# Copy source code
COPY . .

# Expose HTTP port
EXPOSE 5000

# Start production server
CMD ["node", "server.js"]
