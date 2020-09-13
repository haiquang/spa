### STAGE 1: Build ###
FROM node:12-alpine AS build
WORKDIR /usr/src/app
COPY package.json ./
RUN apk update && \
    apk add git
RUN npm install
COPY . .
RUN npm run build

### STAGE 2: Run ###
FROM nginx:alpine
COPY nginx.conf /etc/nginx/nginx.conf
COPY --from=build /usr/src/app/dist/wedding /usr/share/nginx/html