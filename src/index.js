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
	'progress': false,
})
	.then(() => install())
	.then(tree => recalculateMetadata(tree, npmlog))
	.then(tree => lsFromTree('', tree, [], true)); // args, in order: package root (not important), tree, deps to list (empty array means all), silent mode (i.e. just return the tree obj)

export function sanitiseDep(dependency) {
	return renameKeys(pick(dependency, ['_from', '_id', '_resolved', 'name', 'version', 'from', 'id', 'resolved']), {
		'_from': 'from',
		'_id': 'id',
		'_resolved': 'resolved'
	});
}

export function depTreeToGraph(deps, from = 'root', edges = [], refs = {}) {
	for(let k in deps) {
		var sanitised = sanitiseDep(deps[k]);
		var hashed = hash(sanitised);
		edges.push([from, hashed]);
		refs[hashed] = sanitised;
		refs[sanitised.id] = hashed;
		depTreeToGraph(deps[k].dependencies, hashed, edges, refs);
	}
	return {edges, refs};
}

export const depGraphToTree = ({edges, refs}, node = 'root') => transform(edges.filter(edge => edge[0] === node), (tree, edge) => {
	var dep = refs[edge[1]];
	dep.dependencies = depGraphToTree({edges, refs}, edge[1]);
	tree[dep.name] = dep;
}, {});
