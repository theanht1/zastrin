pragma solidity ^0.4.23;

contract Voting {
  bytes32[] public candidateList;

  uint public totalTokens;
  uint public balanceTokens;
  uint public tokenPrice;

  // what is the voter address?
  // total tokens purchased
  // tokens voted per candidate

  struct voter {
    address voterAddress;
    uint tokensBought;
    uint[] tokensUsedPerCandidate;
  }

  mapping(address => voter) public voterInfo;

  mapping(bytes32 => uint) public votesReceived;

  constructor(uint _totalTokens, uint _tokenPrice, bytes32[] _candidateNames) public {
    totalTokens = _totalTokens;
    balanceTokens = _totalTokens;
    tokenPrice = _tokenPrice;
    candidateList = _candidateNames;
  }


  //1. Users should be able to purchase tokens
  function buy() payable public {
    uint tokensToBuy = msg.value / tokenPrice;
    require(tokensToBuy <= balanceTokens);
    voterInfo[msg.sender].voterAddress = msg.sender;
    voterInfo[msg.sender].tokensBought += tokensToBuy;
    balanceTokens -= tokensToBuy;
  }

  //2. Users should be able to vote for candidates with tokens
  function voteForCandidate(bytes32 candidate, uint tokens) public {
    // Check to make sure user has enough tokens to vote
    uint availableTokens = voterInfo[msg.sender].tokensBought - totalTokensUsed(voterInfo[msg.sender].tokensUsedPerCandidate);

    require(tokens <= availableTokens, "You don't have enough tokens");
    // Increment vote count for candidate
    votesReceived[candidate] += tokens;

    // Update the voter struct tokensUsedPerCandidate for this voter
    if(voterInfo[msg.sender].tokensUsedPerCandidate.length == 0) {
      for (uint i = 0; i < candidateList.length; i++) {
        voterInfo[msg.sender].tokensUsedPerCandidate.push(0);
      }
    }

    uint index = indexOfCandidate(candidate);
    voterInfo[msg.sender].tokensUsedPerCandidate[index] += tokens;

  }

  function indexOfCandidate(bytes32 candidate) view public returns(uint) {
    for (uint i = 0; i < candidateList.length; i++) {
      if (candidateList[i] == candidate) {
        return i;
      }
    }
    return uint(-1);
  }

  function totalTokensUsed(uint[] _tokensUsedPerCandidate) private pure returns (uint) {
    uint totalUsedTokens = 0;
    for(uint i = 0; i < _tokensUsedPerCandidate.length; i++) {
      totalUsedTokens += _tokensUsedPerCandidate[i];
    }
    return totalUsedTokens;
  }

  //3. Anyone should be able to lookup voter info
  function voterDetails(address user) view public returns (uint, uint[]) {
    return (voterInfo[user].tokensBought, voterInfo[user].tokensUsedPerCandidate);
  }

  function tokensSold() public view returns (uint) {
    return totalTokens - balanceTokens;
  }

  function allCandidates() public view returns (bytes32[]) {
    return candidateList;
  }

  function totalVotesFor(bytes32 candidate) public view returns (uint) {
    return votesReceived[candidate];
  }
}
