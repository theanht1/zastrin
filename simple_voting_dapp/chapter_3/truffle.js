// Allows us to use ES6 in our migrations and tests.
require('babel-register');
const HDWalletProvider = require('truffle-hdwallet-provider');

const mnemonic = 'debate vanish tool stem acoustic tank move bird tattoo latin license chuckle';

module.exports = {
  networks: {
    development: {
      host: '127.0.0.1',
      port: 8545,
      network_id: '*' // Match any network id
    },
    ropsten: {
      provider: function() {
        return new HDWalletProvider(mnemonic, 'https://ropsten.infura.io/v3/7c5a6bb200b04aa0961af87d796358d5');
      },
      network_id: 3,
      gas: 4700000,
    },
  },
};
