import botconfig from "../../../botconfig.json";

export default async function getAccountAddress() {
  console.log(botconfig.accountAddress);
}
