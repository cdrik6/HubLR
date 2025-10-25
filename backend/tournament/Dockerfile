FROM node:24-alpine

WORKDIR /app/

RUN npm i fastify

COPY src/ src/

CMD ["node", "src/app.mjs"]