import { Token } from "@uniswap/sdk-core";
import { rpc } from "./provider";
import { tokenAddresses } from "./addresses";

export const ARB_TOKEN = new Token(
  rpc.arbitrum.chainId,
  tokenAddresses.arbitrum.ARB_ADDRESS,
  18,
  "ARB",
  "Arbitrum"
);

export const USDC_TOKEN = new Token(
  rpc.arbitrum.chainId,
  tokenAddresses.arbitrum.USDC_ADDRESS,
  6,
  "USDC",
  "USD Coin"
);

export const UNI_TOKEN = new Token(
  rpc.goerliethereum.chainId,
  tokenAddresses.goerliEthereum.UNI_ADDRESS,
  18,
  "UNI",
  "Uniswap"
);

export const WETH_TOKEN = new Token(
  rpc.goerliethereum.chainId,
  tokenAddresses.goerliEthereum.WETH_ADDRESS,
  18,
  "WETH",
  "Wrapped Ethereum"
);
