import orderbookFile from "./orderbook.json";
import botconfig from "../../../botconfig.json";
import { ChainKey } from "../../../constants/types";
import { OrderbookType } from "../../../types/orderbookTypes";
import { writeFile } from "fs/promises";
import path from "path";
import pm2 from "pm2";
import getPairFromSymbols from "../../../utils/getPairFromSymbols";
import startTradingProcess from "./tradingProcess/startTradingProcess";
import getBaseAndQuote from "../getBaseAndQuote";
import getTokenFromSymbol from "../../../utils/getTokenFromSymbol";
import { Erc20__factory } from "../../../types/ethers-contracts";
import getProvider from "../../../utils/getProvider";
import { formatUnits } from "ethers";

export default async function sellLimit(
  token1SymbolInput: string,
  token2SymbolInput: string,
  tokenAmount: number,
  price: number,
  feeAmountInput?: number
) {
  const provider = getProvider();
  const wallet = botconfig.accountAddress;
  const orderbook = orderbookFile as OrderbookType;

  const token1Symbol = token1SymbolInput.toLocaleUpperCase();
  const token2Symbol = token2SymbolInput.toLocaleUpperCase();

  const token1 = getTokenFromSymbol(token1Symbol)!;
  const token2 = getTokenFromSymbol(token2Symbol)!;

  const pairAddress = getPairFromSymbols(token1Symbol, token2Symbol);

  const { baseToken, quoteCurrency } = getBaseAndQuote(token1, token2);

  // sell: brings base to get quote
  const tokenIn = quoteCurrency;

  // Checking tokenIn balance
  const tokenInBalance = await Erc20__factory.connect(
    tokenIn.address,
    provider
  ).balanceOf(wallet);

  // Checking amount in orderbook's open orders
  let openOrdersAmount = 0;
  if (orderbook[pairAddress]) {
    if (orderbook[pairAddress].SELL) {
      Object.entries(orderbook[pairAddress].SELL).forEach(function ([
        _,
        order,
      ]) {
        const amountInOrder = order.tokenAmount;
        openOrdersAmount += amountInOrder;
      });
    }
  }

  const availableBalance =
    Number(formatUnits(tokenInBalance, tokenIn.decimals)) - openOrdersAmount;

  if (tokenAmount > availableBalance) {
    console.log(
      `[TB-BOT] Insufficient ${tokenIn.symbol} balance. You're trying to swap ${tokenAmount} ${tokenIn.symbol} but you only have ${availableBalance} (${openOrdersAmount} ${tokenIn.symbol} in orderbook)`
    );
    return;
  }

  if (!orderbook[pairAddress]) orderbook[pairAddress] = {};
  if (!orderbook[pairAddress].SELL) orderbook[pairAddress].SELL = {};

  const pairOrderbook = orderbook[pairAddress];

  const sellOrder = {
    tokenIn: baseToken.symbol ?? "empty",
    tokenOut: quoteCurrency.symbol ?? "empty",
    tokenAmount: Number(tokenAmount),
    price: Number(price),
    feeAmountInput: Number(feeAmountInput),
  };

  pairOrderbook.SELL[
    `SELL${baseToken.symbol}${quoteCurrency.symbol}${
      Object.keys(pairOrderbook.SELL).length + 1
    }`
  ] = sellOrder;

  const orderbookJson = JSON.stringify(orderbook, null, 2);

  try {
    await writeFile(path.resolve(__dirname, "./orderbook.json"), orderbookJson);
    console.log(`[TB-BOT] Sell order successfully added:`);
    console.log(sellOrder);
  } catch (e) {
    console.log(`[TB-BOT] Error while writing order:`);
    console.log(e);
  }

  // // start a new process only if a process for this pair isn't already running
  // pm2.connect(function (err) {
  //   if (err) {
  //     console.log(err);
  //     process.exit(2);
  //   }

  //   pm2.list(function (err, list) {
  //     if (err) {
  //       console.error(err);
  //       return pm2.disconnect();
  //     }

  //     list.forEach((proc) => {
  //       if (proc.name === pairAddress) {
  //         pm2.disconnect();
  //         return;
  //       }
  //     });
  //   });

  //   startTradingProcess(pairAddress);

  //   pm2.disconnect();
  // });
}
