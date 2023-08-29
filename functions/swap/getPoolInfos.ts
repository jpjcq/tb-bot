import {
  Erc20__factory,
  UniswapV3Pool,
  UniswapV3Pool__factory,
} from "../../types/ethers-contracts";
import getProvider from "../../utils/getProvider";

export interface PoolInfos {
  token0: string;
  token1: string;
  fee: bigint;
  tickSpacing: bigint;
  liquidity: bigint;
  sqrtPriceX96: bigint;
  tick: number;
  token0Decimals: number;
}

export default async function getPoolInfos(
  poolContract: string | UniswapV3Pool
): Promise<PoolInfos> {
  const provider = getProvider();

  if (typeof poolContract === "string") {
    const contract = UniswapV3Pool__factory.connect(poolContract, provider);

    const [token0, token1, fee, tickSpacing, liquidity, slot0] =
      await Promise.all([
        contract.token0(),
        contract.token1(),
        contract.fee(),
        contract.tickSpacing(),
        contract.liquidity(),
        contract.slot0(),
      ]);

    const decimals = await Erc20__factory.connect(token0, provider).decimals();

    return {
      token0,
      token1,
      fee,
      tickSpacing,
      liquidity,
      sqrtPriceX96: slot0[0],
      tick: Number(slot0[1]),
      token0Decimals: Number(decimals),
    };
  } else {
    const [token0, token1, fee, tickSpacing, liquidity, slot0] =
      await Promise.all([
        poolContract.token0(),
        poolContract.token1(),
        poolContract.fee(),
        poolContract.tickSpacing(),
        poolContract.liquidity(),
        poolContract.slot0(),
      ]);

    const decimals = await Erc20__factory.connect(token0, provider).decimals();

    return {
      token0,
      token1,
      fee,
      tickSpacing,
      liquidity,
      sqrtPriceX96: slot0[0],
      tick: Number(slot0[1]),
      token0Decimals: Number(decimals),
    };
  }
}
