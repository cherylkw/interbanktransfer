const HDWalletProvider = require('truffle-hdwallet-provider');
const infuraURL = 'https://rinkeby.infura.io/v3/19de2d94f6334a3291448a17ad8a36a3'
const infuraKey = "19de2d94f6334a3291448a17ad8a36a3";

const fs = require('fs');
//const mnemonic = fs.readFileSync(".secret").toString().trim();
const mnemonic = "leisure spin oil citizen olympic pond dumb swing barrel mixture empty soup";

module.exports = {

 networks: {

    development: {
     host: "127.0.0.1",     // Localhost (default: none)
     port: 8545,            // Standard Ethereum port (default: none)
     network_id: "*",       // Any network (default: none)
    },

    rinkeby: {
     provider: () => new HDWalletProvider(mnemonic, infuraURL),
     network_id: 4,          // Rinkeby's network id
     gas: 5500000,        
   }
  }
}