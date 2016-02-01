const {loadConfig, install, recalculateMetadata, lsFromTree} = require('./npm');
const hash = require('object-hash');
const pick = require('lodash.pick');
const filter = require('lodash.filter');
const transform = require('lodash.transform');
const renameKeys = require('@quarterto/rename-keys');
const transitiveDeps = require('@quarterto/transitive-dependencies');
const npmlog = require('npmlog');

export const getIdealTree = (where = null, packages = []) => loadConfig({
	'dry-run': true,
	'optional': false,
	'progress': false,
	'no-shrinkwrap': true,
})
	.then(() => install(where, packages))
	.then(tree => lsFromTree('', tree, [], true)); // args, in order: package root (not important), tree, deps to list (empty array means all), silent mode (i.e. just return the tree obj)

export function sanitiseDep(dependency) {
	return renameKeys(pick(dependency, ['_from', '_id', '_resolved', 'name', 'version', 'from', 'id', 'resolved']), {
		'_from': 'from',
		'_id': 'id',
		'_resolved': 'resolved'
	});
}

export function depTreeToGraph(deps, from = 'root', edges = [], refs = {}) {
	var rootDeps = {};
	for(let k in deps) {
		var sanitised = sanitiseDep(deps[k]);
		var hashed = hash(sanitised);
		edges.push([from, hashed]);
		refs[hashed] = sanitised;
		rootDeps[sanitised.name] = hashed;
		depTreeToGraph(deps[k].dependencies, hashed, edges, refs);
	}
	return {edges, refs, rootDeps};
}

export const depGraphToTree = ({edges, refs}, node = 'root') => transform(edges.filter(edge => edge[0] === node), (tree, edge) => {
	var dep = refs[edge[1]];
	dep.dependencies = depGraphToTree({edges, refs}, edge[1]);
	tree[dep.name] = dep;
}, {});

export function graftTree(root, {edges: oldEdges, refs: oldRefs, rootDeps: oldRootDeps}, {edges: newEdges, refs: newRefs, rootDeps: newRootDeps}) {
	var rootHash = oldRootDeps[root];
	var deps = [rootHash, ...transitiveDeps(oldEdges, rootHash)];

	return {
		edges: oldEdges.filter(edge => !deps.some(dep => edge[0] === dep || edge[1] === dep)).concat(newEdges),
		refs: Object.assign(pick(oldRefs, (pkg, phash) => !~deps.indexOf(phash)), newRefs),
		rootDeps: Object.assign(oldRootDeps, newRootDeps)
	};
}
