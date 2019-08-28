var compile = require(__dirname + '/compile.js')


var file = process.argv[2];

console.log("building", file)


compile(file);
