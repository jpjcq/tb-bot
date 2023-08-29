import { Wallet, parseUnits } from "ethers";
import { Token } from "@uniswap/sdk-core";
import getProvider from "../../utils/getProvider";
import { privateKey as PRIVATE_KEY } from "../../botconfig.json";
import { Erc20__factory } from "../../types/ethers-contracts";

export default async function getApproval(
  spender: string,
  amountInEth: number,
  token: Token
) {
  const provider = getProvider();

  const wallet = new Wallet(PRIVATE_KEY).connect(provider);

  const response = await Erc20__factory.connect(token.address, wallet).approve(
    spender,
    parseUnits(amountInEth.toString(), token.decimals)
  );

  console.log("[TCH4NG-BOT] Approval sent, waiting for confirmation receipt..");

  const transactionReceipt = await response.wait();

  return transactionReceipt;
}
