pragma solidity ^0.5.0;

import '../node_modules/@openzeppelin/contracts/math/SafeMath.sol';
import './ERC20.sol';

/**
 * @title ERC20Token
 */

contract ERC20Token is ERC20 {
  using SafeMath for uint256;

  uint256 private totalSupply;

  mapping(address => uint256) balances;
  mapping (address => mapping (address => uint256)) internal allowed;

/**
* @dev declare ERC standard details
*/
  string public name = "Gaia Token";
  string public symbol = "GAT";
  uint256 public decimals = 0;

  constructor() public {
    totalSupply = 1000000;
    balances[msg.sender] = totalSupply;
  }

  /**
  * @dev returns the latest totalSupply
  */
  function totalSUpply() public view returns (uint256) {
    return totalSupply;
  }

  /**
  * @dev Gets the balance of the specified address.
  * @param _owner The address to query the the balance of.
  * @return An uint256 representing the amount owned by the passed address.
  */
  function balanceOf(address _owner) public view returns (uint256 balance) {
    return balances[_owner];
  }

  /**
  * @dev transfer token for a specified address
  * @param _to The address to transfer to.
  * @param _value The amount to be transferred.
  */
  function transfer(address _to, uint256 _value) public returns (bool) {
    require(_value <= balances[msg.sender],"cannot be owner and transfer amount exceed balance");

    // SafeMath.sub will throw if there is not enough balance.
    balances[msg.sender] = balances[msg.sender].sub(_value);
    balances[_to] = balances[_to].add(_value);
  //  emit Transfer(msg.sender, _to, _value);
    return true;
  }

  /**
   * @dev Transfer tokens from one address to another
   * @param _from address The address which you want to send tokens from
   * @param _to address The address which you want to transfer to
   * @param _value uint256 the amount of tokens to be transferred
   */
  function transferFrom(address _from, address _to, uint256 _value) public returns (bool) {
    require(_value <= balances[_from], "Transfer amount exceed balance");
    balances[_from] = balances[_from].sub(_value);
    balances[_to] = balances[_to].add(_value);
  //  emit Transfer(_from, _to, _value);
    return true;
  }

  /**
   * @dev Approve the passed address to spend the specified amount of tokens on behalf of msg.sender.
   * @param _spender The address which will spend the funds.
   * @param _value The amount of tokens to be spent.
   */
  function approve(address _spender, uint256 _value) public returns (bool) {
    allowed[msg.sender][_spender] = _value;
   // emit Approval(msg.sender, _spender, _value);
    return true;
  }

  /**
   * @dev Function to check the amount of tokens that an owner allowed to a spender.
   * @param _owner address The address which owns the funds.
   * @param _spender address The address which will spend the funds.
   * @return A uint256 specifying the amount of tokens still available for the spender.
   */
  function allowance(address _owner, address _spender) public view returns (uint256) {
    return allowed[_owner][_spender];
  }

  /**
  * @dev Withdraw fund from account, reducing the total supply.
  *      Emits a {Transfer} event with `to` set to the zero address.
  *      Requirements
  *      - account cannot be the zero address.
  *      - account must have at least fund
  * @param account settlement bank address to be closed
  * @param amount the account balance of settlement bank
  */
  function withdraw(address account, uint256 amount) internal {
    balances[account] = balances[account].sub(amount, "ERC20: burn amount exceeds balance");
    balances[msg.sender] = balances[msg.sender].add(amount);
    totalSupply = totalSupply.sub(amount);
    require(account != address(0), "ERC20: burn from the zero address");
    emit Transfer(account, address(0), amount);
  }

  //event Transfer(address indexed from, address indexed to, uint256 value);
 // event Approval(address indexed owner, address indexed spender, uint256 value);
}

