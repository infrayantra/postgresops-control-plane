.PHONY: dev-up dev-down dev-deps dev-integrated rebuild hub-up hub-down migrate api-install frontend-install test lint docker-build docker-push

COMPOSE ?= docker compose -f docker/docker-compose.yml
COMPOSE_HUB ?= docker compose -f docker/docker-compose.hub.yml --env-file docker/.env.hub

DOCKERHUB_NS ?= infrayantra
IMAGE_NAME ?= postgresops-control-plane
VERSION ?= 0.1.0

# Full rebuild (no cache) + recreate containers — launches UI at http://localhost:8080
rebuild:
	$(COMPOSE) build --no-cache
	$(COMPOSE) up -d --force-recreate
	@echo PostgresOps Control Plane (UI + API + docs): http://localhost:8080
	@echo Swagger: http://localhost:8080/docs

dev-up:
	$(COMPOSE) up -d --build
	@echo PostgresOps Control Plane: http://localhost:8080
	@echo Swagger: http://localhost:8080/docs

dev-down:
	$(COMPOSE) down -v

# Catalog DB + Redis only (for local API + Vite — see README “Integrated local dev”).
dev-deps:
	$(COMPOSE) up -d control-db redis

# After: npm install (repo root), pip install -e ".[dev]" in backend, .env with POSTGRESOPS_* — run: npm run dev
dev-integrated:
	$(COMPOSE) up -d control-db redis
	@echo Postgres + Redis ready. Then from postgresops-enterprise/: npm install && npm run dev
	@echo UI: http://localhost:5173  API: http://127.0.0.1:8000  (Vite proxies /api, /docs, /metrics to API)

hub-up:
	$(COMPOSE_HUB) up -d --pull always
	@echo PostgresOps Control Plane (Hub image): http://localhost:8080
	@echo Tip: copy docker/env.hub.example to docker/.env.hub and set DOCKERHUB_IMAGE first

hub-down:
	$(COMPOSE_HUB) down -v

migrate:
	cd backend && alembic upgrade head

api-install:
	cd backend && pip install -e ".[dev]"

frontend-install:
	cd frontend && npm ci

# Local dev: use `npm run dev` from repo root (API+Vite). UI-only: cd frontend && npm run dev
frontend-dev:
	cd frontend && npm install && npm run dev

test:
	cd backend && pytest -q

lint:
	cd backend && ruff check src && ruff format --check src

docker-build:
	docker build -f docker/Dockerfile.unified \
	  --build-arg APP_VERSION=$(VERSION) \
	  --build-arg APP_REVISION=local \
	  --build-arg SOURCE_URL=local \
	  -t $(DOCKERHUB_NS)/$(IMAGE_NAME):$(VERSION) \
	  -t $(DOCKERHUB_NS)/$(IMAGE_NAME):latest \
	  .

docker-push:
	docker push $(DOCKERHUB_NS)/$(IMAGE_NAME):$(VERSION)
	docker push $(DOCKERHUB_NS)/$(IMAGE_NAME):latest
