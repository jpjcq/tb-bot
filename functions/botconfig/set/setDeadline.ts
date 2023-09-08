import botconfig from "../../../botconfig.json";
import { writeFile } from "fs/promises";
import path from "path";

export default async function setDeadline(deadline: string) {
  botconfig.swapOptions.deadline = Number(deadline);

  const botconfigStr = JSON.stringify(botconfig, null, 2);

  try {
    await writeFile(
      path.resolve(__dirname, "../../../botconfig.json"),
      botconfigStr,
      "utf-8"
    );
    console.log(`[TB-BOT] Success! Deadline set to ${Number(deadline)}min`);
  } catch (e) {
    console.log(`[TB-BOT] Error while updating botconfig.json file:`);
    console.log(e);
  }
}
