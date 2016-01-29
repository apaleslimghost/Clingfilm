#!/usr/bin/env node

const program = require('commander');
const promisify = require('@quarterto/promisify');
const writeFileAtomic = promisify(require('write-file-atomic'));
const path = require('path');

const cling = require('./');

program.version(require('../package.json').version);

program
	.command('write')
	.action(options => {
		cling.getIdealTree()
			.then(tree => cling.depTreeToGraph(tree.dependencies))
			.then(d => JSON.stringify(d, null, 2))
			.then(json => writeFileAtomic(path.resolve('clingfilm.json'), json))
			.catch(e => {
				console.error(e.stack);
				process.exit(1);
			});
	});

program.parse(process.argv);
