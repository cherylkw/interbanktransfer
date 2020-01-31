**Fail early and fail loud**
This pattern checks the condition required for execution as early as possible in the function body and throws an exception if the condition is not met. This reduces unnecessary code execution in the event that an exception will be thrown.

e.g. Checking a user has enough funds before withdraw/issue/transfer.

**Restricting Access**
This pattern is useful for allowing only designated users, or other contracts to access administrative methods, such as changing ownership of a contract, implementing an upgrade or stopping the contract. And only designated users, or other contracts to access settlement banks method suching as creating customer mobile number accounts, transfer payment to registered banks, view payment records.

e.g. Restrict function access so that only the owner is permitted to issue and withdraw funds, setting and manage settlement bank accounts

Library used:Ownable, SignerRole from OpenZeppelin

**Pull over Push Payments (a.k.a Withdrawal Pattern)**
This pattern protects against re-entrancy and denial of service attacks and used extensively in this dapp. Using this pattern, the internal contract state is updated BEFORE making transfers.

**Circuit Breaker**
This design pattern allows contract functionality to be stopped. This is desirable in situations where a bug has been detected in a live contract. Freezing the contract would be beneficial for reducing harm before a fix can be implemented.
Circuit breaker contracts can be set up to permit certain functions in certain situations. 

e.g. when this dapp is stopped, issue funds, transfer funds and withdraw funds cannot be processed.

* please refer to one of the test case

Library used: Pausable.sol from OpenZeppelin