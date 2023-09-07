import { JsonRpcProvider } from "ethers";
import {
  Erc20__factory,
  UniswapV3Pool__factory,
} from "../types/ethers-contracts";
import { STABLECOINS, SECONDARY_QUOTE_CURRENCIES } from "../constants";

/**
 * ASYNC | Determine which of two tokens of a given pair address is base token and quote currency
 * @param {string} pairAddress uniswap address pair
 * @param {JsonRpcProvider} provider ethers provider
 * @returns {number} quoteToken = 0 | 1 | -1
 */
export default async function getQuoteCurrency(
  pairAddress: string,
  provider: JsonRpcProvider
): Promise<0 | 1 | -1> {
  const arbUsdcPoolContract = UniswapV3Pool__factory.connect(
    pairAddress,
    provider
  );

  const token0Address = await arbUsdcPoolContract.token0();
  const token1Address = await arbUsdcPoolContract.token1();

  const token0Contract = Erc20__factory.connect(token0Address, provider);
  const token1Contract = Erc20__factory.connect(token1Address, provider);

  const token0Name = await token0Contract.name();
  const token1Name = await token1Contract.name();

  if (STABLECOINS.includes(token0Name) && STABLECOINS.includes(token1Name)) {
    throw new Error(
      `[TB-BOT] Both tokens are stablecoins, to swap stablecoins please use the tb swap command`
    );
  } else if (
    STABLECOINS.includes(token0Name) ||
    STABLECOINS.includes(token1Name)
  ) {
    return STABLECOINS.includes(token0Name) ? 0 : 1;
  } else if (
    SECONDARY_QUOTE_CURRENCIES.includes(token0Name) ||
    SECONDARY_QUOTE_CURRENCIES.includes(token1Name)
  ) {
    return SECONDARY_QUOTE_CURRENCIES.includes(token0Name) ? 0 : 1;
  } else if (
    SECONDARY_QUOTE_CURRENCIES.includes(token0Name) &&
    SECONDARY_QUOTE_CURRENCIES.includes(token1Name)
  ) {
    throw new Error(
      `[TB-BOT] One of the two tokens must be a base token, to swap between secondary quote currencies (e.g. WETH), please use the tb swap command`
    );
  } else {
    return -1;
  }
}
