dev:
	docker compose -f compose.dev.yaml up --build -d

prod:
	docker compose -f compose.prod.yaml up --build -d

dev-down:
	docker compose -f compose.dev.yaml down

prod-down:
	docker compose -f compose.prod.yaml down

dev-logs:
	docker compose -f compose.dev.yaml logs --follow

prod-logs:
	docker compose -f compose.prod.yaml logs --follow

git-backup:
	git bundle create uxsleuth_app.bundle master

db:
	psql 'postgres://postgres:password@localhost:5432/uxsleuth'

clean:
	rm -rf client/node_modules
	rm -rf server/node_modules
	rm -rf job-processor/node_modules
