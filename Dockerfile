# Debian, не alpine: `npm run build` гоняет Playwright/Chromium для
# пререндера (scripts/prerender.mjs), а `playwright install --with-deps`
# не умеет ставить системные зависимости на musl/Alpine.
FROM node:22 AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
RUN npx playwright install --with-deps chromium
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
