up:
	docker compose up -d -t0

stop:
	docker compose stop -t0

start:
	docker compose start

down:
	docker compose down -t0 --rmi all

fclean:
	docker compose down -t0 --rmi all -v

re:
	${MAKE} down
	${MAKE}

