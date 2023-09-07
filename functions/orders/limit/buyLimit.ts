import { formatUnits } from "ethers";
import { writeFile } from "fs/promises";
import path from "path";
import orderbookFile from "./orderbook.json";
import botconfig from "../../../botconfig.json";
import { OrderbookType } from "../../../types/orderbookTypes";
import getPairFromSymbols from "../../../utils/getPairFromSymbols";
import startTradingProcess from "./tradingProcess/startTradingProcess";
import getBaseAndQuote from "../getBaseAndQuote";
import getTokenFromSymbol from "../../../utils/getTokenFromSymbol";
import { Erc20__factory } from "../../../types/ethers-contracts";
import getProvider from "../../../utils/getProvider";

export default async function buyLimit(
  token1SymbolInput: string,
  token2SymbolInput: string,
  tokenAmount: number,
  price: number,
  feeAmountInput?: number
) {
  const provider = getProvider();
  const wallet = botconfig.accountAddress;
  const orderbook = orderbookFile as OrderbookType;

  let feeAmount = feeAmountInput ?? botconfig.swapOptions.defaultFeeAmount;

  const token1Symbol = token1SymbolInput.toLocaleUpperCase();
  const token2Symbol = token2SymbolInput.toLocaleUpperCase();

  const token1 = getTokenFromSymbol(token1Symbol)!;
  const token2 = getTokenFromSymbol(token2Symbol)!;

  const pairAddress = getPairFromSymbols(token1Symbol, token2Symbol, feeAmount);

  const { baseToken, quoteCurrency } = getBaseAndQuote(token1, token2);

  // buy: brings quote to get base
  const tokenIn = quoteCurrency;

  // Checking tokenIn balance
  const tokenInBalance = await Erc20__factory.connect(
    tokenIn.address,
    provider
  ).balanceOf(wallet);

  // Checking amount in orderbook's open orders
  let openOrdersAmount = 0;
  if (orderbook[pairAddress]) {
    if (orderbook[pairAddress].BUY) {
      Object.entries(orderbook[pairAddress].BUY).forEach(function ([_, order]) {
        const amountInOrder = order.tokenAmount;
        openOrdersAmount += amountInOrder;
      });
    }
  }

  const availableBalance =
    Number(formatUnits(tokenInBalance, tokenIn.decimals)) - openOrdersAmount;

  if (tokenAmount > availableBalance) {
    console.log(
      `[TB-BOT] Insufficient ${tokenIn.symbol} balance. You're trying to trade ${tokenAmount} ${tokenIn.symbol} but you only have ${availableBalance} (${openOrdersAmount} ${tokenIn.symbol} in orderbook)`
    );
    return;
  }

  if (!orderbook[pairAddress]) orderbook[pairAddress] = {};
  if (!orderbook[pairAddress].BUY) orderbook[pairAddress].BUY = {};

  const pairOrderbook = orderbook[pairAddress];

  const buyOrder = {
    tokenIn: quoteCurrency.symbol ?? "empty",
    tokenOut: baseToken.symbol ?? "empty",
    tokenAmount: Number(tokenAmount),
    price: Number(price),
    feeAmountInput: Number(feeAmount),
  };

  pairOrderbook.BUY[
    `BUY${baseToken.symbol}${quoteCurrency.symbol}${
      Object.keys(pairOrderbook.BUY).length + 1
    }`
  ] = buyOrder;

  const orderbookJson = JSON.stringify(orderbook, null, 2);

  try {
    await writeFile(path.resolve(__dirname, "./orderbook.json"), orderbookJson);
    console.log(`[TB-BOT] Buy order successfully added:`);
    console.log(buyOrder);
  } catch (e) {
    console.log(`[TB-BOT] Error while writing order:`);
    console.log(e);
  }

  // start a new process only if a process for this pair isn't already running
  startTradingProcess(pairAddress);
}
