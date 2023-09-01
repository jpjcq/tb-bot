import startTradingProcess from "./startTradingProcess";
import pm2 from "pm2";

// startTradingProcess("0xc31e54c7a869b9fcbecc14363cf510d1c41fa443");

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

    list.forEach(function (process) {
      console.log(process.name);
    });
    pm2.disconnect();
  });
});
