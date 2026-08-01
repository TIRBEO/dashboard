FROM node:20-slim

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate
RUN pnpm install --frozen-lockfile

COPY apps/api/package.json ./apps/api/package.json
COPY packages/*/package.json packages/
COPY apps/api/prisma ./apps/api/prisma

RUN pnpm --filter @tirbeo/api db:generate

COPY . .

RUN pnpm --filter @tirbeo/api build

RUN useradd --create-home appuser
USER appuser

EXPOSE 3000

ENV NODE_ENV=production
ENV PORT=3000

CMD ["pnpm", "--filter", "@tirbeo/api", "start"]