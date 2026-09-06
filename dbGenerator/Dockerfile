FROM python:3.12-alpine

RUN apk update && \
    apk add --no-cache postgresql-dev gcc python3-dev musl-dev && \
    pip install --no-cache-dir --break-system-packages nltk psycopg2-binary

WORKDIR /app
