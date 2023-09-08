import { formatUnits } from "ethers";
import pm2 from "pm2";
import { writeFile } from "fs/promises";
import path from "path";
import { UniswapV3Pool__factory } from "../../../../types/ethers-contracts";
import { OrderbookType } from "../../../../types/orderbookTypes";
import getProvider from "../../../../utils/getProvider";
import getQuoteCurrency from "../../../../utils/getQuoteCurrency";
import orderbookFile from "../../../../orderbook.json";
import buyAtMaximumPrice from "./buyAtMaximumPrice";
import sellAtMinimumPrice from "./sellAtMinimumPrice";
import getAbs from "../../../../utils/getAbs";
import getTokenInstance from "../../../swap/getTokenInstance";
import getBaseAndQuote from "../../getBaseAndQuote";

(async function tradingProcess() {
  const pairAddress = process.argv[2];
  const processName = pairAddress;
  const provider = getProvider();
  const orderbook = orderbookFile as OrderbookType;

  const poolContract = UniswapV3Pool__factory.connect(pairAddress, provider);

  const token0 = await getTokenInstance(await poolContract.token0());
  const token1 = await getTokenInstance(await poolContract.token1());

  const quoteToken = await getQuoteCurrency(pairAddress, provider);

  const swapFilter =
    poolContract.filters[
      "Swap(address,address,int256,int256,uint160,uint128,int24)"
    ];

  console.log(`[TB-BOT] Trading process starting for pair ${pairAddress}`);

  interface SwapEvent {
    amount0: bigint;
    amount1: bigint;
  }
  const eventQueue: SwapEvent[] = [];
  let isProcessing = false;

  const processQueue = async () => {
    if (isProcessing) return;
    async function processEvents(event: SwapEvent) {
      const { amount0, amount1 } = event;

      // Check if there isn't any order
      if (
        !orderbook[pairAddress] ||
        (!orderbook[pairAddress].BUY && !orderbook[pairAddress].SELL) ||
        (orderbook[pairAddress].BUY &&
          Object.keys(orderbook[pairAddress].BUY).length === 0) ||
        (orderbook[pairAddress].SELL &&
          Object.keys(orderbook[pairAddress].SELL).length === 0)
      ) {
        console.log(
          `[TB-BOT] No order has been found for the pair ${pairAddress}. Closing process`
        );

        // No order found, closing process
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
            console.log(`[TB-BOT] Process ${pairAddress} closed.`);
            pm2.disconnect();
          });
        });

        return;
      }

      const absAmount0 = BigInt(getAbs(amount0)); // Assurez-vous que getAbs retourne une chaîne ou un nombre qui peut être converti en BigInt
      const absAmount1 = BigInt(getAbs(amount1)); // Idem

      const { quoteCurrency } = getBaseAndQuote(token0, token1);

      const baseAmount = quoteToken === 0 ? absAmount1 : absAmount0;
      const quoteAmount = quoteToken === 0 ? absAmount0 : absAmount1;

      if (baseAmount === BigInt(0)) {
        throw new Error("Division by zero");
      }

      const priceBigInt = (quoteAmount * BigInt(10 ** 18)) / baseAmount;

      const price = Number(formatUnits(priceBigInt, quoteCurrency.decimals));

      console.log(`[TB-BOT] New price: ${price}`);

      if (orderbook[pairAddress].BUY) {
        const buyOrderbook = Object.entries(orderbook[pairAddress].BUY);
        buyOrderbook.forEach(async function ([orderId, order]) {
          if (price <= order.price) {
            try {
              await buyAtMaximumPrice(
                order.tokenIn,
                order.tokenOut,
                order.tokenAmount,
                order.price
              );

              delete orderbook[pairAddress].BUY[orderId];

              if (Object.keys(orderbook[pairAddress].BUY).length === 0)
                delete orderbook[pairAddress].BUY;

              if (Object.keys(orderbook[pairAddress]).length === 0)
                delete orderbook[pairAddress];

              console.log(
                `[TB-BOT] Buy order ${orderId} passed! At price ${price}`
              );

              const orderbookJson = JSON.stringify(orderbook, null, 2);

              try {
                await writeFile(
                  path.resolve(__dirname, "../../../../orderbook.json"),
                  orderbookJson
                );
                console.log(`[TB-BOT] Buy order successfully removed:`);
                console.log(orderId);
              } catch (e) {
                console.log(
                  `[TB-BOT] Error while writing new orderbook.json file:`
                );
                console.log(e);
              }
            } catch (e) {
              console.log(
                `[TB-BOT] Order ${orderId}[buy@${order.price}] failed to pass at ${price}`
              );
              console.log(`[TB-BOT] Error:`);
              console.log(e);
            }
          } else {
            console.log(
              `[TB-BOT] Order ${orderId}[buy@${order.price}] failed to pass at ${price}`
            );
          }
        });
      }

      if (orderbook[pairAddress].SELL) {
        const sellOrderbook = Object.entries(orderbook[pairAddress].SELL);
        sellOrderbook.forEach(async function ([orderId, order]) {
          if (price >= order.price) {
            try {
              await sellAtMinimumPrice(
                order.tokenIn,
                order.tokenOut,
                order.tokenAmount,
                order.price
              );

              delete orderbook[pairAddress].SELL[orderId];

              if (Object.keys(orderbook[pairAddress].SELL).length === 0)
                delete orderbook[pairAddress].SELL;

              if (Object.keys(orderbook[pairAddress]).length === 0)
                delete orderbook[pairAddress];

              console.log(
                `[TB-BOT] Sell order ${orderId} passed! At price ${price}`
              );

              const orderbookJson = JSON.stringify(orderbook, null, 2);

              try {
                await writeFile(
                  path.resolve(__dirname, "../../../../orderbook.json"),
                  orderbookJson
                );
                console.log(`[TB-BOT] Sell order successfully removed:`);
                console.log(orderId);
              } catch (e) {
                console.log(
                  `[TB-BOT] Error while writing new orderbook.json file:`
                );
                console.log(e);
              }
            } catch (e) {
              console.log(
                `[TB-BOT] Order ${orderId}[sell@${order.price}] failed to pass at ${price}`
              );
              console.log(`[TB-BOT] Error:`);
              console.log(e);
            }
          } else {
            console.log(
              `[TB-BOT] Order ${orderId}[sell@${order.price}] failed to pass at ${price}`
            );
          }
        });
      }
    }
    isProcessing = true;

    while (eventQueue.length > 0) {
      const event = eventQueue.shift();
      if (event) await processEvents(event);
    }

    isProcessing = false;
  };

  await poolContract.addListener(
    swapFilter,
    async function (_, __, amount0: bigint, amount1: bigint) {
      console.log("[TB-BOT] New swap occured");
      eventQueue.push({ amount0, amount1 });
      processQueue();
    }
  );
})();
