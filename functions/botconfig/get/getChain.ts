import botconfig from "../../../botconfig.json";

export default async function getChain() {
  console.log(
    `[TCH4NG-BOT] Chain configured: ${botconfig.chain.toLocaleUpperCase()}`
  );
}
