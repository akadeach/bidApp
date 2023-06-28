var Auction = artifacts.require("./Auction.sol");
// var Election = artifacts.require("./Election.sol");

module.exports = function(deployer) {
  deployer.deploy(Auction);
  // deployer.deploy(Election);
};
