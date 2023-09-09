# TB Bot - a utility bot for cryptocurrency operations.

> :warning: **Caution**: This project is still under development. Use it at your own risk.

## Features

- Monitor transfers for specific cryptocurrencies
- Buy or sell at market prices
- Place limit orders for buying or selling

## Requirements

- Global installation of `pm2`, `ts-node`, and `TypeScript`
- A blockchain provider like Alchemy or Infura for the desired chains. Currently supported chains: Ethereum, Goerli-Ethereum, Arbitrum, Goerli-Arbitrum
- An Ethereum account (both public address and private key are required)

## Setup

1. If not already installed, install `ts-node`, `TypeScript`, and `pm2` globally:
   ```bash
   npm i -g ts-node typescript pm2
   ```
2. Clone the project:
   ```bash
   git clone https://github.com/jpjcq/tb-bot
   ```
3. Navigate to the `tb-bot` directory:
   ```bash
   cd tb-bot
   ```
4. Install the dependencies:
   ```bash
   npm i
   ```

After successful installation, you can configure the bot by either directly editing the `botconfig.json` file with your wallet credentials and provider endpoints, or by using the command `npx tb setaccount <your-wallet-address>`. All available commands can be viewed by running `npx tb --help`.

To make the bot globally available, run `npm link` in the directory. This will allow you to run `tb getchain` instead of `npx tb getchain`.

## Usage

> :exclamation: **Important**: Ensure TB Bot is configured for the correct blockchain **before** running any command. To verify, run `npx tb getchain`.

- **Token Management**:

  - Add tokens to your list by running `npx tb addtoken <token-contract-address>`.
  - To verify that your tokens have been added, run `npx tb gettokens`. To filter by chain, use `npx tb gettokens <chain-name>`.

- **Event Listening**:

  - Run `npx tb listen (--swap or --transfer) <token-contract-address>` to monitor desired events.

- **Market Buy**:

  - Run `npx tb buymarket weth arb 0.1` to buy ARB using 0.1 WETH. A prompt will ask for your confirmation.

- **Limit Orders**:
  - Run `npx tb buylimit weth arb 0.1 0.0005` to place a limit order. TB Bot will initiate a child process using `pm2` to monitor the specified trading pair.

### Logs

When placing a limit order, `pm2` will initiate a child process named after the trading pair to monitor and decide whether to execute the buy order. Logs will be stored in the `logs` folder, named after the trading pair with a `.log` extension. Live logs can also be viewed using `pm2 logs`.

### Quote currencies

Prices and buy/sell operations are always based on "quote currencies," similar to how USD is used when buying or selling an item. Quote currencies will default to stablecoins if available, or to WETH (Wrapped Ether) or any future gas tokens if no stablecoin is involved.
Errors will be thrown under the following conditions:

- Both currencies involved are stablecoins. In this case, the bot will prompt you to use the swap function instead (refer to --help for more details).
- Neither of the currencies involved is a stablecoin or a gas token like WETH.
  When trading between a stablecoin and a gas token, the stablecoin will serve as the quote currency.
