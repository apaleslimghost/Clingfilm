TODO: fully document, fully test (including integration tests)

shrinkwrap without shrinkwrap, most of the time

installation
------------

not on npm yet, `npm install -g quarterto/clingfilm` for now

usage
------

delete your `npm-shrinkwrap.json` and `node_modules`. run `clingfilm wrap`. after a few minutes, `clingfilm.json` will be created.

run `clingfilm install` to install modules from `clingfilm.json`.

to update a package, run `clingfilm update package@version`, then `clingfilm install` again. this doesn't (yet) update package.json

how it works
----------------

`clingfilm.json` is an alternative representation of `npm-shrinkwrap.json`. package metadata is hashed and stored in `refs`, and the dependency tree is stored as graph edges (i.e. pairs of hashes) in `edges`. when you run `clingfilm install`, the graph is expanded to a `shrinkwrap`-compatible tree and written to `npm-shrinkwrap.json`, then a regular `npm install` is run.

the graph structure is nicer to diff and update (***probably***)
