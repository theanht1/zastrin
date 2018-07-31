pragma solidity ^0.4.23;
import "./Escrow.sol";


contract EcommerceStore {

    enum ProductCondition { New, Used }

    uint public productIndex;
    address public arbiter;

    mapping (address => mapping(uint => Product)) stores;
    mapping (uint => address) productIdInStore;
    mapping (uint => address) productToEscrow;

    struct Product {
        uint id;
        string name;
        string category;
        string imageLink;
        string descLink;
        uint startTime;
        uint price;
        ProductCondition condition;
        address buyer;
    }

    constructor(address _arbiter) public {
        productIndex = 0;
        arbiter = _arbiter;
    }

    // Add a product to stores
    function addProductToStore(
        string _name, string _category, string _imageLink, string _descLink,
        uint _startTime, uint _price, uint _productCondition
    ) public
    {
        productIndex++;
        Product memory product = Product(
            productIndex, _name, _category, _imageLink, _descLink,
            _startTime, _price, ProductCondition(_productCondition), 0
        );
        stores[msg.sender][productIndex] = product;
        productIdInStore[productIndex] = msg.sender;
    }

    // Get a product by id
    function getProduct(uint _productId)
        public
        view
        returns (uint, string, string, string, string, uint, uint, ProductCondition, address)
    {
        Product memory product = stores[productIdInStore[_productId]][_productId];
        return (
            product.id, product.name, product.category, product.imageLink,
            product.descLink, product.startTime, product.price, product.condition, product.buyer
        );
    }

    // Buy a product
    function buy(uint _productId) public payable {
        Product memory product = stores[productIdInStore[_productId]][_productId];
        require(product.buyer == address(0));
        require(msg.value >= product.price);

        product.buyer = msg.sender;
        stores[productIdInStore[_productId]][_productId] = product;
        Escrow escrow = (new Escrow).value(msg.value)(
            _productId, msg.sender,
            productIdInStore[_productId], arbiter
        );
        productToEscrow[_productId] = escrow;
    }

    function escrowInfo(uint _productId) public view returns(address, address, address, bool, uint, uint) {
        return Escrow(productToEscrow[_productId]).escrowInfo();
    }

    function releaseAmountToSeller(uint _productId) public {
        Escrow(productToEscrow[_productId]).releaseAmountToSeller(msg.sender);
    }

    function refundAmountToBuyer(uint _productId) public {
        Escrow(productToEscrow[_productId]).refundAmountToBuyer(msg.sender);
    }
}
