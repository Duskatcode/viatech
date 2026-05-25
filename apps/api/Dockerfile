FROM node:22-alpine AS base

WORKDIR /app

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ENV NODE_ENV=production

RUN corepack enable

FROM base AS deps

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps ./apps

RUN pnpm install --frozen-lockfile

FROM deps AS build

COPY . .

RUN pnpm --filter @biomed/api build

FROM base AS runner

WORKDIR /app

COPY --from=build /app/package.json ./package.json
COPY --from=build /app/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=build /app/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/apps/api ./apps/api

EXPOSE 3000

CMD ["node", "apps/api/dist/src/main.js"]
