import { writeFile } from "fs/promises";
import path from "path";
import { rpc } from "../../../constants";
import botconfig from "../../../botconfig.json";

export default async function setChain(chain: string) {
  const availableChains = [];

  for (const chain in rpc) {
    availableChains.push(chain);
  }

  if (availableChains.includes(chain)) {
    try {
      const botconfigObj = botconfig;

      botconfigObj.chain = chain;

      const botconfigStr = JSON.stringify(botconfigObj, null, 2);
      await writeFile(path.resolve(__dirname, "../../../botconfig.json"), botconfigStr, "utf-8");

      console.log(
        `[TCH4NG-BOT] Success! Chain set to ${chain.toLocaleUpperCase()}`
      );
    } catch (e) {
      console.log(
        `[TCH4NG-BOT] Error while updating botconfig.json file: ${e}`
      );
    }
  } else {
    console.error(
      `[TCH4NG-BOT] Argument error. Please choose one of the following chains as setChain's argument:`
    );
    console.log(availableChains);
  }
}
