import { rpc } from "../../../constants";

export default function getAvailableChains() {
  const availableChains = [];

  for (const chain in rpc) {
    availableChains.push(chain);
  }

  console.log(`[TB-BOT] Avalaible chains to set:`);
  console.log(availableChains);
}
