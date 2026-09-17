# Dev only. Production is built by Vercel's Astro preset, not this image.
FROM node:24.21.0-alpine

RUN corepack enable

# Pin the pnpm store to a fixed path backed by its own volume. Without this
# pnpm picks a different store at image-build time than inside `compose run`
# (node_modules is a volume, /root is not) and refuses to install.
ENV npm_config_store_dir=/pnpm-store

WORKDIR /app

COPY package.json pnpm-lock.yaml .npmrc ./
RUN pnpm install --frozen-lockfile

COPY . .

EXPOSE 4321

CMD ["pnpm", "dev", "--host", "0.0.0.0"]
