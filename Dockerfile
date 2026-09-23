# Dev only. Production is built by Vercel's Astro preset, not this image.
FROM node:24.21.0-alpine

RUN corepack enable

# One store path for build and `compose run`, or pnpm refuses to install.
ENV npm_config_store_dir=/pnpm-store

WORKDIR /app

COPY package.json pnpm-lock.yaml .npmrc ./
RUN pnpm install --frozen-lockfile

COPY . .

EXPOSE 4321

CMD ["pnpm", "dev", "--host", "0.0.0.0"]
