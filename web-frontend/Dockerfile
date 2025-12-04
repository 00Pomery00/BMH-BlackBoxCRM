FROM node:20-alpine as build
WORKDIR /app
COPY web-frontend/package*.json ./
RUN npm ci --no-audit --no-fund
COPY web-frontend /app
RUN npm run build

FROM nginx:stable-alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
