# -------------------------------
# Stage 1: Build the Application
# -------------------------------

# Use the official Node.js 20 image as the build environment
FROM node:20 AS builder

# Set the working directory inside the container
# All commands will run inside /app
WORKDIR /app

# Copy package.json and package-lock.json files
# This is done separately to take advantage of Docker layer caching
COPY package*.json ./

# Install all project dependencies
RUN npm install

# Copy the remaining application source code into the container
COPY . .

# Build the Vite application for production
# Output files will be generated inside the /app/dist folder
RUN npm run build


# --------------------------------
# Stage 2: Serve the Application
# --------------------------------

# Use a lightweight Nginx image for production
FROM nginx:alpine

# Copy the built files from the builder stage
# into Nginx's default public folder
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 80 so the container can serve web traffic
EXPOSE 80

# Start the Nginx server in the foreground
# "daemon off;" keeps Nginx running inside the container
CMD ["nginx", "-g", "daemon off;"]







# Feature	                              COPY	         ADD

# Copies local files/folders	            ✅	       ✅
# Auto extracts .tar.gz files	            ❌	       ✅
# Downloads files from URLs	                ❌	       ✅
# Simple & predictable	                    ✅	       ❌
# Recommended for most use cases	        ✅	      ❌