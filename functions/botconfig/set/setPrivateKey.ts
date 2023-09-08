import { writeFile } from "fs/promises";
import botconfig from "../../../botconfig.json";

export default async function setPrivateKey(privateKey: string) {
  if (privateKey.length === 64) {
    botconfig.privateKey = privateKey;

    const botconfigStr = JSON.stringify(botconfig, null, 2);

    try {
      await writeFile("botconfig.json", botconfigStr, "utf-8");

      console.log(`[TB-BOT] Success! Private key set to ${privateKey}`);
    } catch (e) {
      console.log(`[TB-BOT] Error while updating botconfig.json file: ${e}`);
    }
  } else {
    console.log(
      "[TB-BOT] Please enter a valide private key. Must be 64 characters"
    );
  }
}
