import pm2 from "pm2";

// Passer un nom de process unique aussi
export default function startTradingProcess(pairAddress: string) {
  pm2.connect(function (err) {
    if (err) {
      console.log(err);
      process.exit(2);
    }

    pm2.list(function (err, list) {
      if (err) {
        console.error(err);
        return pm2.disconnect();
      }

      list.forEach((proc) => {
        if (proc.name === pairAddress) {
          console.log(
            `[TB-BOT] A trading process is already running for this pair. Disconnecting..`
          );
          pm2.disconnect();
          return;
        }
      });
    });

    pm2.start(
      {
        script: "./functions/orders/limit/tradingProcess/tradingProcess.ts",
        interpreter: "ts-node",
        name: pairAddress,
        args: [pairAddress],
        output: `./logs/${pairAddress}.log`,
        error: `./logs/${pairAddress}.log`,
      },
      function (err, proc) {
        if (err) {
          console.error(err);
          return pm2.disconnect();
        }

        console.log(
          `[TB-BOT] Trading process launched on pair: ${pairAddress}`
        );

        pm2.disconnect();
      }
    );
  });
}
