FROM node:24-alpine

WORKDIR /app/

RUN npm i fastify @fastify/websocket

COPY src/ src/

CMD ["node", "src/app.mjs"]
