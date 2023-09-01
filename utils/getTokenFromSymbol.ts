import tokensFile from "../tokens.json";
import { TokensType } from "../types/tokenType";
import botconfig from "../botconfig.json";
import { Token } from "@uniswap/sdk-core";
import { rpc } from "../constants";
import { ChainKey } from "../constants/types";

export default function getTokenFromSymbol(symbol: string) {
  const tokens = tokensFile as TokensType;

  if (!(tokens as TokensType)[botconfig.chain][symbol]) {
    console.log(`[TCH4NG_BOT] Token ${symbol} doesn't exist`);
    return;
  }

  const { address, decimals, name } = tokens[botconfig.chain][symbol];

  const token = new Token(
    rpc[botconfig.chain as ChainKey].chainId,
    address,
    decimals,
    symbol,
    name
  );

  return token;
}
