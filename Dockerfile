FROM node:22-slim

WORKDIR /app

# Install system dependencies for Playwright Chromium
RUN apt-get update && apt-get install -y \
  libnss3 \
  libatk-bridge2.0-0 \
  libxss1 \
  libgtk-3-0 \
  libgbm1 \
  libasound2 \
  fonts-noto-cjk \
  fonts-liberation \
  && rm -rf /var/lib/apt/lists/*

# Install dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Copy source and build
COPY . .
RUN npx prisma generate
RUN npm run build

# Install Playwright Chromium browser
RUN npx playwright install chromium

# Create uploads directory
RUN mkdir -p /app/uploads

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
ENV PLAYWRIGHT_BROWSERS_PATH="0"

EXPOSE 3000

CMD ["node", ".next/standalone/server.js"]
