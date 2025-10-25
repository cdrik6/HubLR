FROM node:24-alpine

WORKDIR /app/

RUN npm i fastify sqlite3 @types/node @fastify/multipart @fastify/static

# RUN sed -i "s/{/\\n\"type\": \"module\"/1" package.json

COPY src/ src/

COPY ./images /var/local/images

# COPY package-lock.json .

COPY package.json .

# COPY tsconfig.json .

# RUN npm run build

CMD ["node", "src/app.js"]