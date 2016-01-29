const {load: _loadConfig, config: npmConfig} = require('npm');
npmConfig.get = k => ({
	git: '',
	cache: ''
}[k]); // fake config so we can require npm internals. this gets replaced by loadConfig

const hash = require('object-hash');
const pick = require('lodash.pick');
const promisify = require('@quarterto/promisify');
const _install = require('npm/lib/install');
const {fromTree: _lsFromTree} = require('npm/lib/ls');
const {recalculateMetadata: _recalc} = require('npm/lib/install/deps');

const loadConfig = promisify(_loadConfig);
const install = promisify((cb) => _install([], (err, installed, tree) => cb(err, tree)));
const recalculateMetadata = promisify(_recalc);
const lsFromTree = promisify(_lsFromTree);

function packageHash(pkg) {
	return hash(pick(pkg, ['name', 'version', 'from', 'resolved']));
}

export function getIdealTree() {
	return loadConfig({
		'dry-run': true,
		'json': true,
		'progress': false,
	})
		.then(() => install())
		.then(tree => recalculateMetadata(tree, {}))
		.then(tree => lsFromTree('', tree, [], true));
}
