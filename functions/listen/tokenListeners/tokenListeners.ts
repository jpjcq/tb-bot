import listenToTransfers from "../listenToTransfers";
import listenToPrice from "../listenToPrice";
import getProvider from "../../../utils/getProvider";

interface ListenerOptions {
  transfer?: boolean;
  swap?: boolean;
}

export default async function tokenListeners(
  tokenAddress: string,
  options: ListenerOptions
) {
  const provider = getProvider();

  if (!options.transfer && !options.swap) {
    console.log(
      `[TB-BOT] Please specify the event you want to listen (tb listen --transfer <address> or tb listen --swap <address>)`
    );
  }

  // Listen to transfers
  if (options.transfer) {
    await listenToTransfers(tokenAddress, provider);
  }

  // Listen to swap
  if (options.swap) {
    await listenToPrice(tokenAddress, provider);
  }
}
