import buyAtMinimumPrice from "./buyAtMinimumPrice";
import sellAtMinimumPrice from "./sellAtMinimumPrice";

(async function () {
  await sellAtMinimumPrice("UNI", "WETH", 0.01, 0.052);
})();
