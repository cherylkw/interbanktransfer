**Integer Over/Underflow**
This pattern checks if the operation has overflow/underflow and discards if it happened in a way that the transactions does not run/execute. Occurs when trying to set a value larger than the maximum allowable for the integer type e.g. setting a value greater than 4294967296 (2^32) for a uint32; It will overflow and restart counting at 0.

Library Used : SafeMath from OpenZeppelin

**Denial of Service**
Similar to a re-entrancy attack, a DOS attack prevents a function from successfully executing thus blocking the intended transactions from succeeding. Updating the state of the contract BEFORE transfering funds.

**Access right**
The execution of contract functions is only available to those who have rights. For instance, only central bank can enroll a settlement bank,issue fund to the banks, close banks. Only settlement bank can create customer mobile number account,transfer payment to customer's registered bank. Those implementations were implemented on modifiers: onlyOwner and onlySigner.
