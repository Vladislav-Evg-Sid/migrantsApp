FROM node:22-alpine AS build

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

FROM node:22-alpine AS runtime

ENV NODE_ENV=production
ENV REPORT_PYTHON=/opt/reports/bin/python
WORKDIR /app
RUN apk add --no-cache python3 py3-pip py3-lxml
COPY reports/requirements.txt ./reports/requirements.txt
RUN python3 -m venv --system-site-packages /opt/reports \
    && /opt/reports/bin/pip install --no-cache-dir -r reports/requirements.txt
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY --from=build /app/dist ./dist
COPY reports ./reports

USER node
EXPOSE 3000
CMD ["npm", "start"]
