var Web3 = require('web3');
require('colors');


var callSolidityFunction = require( __dirname + '/util/raw_transaction.js');
var compile = require(__dirname + '/compile');


function deploy(params, cb) {

    if(!params) params = {};

    var {file, contract, net, keys, config} = params;

    var env = process.env.ENVIRONMENT || ''; if(env) env += "/";
    config = config || require(`./config/${env}config.js`);
    keys = keys || require(`./config/${env}keys.js`);

    var web3 = new Web3(new Web3.providers.HttpProvider(config.web3.sidechain.rpc_url));
    web3.chainId = config.web3.sidechain.chain_id;

    function contractTx(contract, data, cb){
        callSolidityFunction(
            contract._web3,
            contract.address,
            data,
            keys.public,
            keys.private,
            cb
        );
    }


    if(net) web3 = net;

    var file = file || process.argv[2];

    console.log("FILE", file)

    var built = compile(file, true);
    built = JSON.parse(built)

    //console.log("BUILT", typeof built, JSON.stringify(built, null, 2) )



    var target = contract || process.argv[3];

    console.log("deploy target".blue, target);


    var compiled = built.contracts[file][target];



    //console.log("BUILT", Object.keys(built).includes('errors'), built)

    if(built.errors){
        console.log("COMPILE ERRORS:".red)
        for(var e in built.errors){
            console.log(built.errors[e]);
        }
        return;
    }

    console.log("#".repeat(80))
    console.log("file", file, "contract", target)
    /*web3.eth.defaultAccount = web3.eth.accounts[0];
    console.log("ACCOUNT", web3.eth.defaultAccount)
    var balance =  web3.eth.getBalance(web3.eth.defaultAccount);;
    console.log("BALANCE", balance.toFixed())*/


    //web3.setProvider(new Web3.providers.HttpProvider("http://localhost:8502"))


    var web3Contract = web3.eth.contract(compiled.abi);

    web3Contract._web3 = web3;

    //console.log("WEB3 ADDR", web3.eth.accounts[0])

    console.log("COMPILED", compiled)

    var bytecode = compiled.evm.bytecode.object;

    console.log("BYTECODE", bytecode)

    var callData = web3Contract.new.getData({
        from: web3.eth.accounts[0],
        data: '0x' + bytecode,
        gas: '4700000'
    });

    console.log("CONTRACT CALLDATA", callData);


    contractTx(web3Contract, callData, function (err, hash) {
        console.log("deployed?", err || hash)

        /*setTimeout(function () {
            console.log('getting receipt for', hash)
            web3.eth.getTransactionReceipt(hash, function (err, res) {
                console.log("receipt", res)

                if(cb) cb(err, res);
            })
        }, 10000);*/
        if(cb) cb(err, hash);
    })
}

if(require.main === module) deploy();

module.exports = deploy;

/*
var contract = web3Contract.new(
    {
        from: web3.eth.accounts[0],
        data: '0x' + compiled.bytecode,
        gas: '4700000'
    }, function (e, contract){
        if(e){
            console.log(e, contract);
            return;
        }

        if (contract && typeof contract.address !== 'undefined') {
             console.log('Contract mined!\naddress: ' + contract.address + '\ntransactionHash: ' + contract.transactionHash);
        }
    }
)*/
