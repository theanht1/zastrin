pragma solidity ^0.4.23;


contract Escrow {

    address public buyer;
    address public seller;
    address public arbiter;
    uint public productId;
    uint public amount;
    mapping (address => bool) public releaseAmount;
    mapping (address => bool) public refundAmount;
    uint public releaseCount;
    uint public refundCount;
    // Mark if fund is released or refunded
    bool public fundsDisbursed;
    address public owner;

    constructor(uint _productId, address _buyer, address _seller, address _arbiter) public payable {
        productId = _productId;
        buyer = _buyer;
        seller = _seller;
        arbiter = _arbiter;
        amount = msg.value;
        fundsDisbursed = false;
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }

    function escrowInfo() public view returns(address, address, address, bool, uint, uint) {
        return (buyer, seller, arbiter, fundsDisbursed, releaseCount, refundCount);
    }

    function releaseAmountToSeller(address caller) public onlyOwner {
        require(fundsDisbursed == false);
        if ((caller == buyer || caller == seller || caller == arbiter) && releaseAmount[caller] == false) {
            releaseAmount[caller] = true;
            releaseCount++;
        }

        if (releaseCount == 2) {
            seller.transfer(amount);
            fundsDisbursed = true;
        }
    }

    function refundAmountToBuyer(address caller) public onlyOwner {
        require(fundsDisbursed == false);
        if ((caller == buyer || caller == seller || caller == arbiter) && refundAmount[caller] == false) {
            refundAmount[caller] = true;
            refundCount++;
        }

        if (refundCount == 2) {
            buyer.transfer(amount);
            fundsDisbursed = true;
        }
    }
}
