import botconfig from "../botconfig.json";

export const rpc = {
  ethereum: {
    HTTPS: botconfig.httpsProviders.ethereum,
    chainId: 1,
  },
  goerliethereum: {
    HTTPS: botconfig.httpsProviders.goerliEthereum,
    chainId: 5,
  },
  arbitrum: {
    HTTPS: botconfig.httpsProviders.arbitrum,
    chainId: 42161,
  },
  goerliarbitrum: {
    HTTPS: botconfig.httpsProviders.goerliArbitrum,
    chainId: 421613,
  },
} as const;
