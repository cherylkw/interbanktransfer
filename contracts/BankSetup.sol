pragma solidity ^0.5.0;

import '../node_modules/@openzeppelin/contracts/ownership/Ownable.sol';
import '../node_modules/@openzeppelin/contracts/access/roles/SignerRole.sol';
import '../node_modules/@openzeppelin/contracts/math/SafeMath.sol';

/**
* @title BankSetup
*
* @dev @notice This contract allows :
*               1. Central bank to setup, close and reopen settlement banks
*               2. Central bank to create and remove settlement banks role
*               3. View bank details
*               4. Settlement bank to create, close and view moible number account for their clients
*               5. Keep transfer fund transaction records between settlement banks
*
* @author Cheryl Kwong
*
*/

contract BankSetup is Ownable,SignerRole {
    // Avoiding common attacks : Integer Over/Underflow
    using SafeMath for uint256;

    // bank login address;
    address private loginBank;

    // bank details for settlement bank
    struct BankDetails {
        string name;
        bool authorized;
    }

    // Transfer fund transaction records
    struct MobileTrans{
        address[] sendBank;
        uint256[] amount;
    }

    // settlement bank
    mapping (address => BankDetails) internal banks;

    // mobile number accounts of settlement banks' client
    mapping (uint256 => address[]) private mobileNumbers;

    // transfer fund transaction records, keep by mobile number
    mapping (uint256 => MobileTrans) private mobileRecord;

    // Events - publicize actions to external listeners
    event bankAdded(address bankAddress, string bankName);
    event bankReopened(address bankAddress);
    event bankRemoved(address bankAddress);
    event mobileNumberAdded(address bankAddress, uint256 mobileNumber);
    event mobileNumberRemoved(uint256 mobileNumber);
    event mobileRecordAdded(uint256 mobileNumber,address bank, uint256 amount);

    constructor () public {
        loginBank = msg.sender;
        banks[loginBank] = BankDetails("Gaia Central Bank",true);
    }

    /**
    * @dev Create a new settlement bank account
    *      Settlement bank role create
    * @param bank the bank account address
    * @param bankName the name of the settlement bank
    * @return boolean
    */
   function createBank(address bank, string memory bankName) public onlyOwner returns(bool) {
            banks[bank] = BankDetails(bankName, true);
            _addSigner(bank);
            emit bankAdded(bank, bankName);
            return true;
    }

    /**
    * @dev Reopen an closed settlement bank account
    *      Settlement bank role added
    *      Only contract Owner can perform this function
    * @param bank the bank account address
    * @return boolean
    */
   function reopenBank(address bank) public onlyOwner returns(bool) {
            banks[bank].authorized = true;
            _addSigner(bank);
            emit bankReopened(bank);
            return true;
    }

    /**
    * @dev Remove a settlement bank account
    *      Settlement bank role remove
    *      Only contract Owner can perform this function
    * @param bank the bank account address
    */
    function removeBank(address bank) public onlyOwner {
        banks[bank].authorized = false;
        _removeSigner(bank);
        emit bankRemoved(bank);
    }

    /**
    * @dev Return bank details
    * @param bank the bank account address
    * @return bankName : the bank name of the search bank
    * @return authorization : indicate if the bank is active or close
    */
    function getBankDetails(address bank) public view returns (string memory bankName, bool authorization) {
        return (banks[bank].name, banks[bank].authorized);
    }

    /**
    * @dev Create mobile number account for client by settlement bank
    *      Only settlement bank can perform this function
    * @param mobileNumber client's mobile number
    * @param bank the settlement bank which holds the mobile number account
    */
    function addMobileNumber(uint256 mobileNumber, address bank) public onlySigner() {
        for(uint256 count = 0; count < mobileNumbers[mobileNumber].length; count++) {
            if(mobileNumbers[mobileNumber][count] == bank) {
                return;
            }
        }
        mobileNumbers[mobileNumber].push(bank);
        emit mobileNumberAdded(loginBank, mobileNumber);

    }

    /**
    * @dev Delete mobile number account for client by settlement bank
    *      Only settlement bank can perform this function
    * @param mobileNumber client's mobile number
    * @param bank the settlement bank which holds the mobile number account
    * @return boolean
    */
    function removeMobileNumber(uint256 mobileNumber, address bank) public onlySigner() returns(bool) {
        for(uint256 count = 0; count < mobileNumbers[mobileNumber].length; count++) {
             if(mobileNumbers[mobileNumber][count] == bank) {
                    delete mobileNumbers[mobileNumber][count];
                    //fill the gap caused by delete
                 for (uint256 i = count; i < mobileNumbers[mobileNumber].length - 1; i++){
                     mobileNumbers[mobileNumber][i] = mobileNumbers[mobileNumber][i+1];
                 }
                 mobileNumbers[mobileNumber].length--;

                break;
            }
        }
        emit mobileNumberRemoved(mobileNumber);
        return true;
    }

    /**
    * @dev Retrieve the registered banks of mobile number account
    *      Only settlement bank can perform this function
    * @param mobileNumber client's mobile number
    * @return bank list belongs to mobile number
    */
    function getMobileNumberBanks(uint256 mobileNumber) public view onlySigner() returns
     (address[] memory _bank) {
        return mobileNumbers[mobileNumber];
    }

    /**
    * @dev Keep records of fund transfer between settlement banks for the mobile number account
    *      Only settlement bank can perform this function
    * @param mobileNumber client's mobile number
    * @param bank the fund sender bank address
    * @param amount the fund amount
    * @return boolean
    */
    function addMobileRecord(uint256 mobileNumber,address bank, uint256 amount) public onlySigner() returns(bool) {
        mobileRecord[mobileNumber].sendBank.push(bank);
        mobileRecord[mobileNumber].amount.push(amount);
        emit mobileRecordAdded(mobileNumber,bank,amount);
        return true;
    }

    /**
    * @dev Retrieve records of fund transfer between settlement banks for the mobile number account
    *      Only settlement bank can perform this function
    * @param mobileNumber client's mobile number
    * @return _record : sender bank records
    * @return _amount : amount transferred
    */
    function getMobileRecord(uint256 mobileNumber) public view onlySigner() returns(address[] memory _record,uint256[] memory _amount) {
        return (mobileRecord[mobileNumber].sendBank,mobileRecord[mobileNumber].amount);
    }
}