import { Token } from "@uniswap/sdk-core";
import { rpc } from "../../constants";
import botconfig from "../../botconfig.json";
import { ChainKey } from "../../constants/types";
import { Erc20__factory } from "../../types/ethers-contracts";
import getProvider from "../../utils/getProvider";

/**
 * Returns the token's uniswap sdk core instance of a given token address.
 * Depends on botconfig's chain set
 */
export default async function getTokenInstance(
  address: string
): Promise<Token> {
  const provider = getProvider();
  const tokenFactory = Erc20__factory.connect(address, provider);

  const decimals = await tokenFactory.decimals();
  const symbol = await tokenFactory.symbol();
  const name = await tokenFactory.name();

  const tokenInstance = new Token(
    rpc[botconfig.chain as ChainKey].chainId,
    address,
    Number(decimals),
    symbol,
    name
  );

  return tokenInstance;
}
