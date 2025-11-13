# Use a compatible Node.js 16 image
FROM node:16-bullseye

# Install build essentials for native addons like isolated-vm
RUN apt-get update && apt-get install -y python3 make g++ --no-install-recommends && rm -rf /var/lib/apt/lists/*

# Enable pnpm
RUN corepack enable

# Set the working directory
WORKDIR /app

# Copy ALL files (respecting .dockerignore)
COPY . .

# Run pnpm install. This will correctly link the workspace.
RUN pnpm install --frozen-lockfile

# Run the build command for the entire monorepo.
RUN pnpm run build

# This is a generic CMD. You will need to override this in the
# docker-compose.yml for each specific service.
CMD ["node"]
