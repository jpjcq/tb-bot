import botconfig from "../../../botconfig.json";

export default async function getChain() {
  console.log(
    `[TB-BOT] Chain configured: ${botconfig.chain.toLocaleUpperCase()}`
  );
}
