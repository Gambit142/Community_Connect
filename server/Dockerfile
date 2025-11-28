# Dockerfile for the server application
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Copy environment variables for Docker
RUN if [ -f .env.docker ]; then cp .env.docker .env; fi

# Expose the application port
EXPOSE 10100

# Start the server
CMD ["npm", "start"]