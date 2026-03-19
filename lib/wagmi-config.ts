import { cookieStorage, createConfig, createStorage, http } from "wagmi";
import { base } from "wagmi/chains";
import { baseAccount, coinbaseWallet, injected, walletConnect } from "@/src/lib/wagmi-connectors";
import { BASE_BUILDER_DATA_SUFFIX } from "@/src/lib/base-app";

const projectId =
  process.env.NEXT_PUBLIC_REOWN_PROJECT_ID ||
  process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;

const walletConnectMetadata = {
  name: "SPECTRA",
  description: "SPECTRA founder membership and submission flows on Base.",
  url: "https://spectrart.xyz",
  icons: ["https://spectrart.xyz/favicon.png"],
};

export function getConfig() {
  return createConfig({
    chains: [base],
    dataSuffix: BASE_BUILDER_DATA_SUFFIX,
    multiInjectedProviderDiscovery: true,
    connectors: [
      injected({
        shimDisconnect: true,
      }),
      baseAccount({
        appName: "SPECTRA",
      }),
      coinbaseWallet({
        appName: "SPECTRA",
        preference: { options: "smartWalletOnly" },
      }),
      ...(projectId
        ? [
            walletConnect({
              projectId,
              metadata: walletConnectMetadata,
              showQrModal: true,
            }),
          ]
        : []),
    ],
    storage: createStorage({ storage: cookieStorage }),
    ssr: true,
    transports: {
      [base.id]: http(),
    },
  });
}
