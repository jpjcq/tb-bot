import { ethers } from "ethers";

export const QUOTE_CURRENCIES = [
  "USD Coin",
  "Tether USD",
  "Dai Stablecoin",
  "Wrapped Ether",
];

export const MAX_FEE_PER_GAS = ethers.parseUnits("30", "gwei");
export const MAX_PRIORITY_FEE_PER_GAS = ethers.parseUnits("3", "gwei");

export * from "./provider";

export * from "./addresses";

export * from "./tokens";
