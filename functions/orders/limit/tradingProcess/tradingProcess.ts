import { UniswapV3Pool__factory } from "../../../../types/ethers-contracts";
import { Order, OrderbookType } from "../../../../types/orderbookTypes";
import getAmountsAndTickers from "../../../../utils/getAmountsAndTickers";
import getProvider from "../../../../utils/getProvider";
import getQuoteCurrency from "../../../../utils/getQuoteCurrency";
import botconfig from "../../../../botconfig.json";
import orderbookFile from "../orderbook.json";
//test
import { appendFile } from "fs/promises";
import path from "path";
import pm2 from "pm2";

(async function tradingProcess() {
  const pairAddress = process.argv[2];
  const processName = process.argv[3];
  const provider = getProvider();
  const selectedChain = botconfig.chain;
  const orderbook = orderbookFile as OrderbookType;
  const poolContract = UniswapV3Pool__factory.connect(pairAddress, provider);
  const quoteToken = await getQuoteCurrency(pairAddress, provider);
  const swapFilter =
    poolContract.filters[
      "Swap(address,address,int256,int256,uint160,uint128,int24)"
    ];

  await poolContract.addListener(
    swapFilter,
    async function (_, __, amount0: bigint, amount1: bigint) {
      // Check if there isn't any order
      if (
        !orderbook[selectedChain] ||
        Object.keys(orderbook[selectedChain]).length === 0
      ) {
        console.log(
          `[TCH4NG-BOT] No order has been found for the pair ${pairAddress} on ${selectedChain} chain`
        );

        pm2.connect(function (err) {
          if (err) {
            console.log(err);
            process.exit(2);
          }

          pm2.delete(processName, function (err) {
            if (err) {
              console.log(err);
              process.exit(2);
            }
          });

          pm2.disconnect();
        });

        return;
      }

       

      const { baseAmount, quoteAmount, baseTokenName, quoteTicker } =
        await getAmountsAndTickers(
          amount0,
          amount1,
          pairAddress,
          quoteToken,
          provider
        );

      const priceBigInt = (quoteAmount * BigInt(10 ** 18)) / baseAmount;

      const priceDecimal = parseFloat(
        (Number(priceBigInt) / 10 ** 18).toFixed(18)
      ).toFixed(6);



      // for test purpose only
      // logs and prints
      const event = `[${baseTokenName} price]: ${priceDecimal} $${quoteTicker}\n${processName} ${pairAddress}`;

      console.log(event);
      await appendFile(
        path.resolve(__dirname, "../../../logs/logs.txt"),
        event + "\n"
      );
    }
  );
})();
