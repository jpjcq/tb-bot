import { PairOrderbook, OrderbookType } from "../../../types/orderbookTypes";
import orderbookFile from "./orderbook.json";
import botconfig from "../../../botconfig.json";
import { ChainKey } from "../../../constants/types";
import { writeFile } from "fs/promises";
import path from "path";

export default async function removeOrder(orderId: string) {
  const orderbook = orderbookFile as OrderbookType;
  const selectedChain = botconfig.chain as ChainKey;
  const selectedChainOrderbook = orderbook[selectedChain];

  if (!selectedChainOrderbook) {
    console.log(
      `[TB-BOT] There is no order for the selected chain: ${selectedChain.toLocaleUpperCase()}`
    );
    return;
  }

  let orderToDelete;

  for (const chain in orderbook) {
    if (orderbook[chain][orderId]) {
      // Vérifiez que l'ordre existe
      orderToDelete = { ...orderbook[chain][orderId] }; // Copie de l'ordre
      delete orderbook[chain][orderId]; // Suppression de l'ordre
      break; // Sortir de la boucle si l'ordre est trouvé et supprimé
    }
  }

  if (!orderToDelete) {
    console.log(`[TB-BOT] Order ${orderId} not found.`);
    return;
  }

  try {
    const orderbookJson = JSON.stringify(orderbook, null, 2);
    await writeFile(path.resolve(__dirname, "./orderbook.json"), orderbookJson);
    console.log(`[TB-BOT] Success! Order ${orderId} removed:`);
    console.log(orderToDelete);
  } catch (e) {
    console.log(`[TB-BOT] Error while writing orderbook:`);
    console.log(e);
  }
}
