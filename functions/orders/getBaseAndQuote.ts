import { Token } from "@uniswap/sdk-core";
import { SECONDARY_QUOTE_CURRENCIES, STABLECOINS } from "../../constants";

/**
 * Determine which token is base token and which is quote currency.
 * If both are stablecoins, it throws
 * If none of them is stablecoin or secondary quote currency, it throws
 * @param token1
 * @param token2
 * @returns
 */
export default function getBaseAndQuote(
  token1: Token,
  token2: Token
): { baseToken: Token; quoteCurrency: Token } {
  const symbol1 = token1.symbol ?? "empty";
  const symbol2 = token2.symbol ?? "empty";

  let baseToken: Token;
  let quoteCurrency: Token;

  // If both tokens are stablecoins, throw
  if (STABLECOINS.includes(symbol1) && STABLECOINS.includes(symbol2)) {
    throw new Error(
      `[TCH4NG-BOT] Both tokens are stablecoins, to swap stablecoins please use the tb swap command`
    );
  }
  // If one of the tokens is a stablecoin, define base and quote
  else if (STABLECOINS.includes(symbol1) || STABLECOINS.includes(symbol2)) {
    baseToken = STABLECOINS.includes(symbol1) ? token2 : token1;
    quoteCurrency = STABLECOINS.includes(symbol1) ? token1 : token2;
  }
  // If none of the tokens are stablecoin, but one is secondary quote currency, define base and quote
  else if (
    SECONDARY_QUOTE_CURRENCIES.includes(symbol1) ||
    SECONDARY_QUOTE_CURRENCIES.includes(symbol2)
  ) {
    baseToken = SECONDARY_QUOTE_CURRENCIES.includes(symbol1) ? token2 : token1;
    quoteCurrency = SECONDARY_QUOTE_CURRENCIES.includes(symbol1)
      ? token1
      : token2;
  }
  // If both tokens are secondary quote currencies, throw
  else if (
    SECONDARY_QUOTE_CURRENCIES.includes(symbol1) &&
    SECONDARY_QUOTE_CURRENCIES.includes(symbol2)
  ) {
    throw new Error(
      `[TCH4NG-BOT] One of the two tokens must be a base token, to swap between quote currencies (e.g. WETH), please use the tb swap command`
    );
  }
  // If none of the above conditions are met, throw
  else {
    throw new Error(
      `[TCH4NG-BOT] One of the two tokens must be a stablecoin or a secondary quote currency (e.g. WETH)`
    );
  }

  return { baseToken, quoteCurrency };
}
