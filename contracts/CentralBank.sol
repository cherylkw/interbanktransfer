pragma solidity ^0.5.0;

import '../node_modules/@openzeppelin/contracts/ownership/Ownable.sol';
import '../node_modules/@openzeppelin/contracts/lifecycle/Pausable.sol';
import '../node_modules/@openzeppelin/contracts/math/SafeMath.sol';
import './ERC20Token.sol';
import './BankSetup.sol';

/**
* @title CentralBank
*
* @dev @notice This contract allows :
*               1. Central bank to issue or withdraw fund from settlement banks
*               2. Transfer payment between authorized settlement banks
*               3. Keep records for total issue fund and total refund(withdraw fund) for central bank
*               4. View account balance for both central bank and settlement banks
*
* @author Cheryl Kwong
*
*/

contract CentralBank is Ownable, ERC20Token, BankSetup, Pausable {
    // Avoiding common attacks : Integer Over/Underflow
    using SafeMath for uint256;

    // Central Bank owner;
    address private cBank ;

    // total fund withdraw from settlement bank by central bank when the bank closed
    uint internal totalWithdraw;

    // total fund issued by central bank to settlement bank when it's opened or reopened
    uint internal totalIssued;

    // total amount transfer from sender bank to beneficiary bank
    uint internal totalTransfer;

    // Events - publicize actions to external listeners
    event bankIssued(uint amount, address to);
    event bankWithdraw(uint amount, address from);
    event bankTransfer(uint amount, address from, address to);

    constructor () public {
        cBank = owner();
   }

    // Fallback function - Called if other functions don't match call or sent amount without data
    function() external payable {
        revert("fallback function");
    }

    /**
    * @dev To issue fund to settlement bank account when it's created
    *      Total amount of issued fund will be added
    * @param to settlement account address
    * @param amount credit amount / fund
    */
    function issueBank(address to, uint256 amount) public payable onlyOwner whenNotPaused returns(bool){
        totalIssued += amount;
        transfer(to, amount);
        emit bankIssued(amount, to);
        return true;
    }

    /**
    * @dev To withdraw fund from a settlement account when bank closed
    *      Total amount of withdraw fund wil be added
    * @param account settlement account address
    * @param amount debit amount / fund
    */
    function withdrawBank(address account, uint256 amount) public payable onlyOwner whenNotPaused returns(bool) {
        totalWithdraw += amount;
        withdraw(account, amount);
        emit bankWithdraw(amount, account);
        return true;
    }

    /**
    * @dev transfer payment between settlement banks
    * @param from settlement account address of the payment sender
    * @param to receivable settlement account address
    * @param amount debit and credit amount
    */
    function transferBank(address from, address to,uint256 amount) public payable
        whenNotPaused
        returns(bool)
    {
        transferFrom(from, to, amount);
        emit bankTransfer(amount, from, to);
        return true;
    }

    /**
    * @dev get balance of a bank account
    * @param account the account address
    * @return account balance
    */
    function getBalance(address account) public view returns (uint256 balance) {
        return balanceOf(account);
    }

    /**
    * @dev keep track of total fund being issued by central bank and withdraw back to central bank
    * @return total issued fund and total returned fund
    */
    function getTotal() public view returns (uint256 _totalIssued, uint256 _totalWithdraw) {
        return (totalIssued, totalWithdraw);
    }
}