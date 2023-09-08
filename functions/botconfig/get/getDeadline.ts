import botconfig from "../../../botconfig.json";

export default async function getDeadline() {
  console.log(
    `[TB-BOT] Deadline configured: ${botconfig.swapOptions.deadline}min`
  );
}
