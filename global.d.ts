interface Window {
  okxwallet?: unknown;
  ethereum?: {
    isBase?: boolean;
    isCoinbaseWallet?: boolean;
    isMetaMask?: boolean;
    isOkxWallet?: boolean;
    isOKExWallet?: boolean;
    providers?: Array<{
      isCoinbaseWallet?: boolean;
      isMetaMask?: boolean;
      isOkxWallet?: boolean;
      isOKExWallet?: boolean;
    }>;
  };
}
