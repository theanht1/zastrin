const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

const Schema = mongoose.Schema;

const ProductSchema = new Schema({
  blockchainId: Number,
  name: String,
  category: String,
  ipfsImageHash: String,
  ipfsDescHash: String,
  startTime: Number,
  price: Number,
  condition: Number,
  buyer: String
});

const ProductModel = mongoose.model('ProductModel', ProductSchema);

module.exports = ProductModel;
