import { readFile, writeFile } from "fs/promises";

export default async function setAccountAddress(accountAddress: string) {
  try {
    const data = await readFile("botconfig.json", "utf-8");
    const botconfigObj = JSON.parse(data);

    botconfigObj.accountAddress = accountAddress;

    const botconfigStr = JSON.stringify(botconfigObj, null, 2);
    await writeFile("botconfig.json", botconfigStr, "utf-8");

    console.log(
      `[TB-BOT] Success! Account address set to ${accountAddress}`
    );
  } catch (e) {
    console.log(`[TB-BOT] Error while updating botconfig.json file: ${e}`);
  }
}
