import expect from '@quarterto/chai';
import hash from 'object-hash';
import {depTreeToGraph, depGraphToTree, graftTree} from './';

const fakePackage = (name, version) => ({name, version, id: `${name}@${version}`, from: `${name}@${version}`, resolved: `https://registry.npmjs.org/${name}/-/${name}-${version}.tgz`});

module.exports = {
	depTreeToGraph: {
		'basic tree': {
			before() {
				let foo = this.foo = fakePackage('foo', '1.0.0');
				this.hashed = 'foo-' + hash(foo);
				this.graph = depTreeToGraph({foo});
			},
			
			'should have an edge from root to package'() {
				expect(this.graph.edges).to.deep.equal([['root', this.hashed]]);
			},

			'should have a ref to the package'() {
				expect(this.graph.refs).to.deep.equal({[this.hashed]: this.foo});
			},

			'should have the package as a root dep'() {
				expect(this.graph.rootDeps).to.deep.equal({'foo': this.hashed});
			}
		},

		'simple deps': {
			before() {
				let foo = this.foo = fakePackage('foo', '1.0.0');
				let bar = this.foo = fakePackage('bar', '1.0.0');
				this.hashedFoo = 'foo-' + hash(foo);
				this.hashedBar = 'bar-' + hash(bar);
				foo.dependencies = {bar};
				this.graph = depTreeToGraph({foo});
			},
		
			'should have an edge from package to dep'() {
				expect(this.graph.edges).to.include.something.that.deep.equals([this.hashedFoo, this.hashedBar]);
			},

			'should not have the dep as a root dep'() {
				expect(this.graph.rootDeps).not.to.have.property('bar');
			}
		}
	}
};
