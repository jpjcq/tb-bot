import { Wallet, formatEther } from "ethers";
import getProvider from "../../utils/getProvider";
import { privateKey as PRIVATE_KEY } from "../../botconfig.json";

export default async function getBalance() {
  const provider = getProvider();

  const wallet = new Wallet(PRIVATE_KEY);

  try {
    const balance = await provider.getBalance(wallet.address);

    console.log(`[TB-BOT] Your ETH balance is: ${formatEther(balance)}`);
  } catch (e) {
    console.log(`[TB-BOT] Error while getting your ETH balance:\n${e}`);
  }
}
