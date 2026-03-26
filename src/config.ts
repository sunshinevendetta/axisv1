import { createConfig, http } from "wagmi";
import { base, baseSepolia } from "wagmi/chains";
import { coinbaseWallet, injected, walletConnect } from "@/src/lib/wagmi-connectors";
import { BASE_BUILDER_DATA_SUFFIX } from "@/src/lib/base-app";

type WagmiConfig = ReturnType<typeof createConfig>;

const projectId =
  process.env.NEXT_PUBLIC_REOWN_PROJECT_ID ||
  process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;

if (!projectId) {
  throw new Error(
    "NEXT_PUBLIC_REOWN_PROJECT_ID or NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID is missing. Add one to your .env file",
  );
}

const baseRpcUrl = process.env.NEXT_PUBLIC_BASE_RPC_URL;
const baseSepoliaRpcUrl = process.env.NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL;
const resolvedProjectId = projectId;
const walletConnectMetadata = {
  name: "AXIS",
  description: "AXIS founder membership and submission flows on Base.",
  url: "https://axis.show",
  icons: ["https://axis.show/favicon.png"],
};

const globalForWagmi = globalThis as typeof globalThis & {
  __spectraWagmiConfig?: WagmiConfig;
};

function createWagmiConfig(): WagmiConfig {
  return createConfig({
    chains: [base, baseSepolia],
    dataSuffix: BASE_BUILDER_DATA_SUFFIX,
    multiInjectedProviderDiscovery: true,
    transports: {
      [base.id]: http(baseRpcUrl),
      [baseSepolia.id]: http(baseSepoliaRpcUrl),
    },
    connectors: [
      injected({
        shimDisconnect: true,
      }),
      coinbaseWallet({
        appName: "AXIS Form",
        preference: { options: "smartWalletOnly" },
      }),
      walletConnect({
        projectId: resolvedProjectId,
        metadata: walletConnectMetadata,
        showQrModal: true,
      }),
    ],
    syncConnectedChain: true,
    ssr: true,
  });
}

export function getConfig(): WagmiConfig {
  if (!globalForWagmi.__spectraWagmiConfig) {
    globalForWagmi.__spectraWagmiConfig = createWagmiConfig();
  }

  return globalForWagmi.__spectraWagmiConfig;
}

declare module "wagmi" {
  interface Register {
    config: ReturnType<typeof getConfig>;
  }
}
