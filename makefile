SRC_FILES  = $(wildcard src/*.js)
LIB_FILES  = $(patsubst src/%.js, lib/%.js, $(SRC_FILES))
BABEL      = node_modules/.bin/babel
BABEL_OPTS = --presets es2015

all: $(LIB_FILES)

lib/%.js: src/%.js
	@mkdir -p $(@D)
	$(BABEL) $(BABEL_OPTS) $< -o $@

