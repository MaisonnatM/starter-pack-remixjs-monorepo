# This file is moved to the root directory before building the image

# pruner 
FROM node:18-bookworm-slim as pruner

# Install openssl for Prisma
RUN apt-get update && apt-get install -y fuse3 openssl ca-certificates
RUN corepack enable
WORKDIR /app
RUN yarn global add turbo
COPY . .
RUN turbo prune --scope=@epic-stack-monorepo/main --docker
RUN find . -name "node_modules" -type d -prune -exec rm -rf '{}' +

# base node image
FROM node:18-bookworm-slim as base
RUN apt-get update && apt-get install -y fuse3 openssl ca-certificates
RUN corepack enable
WORKDIR /app
COPY .gitignore .gitignore
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=pruner /app/out/pnpm-workspace.yaml ./pnpm-workspace.yaml


FROM base AS dev-deps
WORKDIR /app
RUN pnpm install --ignore-scripts --no-frozen-lockfile

FROM base AS production-deps
WORKDIR /app
ENV NODE_ENV production
RUN pnpm install --prod --no-frozen-lockfile
COPY --from=pruner /app/out/full/apps/main/prisma/schema.prisma /app/apps/main/prisma/schema.prisma
RUN pnpm dlx prisma generate --schema /app/apps/main/prisma/schema.prisma

FROM base AS builder
WORKDIR /app
RUN corepack enable
# ENV NODE_ENV production
COPY --from=pruner /app/out/full/ .
COPY --from=dev-deps /app/ .
COPY turbo.json turbo.json
RUN pnpm run generate
RUN pnpm run build --filter=@epic-stack-monorepo/main...


# Finally, build the production image with minimal footprint
FROM base AS runner

ENV FLY="true"
ENV INTERNAL_PORT="8080"
ENV PORT="8081"
ENV NODE_ENV="production"

WORKDIR /app

COPY --from=pruner /app/out/full/ .
COPY --from=production-deps /app .
COPY --from=builder /app/apps/main/index.js ./apps/main/index.js
COPY --from=builder /app/apps/main/build ./apps/main/build
COPY --from=builder /app/apps/main/public ./apps/main/public
COPY --from=builder /app/apps/main/server-build ./apps/main/server-build
# COPY --from=builder /app/apps/main/app/components/ui/icons ./apps/main/app/components/ui/icons

ADD . .

CMD ["pnpm", "start"]
