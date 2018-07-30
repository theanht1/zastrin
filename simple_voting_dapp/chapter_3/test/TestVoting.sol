pragma solidity ^0.4.23;

import "truffle/DeployedAddresses.sol";
import "truffle/Assert.sol";
import "../contracts/Voting.sol";

contract TestVoting {
  uint public initialBalance = 2 ether;

  function testInitialTokenBalance() public {
    Voting voting = Voting(DeployedAddresses.Voting());

    Assert.equal(voting.balanceTokens(), 10000, "10000 tokens were not initialized");
  }

  function testBuyTokens() public {
    Voting voting = Voting(DeployedAddresses.Voting());
    voting.buy.value(1 ether)();
    Assert.equal(voting.balanceTokens(), 9900, "9900 is not the balance");
  }

  function testVoteForCandidate() public {
    Voting voting = Voting(DeployedAddresses.Voting());
    voting.voteForCandidate("Spiderman", 10);
    Assert.equal(voting.votesReceived("Spiderman"), 10, "10 is not the voting token for Spiderman");
  }
}
