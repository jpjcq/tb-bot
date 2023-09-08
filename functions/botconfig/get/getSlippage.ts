import botconfig from "../../../botconfig.json";

export default async function getSlippage() {
  console.log(
    `[TB-BOT] Slippage configured: ${botconfig.swapOptions.slippage}%`
  );
}
