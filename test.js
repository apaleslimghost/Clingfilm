import expect from '@quarterto/chai';
import hash from 'object-hash';
import {depTreeToGraph, depGraphToTree, graftTree} from './';

const fakePackage = (name, version) => ({name, version, id: `${name}@${version}`, from: `${name}@${version}`, resolved: `https://registry.npmjs.org/${name}/-/${name}-${version}.tgz`});

module.exports = {
	depTreeToGraph: {
		'basic tree': {
			'should have an edge from root to package'() {
				let foo = fakePackage('foo', '1.0.0');
				let hashed = hash(foo);
				expect(depTreeToGraph({foo}).edges).to.deep.equal([['root', hashed]]);
			}
		}
	}
};
