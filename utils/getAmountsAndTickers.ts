import { JsonRpcProvider } from "ethers";
import {
  Erc20__factory,
  UniswapV3Pool__factory,
} from "../types/ethers-contracts";
import getAbs from "./getAbs";

/**
 * returns absolutes baseAmount and quoteAmount both in wei
 * @param {bigint} amount0 token 0 amount
 * @param {bigint} amount1 token 1 amount
 * @param {string} pairAddress uniswap pair address
 * @param {0 | 1 | -1} quoteToken quote token
 * @param {JsonRpcProvider}
 * @returns {object} {baseAmount, quoteAmount, baseTokenName, quoteTicker}
 */
export default async function getAmountsAndTickers(
  amount0: bigint,
  amount1: bigint,
  pairAddress: string,
  quoteToken: 0 | 1 | -1,
  provider: JsonRpcProvider
): Promise<{
  baseAmount: bigint;
  quoteAmount: bigint;
  baseTokenName: string;
  quoteTicker: string;
}> {
  const pairContract = UniswapV3Pool__factory.connect(pairAddress, provider);

  const token0Address = await pairContract.token0();
  const token1Address = await pairContract.token1();

  const token0Contract = Erc20__factory.connect(token0Address, provider);
  const token1Contract = Erc20__factory.connect(token1Address, provider);

  const token0Decimals = await token0Contract.decimals();
  const token1Decimals = await token1Contract.decimals();

  function convertToWei(amount: bigint, decimals: bigint): bigint {
    return decimals < 18n
      ? amount * BigInt(10n ** (18n - decimals))
      : amount / BigInt(10n ** (decimals - 18n));
  }

  const amount0InWei = getAbs(convertToWei(amount0, token0Decimals));
  const amount1InWei = getAbs(convertToWei(amount1, token1Decimals));

  const token0Name = await token0Contract.name();
  const token1Name = await token1Contract.name();

  const baseTokenName = quoteToken === 0 ? token1Name : token0Name;

  const quoteTicker =
    quoteToken === 0
      ? await token0Contract.symbol()
      : await token1Contract.symbol();

  return {
    baseAmount: quoteToken === 0 ? amount1InWei : amount0InWei,
    quoteAmount: quoteToken === 0 ? amount0InWei : amount1InWei,
    baseTokenName,
    quoteTicker,
  };
}
