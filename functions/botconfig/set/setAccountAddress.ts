import { writeFile } from "fs/promises";
import path from "path";
import botconfig from "../../../botconfig.json";

export default async function setAccountAddress(accountAddress: string) {
  botconfig.accountAddress = accountAddress;

  const botconfigStr = JSON.stringify(botconfig, null, 2);

  try {
    await writeFile(
      path.resolve(__dirname, "../../../botconfig.json"),
      botconfigStr,
      "utf-8"
    );

    console.log(`[TB-BOT] Success! Account address set to ${accountAddress}`);
  } catch (e) {
    console.log(`[TB-BOT] Error while updating botconfig.json file:`);
    console.log(e);
  }
}
