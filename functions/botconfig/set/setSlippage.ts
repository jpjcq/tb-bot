import { writeFile } from "fs/promises";
import botconfig from "../../../botconfig.json";
import path from "path";

export default async function setSlippage(slippage: string) {
  const numSlippage = Number(slippage);

  if (typeof numSlippage === "number" && !isNaN(numSlippage)) {
    botconfig.swapOptions.slippage = numSlippage;

    const botconfigStr = JSON.stringify(botconfig, null, 2);

    try {
      await writeFile(
        path.resolve(__dirname, "../../../botconfig.json"),
        botconfigStr,
        "utf-8"
      );
      console.log(`[TB-BOT] Success! Slippage set to ${numSlippage}`);
    } catch (e) {
      console.log(`[TB-BOT] Error while updating botconfig.json file:`);
      console.log(e);
    }
  } else {
    console.log(
      "[TB-BOT] Please enter a valid number. Letters and symbols are note allowed."
    );
  }
}
