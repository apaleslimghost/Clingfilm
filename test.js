var getIdealTree = require('./').getIdealTree;

getIdealTree().then(console.log, e => console.error(e.stack));
