const Tx = require('ethereumjs-tx').Transaction;

var prev_nonce = null;

function callSolidityFunction(web3, address, data, public_key, private_key, cb, wait_receipt=true, noop=false){

    function send_tx(err, nonce) {
        prev_nonce = nonce;

        console.log("TX COUNT", nonce);
        console.log("CHAIN ID", web3.chainId)

        if(noop){
            console.log("NOOP")
            prev_nonce = nonce-1;
            cb(nonce);
            return;
        }

        var account = public_key;
        var key = new Buffer(private_key, 'hex')

        const gasPrice = web3.eth.gasPrice;

        //console.log("gas price", gasPrice)

        console.log("using gas price", web3._gasPrice)

        const gasPriceHex = web3.toHex(web3._gasPrice || 0); //gasPrice.mul(20);
        const gasLimitHex = web3.toHex(500000);

        var tra = {
            gasPrice: gasPriceHex,
            gasLimit: gasLimitHex,
            data: data,
            from: account,
            to: address,
            nonce: nonce,
            chainId: web3.chainId, //ropsten = 3, mainnet = 1
        };

        //if(typeof data == "")
        console.log("TYPEOF DATA:", typeof data)
        console.log("DATA", data)
        if(typeof data == "object"){
            tra.data = data.data ? data.data : null;
            tra.value = data.value;
            console.log("SENDING", data.value)
        }

        var tx = new Tx(tra);
        tx.sign(key);

        var stx = tx.serialize();
        web3.eth.sendRawTransaction('0x' + stx.toString('hex'), function (err, hash) {
            if (err) {
                if(cb) cb(err);
                console.log(err);
                return;
            }
            console.log('tx: ' + hash);

            if(cb) {
                if(!wait_receipt) {
                    cb(null, hash);
                } else {
                    console.log("waiting for receipt " + hash)
                    function waitForReceipt(){
                        web3.eth.getTransactionReceipt(hash, function (err, res) {
                            console.log(hash + " receipt", res)
                            if(res) {
                                if (cb) cb(err, res);
                            }else{
                                setTimeout(waitForReceipt, 1000);
                            }
                        })
                    }

                    waitForReceipt();
                }
            }
        });
    }

    if(prev_nonce === null) {
        console.log("getting nonce")
        web3.eth.getTransactionCount(public_key, send_tx);
    }else{
        console.log("known nonce", prev_nonce)
        send_tx(null, prev_nonce+1)
    }
}

module.exports = callSolidityFunction;
