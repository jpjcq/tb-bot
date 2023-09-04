#!/usr/bin/env ts-node

import { program } from "commander";
import arbListeners from "./functions/listen/tokenListeners/arbListeners";
import tokenListeners from "./functions/listen/tokenListeners/tokenListeners";
import swapFromTokenAddresses from "./functions/swap/swapFromTokenAddresses";
import getBalance from "./functions/getBalance";
import setChain from "./functions/botconfig/set/setChain";
import setAccountAddress from "./functions/botconfig/set/setAccountAddress";
import setPrivateKey from "./functions/botconfig/set/setPrivateKey";
import getChain from "./functions/botconfig/get/getChain";
import getAccountAddress from "./functions/botconfig/get/getAccountAddress";
import getPrivateKey from "./functions/botconfig/get/getPrivateKey";
import getQuoteFromAddresses from "./functions/getQuoteFromAddresses";
import getAvailableChains from "./functions/botconfig/get/getAvailableChains";
import addToken from "./functions/tokens/addToken";
import swapFromSymbols from "./functions/swap/swapFromSymbols";
import { getAllTokens, getTokensByChain } from "./functions/tokens/getTokens";
import buyLimit from "./functions/orders/limit/buyLimit";
import removeOrder from "./functions/orders/limit/removeOrder";
import buyMarket from "./functions/orders/market/buyMarket";
import sellMarket from "./functions/orders/market/sellMarket";
import sellLimit from "./functions/orders/limit/sellLimit";

program.name("tb-bot").version("1.0.0").description("Crypto utilities bot");

// Token pre defined functions (TODO: delete)
program
  .command("listenarb")
  .option("-t --transfer", "Listen to token transfer listener")
  .option("-s --swap", "Listen to token price listener")
  .action(function (options) {
    arbListeners(options).catch((e) => {
      console.log(e);
      process.exit(1);
    });
  });

// Main functions
program
  .command("listen <token>")
  .option("-t --transfer", "token transfer listener")
  .option("-s --swap", "token price listener")
  .action(function (token, options) {
    tokenListeners(token, options).catch((e) => {
      console.log(e);
      process.exit(1);
    });
  });

program
  .command("swap <tokenIn> <tokenOut> <tokenAmount> [feeAmount]")
  .option("-a --address", "swap from addresses")
  .option("-s --symbol", "swap from symbols")
  .action(function (tokenIn, tokenOut, tokenAmount, feeAmount, options) {
    if (options.address) {
      swapFromTokenAddresses(tokenIn, tokenOut, tokenAmount, feeAmount);
    } else if (options.symbol) {
      swapFromSymbols(tokenIn, tokenOut, tokenAmount, feeAmount);
    } else {
      console.log(
        `[TB-BOT] Please choose a flag to choose the way you want to swap`
      );
    }
  });

program
  .command("getquote <tokenIn> <tokenOut> <tokenAmount> [feeAmount]")
  .action(function (tokenIn, tokenOut, tokenAmount, feeAmount) {
    getQuoteFromAddresses(tokenIn, tokenOut, tokenAmount, feeAmount, true);
  });

// Limit orders functions
program
  .command("buymarket <token1> <token2> <tokenAmount> [feeAmount]")
  .action(function (token1, token2, tokenAmount, feeAmount) {
    buyMarket(token1, token2, tokenAmount, feeAmount);
  });

program
  .command("sellmarket <token1> <token2> <tokenAmount> [feeAmount]")
  .action(function (token1, token2, tokenAmount, feeAmount) {
    sellMarket(token1, token2, tokenAmount, feeAmount);
  });

program
  .command(
    "buylimit <tokenInSymbol> <tokenOutSymbol> <tokenAmount> <price> [feeAmount]"
  )
  .action(function (
    tokenInSymbol,
    tokenOutSymbol,
    tokenAmount,
    price,
    feeAmount
  ) {
    buyLimit(tokenInSymbol, tokenOutSymbol, tokenAmount, price, feeAmount);
  });

program
  .command(
    "selllimit <tokenInSymbol> <tokenOutSymbol> <tokenAmount> <price> [feeAmount]"
  )
  .action(function (
    tokenInSymbol,
    tokenOutSymbol,
    tokenAmount,
    price,
    feeAmount
  ) {
    sellLimit(tokenInSymbol, tokenOutSymbol, tokenAmount, price, feeAmount);
  });

program.command("removeorder <orderId>").action(function (orderId) {
  removeOrder(orderId);
});

// Botconfig functions
program.command("setchain <chain>").action(function (chain) {
  setChain(chain);
});

program.command("setaccountaddress <address>").action(function (address) {
  setAccountAddress(address);
});

program.command("setprivatekey <key>").action(function (key) {
  setPrivateKey(key);
});

program.command("getchain").action(function () {
  getChain();
});

program.command("getavailablechains").action(function () {
  getAvailableChains();
});

program.command("getaccount").action(function () {
  getAccountAddress();
});

program.command("getprivatekey").action(function () {
  getPrivateKey();
});

// Utils functions
program.command("getbalance").action(function () {
  getBalance();
});

// Tokens functions
program.command("addtoken <address>").action(function (address) {
  addToken(address);
});

program.command("gettokens [chain]").action(function (chain) {
  if (chain) {
    getTokensByChain(chain);
  } else {
    getAllTokens();
  }
});

program.parse();
