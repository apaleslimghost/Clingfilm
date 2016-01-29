const {loadConfig, install, recalculateMetadata, lsFromTree} = require('./npm');
const hash = require('object-hash');
const pick = require('lodash.pick');
const transform = require('lodash.transform');
const renameKeys = require('@quarterto/rename-keys');
const npmlog = require('npmlog');

export const getIdealTree = () => loadConfig({
	'dry-run': true,
	'no-optional': true,
	'progress': false,
	'no-shrinkwrap': true
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
		depTreeToGraph(deps[k].dependencies, hashed, edges, refs);
	}
	return {edges, refs};
}

export const depGraphToTree = ({edges, refs}, node = 'root') => transform(edges.filter(edge => edge[0] === node), (tree, edge) => {
	var dep = refs[edge[1]];
	dep.dependencies = depGraphToTree({edges, refs}, edge[1]);
	tree[dep.name] = dep;
}, {});
