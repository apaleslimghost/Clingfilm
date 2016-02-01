SRC_FILES  = $(wildcard src/*.js)
LIB_FILES  = $(patsubst src/%.js, lib/%.js, $(SRC_FILES))
BABEL      = node_modules/.bin/babel

all: $(LIB_FILES)

lib/%.js: src/%.js
	@mkdir -p $(@D)
	$(BABEL) $< -o $@

test: all test.js
	mocha --compilers js:babel-register -u exports test.js

.PHONY: test

