FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN corepack enable && yarn install

COPY . .

ARG VITE_API_BASE_URL=/api
ARG VITE_GOOGLE_CLIENT_ID=
ARG VITE_ADMIN_EMAIL=

ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
ENV VITE_GOOGLE_CLIENT_ID=${VITE_GOOGLE_CLIENT_ID}
ENV VITE_ADMIN_EMAIL=${VITE_ADMIN_EMAIL}

RUN yarn build

FROM nginx:1.27-alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]