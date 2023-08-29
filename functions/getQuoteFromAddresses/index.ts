import { Token } from "@uniswap/sdk-core";
import { ChainKey } from "../../constants/types";
import botconfig from "../../botconfig.json";
import { rpc as storedRpc } from "../../constants";
import { Erc20__factory } from "../../types/ethers-contracts";
import getProvider from "../../utils/getProvider";
import getQuote from "../swap/getQuote";

/**
 * Get a quote from token addresses for a given swap by asking Uniswap V3: Quoter smart contract
 * @param tokenIn Token address
 * @param tokenOut Token address
 * @param feeAmount Fee percentage wanted, in hundredths of bips. (e.g. 3000 = 0.3%)
 * @param tokenAmount Token amount, in eth scale (e.g. 100 = 100 USD = 100 USDC)
 * @param getLog If true, logs the result in console
 * @returns Token amount, in eth scale
 */
export default async function getQuoteFromAddresses(
  tokenInAddress: string,
  tokenOutAddress: string,
  tokenAmount: number,
  feeAmount?: number,
  getLog?: boolean
): Promise<number> {
  const provider = getProvider();
  const chainId = storedRpc[botconfig.chain as ChainKey].chainId;

  const tokenInInstance = await getTokenInstance(tokenInAddress);
  const tokenOutInstance = await getTokenInstance(tokenOutAddress);

  async function getTokenInfos(
    address: string
  ): Promise<[number, string, string]> {
    const contract = Erc20__factory.connect(address, provider);

    const decimals = Number(await contract.decimals());
    const ticker = await contract.symbol();
    const name = await contract.name();

    return [decimals, ticker, name];
  }

  async function getTokenInstance(address: string): Promise<Token> {
    const [decimals, ticker, name] = await getTokenInfos(address);

    const tokenInstance = new Token(chainId, address, decimals, ticker, name);

    return tokenInstance;
  }

  // Using getQuote() from the swap() logic
  const quote = await getQuote(
    tokenInInstance,
    tokenOutInstance,
    tokenAmount,
    feeAmount,
    getLog
  );

  return quote;
}
