# Decentralized Bidding 

A decentralized Bidding system based on [Ethereum blockchain](https://ethereum.org/dapps/) technology.

> This code was cloned from https://github.com/akadeach/bidApp.git.

## System Workflow

A brief explanation on the basic workflow of the application.

- Admin will create a Bidding instance by launching/deploying the system in a blockchain network (EVM), then create an auction instance and start the auction with the details of the auction filled in (including candidates for bidders to bid).
- Then the likely bidders connect to the same blockchain network register to become a bidder. Once the users successfully register, their respective details are sent/displayed in the admins' panel (i.e. verification page).
- The admin then will check if the registration information (blockchain account address, name, and phone number) is valid and matches with his record. If yes, then the admin approves the registered user making them eligible to take part and cast their respective bid in the auction.
- The registered user (bidder) following the approval from the admin casts their bid to the candidate of interest (from the Bidding page).
- After some time, depending on the scale of the auction the admin ends the auction. As that happens the Bidding is closed and the results are displayed announcing the winner at the top of the results page.

---

## Setting up the development environment

### Requirements

- [Node.js](https://nodejs.org)
- [Truffle](https://www.trufflesuite.com/truffle)
- [Ganache](https://github.com/trufflesuite/ganache)
- [Metamask](https://metamask.io/) (Browser Extension)

#### Getting the requirements

1. Download and install **NodeJS**

   Download and install NodeJS from [here](https://nodejs.org/en/download/ "Go to official NodeJS download page.").

1. Install **truffle** using node packager manager (npm)

   ```shell
   npm install -g truffle
   ```

1. Install **metamask** browser extension

   Download and install metamask from [here](https://metamask.io/download "Go to official metamask download page.").

### Configuring the project for development

1. Clone this repository

   ```shell
   git clone https://github.com/akadeach/bidApp.git
   cd Bidding
   ```

2. Run local Ethereum blockchain, e.g., Ganache.

3. Configure metamask on the browser with the following details

   New RPC URL: `http://127.0.0.1:7545` 

   Chain ID: `1337`

4. Import account(s) using private keys from Ganache to the metamask extension on the browser

5. Deploy smart contract to the (local) blockchain network

   ```shell
   # on the Bidding directory
   truffle migrate
   ```

   > Note: Use `truffle migrate --reset` for re-deployments

6. Launch the development server (frontend)

   ```shell
   cd client
   npm install
   npm start
   ```
"# utcc_fintech" 
"# bidApp" 
"# bidApp" 
"# bidApp" 
