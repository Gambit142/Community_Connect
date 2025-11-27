# Use official Node.js LTS image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install ALL dependencies (including dev for dev mode)
RUN npm install

# Copy application code
COPY . .

# Expose port
EXPOSE 10100

# Start with npm start
CMD ["npm", "start"]