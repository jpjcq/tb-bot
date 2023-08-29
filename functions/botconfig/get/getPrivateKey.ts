import botconfig from "../../../botconfig.json";

export default async function getPrivateKey() {
  console.log(botconfig.privateKey);
}
