"use client";

import { LogOut, Wallet, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import clsx from "clsx";
import type { Connector } from "wagmi";

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

function isCoinbaseConnector(connector: Connector) {
  return (
    connector.type === "coinbaseWallet" ||
    connector.name.toLowerCase().includes("coinbase")
  );
}

async function hasInjectedProvider(connector: Connector) {
  if (typeof window === "undefined") return false;
  if (isCoinbaseConnector(connector)) return true;

  try {
    return Boolean(await connector.getProvider());
  } catch {
    return false;
  }
}

export function WalletButton() {
  const [open, setOpen] = useState(false);
  const [availableConnectorIds, setAvailableConnectorIds] = useState<Set<string>>(
    () => new Set(),
  );
  const { address, isConnected } = useAccount();
  const { connectors, connect, status, error } = useConnect();
  const { disconnect } = useDisconnect();

  const visibleConnectors = useMemo(() => {
    const seen = new Set<string>();
    return connectors.filter((connector) => {
      if (!availableConnectorIds.has(connector.uid)) return false;
      const label = getConnectorLabel(connector.name);
      if (seen.has(label)) return false;
      seen.add(label);
      return true;
    });
  }, [availableConnectorIds, connectors]);

  useEffect(() => {
    let cancelled = false;

    async function resolveAvailableConnectors() {
      const results = await Promise.all(
        connectors.map(async (connector) => ({
          connector,
          available: await hasInjectedProvider(connector),
        })),
      );

      if (cancelled) return;
      setAvailableConnectorIds(
        new Set(
          results
            .filter(({ available }) => available)
            .map(({ connector }) => connector.uid),
        ),
      );
    }

    resolveAvailableConnectors();

    return () => {
      cancelled = true;
    };
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

    const injectedConnector = connectors.find(
      (connector) =>
        availableConnectorIds.has(connector.uid) &&
        connector.name.toLowerCase().includes("injected"),
    );

    if (injectedConnector) {
      connect({ connector: injectedConnector });
    }
  }, [availableConnectorIds, connect, connectors, isConnected]);

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
                    {isCoinbaseConnector(connector)
                      ? "External Coinbase Wallet"
                      : "Injected provider"}
                  </small>
                </button>
              ))}
              {!visibleConnectors.some(
                (connector) => getConnectorLabel(connector.name) === "OKX Wallet",
              ) ? (
                <a
                  className="wallet-option wallet-link"
                  href="https://www.okx.com/web3"
                  target="_blank"
                  rel="noreferrer"
                >
                  <span>OKX Wallet</span>
                  <small>Open in OKX browser or install the wallet</small>
                </a>
              ) : null}
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
