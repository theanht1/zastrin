// Import the page's CSS. Webpack will know what to do with it.
import '../stylesheets/app.css';

// Import libraries we need.
import { default as Web3 } from 'web3';
import { default as contract } from 'truffle-contract';
import ipfsAPI from 'ipfs-api';

// Import our contract artifacts and turn them into usable abstractions.
import ecommerce_store_artifacts from '../../build/contracts/EcommerceStore.json';

// IPFS configuration
const ipfs = ipfsAPI({ host: 'localhost', port: '5001', protocol: 'http' });

// EcommerceStore is our usable abstraction, which we'll use through the code below.
const EcommerceStore = contract(ecommerce_store_artifacts);

let reader;

window.App = {
  start: function() {
    const self = this;

    // Bootstrap the MetaCoin abstraction for Use.
    EcommerceStore.setProvider(web3.currentProvider);

    // Check render for index and product detail page
    if ($('#product-details').length > 0) {
      const productId = new URLSearchParams(window.location.search).get('id');
      renderProductDetail(productId);
    } else {
      renderStore();
    }

    // Handler for image picker changing
    $('#product-image').change(function(event) {
      const file = event.target.files[0];
      reader = new window.FileReader();
      reader.readAsArrayBuffer(file);
    });

    // Handler for adding new product
    $('#add-item-to-store').submit(function(event) {
      const req = $('#add-item-to-store').serialize();
      const params = JSON.parse('{"' + req.replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g, '":"') + '"}');
      let decodedParams = {};
      Object.keys(params).forEach(function(v) {
        decodedParams[v] = decodeURIComponent(decodeURI(params[v]));
      });
      saveProduct(decodedParams);
      event.preventDefault();
    });

    // Handler for buying product
    $('#buy-now').submit(function(event) {
      event.preventDefault();
      $('#msg').hide();
      const amount = $('#buy-now-price').val();
      const productId = $('#product-id').val();
      return EcommerceStore.deployed().then(function(instance) {
        return instance.buy(productId, {
          from: web3.eth.accounts[0],
          value: amount,
          gas: 470000
        });
      }).then(function() {
        $('#msg').show();
        $('#msg').html('You have purchased this product successfully!');
      });
    });
  }
};

/* Product detail page's functions */
// Render detail of product
function renderProductDetail(productId) {
  return EcommerceStore.deployed().then(function(instance) {
    return instance.getProduct.call(productId).then(function(product) {
      $('#product-name').html(product[1]);
      $('#product-image').html('<img width="100" src="http://localhost:9001/ipfs/' + product[3] + '" />');
      $('#product-price').html(displayPrice(product[6]));
      $('#product-id').val(product[0]);
      $('#buy-now-price').val(product[6]);
      ipfs.cat(product[4]).then(function (file) {
        const content = file.toString();
        $('#product-desc').append('<div>' + content + '</div>');
      })
    });
  });
}
/* End product detail page's functions */

/* New product page's functions */
// Save product to blockchain
async function saveProduct(params) {
  // Upload image
  const imageHash = await saveImageOnIpfs(reader);
  const descHash = await saveTextBlobOnIpfs(params['product-description']);

  const instance = await EcommerceStore.deployed();
  return instance.addProductToStore(
    params['product-name'], params['product-category'],
    imageHash, descHash,
    Date.parse(params['product-start-time']) / 1000,
    web3.toWei(params['product-price'], 'ether'),
    params['product-condition'],
    { from: web3.eth.accounts[0], gas: 4700000 },
  ).then(function(result) {
    window.alert('You have added new product successfully');
  });
}
/* End new product page's functions */

/* Index page's functions */
// Get products
function renderStore() {
  let instance;
  return EcommerceStore.deployed().then(function(i) {
    instance = i;
    return instance.productIndex.call();
  }).then(function(productIndex) {
    for (let index = 0; index < productIndex; index++) {
      renderProduct(instance, index + 1);
    }
  });
}

// Render product to UI
function renderProduct(instance, index) {
  return instance.getProduct.call(index).then(function(product) {
    const node = $('<div />');
    node.addClass('col-sm-3 text-center col-margin-bottom-1 product');
    node.append('<img src="http://localhost:9001/ipfs/' + product[3] + '" />');
    node.append('<div class="title">' + product[1] + '</div>');
    node.append('<div> Price: ' + displayPrice(product[6]) + '</div>');
    node.append('<a href="product.html?id=' + product[0] + '">Details</a>');
    if (product[8] === '0x0000000000000000000000000000000000000000') {
      $('#product-list').append(node);
    } else {
      $('#product-purchased').append(node);
    }
  });
}
/* End index page's functions */

function saveTextBlobOnIpfs(blob) {
  return new Promise(function(resolve, reject) {
    const buffer = Buffer.from(blob, 'utf-8');
    ipfs.add(buffer).then(function(response) {
      console.log(response);
      resolve(response[0].hash);
    }).catch(function(err) {
      console.error(err);
      reject(err);
    });
  });
}

function saveImageOnIpfs(reader) {
  return new Promise(function(resolve, reject) {
    const buffer = Buffer.from(reader.result);
    ipfs.add(buffer).then(function(response) {
      console.log(response);
      resolve(response[0].hash);
    }).catch(function(err) {
      console.error(err);
      reject(err);
    });
  });
}

function displayPrice(price) {
  return '&Xi;' + web3.fromWei(price, 'ether');
}

window.addEventListener('load', function() {
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
