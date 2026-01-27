FROM node:20-alpine AS base
WORKDIR /app
COPY services/signal-engine/package.json ./
RUN npm install
COPY services/signal-engine/tsconfig.json ./tsconfig.json
COPY services/signal-engine/src ./src

FROM base AS dev
CMD ["npm", "run", "dev"]

FROM base AS build
RUN npm run build

FROM node:20-alpine AS prod
WORKDIR /app
COPY services/signal-engine/package.json ./
RUN npm install --omit=dev
COPY --from=build /app/dist ./dist
CMD ["node", "dist/index.js"]
