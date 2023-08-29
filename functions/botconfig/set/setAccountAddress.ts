import { readFile, writeFile } from "fs/promises";

export default async function setAccountAddress(accountAddress: string) {
  try {
    const data = await readFile("botconfig.json", "utf-8");
    const botconfigObj = JSON.parse(data);

    botconfigObj.accountAddress = accountAddress;

    const botconfigStr = JSON.stringify(botconfigObj, null, 2);
    await writeFile("botconfig.json", botconfigStr, "utf-8");

    console.log(
      `[TCH4NG-BOT] Success! Account address set to ${accountAddress}`
    );
  } catch (e) {
    console.log(`[TCH4NG-BOT] Error while updating botconfig.json file: ${e}`);
  }
}
