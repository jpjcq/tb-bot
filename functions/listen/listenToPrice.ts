import { JsonRpcProvider } from "ethers";
import { UniswapV3Pool__factory } from "../../types/ethers-contracts";
import getQuoteCurrency from "../../utils/getQuoteCurrency";
import getAmountsAndTicker from "../../utils/getAmountsAndTickers";
import { appendFile } from "fs/promises";
import path from "path";

/**
 * Logs the price of a token according to it's pair address,
 * @param {string} pairAddress uniswap pair address
 * @param provider ethers provider
 */
export default async function listenToPrice(
  pairAddress: string,
  provider: JsonRpcProvider
): Promise<void> {
  const arbUsdcPoolContract = UniswapV3Pool__factory.connect(
    pairAddress,
    provider
  );

  const quoteToken = await getQuoteCurrency(pairAddress, provider);

  const swapFilter =
    arbUsdcPoolContract.filters[
      "Swap(address,address,int256,int256,uint160,uint128,int24)"
    ];

  await arbUsdcPoolContract.addListener(
    swapFilter,
    async function (_, __, amount0: bigint, amount1: bigint) {
      const { baseAmount, quoteAmount, baseTokenName, quoteTicker } =
        await getAmountsAndTicker(
          amount0,
          amount1,
          pairAddress,
          quoteToken,
          provider
        );

      const priceBigInt = (quoteAmount * BigInt(10 ** 18)) / baseAmount;

      const priceDecimal = parseFloat(
        (Number(priceBigInt) / 10 ** 18).toFixed(18)
      );

      // VERIFY ORDERBOOK TO GET CORRESPONDING ORDER TO EXECUTE

      // logs and prints
      const event = `[${baseTokenName} price]: ${priceDecimal.toFixed(
        4
      )} $${quoteTicker}\n`;

      console.log(event);
      await appendFile(
        path.resolve(__dirname, "../../logs/logs.txt"),
        event + "\n"
      );
    }
  );
}
