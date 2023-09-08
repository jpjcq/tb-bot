import { writeFile } from "fs/promises";
import path from "path";
import botconfig from "../../../botconfig.json";

export default async function setTolerance(tolerance: string) {
  const botconfigObj = botconfig;

  botconfigObj.swapOptions.tolerance = Number(tolerance);

  const botconfigStr = JSON.stringify(botconfigObj, null, 2);

  try {
    await writeFile(
      path.resolve(__dirname, "../../../botconfig.json"),
      botconfigStr,
      "utf-8"
    );
    console.log(`[TB-BOT] Success! Tolerance set to ${Number(tolerance)}`);
  } catch (e) {
    console.log(`[TB-BOT] Error while updating botconfig.json file:`);
    console.log(e);
  }
}
