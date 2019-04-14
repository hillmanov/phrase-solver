FROM python:3.6-alpine

RUN apk update && \
    apk add postgresql-dev gcc python3-dev musl-dev && \
    pip install -U nltk

RUN pip install psycopg2

