import { JsonRpcProvider } from "ethers";
import {
  Erc20__factory,
  UniswapV3Pool__factory,
} from "../types/ethers-contracts";
import { QUOTE_CURRENCIES } from "../constants";

/**
 * ASYNC | Determine which of two tokens of a given pair address is base token and quote currency
 * @param {string} pairAddress uniswap address pair
 * @param {JsonRpcProvider} provider ethers provider
 * @returns {number} quoteToken = 0 | 1
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

  if (QUOTE_CURRENCIES.includes(token0Name)) {
    return 0;
  }

  if (QUOTE_CURRENCIES.includes(token1Name)) {
    return 1;
  }

  return -1;
}
