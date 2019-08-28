var Web3 = require('web3')

if (typeof web3 !== 'undefined') {
    console.log("USING INJECTED WEB3");
    web3 = new Web3(web3.currentProvider);
} else {
    // set the provider you want from Web3.providers
    console.log("USING LOCAL WEB3");
    web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
}
