import { Token } from "@uniswap/sdk-core";
import { SECONDARY_QUOTE_CURRENCIES, STABLECOINS } from "../../constants";

/**
 * Determine which token is base token and which is quote currency.
 * If both are stablecoins, it throws
 * If none of them is stablecoin or secondary quote currency, it throws
 * @param token1 Token instance
 * @param token2 Token instance
 * @returns { baseToken: Token; quoteCurrency: Token }
 */
export default function getBaseAndQuote(
  token1: Token,
  token2: Token
): { baseToken: Token; quoteCurrency: Token } {
  const name1 = token1.name ?? "empty";
  const name2 = token2.name ?? "empty";

  let baseToken: Token;
  let quoteCurrency: Token;

  // If both tokens are stablecoins, throw
  if (STABLECOINS.includes(name1) && STABLECOINS.includes(name2)) {
    throw new Error(
      `[TB-BOT] Both tokens are stablecoins, to swap stablecoins please use the tb swap command`
    );
  }
  // If one of the tokens is a stablecoin, define base and quote
  else if (STABLECOINS.includes(name1) || STABLECOINS.includes(name2)) {
    baseToken = STABLECOINS.includes(name1) ? token2 : token1;
    quoteCurrency = STABLECOINS.includes(name1) ? token1 : token2;
  }
  // If none of the tokens are stablecoin, but one is secondary quote currency, define base and quote
  else if (
    SECONDARY_QUOTE_CURRENCIES.includes(name1) ||
    SECONDARY_QUOTE_CURRENCIES.includes(name2)
  ) {
    baseToken = SECONDARY_QUOTE_CURRENCIES.includes(name1) ? token2 : token1;
    quoteCurrency = SECONDARY_QUOTE_CURRENCIES.includes(name1)
      ? token1
      : token2;
  }
  // If both tokens are secondary quote currencies, throw
  else if (
    SECONDARY_QUOTE_CURRENCIES.includes(name1) &&
    SECONDARY_QUOTE_CURRENCIES.includes(name2)
  ) {
    throw new Error(
      `[TB-BOT] One of the two tokens must be a base token, to swap between secondary quote currencies (e.g. WETH), please use the tb swap command`
    );
  }
  // If none of the above conditions are met, throw
  else {
    throw new Error(
      `[TB-BOT] One of the two tokens must be a stablecoin or a secondary quote currency (e.g. WETH)`
    );
  }

  return { baseToken, quoteCurrency };
}
