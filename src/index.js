import npm from 'npm';
import hash from 'object-hash';
import pick from 'lodash.pick';
import promisify from '@quarterto/promisify';

const loadConfig = promisify(npm.load);
const install    = promisify(npm.commands.install);

function packageHash(pkg) {
	return hash(pick(pkg, ['name', 'version', 'from', 'resolved']));
}

export function getIdealTree() {
	return loadConfig({
		'dry-run': true,
		'json': true
	}).then(() => install());
}
