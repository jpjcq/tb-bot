import { writeFile } from "fs/promises";
import path from "path";
import botconfig from "../../../botconfig.json";

export default async function setTolerance(tolerance: string) {
  const numTolerance = Number(tolerance);
  botconfig.swapOptions.tolerance = numTolerance;

  if (typeof numTolerance === "number" && !isNaN(numTolerance)) {
    const botconfigStr = JSON.stringify(botconfig, null, 2);

    try {
      await writeFile(
        path.resolve(__dirname, "../../../botconfig.json"),
        botconfigStr,
        "utf-8"
      );
      console.log(`[TB-BOT] Success! Tolerance set to ${numTolerance}`);
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
