FROM node:20-alpine AS base
WORKDIR /app
COPY services/api/package.json ./
RUN npm install
COPY services/api/tsconfig.json ./tsconfig.json
COPY services/api/src ./src

FROM base AS dev
EXPOSE 4000
CMD ["npm", "run", "dev"]

FROM base AS build
RUN npm run build

FROM node:20-alpine AS prod
WORKDIR /app
COPY services/api/package.json ./
RUN npm install --omit=dev
COPY --from=build /app/dist ./dist
EXPOSE 4000
CMD ["node", "dist/index.js"]
