import { Percent } from "@uniswap/sdk-core";
import buyAtMaximumPrice from "./buyAtMaximumPrice";
import sellAtMinimumPrice from "./sellAtMinimumPrice";

// buyAtMaximumPrice("arb", "weth", 0.003, 0.00056);

const per = new Percent(50, 10_000);

console.log(per)
