import { ChainKey } from "../../constants/types";
import { rpc } from "../../constants";
import tokens from "../../tokens.json";
import { TokensType } from "../../types/tokenType";

export function getAllTokens() {
  console.log("[TB-BOT] List of added tokens:");
  console.log(tokens);
}

export function getTokensByChain(chain: ChainKey) {
  const tokensDb = tokens as TokensType;
  const availableChains = [];

  for (const chain in rpc) {
    availableChains.push(chain);
  }

  if (!availableChains.includes(chain)) {
    console.error(
      `[TB-BOT] Argument error. Please choose one of the following chains as setChain's argument:`
    );
    console.log(availableChains);
    return;
  }

  if (tokensDb[chain]) {
    console.log(`[TB-BOT] List of ${chain} tokens:`);
    console.log(tokensDb[chain]);
  } else {
    console.log(`[TB-BOT] No token has been added for ${chain} yet`);
  }
}
