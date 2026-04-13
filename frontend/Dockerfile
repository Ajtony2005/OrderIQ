FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json yarn.lock ./
COPY backend/package.json ./backend/package.json
COPY frontend/package.json ./frontend/package.json
COPY types/package.json ./types/package.json

RUN corepack enable && yarn install --frozen-lockfile

COPY tsconfig.base.json ./tsconfig.base.json
COPY frontend ./frontend

ARG VITE_API_BASE_URL=/api/v1
ARG VITE_GOOGLE_CLIENT_ID=
ARG VITE_ADMIN_EMAIL=

ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
ENV VITE_GOOGLE_CLIENT_ID=${VITE_GOOGLE_CLIENT_ID}
ENV VITE_ADMIN_EMAIL=${VITE_ADMIN_EMAIL}

WORKDIR /app/frontend

RUN yarn build

FROM nginx:1.27-alpine

COPY --from=builder /app/frontend/dist /usr/share/nginx/html
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
