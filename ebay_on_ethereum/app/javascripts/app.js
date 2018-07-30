// Import the page's CSS. Webpack will know what to do with it.
import '../stylesheets/app.css';

// Import libraries we need.
import { default as Web3 } from 'web3';
import { default as contract } from 'truffle-contract';

// Import our contract artifacts and turn them into usable abstractions.
import ecommerce_store_artifacts from '../../build/contracts/EcommerceStore.json';

// MetaCoin is our usable abstraction, which we'll use through the code below.
const EcommerceStore = contract(ecommerce_store_artifacts);

window.App = {
  start: function () {
    const self = this;

    // Bootstrap the MetaCoin abstraction for Use.
    EcommerceStore.setProvider(web3.currentProvider);
    renderStore();

    $('#add-item-to-store').submit(function (event) {
      const req = $('#add-item-to-store').serialize();
      const params = JSON.parse('{"' + req.replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g, '":"') + '"}');
      let decodedParams = {};
      Object.keys(params).forEach(function (v) {
        decodedParams[v] = decodeURIComponent(decodeURI(params[v]));
      });
      console.log(req, decodedParams);
      saveProduct(decodedParams);
      event.preventDefault();
    });
  }
};

// Save product to blockchain
function saveProduct (params) {
  let instance;
  return EcommerceStore.deployed().then(function (i) {
    instance = i;
    return instance.addProductToStore(
      params['product-name'], params['product-category'], 'imageLink', 'descLink',
      Date.parse(params['product-start-time']) / 1000,
      web3.toWei(params['product-price'], 'ether'),
      params['product-condition'],
      { from: web3.eth.accounts[0], gas: 4700000 },
    );
  }).then(function (result) {
    console.log(result);
  });
}

// Get products
function renderStore () {
  let instance;
  return EcommerceStore.deployed().then(function (i) {
    instance = i;
    return instance.productIndex.call();
  }).then(function (productIndex) {
    for (let index = 0; index < productIndex; index++) {
      renderProduct(instance, index + 1);
    }
  });
}

// Render product to UI
function renderProduct (instance, index) {
  return instance.getProduct.call(index).then(function (product) {
    const node = $('<div />');
    node.addClass('col-sm-3 text-center col-margin-bottom-1 product');
    node.append('<div class="title">' + product[1] + '</div>');
    node.append('<div> Price: ' + displayPrice(product[6]) + '</div>');
    if (product[8] === '0x0000000000000000000000000000000000000000') {
      $('#product-list').append(node);
    } else {
      $('#product-purchased').append(node);
    }
  });
}

function displayPrice (price) {
  return '&Xi;' + web3.fromWei(price, 'ether');
}

window.addEventListener('load', function () {
  // Checking if Web3 has been injected by the browser (Mist/MetaMask)
  if (typeof web3 !== 'undefined') {
    console.warn('Using web3 detected from external source. ' +
      "If you find that your accounts don't appear or you have 0 MetaCoin, " +
      "ensure you've configured that source properly. If using MetaMask, see the following link. " +
      'Feel free to delete this warning. :) http://truffleframework.com/tutorials/truffle-and-metamask');
    // Use Mist/MetaMask's provider
    window.web3 = new Web3(web3.currentProvider);
  } else {
    console.warn('No web3 detected. Falling back to http://127.0.0.1:9545. ' +
      "You should remove this fallback when you deploy live, as it's inherently insecure. " +
      'Consider switching to Metamask for development. ' +
      'More info here: http://truffleframework.com/tutorials/truffle-and-metamask');
    // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
    window.web3 = new Web3(new Web3.providers.HttpProvider('http://127.0.0.1:8545'));
  }

  window.App.start();
});
