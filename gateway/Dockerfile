FROM nginx

# WORKDIR /app/

RUN mkdir -p /etc/nginx/ssl/ \
	&& openssl req -x509 -nodes -batch -newkey rsa:4096 -sha256 \
		-keyout /etc/nginx/ssl/server.key \
		-out /etc/nginx/ssl/server.crt
		

RUN apt-get update \ 
	&& apt-get upgrade -y \
	&& apt-get install nodejs npm -y

# RUN npm install typescript

COPY frontend /app/.

COPY gateway/config/site.conf /etc/nginx/conf.d/

# RUN npm run build

CMD ["nginx", "-g", "daemon off;"]