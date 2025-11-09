# Use the official Node.js 20 image
FROM node:20-slim

# Enable pnpm
RUN corepack enable

# Set the working directory
WORKDIR /app

# Copy ALL files from the monorepo root.
# This is "slow" but it is CORRECT.
COPY . .

# Run pnpm install. It can now see all package.json files
# and will correctly build the workspace.
RUN pnpm install --frozen-lockfile

# Run the build command FOR THE ENTIRE MONOREPO.
# Turborepo will handle caching and dependencies.
RUN pnpm run build
