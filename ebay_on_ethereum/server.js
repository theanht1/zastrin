const express = require('express');
const contract = require('truffle-contract');
const Web3 = require('web3');
const mongoose = require('mongoose');
const ProductModel = require('./product');

// Contract setup
const ecommerce_store_artifacts = require('./build/contracts/EcommerceStore.json');
const EcommerceStore = contract(ecommerce_store_artifacts);
const provider = new Web3.providers.HttpProvider('http://localhost:8545');
EcommerceStore.setProvider(provider);

// Mongoose setup
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/ebay_dapp');
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// App define
const app = express();

app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

app.listen(3000, function() {
  console.log('Server start at port 3000');
});

// Get products from db
app.get('/products', function(req, res) {
  const query = {};
  if (req.query.category) {
    query.category = { $eq: req.query.category };
  }

  ProductModel.find(query, null, { sort: 'startTime' }, function(err, products) {
    res.send(products);
  });
});

setupProductEventListener();

// Listen to contract event and add it to mongodb
function setupProductEventListener() {
  EcommerceStore.deployed().then(function(instance) {
    const productEvent = instance.NewProduct({ fromBlock: 0, toBlock: 'latest' });
    productEvent.watch(function(err, result) {
      if (err) {
        console.log(err);
        return;
      }
      saveProduct(result.args);
    });

    const buyEvent = instance.BuyProduct({ fromBlock: 0, toBlock: 'latest' });
    buyEvent.watch(function(err, result) {
      if (err) {
        console.log(err);
        return;
      }
      console.log(result.args)
      updateProduct(result.args);
    });
  });
}

function saveProduct(product) {
  ProductModel.findOne({ 'blockchainId': product.id.toNumber() }, function(getProductErr, dbProduct) {
    if (getProductErr || dbProduct) {
      return;
    }
    const newProduct = new ProductModel({
      blockchainId: product.id,
      name: product.name,
      category: product.category,
      ipfsImageHash: product.imageLink,
      ipfsDescHash: product.descLink,
      startTime: product.startTime,
      price: product.price,
      condition: product.condition,
      buyer: '0x0000000000000000000000000000000000000000'
    });

    newProduct.save(function(saveProductErr) {
      if (saveProductErr) {
        console.log(saveProductErr);
        return;
      }
    });
  });
}

function updateProduct(product) {
  ProductModel.findOneAndUpdate(
    { 'blockchainId': product.id.toNumber() },
    { $set: { buyer: product.buyer } },
    { new: true },
    (err, dbProduct) => {
      if (err) {
        console.log(err);
        return;
      }
    }
  );
}
