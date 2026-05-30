"use client";

import { LogOut, Wallet, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import clsx from "clsx";

const DISCONNECT_KEY = "dreamexchange.manualDisconnect";

function shortAddress(address?: string) {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function getConnectorLabel(name: string) {
  const lower = name.toLowerCase();
  if (lower.includes("coinbase")) return "Coinbase Wallet";
  if (lower.includes("metamask")) return "MetaMask";
  if (lower.includes("okx") || lower.includes("okex")) return "OKX Wallet";
  if (lower.includes("injected")) return "Browser Wallet";
  return name;
}

export function WalletButton() {
  const [open, setOpen] = useState(false);
  const { address, isConnected } = useAccount();
  const { connectors, connect, status, error } = useConnect();
  const { disconnect } = useDisconnect();

  const visibleConnectors = useMemo(() => {
    const seen = new Set<string>();
    return connectors.filter((connector) => {
      const label = getConnectorLabel(connector.name);
      if (seen.has(label)) return false;
      seen.add(label);
      return true;
    });
  }, [connectors]);

  useEffect(() => {
    if (isConnected || typeof window === "undefined") return;
    if (window.localStorage.getItem(DISCONNECT_KEY) === "true") return;

    const userAgent = window.navigator.userAgent.toLowerCase();
    const ethereum = window.ethereum as
      | { isCoinbaseWallet?: boolean; isBase?: boolean }
      | undefined;
    const isBaseApp =
      userAgent.includes("baseapp") ||
      userAgent.includes("base app") ||
      Boolean(ethereum?.isBase || ethereum?.isCoinbaseWallet);

    if (!isBaseApp) return;

    const injectedConnector = connectors.find((connector) =>
      connector.name.toLowerCase().includes("injected"),
    );

    if (injectedConnector) {
      connect({ connector: injectedConnector });
    }
  }, [connect, connectors, isConnected]);

  if (isConnected) {
    return (
      <button
        className="wallet-pill"
        type="button"
        onClick={() => {
          window.localStorage.setItem(DISCONNECT_KEY, "true");
          disconnect();
        }}
        aria-label="Disconnect wallet"
      >
        <span>{shortAddress(address)}</span>
        <LogOut size={16} aria-hidden="true" />
      </button>
    );
  }

  return (
    <>
      <button className="wallet-pill" type="button" onClick={() => setOpen(true)}>
        <Wallet size={17} aria-hidden="true" />
        <span>Connect Wallet</span>
      </button>

      {open ? (
        <div className="modal-backdrop" role="presentation">
          <div className="wallet-modal" role="dialog" aria-modal="true">
            <div className="modal-head">
              <div>
                <p className="eyebrow">Choose wallet</p>
                <h2>Enter the dream ledger</h2>
              </div>
              <button
                className="icon-button"
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close wallet dialog"
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>

            <div className="wallet-list">
              {visibleConnectors.map((connector) => (
                <button
                  className={clsx("wallet-option", {
                    "is-loading": status === "pending",
                  })}
                  type="button"
                  key={connector.uid}
                  onClick={() => {
                    window.localStorage.removeItem(DISCONNECT_KEY);
                    connect(
                      { connector },
                      {
                        onSuccess: () => setOpen(false),
                      },
                    );
                  }}
                >
                  <span>{getConnectorLabel(connector.name)}</span>
                  <small>
                    {connector.type === "coinbaseWallet"
                      ? "External Coinbase Wallet"
                      : "Injected provider"}
                  </small>
                </button>
              ))}
            </div>

            <p className="modal-note">
              Base App, MetaMask, OKX and other injected wallets use the native
              browser provider. No WalletConnect session is required.
            </p>
            {error ? <p className="error-text">{error.message}</p> : null}
          </div>
        </div>
      ) : null}
    </>
  );
}
