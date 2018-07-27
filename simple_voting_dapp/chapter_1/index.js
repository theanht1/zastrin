const web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));

const abi = JSON.parse('[{"constant":true,"inputs":[{"name":"candidate","type":"bytes32"}],"name":"totalVotesFor","outputs":[{"name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"candidate","type":"bytes32"}],"name":"validCandidate","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"bytes32"}],"name":"votesReceived","outputs":[{"name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"candidateList","outputs":[{"name":"","type":"bytes32"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"candidate","type":"bytes32"}],"name":"voteForCandidate","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"inputs":[{"name":"candidateNames","type":"bytes32[]"}],"payable":false,"stateMutability":"nonpayable","type":"constructor"}]');

const VotingContract = web3.eth.contract(abi);
const contractInstance = VotingContract.at('0x6661332e95e0f165910a33c9ae2e231702d388bd');

const candidates = { 'Spiderman': 'candidate-1', 'Ironman': 'candidate-2', 'Hulk': 'candidate-3', 'Thor': 'candidate-4' };

function voteForCandidate(e) {
  const name = $('#candidate').val();
  console.log(name);
  contractInstance.voteForCandidate(name, { from: web3.eth.accounts[0], gas: 4700000 }, function() {
    const div_id = candidates[name];
    $('#' + div_id).html(contractInstance.totalVotesFor.call(name).toNumber());
  });
}

$(document).ready(function() {
  const candidateNames = Object.keys(candidates);

  for (var i = 0; i < candidateNames.length; i++) {
    const name = candidateNames[i];
    const value = contractInstance.totalVotesFor.call(name).toNumber();
    $('#' + candidates[name]).html(value);
  }
});
