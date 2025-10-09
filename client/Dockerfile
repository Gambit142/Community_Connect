# Development stage
FROM node:20-alpine AS development
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including devDependencies for development)
RUN npm install

# Copy source code
COPY . .

# Expose port (Vite default)
EXPOSE 5173

# Start development server with hot reload
CMD ["npm", "run", "dev", "--", "--host"]

# Build stage
FROM node:20-alpine AS build
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (needs devDependencies for build)
RUN npm install

# Copy source code
COPY . .

# Build the app
RUN npm run build

# Production stage - serve with nginx
FROM nginx:alpine AS production

# Copy custom nginx config if you have one
# COPY nginx.conf /etc/nginx/nginx.conf

# Copy built app from build stage
COPY nginx.conf /etc/nginx/nginx.conf
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]