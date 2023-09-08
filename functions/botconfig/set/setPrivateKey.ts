import { writeFile } from "fs/promises";
import botconfig from "../../../botconfig.json";

export default async function setPrivateKey(privateKey: string) {
  botconfig.privateKey = privateKey;

  const botconfigStr = JSON.stringify(botconfig, null, 2);

  try {
    await writeFile("botconfig.json", botconfigStr, "utf-8");

    console.log(`[TB-BOT] Success! Private key set to ${privateKey}`);
  } catch (e) {
    console.log(`[TB-BOT] Error while updating botconfig.json file: ${e}`);
  }
}
