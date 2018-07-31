# Zastrin course: Ebay on Ethereum
In this course, I created an dapp with these features:
* List/Add/Buy products
* The process of buying is executed via an Escrow contract
* Use IPFS to store the product's image + description
* Use MongoDB + Nodejs to store (via contract event) + query products

### Setup
* Contract
```sh
npm install -g truffle
npm install -g ganache-cli
npm install
```
* [IPFS](https://dist.ipfs.io/#go-ipfs): 
```sh
# Config ipfs
./ipfs config --json API.HTTPHeaders.Access-Control-Allow-Origin '["*"]'
./ipfs config --json API.HTTPHeaders.Access-Control-Allow-Methods '["PUT", "GET", "POST"]'
./ipfs config --json API.HTTPHeaders.Access-Control-Allow-Credentials '["true"]'
./ipfs config Addresses.Gateway /ip4/0.0.0.0/tcp/9001

# Start ipfs daemon
./ipfs daemon
```
* [MongoDB](https://docs.mongodb.com/manual/installation/): Install + start service

### Running
```sh
# Start ganache in a terminal
ganache-cli -d

# In another termial
# Migrate contract
truffle migrate

# Run seed
truffle exec seed.js

# Start frontend app dev server
npm run dev
```

### Testing
```sh
# Run test
truffle test

# Coverage
npm run coverage
```
