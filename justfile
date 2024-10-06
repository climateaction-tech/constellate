# just files are like makefiles but a bit
# more intuitive to use
# https://github.com/casey/just

default:
    just --list

@test *options:
    uv run pytest {{ options }}

@install:
    #!/usr/bin/env sh

    uv sync
    cd theme/static_src/ && npm install && cd ../..
    uv run ./manage.py migrate
    uv run ./manage.py collectstatic --no-input

@ci:
    uv run pytest

@serve *options:
    uv run ./manage.py runserver {{ options }}

@manage *options:
    uv run ./manage.py {{ options }}

@tailwind-dev:
    uv run ./manage.py tailwind start

@tailwind-build:
    uv run ./manage.py tailwind build

@run *options:
    # run gunicorn in production
    uv run gunicorn config.wsgi --bind :8000 --workers 2 {{ options }}
    # pipenv run gunicorn config.wsgi -b :9000 --timeout 300 {{ options }}

@docker-build:
    # create a docker image, tagged as cl8
    docker build . -t cl8

@docker-run:
    # run the current local docker image tagged as cl8, using the env file at .env
    docker run --env-file .env -p 8000:8000 -p 5432:5432 cl8

@caddy:
    # run caddy in the current directory, using the Caddyfile
    caddy run
