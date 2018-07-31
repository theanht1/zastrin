
const EcommerceStore = artifacts.require('./EcommerceStore.sol');

contract('EcommerceStore', (accounts) => {
  let instance;
  const ARBITER = accounts[9];
  const SELLER = accounts[0];
  const BUYER = accounts[1];
  const PRODUCT = {
    name: 'NAME',
    category: 'CATEGORY',
    imageLink: 'IMAGE_LINK',
    descLink: 'DESC_LINK',
    startTime: new Date().getTime(),
    price: web3.toWei(0.5),
    productCondition: 0
  };

  before(async () => {
    instance = await EcommerceStore.deployed();
  });

  it('should be initialized', async () => {
    const productIndex = await instance.productIndex.call();
    assert.equal(productIndex, 0, 'productIndex was not assgned to 0');
    const arbiter = await instance.arbiter.call();
    assert.equal(arbiter, ARBITER, 'arbiter was wrong');
  });

  it('should create new product', async () => {
    await instance.addProductToStore(
      PRODUCT.name, PRODUCT.category, PRODUCT.imageLink, PRODUCT.descLink,
      PRODUCT.startTime, PRODUCT.price, PRODUCT.productCondition,
      { from: SELLER }
    );

    const productIndex = await instance.productIndex.call();
    assert.equal(productIndex, 1, 'Product was not added');
    const product = await instance.getProduct(1);
    assert.equal(product[0], 1);
    assert.equal(product[1], PRODUCT.name);
    assert.equal(product[2], PRODUCT.category);
    assert.equal(product[8], '0x0000000000000000000000000000000000000000');
  });

  it('should be bought', async () => {
    await instance.buy(1, { from: BUYER, value: PRODUCT.price });

    const product = await instance.getProduct(1);
    assert.equal(product[8], BUYER, 'Product was not bought');

    const escrow = await instance.escrowInfo(1);
    assert.equal(escrow[0], BUYER, 'Escrow was not created');
  });

  it('should be voted', async () => {
    await instance.releaseAmountToSeller(1, { from: SELLER});
    let escrow = await instance.escrowInfo(1);
    assert.equal(escrow[3], false);
    assert.equal(escrow[4], 1);
    assert.equal(escrow[5], 0);

    await instance.refundAmountToBuyer(1, { from: BUYER });
    escrow = await instance.escrowInfo(1);
    assert.equal(escrow[3], false);
    assert.equal(escrow[4], 1);
    assert.equal(escrow[5], 1);

    await instance.refundAmountToBuyer(1, { from: ARBITER });
    escrow = await instance.escrowInfo(1);
    assert.equal(escrow[3], true);
    assert.equal(escrow[4], 1);
    assert.equal(escrow[5], 2);
  });
});
