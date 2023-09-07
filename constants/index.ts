import { ethers } from "ethers";

export const STABLECOINS = [
  "USD Coin",
  "USD Coin (Arb1)",
  "Tether USD",
  "Dai Stablecoin",
  "TrueUSD",
  "Frax",
];

export const SECONDARY_QUOTE_CURRENCIES = ["Wrapped Ether"];

export const MAX_FEE_PER_GAS = ethers.parseUnits("30", "gwei");
export const MAX_PRIORITY_FEE_PER_GAS = ethers.parseUnits("3", "gwei");

export * from "./provider";

export * from "./addresses";

export * from "./tokens";
