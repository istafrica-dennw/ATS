# Build stage
FROM node:18-alpine as build
WORKDIR /app

# Accept build arguments for React environment variables
ARG REACT_APP_API_URL
ARG REACT_APP_SOCKET_URL

# Set environment variables for the build
ENV REACT_APP_API_URL=$REACT_APP_API_URL
ENV REACT_APP_SOCKET_URL=$REACT_APP_SOCKET_URL

COPY package*.json ./
# Increase memory limit and install dependencies
ENV NODE_OPTIONS="--max-old-space-size=4096"
RUN npm install --legacy-peer-deps
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 3001
CMD ["nginx", "-g", "daemon off;"] 