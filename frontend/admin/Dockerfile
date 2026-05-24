# -------------------------------
# Stage 1: Build the Application
# -------------------------------
FROM node:20 AS builder

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

# --------------------------------
# Stage 2: Serve the Application
# --------------------------------
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html

# This line fixes the refresh 404 issue
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]