import { parseUnits, AbiCoder, Wallet, formatUnits } from "ethers";
import {
  Pool,
  Route,
  SwapOptions,
  SwapQuoter,
  SwapRouter,
  Trade,
  computePoolAddress,
} from "@uniswap/v3-sdk";
import { CurrencyAmount, Percent, TradeType } from "@uniswap/sdk-core";
import {
  MAX_FEE_PER_GAS,
  MAX_PRIORITY_FEE_PER_GAS,
  uniswapContracts,
} from "../../constants";
import {
  privateKey as PRIVATE_KEY,
  accountAddress as ACCOUNT_ADDRESS,
} from "../../botconfig.json";
import { UniswapV3Pool__factory } from "../../types/ethers-contracts";
import getPoolInfos from "./getPoolInfos";
import getProvider from "../../utils/getProvider";
import getApproval from "./getApproval";
import JSBI from "jsbi";
import getTokenInstance from "./getTokenInstance";
import yesno from "yesno";
import botconfig from "../../botconfig.json";

export default async function swapFromTokenAddresses(
  tokenInAddress: string,
  tokenOutAddress: string,
  tokenAmount: number,
  feeAmountInput?: number
) {
  const provider = getProvider();

  const wallet = new Wallet(PRIVATE_KEY).connect(provider);

  const tokenIn = await getTokenInstance(tokenInAddress);
  const tokenOut = await getTokenInstance(tokenOutAddress);

  let feeAmount = botconfig.swapOptions.feeAmount;

  if (feeAmountInput) feeAmount = feeAmountInput;

  // get pool address
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

  const { sqrtPriceX96, liquidity, tick } = await getPoolInfos(poolContract);

  const pool = new Pool(
    tokenIn,
    tokenOut,
    feeAmount,
    sqrtPriceX96.toString(),
    liquidity.toString(),
    tick
  );

  const swapRoute = new Route([pool], tokenIn, tokenOut);

  // create quote call data (hex to send when call a txn with provider)
  const { calldata: quoteCalldata } = SwapQuoter.quoteCallParameters(
    swapRoute,
    CurrencyAmount.fromRawAmount(
      tokenIn,
      parseUnits(tokenAmount.toString(), tokenIn.decimals).toString()
    ),
    TradeType.EXACT_INPUT
  );

  // call quoter contract to get quote
  const quoteCallReturnData = await provider.call({
    to: uniswapContracts.ethereum.UNISWAP_V3_QUOTER_ADDRESS,
    data: quoteCalldata,
  });

  // decode hex quoter response
  const decodedQuoteResponse = AbiCoder.defaultAbiCoder().decode(
    ["uint256"],
    quoteCallReturnData
  );

  // create a trade to send to swap router contract
  const trade = Trade.createUncheckedTrade({
    route: swapRoute,
    inputAmount: CurrencyAmount.fromRawAmount(
      tokenIn,
      parseUnits(tokenAmount.toString(), tokenIn.decimals).toString()
    ),
    outputAmount: CurrencyAmount.fromRawAmount(
      tokenOut,
      JSBI.BigInt(decodedQuoteResponse)
    ),
    tradeType: TradeType.EXACT_INPUT,
  });

  // swap options
  const options: SwapOptions = {
    slippageTolerance: new Percent(50, 10_000), // 50 bips, or 0.50%
    deadline: Math.floor(Date.now() / 1000) + 60 * 20, // 20 minutes from the current Unix time
    recipient: ACCOUNT_ADDRESS,
  };

  // Create swap calldata and value in hex (hex to send when call a txn with provider)
  const { calldata: swapCalldata, value } = SwapRouter.swapCallParameters(
    [trade],
    options
  );

  // approve
  try {
    const transactionReceipt = await getApproval(
      uniswapContracts.ethereum.UNISWAP_V3_ROUTER_ADDRESS,
      tokenAmount,
      tokenIn
    );
    console.log(`[TB-BOT] Token approval success:`);
    console.log(`hash: ${transactionReceipt?.hash}`);
  } catch (e) {
    console.log(`[TB-BOT] Error while approving token:`);
    console.log(e);
  }

  const ethSwapTransaction = {
    data: swapCalldata,
    to: uniswapContracts.ethereum.UNISWAP_V3_ROUTER_ADDRESS,
    value: value,
    from: ACCOUNT_ADDRESS,
    maxFeePerGas: MAX_FEE_PER_GAS,
    maxPriorityFeePerGas: MAX_PRIORITY_FEE_PER_GAS,
  };

  // swap
  try {
    const ok = await yesno({
      question: `[TB-BOT] Swap ${tokenAmount} ${
        tokenIn.symbol
      } for ${formatUnits(
        decodedQuoteResponse.toString(),
        tokenOut.decimals
      )} ${tokenOut.symbol} ?`,
    });
    if (!ok) return;
    const swapResponse = await wallet.sendTransaction(ethSwapTransaction);
    console.log(`[TB-BOT] Swap success:`);
    console.log(
      `Swapped ${tokenAmount} ${tokenIn.symbol} for ${formatUnits(
        decodedQuoteResponse.toString(),
        tokenOut.decimals
      )} ${tokenOut.symbol}`
    );
    console.log(`hash: ${swapResponse.hash}`);
  } catch (e) {
    console.log(`[TB-BOT] Swap failed:`);
    console.log(e);
  }
}
