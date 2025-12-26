FROM node:22-alpine

WORKDIR /usr/src/app

COPY package*.json ./

ENV NODE_ENV=production
ARG DATABASE_URL
ENV DATABASE_URL=${DATABASE_URL}
ARG DIRECT_URL
ENV DIRECT_URL=${DIRECT_URL}

RUN npm ci

COPY . .

RUN npm run build

EXPOSE 8080:8080

CMD ["node", "dist/src/main.js"]