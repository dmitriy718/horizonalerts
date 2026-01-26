FROM node:20-alpine AS base
WORKDIR /app
COPY apps/web/package.json ./
RUN npm install
COPY apps/web/tsconfig.json ./tsconfig.json
COPY apps/web/next-env.d.ts ./next-env.d.ts
COPY apps/web/next.config.mjs ./next.config.mjs
COPY apps/web/postcss.config.js ./postcss.config.js
COPY apps/web/tailwind.config.ts ./tailwind.config.ts
COPY apps/web/app ./app

FROM base AS dev
EXPOSE 3000
CMD ["npm", "run", "dev"]

FROM base AS build
RUN npm run build

FROM node:20-alpine AS prod
WORKDIR /app
COPY apps/web/package.json ./
RUN npm install --omit=dev
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY apps/web/next.config.mjs ./next.config.mjs
EXPOSE 3000
CMD ["npm", "run", "start"]
