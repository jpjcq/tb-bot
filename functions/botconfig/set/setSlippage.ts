import { writeFile } from "fs/promises";
import botconfig from "../../../botconfig.json";
import path from "path";

export default async function setSlippage(slippage: string) {
  botconfig.swapOptions.slippage = Number(slippage);

  const botconfigStr = JSON.stringify(botconfig, null, 2);

  try {
    await writeFile(
      path.resolve(__dirname, "../../../botconfig.json"),
      botconfigStr,
      "utf-8"
    );
    console.log(`[TB-BOT] Success! Slippage set to ${Number(slippage)}`);
  } catch (e) {
    console.log(`[TB-BOT] Error while updating botconfig.json file:`);
    console.log(e);
  }
}
