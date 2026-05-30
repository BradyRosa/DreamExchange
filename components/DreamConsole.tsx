"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  FlameKindling,
  Layers3,
  Moon,
  Sparkles,
  WandSparkles,
} from "lucide-react";
import {
  useAccount,
  useChainId,
  usePublicClient,
  useSwitchChain,
  useWriteContract,
} from "wagmi";
import { base } from "wagmi/chains";
import {
  DREAM_EXCHANGE_ADDRESS,
  dreamExchangeAbi,
  type DreamRecord,
} from "@/lib/contract";
import { baseDataSuffix } from "@/lib/wagmi";
import { WalletButton } from "./WalletButton";

type Mode = "home" | "vault";

type TxArgs = Parameters<ReturnType<typeof useWriteContract>["writeContractAsync"]>[0];

const starterDreams = [
  {
    title: "Moonlit Market",
    description:
      "I found a floating bazaar where every stall traded memories for purple smoke.",
    mood: "Curious",
  },
  {
    title: "Crystal Door",
    description:
      "A glass door opened inside a cloud and paid me in tiny sparks when I stepped through.",
    mood: "Wonder",
  },
  {
    title: "Velvet Spell",
    description:
      "A quiet witch stitched a new constellation into my sleeve and told me to wake gently.",
    mood: "Mystic",
  },
];

function formatCount(value?: bigint) {
  return Number(value ?? 0n).toLocaleString("en-US");
}

function asDreamRecord(result: unknown): DreamRecord | null {
  if (!Array.isArray(result)) return null;
  const [id, title, description, mood, fusionCount, createdAt, exists] = result;
  return {
    id,
    title,
    description,
    mood,
    fusionCount,
    createdAt,
    exists,
  } as DreamRecord;
}

export function DreamConsole({ mode }: { mode: Mode }) {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const publicClient = usePublicClient({ chainId: base.id });
  const { switchChainAsync } = useSwitchChain();
  const { writeContractAsync, isPending } = useWriteContract();

  const [title, setTitle] = useState(starterDreams[0].title);
  const [description, setDescription] = useState(starterDreams[0].description);
  const [mood, setMood] = useState(starterDreams[0].mood);
  const [dreamCount, setDreamCount] = useState<bigint>(0n);
  const [interactionCount, setInteractionCount] = useState<bigint>(0n);
  const [dreams, setDreams] = useState<DreamRecord[]>([]);
  const [notice, setNotice] = useState("Record your first dream to unlock +1 Dream Spark.");
  const [rewardPulse, setRewardPulse] = useState(false);

  const rewardTotal = useMemo(
    () => interactionCount + (rewardPulse ? 1n : 0n),
    [interactionCount, rewardPulse],
  );

  const refreshDreams = useCallback(async () => {
    if (!address || !publicClient) return;

    const [count, interactions] = await Promise.all([
      publicClient.readContract({
        address: DREAM_EXCHANGE_ADDRESS,
        abi: dreamExchangeAbi,
        functionName: "dreamCount",
        args: [address],
      }),
      publicClient.readContract({
        address: DREAM_EXCHANGE_ADDRESS,
        abi: dreamExchangeAbi,
        functionName: "interactionCount",
        args: [address],
      }),
    ]);

    setDreamCount(count);
    setInteractionCount(interactions);

    const capped = Math.min(Number(count), 24);
    const records = await Promise.all(
      Array.from({ length: capped }, (_, index) =>
        publicClient.readContract({
          address: DREAM_EXCHANGE_ADDRESS,
          abi: dreamExchangeAbi,
          functionName: "getDream",
          args: [address, BigInt(index)],
        }),
      ),
    );

    setDreams(records.map(asDreamRecord).filter((dream): dream is DreamRecord => Boolean(dream?.exists)));
  }, [address, publicClient]);

  useEffect(() => {
    refreshDreams().catch(() => {
      setNotice("Connect on Base to read your dream archive.");
    });
  }, [refreshDreams]);

  async function sendDreamTx(args: TxArgs, success: string) {
    if (!isConnected) {
      setNotice("Connect a wallet first, then cast the dream.");
      return;
    }
    if (chainId !== base.id) {
      await switchChainAsync({ chainId: base.id });
    }

    setRewardPulse(true);
    setNotice("+1 Dream Spark appears as soon as you sign.");

    const hash = await writeContractAsync({
      ...args,
      dataSuffix: baseDataSuffix,
    } as TxArgs);

    await publicClient?.waitForTransactionReceipt({ hash });
    setRewardPulse(false);
    setNotice(success);
    await refreshDreams();
  }

  async function createDream(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await sendDreamTx(
      {
        address: DREAM_EXCHANGE_ADDRESS,
        abi: dreamExchangeAbi,
        functionName: "createDream",
        args: [title.trim(), description.trim(), mood.trim()],
      } as TxArgs,
      "Dream recorded onchain. Your archive and sparks are updated.",
    );
  }

  async function editLatestDream() {
    const latest = dreams.at(-1);
    if (!latest) {
      setNotice("Record a dream before editing the archive.");
      return;
    }
    await sendDreamTx(
      {
        address: DREAM_EXCHANGE_ADDRESS,
        abi: dreamExchangeAbi,
        functionName: "editDream",
        args: [
          latest.id,
          `${latest.title} Recast`,
          `${latest.description} The ending now glows brighter.`,
          `${latest.mood}+Lucid`,
        ],
      } as TxArgs,
      "Latest dream recast onchain.",
    );
  }

  async function fuseFirstTwoDreams() {
    if (dreams.length < 2) {
      setNotice("You need two dreams before fusion.");
      return;
    }
    await sendDreamTx(
      {
        address: DREAM_EXCHANGE_ADDRESS,
        abi: dreamExchangeAbi,
        functionName: "fuseDreams",
        args: [dreams[0].id, dreams[1].id],
      } as TxArgs,
      "Fusion complete. A new dream entered the ledger.",
    );
  }

  async function deleteLatestDream() {
    const latest = dreams.at(-1);
    if (!latest) {
      setNotice("No dream is available to clear.");
      return;
    }
    await sendDreamTx(
      {
        address: DREAM_EXCHANGE_ADDRESS,
        abi: dreamExchangeAbi,
        functionName: "deleteDream",
        args: [latest.id],
      } as TxArgs,
      "Latest dream cleared from your archive.",
    );
  }

  async function resetDreams() {
    await sendDreamTx(
      {
        address: DREAM_EXCHANGE_ADDRESS,
        abi: dreamExchangeAbi,
        functionName: "resetDreams",
        args: [],
      } as TxArgs,
      "Dream archive reset. You can begin again immediately.",
    );
  }

  function fillStarter(index: number) {
    const next = starterDreams[index];
    setTitle(next.title);
    setDescription(next.description);
    setMood(next.mood);
  }

  return (
    <main className="app-shell">
      <div className="smoke smoke-a" />
      <div className="smoke smoke-b" />
      <div className="topbar">
        <Link className="brand" href="/">
          <span className="brand-mark">
            <Moon size={18} aria-hidden="true" />
          </span>
          <span>DreamExchange</span>
        </Link>
        <nav className="nav-tabs" aria-label="Primary navigation">
          <Link className={mode === "home" ? "active" : ""} href="/">
            Record
          </Link>
          <Link className={mode === "vault" ? "active" : ""} href="/vault">
            Vault
          </Link>
        </nav>
        <WalletButton />
      </div>

      <section className="hero-grid">
        <div className="visual-stage" aria-label="Mystic dream exchange artwork">
          <img
            src="/images/dreamexchange-hero.png"
            alt=""
            className="hero-art"
            aria-hidden="true"
          />
          <div className="moon-disc" />
          <div className="rune-ring">
            <span>✦</span>
            <span>☾</span>
            <span>✧</span>
            <span>◇</span>
          </div>
          <div className="dream-fragment fragment-a">
            <Sparkles size={16} aria-hidden="true" />
            <span>+1 Spark</span>
          </div>
          <div className="dream-fragment fragment-b">
            <Moon size={16} aria-hidden="true" />
            <span>{formatCount(dreamCount)} Dreams</span>
          </div>
          <div className="dream-fragment fragment-c">
            <WandSparkles size={16} aria-hidden="true" />
            <span>Fuse</span>
          </div>
          <h1>DreamExchange</h1>
        </div>

        <div className="action-dock">
          <div className="reward-strip" aria-live="polite">
            <div>
              <small>Now</small>
              <strong className={rewardPulse ? "pulse" : ""}>+1 Spark</strong>
            </div>
            <div>
              <small>Sparks</small>
              <strong>{formatCount(rewardTotal)}</strong>
            </div>
            <div>
              <small>Dreams</small>
              <strong>{formatCount(dreamCount)}</strong>
            </div>
          </div>

          <div className="oracle-panel">
            {mode === "home" ? (
              <form className="dream-form" onSubmit={createDream}>
                <div className="form-head">
                  <WandSparkles size={20} aria-hidden="true" />
                  <h2>Record a dream</h2>
                </div>
                <div className="compact-fields">
                  <label>
                    <span>Title</span>
                    <input
                      value={title}
                      onChange={(event) => setTitle(event.target.value)}
                      maxLength={64}
                      required
                    />
                  </label>
                  <label>
                    <span>Mood</span>
                    <input
                      value={mood}
                      onChange={(event) => setMood(event.target.value)}
                      maxLength={32}
                      required
                    />
                  </label>
                </div>
                <label>
                  <span>Memory</span>
                  <textarea
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    maxLength={320}
                    required
                  />
                </label>
                <div className="starter-row" aria-label="Starter dreams">
                  {starterDreams.map((dream, index) => (
                    <button type="button" key={dream.title} onClick={() => fillStarter(index)}>
                      {dream.mood}
                    </button>
                  ))}
                </div>
                <button className="primary-action" type="submit" disabled={isPending}>
                  <Sparkles size={18} aria-hidden="true" />
                  <span>{isPending ? "Casting..." : "Cast Dream"}</span>
                  <ArrowRight size={18} aria-hidden="true" />
                </button>
              </form>
            ) : (
              <div className="vault-actions">
                <div className="form-head">
                  <Layers3 size={20} aria-hidden="true" />
                  <h2>Dream vault</h2>
                </div>
                <button className="primary-action" type="button" onClick={fuseFirstTwoDreams} disabled={isPending}>
                  <FlameKindling size={18} aria-hidden="true" />
                  <span>{isPending ? "Signing..." : "Fuse Dreams"}</span>
                </button>
                <div className="action-grid">
                  <button type="button" onClick={editLatestDream} disabled={isPending}>
                    Recast
                  </button>
                  <button type="button" onClick={deleteLatestDream} disabled={isPending}>
                    Clear
                  </button>
                  <button type="button" onClick={resetDreams} disabled={isPending}>
                    Reset
                  </button>
                </div>
              </div>
            )}
            <p className="notice">{notice}</p>
          </div>
        </div>
      </section>

      <section className="below-copy" aria-label="DreamExchange summary">
        <p>
          No token purchase. No daily limit. Gas only. Every cast, recast,
          fusion and clear is written to your Base dream archive.
        </p>
      </section>

      <section className="dream-ledger" aria-label="Dream archive">
        <div className="section-head">
          <div>
            <p className="eyebrow">Your archive</p>
            <h2>Latest dream records</h2>
          </div>
          <button className="ghost-button" type="button" onClick={() => refreshDreams()}>
            Refresh
          </button>
        </div>

        <div className="dream-list">
          {dreams.length ? (
            dreams
              .slice()
              .reverse()
              .map((dream) => (
                <article className="dream-card" key={dream.id.toString()}>
                  <div>
                    <small>#{dream.id.toString()}</small>
                    <h3>{dream.title}</h3>
                  </div>
                  <p>{dream.description}</p>
                  <footer>
                    <span>{dream.mood}</span>
                    <span>{dream.fusionCount.toString()} fusions</span>
                    <span>
                      {dream.createdAt
                        ? new Date(Number(dream.createdAt) * 1000).toLocaleDateString("en-US")
                        : "New"}
                    </span>
                  </footer>
                </article>
              ))
          ) : (
            <div className="empty-state">
              <Sparkles size={24} aria-hidden="true" />
              <p>No onchain dreams found yet.</p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
