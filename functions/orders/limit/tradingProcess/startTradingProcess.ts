import pm2 from "pm2";

// Passer un nom de process unique aussi
export default function startTradingProcess(pairAddress: string) {
  const processName = pairAddress;

  pm2.start(
    {
      script: "./functions/limitOrders/tradingProcess/tradingProcess.ts",
      interpreter: "/usr/local/bin/ts-node",
      name: processName,
      args: [pairAddress, processName],
      output: `./functions/limitOrders/tradingProcess/logs/${pairAddress}.log`,
      error: `./functions/limitOrders/tradingProcess/logs/${pairAddress}.log`,
    },
    function (err, proc) {
      if (err) {
        console.error(err);
        return pm2.disconnect();
      }

      console.log(
        `[TCH4NG-BOT] Trading process launched on pair: ${processName}`
      );
    }
  );
}
