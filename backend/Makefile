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
