import { MAX_FEE_PER_GAS, MAX_PRIORITY_FEE_PER_GAS } from "../constants";
import botconfig from "../botconfig.json";

export default function getGasFees(): {
  MAX_FEE_PER_GAS: bigint;
  MAX_PRIORITY_FEE_PER_GAS: bigint;
} {
  switch (botconfig.chain) {
    case "arbitrum":
      return {
        MAX_FEE_PER_GAS: MAX_FEE_PER_GAS.arbitrum,
        MAX_PRIORITY_FEE_PER_GAS: MAX_PRIORITY_FEE_PER_GAS.arbitrum,
      };
    case "goerliethereum":
      return {
        MAX_FEE_PER_GAS: MAX_FEE_PER_GAS.goerliethereum,
        MAX_PRIORITY_FEE_PER_GAS: MAX_PRIORITY_FEE_PER_GAS.goerliethereum,
      };
    default:
      return {
        MAX_FEE_PER_GAS: MAX_FEE_PER_GAS.arbitrum,
        MAX_PRIORITY_FEE_PER_GAS: MAX_PRIORITY_FEE_PER_GAS.arbitrum,
      };
  }
}
