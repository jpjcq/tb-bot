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
import { CurrencyAmount, Percent, Token, TradeType } from "@uniswap/sdk-core";
import {
  MAX_FEE_PER_GAS,
  MAX_PRIORITY_FEE_PER_GAS,
  rpc,
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
import tokens from "../../tokens.json";
import botconfig from "../../botconfig.json";
import { TokenType, TokensType } from "../../types/tokenType";
import { ChainKey } from "../../constants/types";
import yesno from "yesno";

export default async function swapFromSymbols(
  tokenInSymbol: string,
  tokenOutSymbol: string,
  tokenAmount: number,
  feeAmountInput?: number
) {
  if (!(tokens as TokensType)[botconfig.chain]) {
    console.log(
      `[TCH4NG_BOT] No token has been saved for the chain ${botconfig.chain}`
    );
    return;
  }

  if (!(tokens as TokensType)[botconfig.chain][tokenInSymbol]) {
    console.log(`[TCH4NG_BOT] Token ${tokenInSymbol} doesn't exist`);
    return;
  }

  if (!(tokens as TokensType)[botconfig.chain][tokenOutSymbol]) {
    console.log(`[TCH4NG_BOT] Token ${tokenOutSymbol} doesn't exist`);
    return;
  }

  const {
    address: tokenInAddress,
    decimals: tokenInDecimals,
    name: tokenInName,
  } = (tokens as TokensType)[botconfig.chain][tokenInSymbol] as TokenType;

  const {
    address: tokenOutAddress,
    decimals: tokenOutDecimals,
    name: tokenOutName,
  } = (tokens as TokensType)[botconfig.chain][tokenOutSymbol] as TokenType;

  const tokenIn = new Token(
    rpc[botconfig.chain as ChainKey].chainId,
    tokenInAddress,
    tokenInDecimals,
    tokenInSymbol,
    tokenInName
  );

  const tokenOut = new Token(
    rpc[botconfig.chain as ChainKey].chainId,
    tokenOutAddress,
    tokenOutDecimals,
    tokenOutSymbol,
    tokenOutName
  );

  const provider = getProvider();

  const wallet = new Wallet(PRIVATE_KEY).connect(provider);

  let feeAmount = 3000;

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
      JSBI.BigInt(decodedQuoteResponse) //ici
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
    console.log(`[TCH4NG-BOT] Sending token approval transation..`);
    const transactionReceipt = await getApproval(
      uniswapContracts.ethereum.UNISWAP_V3_ROUTER_ADDRESS,
      tokenAmount,
      tokenIn
    );
    console.log(`[TCH4NG-BOT] Token approval success:`);
    console.log(`hash: ${transactionReceipt?.hash}`);
  } catch (e) {
    console.log(`[TCH4NG-BOT] Error while approving token:`);
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
      question: `[TCH4NG-BOT] Swap ${tokenAmount} ${
        tokenIn.symbol
      } for ${formatUnits(
        decodedQuoteResponse.toString(),
        tokenOut.decimals
      )} ${tokenOut.symbol} ?`,
    });
    if (!ok) return;
    const swapResponse = await wallet.sendTransaction(ethSwapTransaction);
    console.log(`[TCH4NG-BOT] Swap success:`);
    console.log(
      `Swapped ${tokenAmount} ${tokenIn.symbol} for ${formatUnits(
        decodedQuoteResponse.toString(),
        tokenOut.decimals
      )} ${tokenOut.symbol}`
    );
    console.log(`hash: ${swapResponse.hash}`);
  } catch (e) {
    console.log(`[TCH4NG-BOT] Swap failed:`);
    console.log(e);
  }
}
