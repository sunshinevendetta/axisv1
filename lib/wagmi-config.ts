import { cookieStorage, createConfig, createStorage, http } from "wagmi";
import { base } from "wagmi/chains";
import { baseAccount, coinbaseWallet } from "@wagmi/connectors";

export function getConfig() {
  return createConfig({
    chains: [base],
    multiInjectedProviderDiscovery: false,
    connectors: [
      baseAccount({
        appName: "Spectrart",
      }),
      coinbaseWallet({
        appName: "Spectrart",
        preference: "smartWalletOnly",
      }),
    ],
    storage: createStorage({ storage: cookieStorage }),
    ssr: true,
    transports: {
      [base.id]: http(),
    },
  });
}

declare module "wagmi" {
  interface Register {
    config: ReturnType<typeof getConfig>;
  }
}
