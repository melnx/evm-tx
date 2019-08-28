const path = require('path');
const fs = require('fs');
const solc = require('solc');
var crypto = require('crypto');
require('colors')


function compile(contract, debug_compiler){
    var debug = debug_compiler || process.argv.includes('--debug-compiler');

    if(debug) console.log("CONTRACT FILE", contract)

    var source = contract;
    var cache_build = false;

    if(!contract.startsWith('pragma solidity')){
      const cpath = path.resolve(__dirname, 'contracts', contract);
      source = fs.readFileSync(cpath, 'UTF-8');
      cache_build = true;
    }

    if(cache_build){
      var source_hash = crypto.createHash('md5').update(source).digest('hex');

      var name = contract.split('.')[0];

      var base_dir = path.resolve(__dirname, 'contracts', 'compiled');

      if (!fs.existsSync(base_dir)) fs.mkdirSync(base_dir);

      var dir = path.resolve(base_dir, name);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir);

      if(debug) console.log("CONTRACT FILE NAME", name)
      if(debug) console.log("BUILD PATH", dir)

      var build_path = path.resolve(dir, 'compiled.json');


      var hash_path = path.resolve(dir, 'hash.txt');

      var built_hash = fs.existsSync(hash_path) ? fs.readFileSync(hash_path, 'UTF-8') : '';

      fs.writeFileSync(hash_path, source_hash);
    }

    if( !cache_build || built_hash != source_hash ) {

        if(debug) console.log("re-compiling solidity file");

        var parsed = {
        	language: 'Solidity',
        	sources: {
        		[contract]: {
        			content: source
        		}
        	},
        	settings: {
        		outputSelection: {
        			'*': {
        				'*': [ '*' ]
        			}
        		}
        	}
        }

        var compiled = solc.compile(JSON.stringify(parsed));//.contracts[':Ticketing'];

        if(cache_build){
          fs.writeFileSync(build_path, JSON.stringify(compiled, null, 2));
        }

        return compiled;
    }else{
        if(debug) console.log("returning pre-built json");
        var json =fs.readFileSync(build_path, 'UTF-8');
        //console.log("JSON", json);
        return JSON.parse(json);
    }
}

module.exports = compile;
