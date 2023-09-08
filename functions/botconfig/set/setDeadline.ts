import botconfig from "../../../botconfig.json";
import { writeFile } from "fs/promises";
import path from "path";

export default async function setDeadline(deadline: string) {
  const numDeadline = Number(deadline);

  if (typeof numDeadline === "number" && !isNaN(numDeadline)) {
    botconfig.swapOptions.deadline = numDeadline;

    const botconfigStr = JSON.stringify(botconfig, null, 2);

    try {
      await writeFile(
        path.resolve(__dirname, "../../../botconfig.json"),
        botconfigStr,
        "utf-8"
      );
      console.log(`[TB-BOT] Success! Deadline set to ${numDeadline}min`);
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
