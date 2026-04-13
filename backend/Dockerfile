FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json yarn.lock ./
COPY backend/package.json ./backend/package.json
COPY frontend/package.json ./frontend/package.json
COPY types/package.json ./types/package.json

RUN corepack enable && yarn install --frozen-lockfile

COPY . .

RUN yarn workspace @orderiq/types build
RUN yarn workspace @orderiq/backend build

FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/backend/package.json ./backend/package.json
COPY --from=builder /app/backend/prisma ./backend/prisma
COPY --from=builder /app/backend/dist ./backend/dist

WORKDIR /app/backend

EXPOSE 3000

CMD ["node", "dist/main.js"]