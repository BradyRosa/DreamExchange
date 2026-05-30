import { coinbaseWallet, injected } from "wagmi/connectors";
import { createConfig, http, type Config } from "wagmi";
import { base } from "wagmi/chains";

export const BASE_APP_ID = "";

// Replace "0x" with the ERC-8021 encoded builder code after base.dev verification.
export const baseDataSuffix = "0x" as `0x${string}`;

type AttributionConfig = Config & {
  dataSuffix: `0x${string}`;
};

export const wagmiConfig = createConfig({
  chains: [base],
  connectors: [
    injected({ shimDisconnect: true, unstable_shimAsyncInject: 750 }),
    injected({ target: "metaMask", shimDisconnect: true }),
    injected({ target: "okxWallet", shimDisconnect: true }),
    coinbaseWallet({
      appName: "DreamExchange",
      preference: "all",
    }),
  ],
  multiInjectedProviderDiscovery: true,
  transports: {
    [base.id]: http(),
  },
}) as unknown as AttributionConfig;

wagmiConfig.dataSuffix = baseDataSuffix;
