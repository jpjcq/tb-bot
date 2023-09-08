import botconfig from "../../../botconfig.json";

export default async function getTolerance() {
  console.log(
    `[TB-BOT] Tolerance configured: ${botconfig.swapOptions.tolerance}%`
  );
}
