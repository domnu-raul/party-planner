FROM python:3.11-slim

RUN pip install poetry

ENV APP_HOME /app
WORKDIR $APP_HOME

COPY pyproject.toml poetry.lock ./
RUN poetry config virtualenvs.create false && poetry install --no-root --no-dev

COPY ./src ./src

EXPOSE 8000
