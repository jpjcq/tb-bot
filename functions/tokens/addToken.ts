import { EthersError } from "ethers";
import { writeFile } from "fs/promises";
import path from "path";
import { Erc20__factory } from "../../types/ethers-contracts";
import botconfig from "../../botconfig.json";
import tokensFile from "../../tokens.json";
import { ChainKey } from "../../constants/types";
import { TokensType } from "../../types/tokenType";
import getProvider from "../../utils/getProvider";

export default async function addToken(address: string) {
  const provider = getProvider();
  const selectedChain = botconfig.chain as ChainKey;
  const tokenFactory = Erc20__factory.connect(address, provider);
  const tokens = tokensFile as TokensType;
  let decimals;
  let symbol;
  let name;

  try {
    decimals = Number(await tokenFactory.decimals());
    symbol = await tokenFactory.symbol();
    name = await tokenFactory.name();

    if (!tokens[selectedChain]) {
      tokens[selectedChain] = {};
    }

    tokens[selectedChain][symbol] = {
      name,
      symbol,
      address,
      decimals,
    };
  } catch (e) {
    if ((e as EthersError).code === "BAD_DATA") {
      console.log(
        `[TCH4NG-BOT] Error while fetching token infos, please verify the address you provided and/or the chain the bot is configured on. (it has to be the chain corresponding the token)`
      );
      return;
    } else if ((e as EthersError).code === "INVALID_ARGUMENT") {
      console.log(
        "[TCH4NG-BOT] The address does not appear to be a valid ERC-20 token."
      );
      return;
    } else {
      console.log("[TCH4NG-BOT] Error while fetching token infos:");
      console.log(e);
      return;
    }
  }

  const newTokensJson = JSON.stringify(tokens, null, 2);

  try {
    await writeFile(
      path.resolve(__dirname, "../../tokens.json"),
      newTokensJson
    );
    console.log(`[TCH4NG-BOT] Success! Token ${symbol} added`);
  } catch (e) {
    console.log(`[TCH4NG-BOT] Error while writing tokens.json file:`);
    console.log(e);
  }
}
