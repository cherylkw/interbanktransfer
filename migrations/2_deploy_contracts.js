var CentralBank = artifacts.require("./CentralBank.sol");
var BankSetup = artifacts.require("./BankSetup.sol");

module.exports = function(deployer) {
    deployer.deploy(CentralBank);
    deployer.deploy(BankSetup);
}