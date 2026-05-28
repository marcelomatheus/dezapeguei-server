FROM node:22-alpine AS builder

WORKDIR /usr/src/app

COPY package*.json ./

ARG DATABASE_URL
ENV DATABASE_URL=${DATABASE_URL}
ARG DIRECT_URL
ENV DIRECT_URL=${DIRECT_URL}

RUN npm ci --include=dev

COPY . .

RUN npm run build
RUN npm prune --omit=dev

FROM node:22-alpine

WORKDIR /usr/src/app

ENV NODE_ENV=production

COPY --from=builder /usr/src/app/package*.json ./
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/prisma ./prisma

EXPOSE 8081

CMD ["node", "dist/src/main.js"]
