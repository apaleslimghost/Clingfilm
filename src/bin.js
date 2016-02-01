#!/usr/bin/env node

const program = require('commander');
const promisify = require('@quarterto/promisify');
const writeFileAtomic = promisify(require('write-file-atomic'));
const path = require('path');
const {loadConfig, install} = require('./npm');
const unlink = promisify(require('fs').unlink);
const npmPackageArg = require('npm-package-arg');

const cling = require('./');

program.version(require('../package.json').version);

const die = e => {
	console.error(e.stack);
	process.exit(1);
};

function writeClingfilm(graph) {
	return writeFileAtomic(path.resolve('clingfilm.json'), JSON.stringify(graph, null, 2));
}

program
	.command('wrap')
	.action(options => {
		cling.getIdealTree()
			.then(tree => cling.depTreeToGraph(tree.dependencies))
			.then(writeClingfilm)
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

program
	.command('update <packages...>')
	.action(packages => {
		var graph = require(path.resolve('clingfilm.json'));
		var packageNames = packages.map(pkg => npmPackageArg(pkg).name);
		var notRoot = packageNames.filter(name => !graph.rootDeps[name]);
		if(notRoot.length) throw new Error(`Packages ${notRoot.join()} are not dependencies of ${require(path.resolve('package.json')).name}`);

		cling.getIdealTree(packages)
			.then(tree => cling.depTreeToGraph(tree.dependencies))
			.then(newGraph => cling.graftTree(packageNames, graph, newGraph))
			.then(writeClingfilm)
			.catch(die);
	});

program.parse(process.argv);
