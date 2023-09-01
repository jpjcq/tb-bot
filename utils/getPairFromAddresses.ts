import { computePoolAddress } from "@uniswap/v3-sdk";
import getTokenInstance from "../functions/swap/getTokenInstance";
import { uniswapContracts } from "../constants";

export default async function getPairFromAddresses(
  address1: string,
  address2: string
) {
  const token1 = await getTokenInstance(address1);
  const token2 = await getTokenInstance(address2);

  let feeAmount = 3000;

  // get pool address
  const pairAddress = computePoolAddress({
    factoryAddress: uniswapContracts.ethereum.UNISWAP_V3_FACTORY_ADDRESS,
    tokenA: token1, //in
    tokenB: token2, //out
    fee: feeAmount,
  });

  return pairAddress;
}
