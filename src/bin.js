#!/usr/bin/env node

const program = require('commander');
const promisify = require('@quarterto/promisify');
const writeFileAtomic = promisify(require('write-file-atomic'));
const path = require('path');
const {loadConfig, install} = require('./npm');
const unlink = promisify(require('fs').unlink);

const cling = require('./');

program.version(require('../package.json').version);

const die = e => {
	console.error(e.stack);
	process.exit(1);
};

program
	.command('wrap')
	.action(options => {
		cling.getIdealTree()
			.then(tree => cling.depTreeToGraph(tree.dependencies))
			.then(d => JSON.stringify(d, null, 2))
			.then(json => writeFileAtomic(path.resolve('clingfilm.json'), json))
			.catch(die);
	});

program
	.command('install')
	.action(options => {
		var tree = {
			dependencies: cling.depGraphToTree(require(path.resolve('clingfilm.json')))
		};
		writeFileAtomic(path.resolve('npm-shrinkwrap.json'), JSON.stringify(tree))
			.then(() => loadConfig({}))
			.then(() => install())
			.then(() => unlink(path.resolve('npm-shrinkwrap.json')))
			.catch(die);
	});

program.parse(process.argv);
