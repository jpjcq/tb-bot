import { JsonRpcProvider, ethers } from "ethers";
import { Erc20__factory } from "../../types/ethers-contracts";

/**
 * Logs tokens transfers according to its contract address
 * @param {string} tokenAddress token smart contract address
 * @param {JsonRpcProvider} provider ethers provider
 */
export default async function listenToTransfers(
  tokenAddress: string,
  provider: JsonRpcProvider
): Promise<void> {
  const tokenContract = Erc20__factory.connect(tokenAddress, provider);
  const tokenName = await tokenContract.name();
  const tokenTicker = await tokenContract.symbol();

  const transferFilter =
    tokenContract.filters["Transfer(address,address,uint256)"];

  await tokenContract.addListener(transferFilter, (from, to, amountInWei) =>
    console.log(
      `[${tokenName} transfer]: ${from} to ${to}, amount: ${Number(
        ethers.formatEther(amountInWei)
      ).toFixed(2)} $${tokenTicker}`
    )
  );
}
