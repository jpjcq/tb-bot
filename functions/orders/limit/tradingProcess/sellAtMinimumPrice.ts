import { parseUnits, AbiCoder, Wallet, formatUnits } from "ethers";
import JSBI from "jsbi";
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
import { uniswapContracts } from "../../../../constants";
import {
  privateKey as PRIVATE_KEY,
  accountAddress as ACCOUNT_ADDRESS,
} from "../../../../botconfig.json";
import {
  Erc20__factory,
  UniswapV3Pool__factory,
} from "../../../../types/ethers-contracts";
import getPoolInfos from "../../../swap/getPoolInfos";
import getProvider from "../../../../utils/getProvider";
import getApproval from "../../../swap/getApproval";
import tokensFile from "../../../../tokens.json";
import botconfig from "../../../../botconfig.json";
import { TokensType } from "../../../../types/tokenType";
import getTokenFromSymbol from "../../../../utils/getTokenFromSymbol";
import getBaseAndQuote from "../../getBaseAndQuote";
import getGasFees from "../../../../utils/getGasFees";

export default async function sellAtMinimumPrice(
  token1SymbolInput: string,
  token2SymbolInput: string,
  tokenAmount: number,
  priceInput: number,
  feeAmountInput?: number
) {
  const token1Symbol = token1SymbolInput.toLocaleUpperCase();
  const token2Symbol = token2SymbolInput.toLocaleUpperCase();

  const tokens = tokensFile as TokensType;

  if (!tokens[botconfig.chain]) {
    throw new Error(
      `[TB_BOT] No token has been saved for the chain ${botconfig.chain}`
    );
  }

  const token1 = getTokenFromSymbol(token1Symbol);
  const token2 = getTokenFromSymbol(token2Symbol);

  const provider = getProvider();

  const wallet = new Wallet(PRIVATE_KEY).connect(provider);

  const { MAX_FEE_PER_GAS, MAX_PRIORITY_FEE_PER_GAS } = getGasFees();

  let feeAmount = feeAmountInput ?? botconfig.swapOptions.defaultFeeAmount;

  // get pool address
  const currentPoolAddress = computePoolAddress({
    factoryAddress: uniswapContracts.ethereum.UNISWAP_V3_FACTORY_ADDRESS,
    tokenA: token1, //in
    tokenB: token2, //out
    fee: feeAmount,
  });

  const poolContract = UniswapV3Pool__factory.connect(
    currentPoolAddress,
    provider
  );

  const { sqrtPriceX96, liquidity, tick } = await getPoolInfos(poolContract);

  const pool = new Pool(
    token1,
    token2,
    feeAmount,
    sqrtPriceX96.toString(),
    liquidity.toString(),
    tick
  );

  const { baseToken, quoteCurrency } = getBaseAndQuote(token1, token2);

  // sell: brings base to get quote
  const tokenIn = baseToken;
  const tokenOut = quoteCurrency;

  // Checking tokenIn balance
  const tokenInBalance = await Erc20__factory.connect(
    tokenIn.address,
    provider
  ).balanceOf(wallet.address);

  if (tokenAmount > Number(formatUnits(tokenInBalance, tokenIn.decimals))) {
    throw new Error(
      `[TB-BOT] Insufficient ${
        tokenIn.symbol
      } balance. You're trying to swap ${tokenAmount} ${
        tokenIn.symbol
      } but you only have ${Number(
        formatUnits(tokenInBalance, tokenIn.decimals)
      ).toFixed(6)} ${tokenIn.symbol}selltest`
    );
  }

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

  const slippage = botconfig.swapOptions.slippage * 100;

  // swap options
  const options: SwapOptions = {
    slippageTolerance: new Percent(slippage, 10_000), // in bips: 50 bips = 0.50%
    deadline:
      Math.floor(Date.now() / 1000) + 60 * botconfig.swapOptions.deadline, // in minutes
    recipient: ACCOUNT_ADDRESS,
  };

  // Create swap calldata and value in hex (hex to send when call a txn with provider)
  const { calldata: swapCalldata, value } = SwapRouter.swapCallParameters(
    [trade],
    options
  );

  const price =
    parseFloat(
      formatUnits(decodedQuoteResponse.toString(), tokenOut.decimals)
    ) / tokenAmount;

  // Tolerance between Uniswap v3 Quoter price and last swap price
  const tolerance = botconfig.swapOptions.tolerance / 100;

  const toleredPrice = price * (1 + tolerance);

  if (toleredPrice < priceInput) {
    throw new Error(
      `[TB-BOT] Aborting. Price was not met.\n[TB-BOT] Price wanted: ${priceInput} | Actual price: ${price.toFixed(
        6
      )}`
    );
  } else {
    console.log(`[TB-BOT] Price matched!`);
    console.log(
      `Price wanted: ${priceInput} | Actual price: ${price.toFixed(6)}`
    );
    console.log(`Starting swap process..`);
  }

  // approve
  try {
    console.log(`[TB-BOT] Sending token approval transation..`);
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
    throw new Error(`[TB-BOT] Aborting token approval.`);
  }

  const ethSwapTransaction = {
    data: swapCalldata,
    to: uniswapContracts.ethereum.UNISWAP_V3_ROUTER_ADDRESS,
    value: value,
    from: ACCOUNT_ADDRESS,
    maxFeePerGas: MAX_FEE_PER_GAS,
    maxPriorityFeePerGas: MAX_PRIORITY_FEE_PER_GAS,
  };

  const tokenOutAmount = Number(formatUnits(decodedQuoteResponse.toString()));

  // swap
  try {
    const swapResponse = await wallet.sendTransaction(ethSwapTransaction);
    const transactionReceipt = await swapResponse.wait();
    console.log(
      `\n| [TB-BOT] SUCCESS! SELL RECAP:\n|\n|    - SOLD ${tokenAmount} ${
        tokenIn.symbol
      }\n|\n|    - FOR ${tokenOutAmount.toFixed(6)} ${
        tokenOut.symbol
      }\n|\n|    - PRICE ${price.toFixed(6)} ${baseToken.symbol}/${
        quoteCurrency.symbol
      }\n|\n|    - HASH: ${transactionReceipt?.hash}
      `
    );
  } catch (e) {
    console.log(`[TB-BOT] Swap failed:`);
    console.log(e);
    throw new Error(`[TB-BOT] Aborting swap.`);
  }
}
