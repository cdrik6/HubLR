FROM nginx

WORKDIR /app/

RUN mkdir -p /etc/nginx/ssl/ \
		&& openssl req -x509 -newkey rsa:4096 -sha256 \
			-keyout /etc/nginx/ssl/key.pem -out /etc/nginx/ssl/cert.pem \
			-nodes -batch

RUN apt update \ 
		&& apt upgrade -y \
		&& apt install -y nodejs npm
RUN npm install typescript tailwindcss

COPY frontend .


COPY gateway/config/site.conf /etc/nginx/conf.d/

RUN npm run build

CMD ["nginx", "-g", "daemon off;"]