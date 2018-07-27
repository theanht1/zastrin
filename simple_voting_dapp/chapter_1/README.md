# Simple voting app on Ethereum

### Running
* Install necessary packges
```
npm install
```
* Start Ganache
```
node_modules/.bin/ganache-cli
```
* Compile and deploy app
```
node
code = fs.readFileSync('voting.sol').toString()
compiledCode = solc.compile(code)
abiDefinition = JSON.parse(compiledCode.contracts[':Voting'].interface)
byteCode = compiledCode.contracts[':Voting'].bytecode
VotingContract = web3.eth.contract(abiDefinition)
deployedContract = VotingContract.new(['Spiderman','Ironman','Hulk', 'Thor'],{data: byteCode, from: web3.eth.accounts[0], gas: 4700000})

deployedContract.address
compiledCode.contracts[':Voting'].interface
```
* Configurate web client: use the last two values of the above script to paste in `index.js` address and abi values
* Open `index.html` by a browser
