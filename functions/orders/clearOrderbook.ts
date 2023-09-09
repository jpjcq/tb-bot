import { writeFile } from "fs/promises";
import path from "path";

export default async function clearOrderbook() {
  const orderbook = {};

  const orderbookStr = JSON.stringify(orderbook, null, 2);

  try {
    await writeFile(
      path.resolve(__dirname, "../../orderbook.json"),
      orderbookStr,
      "utf-8"
    );
    console.log("[TB-BOT] Success! Orderbook cleared");
  } catch (e) {
    console.log(`[TB-BOT] Error while clearing orderbook:`);
    console.log(e);
  }
}
