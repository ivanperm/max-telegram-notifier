FROM mcr.microsoft.com/playwright:v1.61.0-noble

WORKDIR /app

ENV NODE_ENV=production
ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

RUN mkdir -p /data/playwright-profile

CMD ["npm", "start"]
