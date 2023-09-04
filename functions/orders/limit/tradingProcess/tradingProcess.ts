import pm2 from "pm2";
import { UniswapV3Pool__factory } from "../../../../types/ethers-contracts";
import { OrderbookType } from "../../../../types/orderbookTypes";
import getAmountsAndTickers from "../../../../utils/getAmountsAndTickers";
import getProvider from "../../../../utils/getProvider";
import getQuoteCurrency from "../../../../utils/getQuoteCurrency";
import orderbookFile from "../orderbook.json";
import buyAtMinimumPrice from "./buyAtMinimumPrice";
import sellAtMinimumPrice from "./sellAtMinimumPrice";

(async function tradingProcess() {
  const pairAddress = process.argv[2];
  const processName = pairAddress;
  const provider = getProvider();
  const orderbook = orderbookFile as OrderbookType;

  const poolContract = UniswapV3Pool__factory.connect(pairAddress, provider);

  const quoteToken = await getQuoteCurrency(pairAddress, provider);

  const swapFilter =
    poolContract.filters[
      "Swap(address,address,int256,int256,uint160,uint128,int24)"
    ];

  console.log("launching..");

  await poolContract.addListener(
    swapFilter,
    async function (_, __, amount0: bigint, amount1: bigint) {
      console.log("swap occured");
      // Check if there isn't any order
      if (
        !orderbook[pairAddress] ||
        (!orderbook[pairAddress].BUY && !orderbook[pairAddress].SELL) ||
        (Object.keys(orderbook[pairAddress].BUY).length === 0 &&
          Object.keys(orderbook[pairAddress].SELL).length === 0)
      ) {
        console.log(
          `[TB-BOT] No order has been found for the pair ${pairAddress}`
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
          });

          pm2.disconnect();
        });

        return;
      }

      const { baseAmount, quoteAmount } = await getAmountsAndTickers(
        amount0,
        amount1,
        pairAddress,
        quoteToken,
        provider
      );

      const priceBigInt = (quoteAmount * BigInt(10 ** 18)) / baseAmount;

      const price = Number(
        parseFloat((Number(priceBigInt) / 10 ** 18).toFixed(18)).toFixed(6)
      );

      // Verify if there is any order to pass
      const buyOrderbook = Object.entries(orderbook[pairAddress].BUY);
      const sellOrderbook = Object.entries(orderbook[pairAddress].SELL);

      buyOrderbook.forEach(async function ([orderId, order]) {
        if (order.price <= price) {
          try {
            await buyAtMinimumPrice(
              order.tokenIn,
              order.tokenOut,
              order.tokenAmount,
              order.price
            );
            delete orderbook[pairAddress].BUY[orderId];
            if (Object.keys(orderbook[pairAddress].BUY).length === 0)
              delete orderbook[pairAddress].BUY;
            console.log(
              `[TB-BOT] Buy order ${orderId} passed! At price ${price}`
            );
          } catch (e) {
            console.log(
              `[TB-BOT] Order ${orderId} failed to pass at ${price}. Re trying at next price.`
            );
          }
        }
      });

      sellOrderbook.forEach(async function ([orderId, order]) {
        if (order.price >= price) {
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
            console.log(
              `[TB-BOT] Sell order ${orderId} passed! At price ${price}`
            );
          } catch (e) {
            console.log(
              `[TB-BOT] Order ${orderId} failed to pass at ${price}. Re trying at next price.`
            );
          }
        }
      });
    }
  );
})();
