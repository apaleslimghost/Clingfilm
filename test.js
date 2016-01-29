var cling = require('./');

cling.getIdealTree()
  .then(tree => cling.depTreeToGraph(tree.dependencies))
  .then(d => JSON.stringify(d, null, 2))
  .then(console.log, e => console.error(e.stack));
