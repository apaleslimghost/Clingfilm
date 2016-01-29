const {load: _loadConfig, config: npmConfig} = require('npm');
npmConfig.get = k => ({
	git: '',
	cache: ''
}[k]); // fake config so we can require npm internals. this gets replaced by loadConfig

const hash = require('object-hash');
const pick = require('lodash.pick');
const transform = require('lodash.transform');
const renameKeys = require('@quarterto/rename-keys');
const promisify = require('@quarterto/promisify');
const _install = require('npm/lib/install');
const {fromTree: _lsFromTree} = require('npm/lib/ls');
const {recalculateMetadata: _recalc} = require('npm/lib/install/deps');
const npmlog = require('npmlog');

const loadConfig = promisify(_loadConfig);
const install = promisify((cb) => _install([], (err, installed, tree) => cb(err, tree)));
const recalculateMetadata = promisify(_recalc);
const lsFromTree = promisify(_lsFromTree);

export const getIdealTree = () => loadConfig({
	'dry-run': true,
	'json': true,
	'progress': false,
	'production': false
})
	.then(() => install())
	.then(tree => recalculateMetadata(tree, npmlog))
	.then(tree => lsFromTree('', tree, [], true));

export function sanitiseDep(dependency) {
	return renameKeys(pick(dependency, ['_from', '_id', 'name', '_resolved', 'version']), {
		'_from': 'from',
		'_id': 'id',
		'_resolved': 'resolved'
	});
}

export function hashDependencies(tree) {
	return transform(tree.dependencies, (newTree, dep) => {
		var sanitised = sanitiseDep(dep);
		sanitised.dependencies = hashDependencies(dep);
		newTree[hash(sanitised)] = sanitised;
	});
}

export function dependencyEdges(tree, edges = []) {
	
}
