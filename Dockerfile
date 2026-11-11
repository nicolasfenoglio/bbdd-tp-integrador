FROM node:22-alpine AS base

WORKDIR /app

RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

FROM base AS development

ENV NODE_ENV=development

RUN pnpm install --frozen-lockfile

COPY . .

EXPOSE 3000

CMD ["pnpm", "dev"]

FROM base AS production

ENV NODE_ENV=production

RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm build

EXPOSE 3000

CMD ["pnpm", "start"]