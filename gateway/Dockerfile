FROM nginx

RUN mkdir -p /etc/nginx/ssl/ \
	&& openssl req -x509 -nodes -batch -newkey rsa:4096 -sha256 \
		-keyout /etc/nginx/ssl/server.key \
		-out /etc/nginx/ssl/server.crt

COPY frontend/dist /app/dist

COPY gateway/config/site.conf /etc/nginx/conf.d/

EXPOSE 443

CMD ["nginx", "-g", "daemon off;"]