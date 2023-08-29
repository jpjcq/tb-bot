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

program.name("tch4ng-bot").version("1.0.0").description("Crypto utilities bot");

// Token pre defined functions
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
        `[TCH4NG-BOT] Please choose a flag to choose the way you want to swap`
      );
    }
  });

program
  .command("getquote <tokenIn> <tokenOut> <tokenAmount> [feeAmount]")
  .action(function (tokenIn, tokenOut, tokenAmount, feeAmount) {
    getQuoteFromAddresses(tokenIn, tokenOut, tokenAmount, feeAmount, true);
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

program.command("getaccountaddress").action(function () {
  getAccountAddress();
});

program.command("getprivatekey").action(function () {
  getPrivateKey();
});

// Utils functions
program.command("getbalance").action(function () {
  getBalance();
});

program.command("addtoken <address>").action(function (address) {
  addToken(address);
});

program.parse();
