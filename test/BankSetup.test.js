let catchRevert = require("./exceptionsHelpers.js").catchRevert
var BankSetup = artifacts.require("./BankSetup.sol")

contract('BankSetup', function(accounts) {
    const owner = accounts[0]
    const bankA = accounts[1]
    const bankNameA = 'bank A'

    beforeEach(async () => {
        instance = await BankSetup.new()
    });

    // when creating a new bank , to ensure both bank details is added.
    it("should create new bank and stored bank details correctly", async() => {
        await instance.createBank(bankA,bankNameA)
        const tx = await instance.getBankDetails(bankA)
        assert.equal(tx[0],bankNameA,'Stored bank name does not match the input bank name')
        assert.equal(tx[1],true,'added bank should be authorized')
    });

    // when creating a new bank, to ensure settlement bank role is created.
    it("should be create a settlement bank role after new bank is added", async() => {
        let eventEmitted = false     
        await instance.createBank(bankA,bankNameA)
        const tx = await instance.isSigner(bankA)
        assert.equal(tx, true, 'added new settlement bank role')
    });

    // when closing a settlement bank, to ensure settlement bank role is removed.
    // it prevents the bankto be able to access the account page again.
    it("should emit a bankRemoved event and a SignerRemoved event when a bank is removed", async() => {
        let eventEmitted = false     
        await instance.createBank(bankA,bankNameA)
        const tx = await instance.removeBank(bankA)
        if ((tx.logs[1].event == "bankRemoved") && (tx.logs[0].event == "SignerRemoved")) {
            eventEmitted = true
        }
        assert.equal(eventEmitted, true, 'Remove bank should emit a removeBank event and a SignerRemoved event')
    });

    // ensure the bank can be reopened again after closed. Performed by central bank.
    it("should emit a bankReopened event when a bank is reopened after closed", async() => {
        let eventEmitted = false     
        await instance.createBank(bankA,bankNameA)
        await instance.removeBank(bankA)
        const tx = await instance.reopenBank(bankA)
        if (tx.logs[1].event == "bankReopened") {
            eventEmitted = true
        }
        assert.equal(eventEmitted, true, 'Reopen bank should emit a bankReopened event')
    });

    // ensure the mobile number account can be opened successfully.
    it("should emit a mobileNumberAdded event when a mobile number is added", async() => {
        let mobileNum = 1234
        let eventEmitted = false  
        const tx = await instance.addMobileNumber(mobileNum,owner)
        if (tx.logs[0].event == "mobileNumberAdded") {
            eventEmitted = true
        }
        assert.equal(eventEmitted, true, 'adding a new mobile number should emit a mobileNumberAdded event')
    });

    // by enterning a mobile number, the bank lists which are registered under that mobile number should be retrieved.
    it("should return a bank address in the bank list under a mobile number ", async() => {
        let mobileNum = 1234 
        await instance.addMobileNumber(mobileNum,owner)
        const tx = await instance.getMobileNumberBanks(mobileNum)
        assert.equal(tx[0], owner, 'does not return a correct address list of the mobile number')
    });

    // mobile number account should be able to closed by the settlement bank account which created it.
    it("should emit a mobileNumberRemoved event after removed mobile number and its bank list ", async() => {
        let mobileNum = 123456789
        let eventEmitted = false
        await instance.addMobileNumber(mobileNum,owner)
        const tx = await instance.removeMobileNumber(mobileNum,owner)        
        if (tx.logs[0].event == "mobileNumberRemoved") {
            eventEmitted = true
        }
        assert.equal(eventEmitted, true, 'remove a mobile number should emit a mobileNumberAdded event')
    });
})