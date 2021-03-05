install:
	npm ci
	sudo npm link

test:
	npm test

test-coverage:
	npm test -- --coverage --coverageProvider=v8

lint:
	npx eslint .

develop:
	rm -rf dist
	NODE_ENV=development npx webpack

publish:
	npm publish --dry-run

.PHONY: test