import listenToTransfers from "../listenToTransfers";
import listenToPrice from "../listenToPrice";
import getProvider from "../../../utils/getProvider";

interface ListenerOptions {
  transfer?: boolean;
  swap?: boolean;
}

export default async function tokenListeners(
  token: string,
  options: ListenerOptions
) {
  const provider = getProvider();

  // Listen to transfers
  if (options.transfer) {
    await listenToTransfers(token, provider);
  }

  // Listen to swap
  if (options.swap) {
    await listenToPrice(token, provider);
  }
}
