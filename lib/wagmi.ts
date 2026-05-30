import { coinbaseWallet, injected } from "wagmi/connectors";
import { createConfig, http, type Config } from "wagmi";
import { base } from "wagmi/chains";
import type { EIP1193Provider } from "viem";

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
    injected({
      target: {
        id: "okx-wallet",
        name: "OKX Wallet",
        provider(window) {
          const walletWindow = window as
            | (Window & {
                okxwallet?: EIP1193Provider;
              })
            | undefined;
          const okxProvider = walletWindow?.okxwallet;
          if (okxProvider) return okxProvider as EIP1193Provider;

          const ethereum = walletWindow?.ethereum;
          const providers = ethereum?.providers ?? [];
          const provider = providers.find(
            (item) => item.isOkxWallet || item.isOKExWallet,
          );

          if (provider) return provider as EIP1193Provider;
          if (ethereum?.isOkxWallet || ethereum?.isOKExWallet) {
            return ethereum as EIP1193Provider;
          }

          return undefined;
        },
      },
      shimDisconnect: true,
    }),
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
