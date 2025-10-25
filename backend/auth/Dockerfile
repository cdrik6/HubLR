FROM node:24-alpine

WORKDIR /app/

RUN npm i fastify @fastify/jwt @fastify/cookie bcrypt @types/node @types/bcrypt node-fetch @fastify/multipart form-data speakeasy qrcode @hapi/iron

COPY src/ src/

# COPY package-lock.json .

COPY package.json .

CMD ["node", "--trace-deprecation","src/app.js"]