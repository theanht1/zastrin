const Voting = artifacts.require('./Voting.sol');

contract('Voting', function(accounts) {
  it("should be able to buy tokens", function () {
    let instance;

    return Voting.deployed().then(function (i) {
      instance = i;
      return instance.buy({ value: web3.toWei(1, 'ether') });
    }).then(function () {
      return instance.tokensSold.call();
    }).then(function (balance) {
      assert.equal(balance, 100, "100 tokens were not sold");
      return instance.voterDetails.call(web3.eth.accounts[0]);
    }).then(function (detail) {
      const userTokens = detail[0].toNumber();
      assert.equal(userTokens, 100, "100 tokens were not assigned to user");
    });
  });

  it("should be able to vote for candidate", function() {
    let instance;
    return Voting.deployed().then(function(i) {
      instance = i;
      return instance.buy({value: web3.toWei(1, 'ether')});
    }).then(function() {
      return instance.voteForCandidate('Spiderman', 25);
    }).then(function() {
      return instance.voterDetails.call(web3.eth.accounts[0]);
    }).then(function(tokenDetails) {
      const tokensUsedPerCandidate = tokenDetails[1];
      assert.equal(tokensUsedPerCandidate[0], 25, "25 tokens were not voted for Spiderman");
    });
  });

});
