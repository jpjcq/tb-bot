import { computePoolAddress } from "@uniswap/v3-sdk";
import getTokenFromSymbol from "./getTokenFromSymbol";
import { uniswapContracts } from "../constants";
import botconfig from "../botconfig.json";

export default function getPairFromSymbols(symbol1: string, symbol2: string) {
  const token1 = getTokenFromSymbol(symbol1)!;
  const token2 = getTokenFromSymbol(symbol2)!;

  let feeAmount = botconfig.swapOptions.feeAmount;

  // get pool address
  const pairAddress = computePoolAddress({
    factoryAddress: uniswapContracts.ethereum.UNISWAP_V3_FACTORY_ADDRESS,
    tokenA: token1, //in
    tokenB: token2, //out
    fee: feeAmount,
  });

  return pairAddress;
}
