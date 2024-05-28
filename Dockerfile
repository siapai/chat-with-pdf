
# base node image
FROM node:18-alpine as base

# Install openssl for Prisma
RUN apk add --no-cache g++ make py3-pip libc6-compat openssl

RUN npm install -g pnpm

# Install all node_modules, including dev dependencies
FROM base as deps

RUN mkdir /app
WORKDIR /app

ADD prisma package.json pnpm-lock.yaml ./
RUN pnpm install --production=false --frozen-lockfile
RUN npx prisma generate


# Setup production node_modules
FROM base as production-deps

ENV NODE_ENV production

RUN mkdir /app
WORKDIR /app

COPY --from=deps /app/node_modules /app/node_modules
ADD package.json pnpm-lock.yaml ./

RUN pnpm prune --production

# Build the app
FROM base as build

RUN mkdir /app
WORKDIR /app

COPY --from=deps /app/node_modules /app/node_modules

ADD . .
RUN pnpm run build

# Finally, build the production image with minimal footprint
FROM base

ENV NODE_ENV production

RUN mkdir /app
WORKDIR /app

COPY --from=build /app/.next ./.next
COPY --from=production-deps /app/node_modules /app/node_modules
COPY --from=build /app/public /app/public
ADD . .

EXPOSE 3000

ENV HOSTNAME "0.0.0.0"


CMD ["pnpm", "run", "start"]
