SHELL := /bin/bash

DOCKER_COMPOSE_LOCAL = docker compose -p local-phrase-solver -f compose.local.yaml

build:
	@$(DOCKER_COMPOSE_LOCAL) build
	@cd client && bun run build

db:
	@$(DOCKER_COMPOSE_LOCAL) up -d db

run:
	./.start-dev.sh

stop:
	$(DOCKER_COMPOSE_LOCAL) stop

# Rebuild the corpus DB (drops and repopulates unigram/bigram/trigram).
# Uses the shared db from compose.local.yaml (host port 5433).
regenerate-db: db
	@cd dbGenerator && docker compose build python && docker compose run --rm python
