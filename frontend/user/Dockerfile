# --------------------------------
# Stage 1: Build the Application
# --------------------------------

# Use the official Node.js 20 image
FROM node:20 AS builder

# Set working directory inside the container
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all source code
COPY . .

# Build the Vite application
RUN npm run build


# --------------------------------
# Stage 2: Production Server
# --------------------------------

# Use lightweight Nginx image
FROM nginx:alpine

# Copy built files from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start Nginx server
CMD ["nginx", "-g", "daemon off;"]