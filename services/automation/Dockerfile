FROM node:20-alpine
WORKDIR /app
COPY services/automation/package.json ./
RUN npm install
COPY services/automation/src ./src
COPY services/automation/tsconfig.json ./tsconfig.json
RUN npm install -g tsx
CMD ["npx", "tsx", "src/index.ts"]
