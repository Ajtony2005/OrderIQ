FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN corepack enable && yarn install

COPY . .

EXPOSE 5173

CMD ["yarn", "dev", "--host", "0.0.0.0"]