lint:
	ruff check .
	mypy .

format:
	black .
	ruff check . --fix

lint-ci:
	ruff check .

format-ci:
	black --check .
	ruff check .

check-ci:
	mypy .

test:
	pytest
