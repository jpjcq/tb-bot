import { JsonRpcProvider } from "ethers";
import { rpc } from "../constants";
import botconfig from "../botconfig.json";
import { ChainKey } from "../constants/types";

export default function getProvider(): JsonRpcProvider {
  const provider = new JsonRpcProvider(rpc[botconfig.chain as ChainKey].HTTPS);

  return provider;
}
