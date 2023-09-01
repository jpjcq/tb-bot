import orderbookFile from "./orderbook.json";
import botconfig from "../../../botconfig.json";
import { ChainKey } from "../../../constants/types";
import { OrderbookType } from "../../../types/orderbookTypes";
import { writeFile } from "fs/promises";
import path from "path";
import pm2 from "pm2";
import getPairFromSymbols from "../../../utils/getPairFromSymbols";
import startTradingProcess from "./tradingProcess/startTradingProcess";

export default async function addOrder(
  tokenInSymbol: string,
  tokenOutSymbol: string,
  tokenAmount: number,
  price: number,
  feeAmountInput?: number
) {
  const selectedChain = botconfig.chain as ChainKey;
  const orderbook = orderbookFile as OrderbookType;
  const pairAddress = getPairFromSymbols(tokenInSymbol, tokenOutSymbol);

  if (!orderbook[selectedChain]) orderbook[selectedChain] = {};

  const chainOrderbook = orderbook[selectedChain];

  const buyOrder = {
    tokenInSymbol,
    tokenOutSymbol,
    tokenAmount: Number(tokenAmount),
    price: Number(price),
    feeAmountInput: Number(feeAmountInput),
  };

  chainOrderbook[`${selectedChain}${Object.keys(chainOrderbook).length + 1}`] =
    buyOrder;

  const orderbookJson = JSON.stringify(orderbook, null, 2);

  try {
    await writeFile(path.resolve(__dirname, "./orderbook.json"), orderbookJson);
    console.log(`[TCH4NG-BOT] Buy order successfully added:`);
    console.log(buyOrder);
  } catch (e) {
    console.log(`[TCH4NG-BOT] Error while writing order:`);
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
