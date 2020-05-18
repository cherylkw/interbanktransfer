# InterBank Transfer Payment Dapp

## About

Welcome to InterBank Transfer Payment Dapp! This dapp is built using Ethereum smart contracts in Solidity, OpenZeppelin and Truffle. The cryptocurrency **Gaia Token** using in this project is under ERC-20 standard.Its symbol is **GAT** and total supply is **1,000,000**.

InterBank Transfer Payment Dapp is a solution using cryptocurrency for the settlement and clearance of global InterBank transfers. As every country's central bank has different types of centralized electronic fund transfer systems. These systems are used by the country's banks to send messages to each other to facilitate the transfer of funds to their customers. Every bank holds a settlement account with the central bank, and money is either credited or debited in these accounts whenever there is a transfer message. Let's take alook at below scenario.

## Scenario

Bank A in US and Bank B in Finland , both have settlement accounts in Gaia Central Bank. Gaia Central Bank issue funds into their settlement accounts so that they can transfer funds whenever they recieve payment requests from their customers.

Each bank can create their customer accounts using their mobile numbers. So mobile number is the address of the customer accounts.
Each mobile number account can hold multiple bank accounts.

So Alice is the customer of Bank A and she wants to send a global payment $100 to Rob in Finaland Bank B. So when Bank B recieve the transfer message from Bank A, Bank B will use Alice's mobile number to check and validate her account in Bank A. Then Bank B will send(debit) $100 from it's settlement account under Gaia Central Bank to (credited) Bank A's settlement account. Payment transfer records will be stored and able to retrieve for reference.

## Features

**Central Bank (Contract Owner)**

- Enroll settlement bank account and it's role
- Issue funds to the settlement bank accounts
- Close settlement bank account and withdraw it's fund
- Top up an active settlement bank account
- Check settlement bank details and balance
- Live update and display Cetnral Bank balance, total issue fund and total withdraw fund

**Settlement Bank**

- Enroll it's customer mobile number account
- Close mobile number account
- View a mobile number account's bank lists
- Payment transfer to the mobile number account
- View payment transfer records under mobile number account
- Live update and display the login settlement account's balance

**Role assignment**

- Settlement bank role is enrolled once it's account is enrolled by central bank
- Central Bank can only access central bank's page
- Active settlement bank can only access settlement bank page
- Inactive/closed settle bank cannot access settlement bank page

## Contract

CentralBank
0x2C23103F9660B270BAcD984fBB5985404Ab41605
https://rinkeby.etherscan.io/address/0x2C23103F9660B270BAcD984fBB5985404Ab41605

## Youtube Demo

https://youtu.be/07u7FAIQlQw

## EthPM/Libraries/External

- Libraries of OpenZeppelin EthPM package : Safemath, Ownable, Pausable and SignerRole

## Design Pattern Decisions

https://github.com/cherylkw/interbanktransfer/blob/master/design_pattern_decisions.md

## Avoiding Common Attacks

https://github.com/cherylkw/interbanktransfer/blob/master/avoiding_common_attacks.md

## Pre-requisites and programs used versions:

- Truffle v5.1.7 (core: 5.1.7)
- Solidity v0.5.12 (solc-js)
- Node v10.17.0
- Web3.js v1.2.1
- npm 6.11.3
- Ganache CLI v6.7.0 (ganache-core: 2.8.0)
- MetaMask V7.7.3
- Openzeppelin

## Setting up the development environment

- Be sure to test the project in the standard environment suggested for the course. 
- Be sure to have installed npm or other pakage manager. The following guide will assume that npm has been installed.

1. Install Truffle: 
    >npm install -g truffle

2. Install ganache-cli:
    >npm install -g ganache-cli

3. Install MetaMask in your browser (https://metamask.io/)

## Installation/Running

**Launching local blockchain with Ganache**

First launch the local testing blockchain with Ganache.
Open up a new seperate terminal, and run the following command:

    >ganache-cli

New blockchain listens on **127.0.0.1:8545** by default
Copy the MNEMONIC seed to Metamask and connect Metamask as "LocalHost 8545" on the port listed above.

**In order to keep Ganache running, do not close this terminal**

**Clone the project**

Open up another new terminal, make sure the ganache-cli terminal is running at the same time.

1. git clone https://github.com/cherylkw/interbanktransfer.git

2. Move to centralbank directory
    >npm install

3. Install Openzeppelin
    >npm install @openzeppelin/contracts

4. Compile the contracts
    >truffle compile

5.  Migrate to ganache-cli
    >truffle migrate --reset

6. Run tests. (All tests should pass)
    >truffle test

7. Run Dapp
    >npm run dev

## Visiting an URL and interact with the application

- http://localhost:3000/
- This Dapp requires to interact with MetaMask. When the dapp loaded, MetaMask pop-up will appear if installed properly, requesting your approveal to allow InterBank Transfer Payment Dapp connect to MetaMask wallet. Please choose **Connect**.

### Using the dapp

**Assigning address and role**

- Owner is default as Gaia Central Bank, initally it has already 1,000,000 tokens in the account balance.
- Pick 2 addresses in ganache, import to MetaMask. Then use these 2 addresses as 2 settlement banks to interact with this Dapp
- Choose the Owner account in MetaMask, then click **Central Bank**. It will directly you to the **central bank page**

**Enroll and issue fund to settlement bank**

Under the **Create Settlement Bank Account** section:

1. Enter an address of one of the 2 accounts imported before as new settlement bank address
2. Issue 100 tokens
3. Enter bank name

- Repeat the above steps to create as many settlement bank as you want. In testing case, 2 banks will be created to test functions.
- Once the settlement accounts are enrolled. Try all the functions in **central bank page**

**Transfer payment between settlement bank**

After created settlebank account, open MetaMask, choose the account( e.g. **Bank A**) which is enrolled as settlement account. Then click **settlement bank** button

1. Enroll mobile number account

    Under **Create Mobile Client Account** section:

        - Enter a mobile number to create a customer account under the login bank, e.g. **123456789**

2. Switch to another bank (**Bank B**). Open MetaMask, choose the account which is enrolled as settlement account. Then click **settlement bank** button

    Under **Search Mobile Number Account** section:

    - Enter mobile number, a bank list which registered under this mobile number should appeared, in this case, **Bank A** address displayed. Copy the address for Bank A

    Suppose **Bank B** receive a payment request message from Bank A of the mobile number account **123456789**, wants to send 100 to a **Bank B** customer.

    Under **Transfer Fund To Recipiant's Settlement Bank Account** section:

        - Enter mobile number account : 123456789
        - Recipiant bank address : Bank A address
        - fund to be transferred : 100

    Under **View Mobile Number Account Transcation Records** section

        - Enter mobile number **123456789**, the transcation record should display




