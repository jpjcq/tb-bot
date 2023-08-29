import { tokenAddresses } from "../../../constants";
import listenToPrice from "../listenToPrice";
import listenToTransfers from "../listenToTransfers";
import getProvider from "../../../utils/getProvider";

interface ListenerOptions {
  transfer?: boolean;
  swap?: boolean;
}

export default async function arbListeners(options: ListenerOptions) {
  const provider = getProvider();

  // Listen to both
  if (!options.transfer && !options.swap) {
    await listenToTransfers(tokenAddresses.arbitrum.ARB_ADDRESS, provider);
    await listenToPrice(tokenAddresses.arbitrum.ARB_USDC_POOL, provider);
  }

  // Listen to $ARB transfers
  if (options.transfer) {
    await listenToTransfers(tokenAddresses.arbitrum.ARB_ADDRESS, provider);
  }

  // Listen to ARB/USDC price
  if (options.swap) {
    await listenToPrice(tokenAddresses.arbitrum.ARB_USDC_POOL, provider);
  }
}
