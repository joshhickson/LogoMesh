# Stage 1: Base image with pnpm
FROM node:22-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# Stage 2: Builder image with all dependencies and compiled code
FROM base AS builder
WORKDIR /app
COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm run build

# Stage 3: Production image with only necessary artifacts
FROM base AS production
WORKDIR /app
COPY --from=builder /app/pnpm-lock.yaml ./
COPY --from=builder /app/package.json ./
COPY --from=builder /app/packages ./packages

# The CMD will be specified in the docker-compose.yml to run the specific services
EXPOSE 3001
