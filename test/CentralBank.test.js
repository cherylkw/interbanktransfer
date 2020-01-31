let catchRevert = require("./exceptionsHelpers.js").catchRevert
var CentralBank = artifacts.require("./CentralBank.sol")

contract('CentralBank', function(accounts) {

    const owner = accounts[0]
    const bankA = accounts[1]
    const bankB = accounts[2]
    const issue = web3.utils.toBN(2)

    beforeEach(async () => {
        instance = await CentralBank.new()
    })

    // should be able to initalized the fund of the central bank once contract is created.
    it("Should have inital amount", async () => {
        const ownerBalance = await instance.balanceOf(owner,{from: owner})
        assert.equal(ownerBalance, 1000000,'inital central bank balance should be 1000000')
    });

    // ensure the central bank issue correct amount to the settlement bank when it is created.
    it("should issue correct amount to settlement bank", async () => {
        let transferValue = 100
        const tx = await instance.issueBank(bankA,transferValue)
        const balance = await instance.balanceOf(bankA,{from: bankA})
        assert.equal(balance, transferValue, 'transfer amount to bank is incorrect')
    });

    // ensure issue and withdraw fund calculation is correct when issue fund and withdraw fund of settlement bank.
    it("should burn the amount from settlement bank", async () => {
        let resultValue = 95
        let withdrawValue = 5
        let transferValue = 100
        await instance.issueBank(bankA,transferValue)       
        await instance.withdrawBank(bankA,withdrawValue)
        const balance = await instance.balanceOf(bankA,{from: bankA})
        assert.equal(balance, resultValue,'burn amount from bank is incorrect')
    });

    // ensure correct fund transfer between settlement bank accounts
    it("should transfer amount from one settlement bank account to another", async() =>{
        let issueValue = 1000
        let transferValue = 200
        await instance.issueBank(bankA,issueValue)
        await instance.transferBank(bankA,bankB,transferValue)
        const transfered = await instance.balanceOf(bankB,{from: bankB})
        assert.equal(transfered,transferValue,'recipient bank amount is incorrect')
    });

    // ensure when transfer fund between settlement banks, the sender's account balance is debited the correct amount
    it("should be debit Sender's amount after transferred to recipient bank account", async() =>{
        let issueValue = 1000
        let transferValue = 600
        let resultValue = 400
        await instance.issueBank(bankA,issueValue)
        await instance.transferBank(bankA,bankB,transferValue)
        const transfered = await instance.balanceOf(bankA,{from: bankA})
        assert.equal(transfered,resultValue,'sender bank amount is incorrect')
    });

    // check if functions banned overdrawn from settlement bank account.
    it("should not be able to transfer more than has been deposited", async() => {
        let issueValue = 1000
        let transferValue = 1600
        await instance.issueBank(bankA,issueValue)
        await catchRevert(instance.transferBank(bankA,bankB,transferValue))
      });

    // ensure central bank cannot issue an amount to settlement bank which excess it's current balance.
    it("should not be able to issue amount to settelment bank when excess central bank balance", async() => {
      let issueValue = 20000000
      await catchRevert(instance.issueBank(bankA,issueValue))
    });

    // cannot be able to issue any fund when circuit break occurs.
    it("should not be able to issue amount when pause is true", async() => {
      let issueValue = 20000000
      await instance.pause()
      await catchRevert(instance.issueBank(bankA,issueValue))
    });
})