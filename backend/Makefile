lint:
	ruff check .

format:
	black .
	ruff check . --fix

check:
	mypy .

lint-ci:
	ruff check .

format-ci:
	black --check .
	ruff check .

check-ci:
	mypy .

test:
	pytest

install:
	pip install -r requirements.txt
	pip install -r requirements-dev.txt

run:
	python -m app.main
