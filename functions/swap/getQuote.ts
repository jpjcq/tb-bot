import { Token } from "@uniswap/sdk-core";
import { computePoolAddress } from "@uniswap/v3-sdk";
import { uniswapContracts } from "../../constants";
import {
  UniswapV3Pool__factory,
  UniswapV3Quoter__factory,
} from "../../types/ethers-contracts";
import { formatUnits, parseUnits } from "ethers";
import getProvider from "../../utils/getProvider";
import botconfig from "../../botconfig.json";

/**
 * Get a quote for a given swap by asking Uniswap V3: Quoter smart contract
 * @param tokenIn Token instance
 * @param tokenOut Token instance
 * @param feeAmount Fee percentage wanted, in hundredths of bips. (e.g. 3000 = 0.3%)
 * @param tokenAmount Token amount, in eth scale (e.g. 100 = 100 USD = 100 USDC)
 * @param getLog If true, logs the result in console
 * @returns Token amount, in eth scale
 */
export default async function getQuote(
  tokenIn: Token,
  tokenOut: Token,
  tokenAmount: number,
  feeAmountInput?: number,
  getLog?: boolean
): Promise<number> {
  const provider = getProvider();

  let feeAmount = botconfig.swapOptions.defaultFeeAmount;

  if (feeAmountInput) feeAmount = feeAmountInput;

  const currentPoolAddress = computePoolAddress({
    factoryAddress: uniswapContracts.ethereum.UNISWAP_V3_FACTORY_ADDRESS,
    tokenA: tokenIn, //in
    tokenB: tokenOut, //out
    fee: feeAmount,
  });

  const poolContract = UniswapV3Pool__factory.connect(
    currentPoolAddress,
    provider
  );

  const quoterContract = UniswapV3Quoter__factory.connect(
    uniswapContracts.ethereum.UNISWAP_V3_QUOTER_ADDRESS,
    provider
  );

  const fee = await poolContract.fee();

  const quotedAmountOut = await quoterContract.quoteExactInputSingle.staticCall(
    tokenIn.address,
    tokenOut.address,
    fee,
    parseUnits(tokenAmount.toString(), tokenIn.decimals),
    0
  );

  const result = Number(formatUnits(quotedAmountOut, tokenOut.decimals));

  if (getLog)
    console.log(
      `[TB-BOT] Quote result for ${tokenAmount} ${tokenIn.symbol}:\n${result} ${tokenOut.symbol}`
    );

  return result;
}
