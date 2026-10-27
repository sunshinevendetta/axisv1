"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { Component, useCallback, useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";
import { numberToHex, type Address, type Hex } from "viem";
import { useAccount, useConnect } from "wagmi";
import { useSiteLanguage } from "@/components/site-language";
import { encodeCardMint } from "@/src/lib/velvique-chain";
import { EN_NAMES, VELVIQUE_COPY, localName, localizeQuestions } from "./velvique-i18n";
import type { PortalOption } from "./VelviquePortals";
import type { CollectibleCard } from "./VelviqueCollectible";
import "./velvique.css";

const VelviquePortals = dynamic(() => import("./VelviquePortals"), { ssr: false });
const VelviqueCollectible = dynamic(() => import("./VelviqueCollectible"), { ssr: false });

/* If WebGL is missing or the context is lost, drop the 3D layer and keep the
   dock buttons, which run the same five-question flow on their own. */
class SceneBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}

function hasWebGL() {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

type Question = {
  id: string;
  dimension: string;
  prompt: string;
  options: Array<PortalOption & { detail: string }>;
};

type Exclusion = { id: string; label: string };

type Pour = { ingredientId: string; ml: number };

/* What /api/velvique/quote returns; sealed server-side, shown here as-is. */
type Quote = {
  wallet: string;
  recipeCode: Hex;
  components: Pour[];
  signatureHash: string;
  garnishId: string | null;
  narrative: { name: string; description: string; reading: string };
  guestName: string | null;
  profileCode: string;
  lang: string;
  expiresAt: number;
};

type CardMetadata = {
  name: string;
  description: string;
  properties: { recipe: Pour[]; recipe_signature: string; garnish_id: string | null; sensory_reading: string; guest_name: string | null; created_at: string };
} | null;

type DisplayCard = CollectibleCard & {
  narrative: { name: string; description: string; reading: string } | null;
  wallet: string | null;
};

type Eip1193 = { request: (args: { method: string; params?: unknown[] }) => Promise<unknown> };
type MintState = "idle" | "saving" | "saved" | "error";

type Phase = "intro" | "follow" | "name" | "worlds" | "exclusions" | "mixing" | "result" | "error";

const CARD_KEY = "velvique-card";
const ANSWERS_KEY = "velvique-answers";
const FOLLOW_KEY = "velvique-follow-ok";
const NAME_KEY = "velvique-name";
const INSTAGRAM_URL = "https://www.instagram.com/velviquetequila/";
const FOLLOW_WAIT_S = 5;

function readStored(key: string) {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function store(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    /* Storage can be blocked; the session still works without it. */
  }
}

function buildOf(components: Pour[]) {
  return components.map((c) => ({ ...c, name: EN_NAMES[c.ingredientId] ?? c.ingredientId }));
}

function cardFromQuote(quote: Quote, tokenId: number, wallet: string | null): DisplayCard {
  return {
    queueNumber: tokenId,
    guestName: quote.guestName,
    recipeId: `VLQ-${quote.signatureHash.slice(0, 8).toUpperCase()}`,
    signatureHash: quote.signatureHash,
    assignedAt: new Date().toISOString(),
    build: buildOf(quote.components),
    garnish: quote.garnishId ? { id: quote.garnishId, name: EN_NAMES[quote.garnishId] ?? quote.garnishId } : null,
    narrative: quote.narrative,
    wallet,
  };
}

function cardFromMetadata(tokenId: number, metadata: NonNullable<CardMetadata>, wallet: string): DisplayCard {
  const p = metadata.properties;
  return {
    queueNumber: tokenId,
    guestName: p.guest_name,
    recipeId: `VLQ-${p.recipe_signature.slice(0, 8).toUpperCase()}`,
    signatureHash: p.recipe_signature,
    assignedAt: p.created_at,
    build: buildOf(p.recipe),
    garnish: p.garnish_id ? { id: p.garnish_id, name: EN_NAMES[p.garnish_id] ?? p.garnish_id } : null,
    narrative: { name: metadata.name, description: metadata.description, reading: p.sensory_reading },
    wallet,
  };
}

/* wallet_getCallsStatus until the batch settles (EIP-5792 v1 strings or v2 codes). */
async function waitForCalls(provider: Eip1193, batchId: string) {
  const started = Date.now();
  while (Date.now() - started < 120_000) {
    const status = (await provider.request({ method: "wallet_getCallsStatus", params: [batchId] }).catch(() => null)) as {
      status?: string | number;
      receipts?: Array<{ status?: string }>;
    } | null;
    const value = status?.status;
    if (value !== undefined && value !== "PENDING" && value !== 100) return status;
    await new Promise((resolve) => setTimeout(resolve, 1500));
  }
  return null;
}

export default function VelviqueExperience() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [exclusionOptions, setExclusionOptions] = useState<Exclusion[]>([]);
  const [phase, setPhase] = useState<Phase>("intro");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [activeId, setActiveId] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [focus, setFocus] = useState(0);
  const swipe = useRef({ x: 0, y: 0, at: 0, swipedAt: 0 });
  const [restrictions, setRestrictions] = useState<string[]>([]);
  const [showAllExclusions, setShowAllExclusions] = useState(false);
  const [display, setDisplay] = useState<DisplayCard | null>(null);
  const [error, setError] = useState("");
  const [webgl, setWebgl] = useState(true);
  const [sceneReady, setSceneReady] = useState(false);
  const [followClock, setFollowClock] = useState<number | null>(null);
  const [flipped, setFlipped] = useState(false);
  const [guestName, setGuestName] = useState("");
  const [zoomed, setZoomed] = useState(false);
  const [mint, setMint] = useState<MintState>("idle");
  const [mintError, setMintError] = useState("");
  const markSceneReady = useCallback(() => setSceneReady(true), []);
  const flip = useCallback(() => setFlipped((value) => !value), []);
  const { address, connector: activeConnector } = useAccount();
  const { connectAsync, connectors } = useConnect();
  const { language } = useSiteLanguage();
  const t = VELVIQUE_COPY[language];
  /* The catalog arrives in English; every guest-facing label is localized here. */
  const shown = useMemo(() => localizeQuestions(questions, language), [questions, language]);
  const sceneText = useMemo(() => ({ words: language === "en" || language === "es", notAnswered: t.notAnswered }), [language, t]);

  useEffect(() => {
    setWebgl(hasWebGL());
    setGuestName(readStored(NAME_KEY) ?? "");
    /* Reopen the last card this browser showed; the chain confirms it below. */
    try {
      const cached = JSON.parse(readStored(CARD_KEY) ?? "null") as DisplayCard | null;
      const savedAnswers = JSON.parse(readStored(ANSWERS_KEY) ?? "null") as { answers: Record<string, string>; restrictions: string[] } | null;
      if (savedAnswers) {
        setAnswers(savedAnswers.answers);
        setRestrictions(savedAnswers.restrictions);
      }
      if (cached) {
        setDisplay(cached);
        setMint(cached.queueNumber > 0 ? "saved" : "error");
        setPhase("result");
      }
    } catch {
      /* A corrupt cache just means starting fresh. */
    }

    void fetch("/api/velvique/questions")
      .then((res) => res.json())
      .then((data: { questions: Question[]; exclusions: Exclusion[] }) => {
        setQuestions(data.questions);
        setExclusionOptions(data.exclusions);
      })
      .catch(() => {
        setError("questions");
        setPhase("error");
      });
  }, []);

  /* A connected pass that already holds a card always shows it, read from Base. */
  useEffect(() => {
    if (!address || mint === "saving") return;
    void fetch(`/api/velvique/card?wallet=${address}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { tokenId?: number; metadata?: CardMetadata } | null) => {
        if (data?.tokenId && data.metadata) {
          const next = cardFromMetadata(data.tokenId, data.metadata, address);
          setDisplay(next);
          store(CARD_KEY, JSON.stringify(next));
          setMint("saved");
          setPhase("result");
        }
      })
      .catch(() => undefined);
    // Only when the connected account changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address]);

  useEffect(() => {
    if (!zoomed) return;
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setZoomed(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [zoomed]);

  /* Instagram gate: once the guest opens the profile, Continue unlocks after five seconds. */
  useEffect(() => {
    if (followClock === null || followClock <= 0) return;
    const timer = window.setTimeout(() => setFollowClock(followClock - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [followClock]);

  const activeIndex = shown.findIndex((question) => question.id === activeId);
  const activeQuestion = activeIndex >= 0 ? shown[activeIndex] : null;
  const pendingOption = activeQuestion?.options.find((option) => option.id === pendingId) ?? null;
  const answeredCount = questions.filter((question) => answers[question.id]).length;
  const allAnswered = questions.length > 0 && answeredCount === questions.length;
  const focusQuestion = shown[focus] ?? null;

  const start = () => setPhase(readStored(FOLLOW_KEY) === "1" ? "name" : "follow");

  const passFollow = () => {
    store(FOLLOW_KEY, "1");
    setPhase("name");
  };

  const passName = (keep: boolean) => {
    const name = keep ? guestName.trim().slice(0, 24) : "";
    setGuestName(name);
    store(NAME_KEY, name);
    setPhase("worlds");
  };

  const enter = useCallback(
    (questionId: string) => {
      setActiveId(questionId);
      setPendingId(answers[questionId] ?? null);
    },
    [answers],
  );

  const leave = useCallback(() => {
    setActiveId(null);
    setPendingId(null);
  }, []);

  const pick = useCallback(
    (questionId: string, optionId: string) => {
      if (questionId === activeId) setPendingId(optionId);
    },
    [activeId],
  );

  /* After an answer, step to the next world that still needs one. */
  const confirm = useCallback(() => {
    if (!activeId || !pendingId) return;
    const next = { ...answers, [activeId]: pendingId };
    setAnswers(next);
    leave();
    const from = questions.findIndex((question) => question.id === activeId);
    for (let step = 1; step <= questions.length; step += 1) {
      const index = (from + step) % questions.length;
      if (!next[questions[index].id]) {
        window.setTimeout(() => setFocus(index), 450);
        break;
      }
    }
  }, [activeId, pendingId, answers, questions, leave]);

  const moveFocus = useCallback(
    (delta: number) => setFocus((current) => Math.min(questions.length - 1, Math.max(0, current + delta))),
    [questions.length],
  );

  /* A swipe on the stage moves the stepper; the tap that ends a swipe must not also enter a world. */
  const enterFromScene = useCallback(
    (questionId: string) => {
      if (Date.now() - swipe.current.swipedAt >= 400) enter(questionId);
    },
    [enter],
  );
  const focusFromScene = useCallback((index: number) => {
    if (Date.now() - swipe.current.swipedAt >= 400) setFocus(index);
  }, []);
  const onStageDown = (event: ReactPointerEvent) => {
    swipe.current = { ...swipe.current, x: event.clientX, y: event.clientY, at: Date.now() };
  };
  const onStageUp = (event: ReactPointerEvent) => {
    if (activeId) return;
    const dx = event.clientX - swipe.current.x;
    const dy = event.clientY - swipe.current.y;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.2 && Date.now() - swipe.current.at < 800) {
      swipe.current.swipedAt = Date.now();
      moveFocus(dx < 0 ? 1 : -1);
    }
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (phase !== "worlds") return;
      if (event.key === "Escape") leave();
      if (event.key === "Enter" && pendingId) confirm();
      if (!activeQuestion && event.key === "ArrowRight") moveFocus(1);
      if (!activeQuestion && event.key === "ArrowLeft") moveFocus(-1);
      if (!activeQuestion && event.key === "Enter" && questions[focus]) enter(questions[focus].id);
      const n = Number(event.key) - 1;
      if (Number.isNaN(n)) return;
      if (!activeQuestion && questions[n]) setFocus(n);
      if (activeQuestion?.options[n]) setPendingId(activeQuestion.options[n].id);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [phase, questions, activeQuestion, pendingId, focus, enter, leave, confirm, moveFocus]);

  const showCard = useCallback((next: DisplayCard) => {
    setDisplay(next);
    store(CARD_KEY, JSON.stringify(next));
  }, []);

  /* "Create my card" opens a Base Account (passkey, no seed phrase) first: the card is minted into it. */
  const ensurePass = async () => {
    let account = address;
    let connector = activeConnector;
    if (!account || !connector) {
      connector = connectors.find((item) => item.id === "baseAccount") ?? connectors.find((item) => item.id === "coinbaseWalletSDK");
      if (!connector) throw new Error("pass-browser");
      const result = await connectAsync({ connector });
      account = result.accounts[0];
    }
    const provider = (await connector.getProvider()) as Eip1193;
    return { account: account as Address, provider };
  };

  /* Render the card, publish it to Grove, then mint from the guest's pass with gas sponsored. */
  const mintCard = async (quote: Quote, token: string, account: Address, provider: Eip1193): Promise<number | "taken"> => {
    const { renderCardImage } = await import("./VelviqueCollectible");
    const image = await renderCardImage(cardFromQuote(quote, 0, account), t.card);
    const res = await fetch("/api/velvique/publish", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, image }),
    });
    const voucher = (await res.json()) as { ok: boolean; taken?: boolean; contract?: Address; chainId?: number; recipe?: Hex; uri?: string; deadline?: string; signature?: Hex };
    if (voucher.taken) return "taken";
    if (!voucher.ok || !voucher.contract || !voucher.recipe || !voucher.uri || !voucher.deadline || !voucher.signature) throw new Error("save");

    const batch = (await provider.request({
      method: "wallet_sendCalls",
      params: [
        {
          version: "1.0",
          chainId: numberToHex(voucher.chainId ?? 8453),
          from: account,
          calls: [{ to: voucher.contract, value: "0x0", data: encodeCardMint(voucher.recipe, voucher.uri, BigInt(voucher.deadline), voucher.signature) }],
          capabilities: { paymasterService: { url: `${window.location.origin}/api/velvique/paymaster` } },
        },
      ],
    })) as string | { id?: string };
    const batchId = typeof batch === "string" ? batch : batch?.id ?? "";
    if (!batchId) throw new Error("save");
    await waitForCalls(provider, batchId);

    /* The chain decides: a card means it minted, none means the recipe went to someone else. */
    const card = (await fetch(`/api/velvique/card?wallet=${account}`).then((r) => (r.ok ? r.json() : null))) as { tokenId?: number } | null;
    return card?.tokenId ? card.tokenId : "taken";
  };

  const createCard = useCallback(async () => {
    setPhase("mixing");
    setError("");
    setMintError("");
    store(ANSWERS_KEY, JSON.stringify({ answers, restrictions }));
    let revealed = false;
    try {
      const { account, provider } = await ensurePass();
      const ordered = questions.map((question) => answers[question.id]);
      const avoid: string[] = [];
      for (let attempt = 0; attempt < 3; attempt += 1) {
        const res = await fetch("/api/velvique/quote", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ answers: ordered, restrictions, displayName: guestName, wallet: account, lang: language, avoid }),
        });
        const data = (await res.json()) as { ok: boolean; quote?: Quote; token?: string; existing?: { tokenId: number; metadata: CardMetadata } };
        if (data.existing?.metadata) {
          showCard(cardFromMetadata(data.existing.tokenId, data.existing.metadata, account));
          setMint("saved");
          setPhase("result");
          return;
        }
        if (!data.ok || !data.quote || !data.token) {
          setError(res.status === 409 ? "soldout" : "recipe");
          setPhase("error");
          return;
        }
        showCard(cardFromQuote(data.quote, 0, account));
        setPhase("result");
        setMint("saving");
        revealed = true;
        const outcome = await mintCard(data.quote, data.token, account, provider);
        if (outcome !== "taken") {
          showCard(cardFromQuote(data.quote, outcome, account));
          setMint("saved");
          return;
        }
        avoid.push(data.quote.recipeCode);
      }
      setMint("error");
    } catch (err) {
      const message = err instanceof Error ? err.message : "";
      const kind = /reject|denied|cancel|closed/i.test(message) ? "pass-closed" : message === "pass-browser" ? "pass-browser" : "save";
      if (revealed) {
        setMintError(kind === "pass-closed" ? t.errorPassClosed : t.errorPassSave);
        setMint("error");
      } else {
        setError(kind === "save" ? "recipe" : kind);
        setPhase("error");
      }
    }
    // ensurePass/mintCard read the latest wagmi state on each call.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answers, questions, restrictions, guestName, language, t, showCard]);

  const visibleExclusions = useMemo(() => (showAllExclusions ? exclusionOptions : exclusionOptions.slice(0, 3)), [exclusionOptions, showAllExclusions]);
  const card = useMemo(
    () =>
      display && {
        ...display,
        build: display.build.map((item) => ({ ...item, name: localName(language, item.ingredientId, item.name) })),
        garnish: display.garnish && { ...display.garnish, name: localName(language, display.garnish.id, display.garnish.name) },
      },
    [display, language],
  );

  return (
    <main className={`vq-page ${phase === "result" ? "is-scroll" : ""}`}>
      <div aria-hidden className="vq-bg" />

      <header className="vq-topbar">
        <Link href="/" aria-label="Go to AXIS home" className="vq-axis">
          <Image src="/logow.png" alt="AXIS" width={84} height={26} priority />
        </Link>
        <span className="vq-cross" aria-hidden>
          ×
        </span>
        <Image className="vq-brand" src="/velvique/velvique-logo.webp" alt="Velvique" width={688} height={107} priority />
        {phase === "worlds" && (
          <span className="vq-progress" aria-live="polite">
            {t.progress(answeredCount, questions.length)}
          </span>
        )}
      </header>

      <div className="vq-body">
        {phase === "intro" && (
          <section className="vq-screen vq-intro">
            <div className="vq-bottle" aria-hidden>
              <Image src="/velvique/velvique-bottle.webp" alt="" width={900} height={1200} priority sizes="(max-width: 720px) 40vw, 300px" />
            </div>
            <Image className="vq-wordmark" src="/velvique/velvique-logo.webp" alt="Velvique" width={688} height={107} priority />
            <h1 className="vq-h1">{t.introTitle}</h1>
            <p className="vq-copy">{t.introBody}</p>
            <p className="vq-meta">{t.giveaway}</p>
            <button type="button" className="vq-button" disabled={questions.length === 0} onClick={start}>
              {questions.length === 0 ? t.loading : t.start}
            </button>
          </section>
        )}

        {phase === "follow" && (
          <section className="vq-screen vq-follow">
            <h2 className="vq-h2">{t.followTitle}</h2>
            <p className="vq-copy">{t.followBody}</p>
            <div className="vq-actions is-stacked">
              <button
                type="button"
                className="vq-button"
                onClick={() => {
                  /* A user-initiated open hands the profile to the Instagram app on iOS and Android. */
                  window.open(INSTAGRAM_URL, "_blank", "noopener");
                  setFollowClock(FOLLOW_WAIT_S);
                }}
              >
                {t.openInstagram}
              </button>
              {followClock !== null && (
                <button type="button" className="vq-button is-ghost" disabled={followClock > 0} onClick={passFollow}>
                  {followClock > 0 ? t.continueIn(followClock) : t.continue}
                </button>
              )}
            </div>
            <button type="button" className="vq-link" onClick={passFollow}>
              {t.alreadyFollow}
            </button>
          </section>
        )}

        {phase === "name" && (
          <section className="vq-screen">
            <h2 className="vq-h2">{t.nameTitle}</h2>
            <p className="vq-copy">{t.nameBody}</p>
            <form
              className="vq-name"
              onSubmit={(event) => {
                event.preventDefault();
                passName(true);
              }}
            >
              <input
                className="vq-input"
                type="text"
                name="name"
                autoComplete="given-name"
                enterKeyHint="next"
                maxLength={24}
                placeholder={t.namePlaceholder}
                aria-label={t.namePlaceholder}
                value={guestName}
                onChange={(event) => setGuestName(event.target.value)}
              />
              <div className="vq-actions">
                <button type="submit" className="vq-button" disabled={!guestName.trim()}>
                  {t.continue}
                </button>
              </div>
            </form>
            <button type="button" className="vq-link" onClick={() => passName(false)}>
              {t.skipName}
            </button>
          </section>
        )}

        {phase === "worlds" && (
          <section className="vq-worlds">
            <div className="vq-band">
              {activeQuestion ? (
                <>
                  <button type="button" className="vq-link vq-back" onClick={leave}>
                    {t.backToWorlds}
                  </button>
                  <p className="vq-meta">{t.questionMeta(activeIndex + 1, questions.length)}</p>
                  <h2 className="vq-h2">{activeQuestion.prompt}</h2>
                </>
              ) : (
                focusQuestion && (
                  <>
                    <p className="vq-meta">{t.worldMeta(focus + 1, questions.length, focusQuestion.dimension)}</p>
                    <h2 className="vq-h2">{focusQuestion.prompt}</h2>
                  </>
                )
              )}
            </div>

            <div className="vq-stage" onPointerDown={onStageDown} onPointerUp={onStageUp}>
              {webgl && (
                <SceneBoundary>
                  <VelviquePortals
                    questions={shown}
                    answers={answers}
                    activeId={activeId}
                    pendingId={pendingId}
                    focusIndex={focus}
                    onEnter={enterFromScene}
                    onFocusIndex={focusFromScene}
                    onPick={pick}
                    onReady={markSceneReady}
                    sceneText={sceneText}
                  />
                </SceneBoundary>
              )}
              {webgl && !sceneReady && (
                <div className="vq-loading" aria-live="polite">
                  <div className="vq-bottle is-small" aria-hidden>
                    <Image src="/velvique/velvique-bottle.webp" alt="" width={900} height={1200} sizes="64px" />
                  </div>
                  <p className="vq-meta">{t.openingWorlds}</p>
                </div>
              )}
            </div>

            <div className="vq-dock">
              {!activeQuestion && (
                <>
                  <ol className="vq-steps" aria-label="Questions">
                    {shown.map((question, index) => (
                      <li key={question.id}>
                        <button
                          type="button"
                          className={`${answers[question.id] ? "is-done" : ""} ${focus === index ? "is-current" : ""}`}
                          aria-current={focus === index ? "step" : undefined}
                          aria-label={`${question.dimension}${answers[question.id] ? ", answered" : ""}`}
                          onClick={() => setFocus(index)}
                        >
                          {index + 1}
                        </button>
                      </li>
                    ))}
                  </ol>
                  {focusQuestion && (
                    <div className="vq-actions">
                      {allAnswered ? (
                        <>
                          <button type="button" className="vq-button is-ghost" onClick={() => enter(focusQuestion.id)}>
                            {t.changeAnswer}
                          </button>
                          <button type="button" className="vq-button" onClick={() => setPhase("exclusions")}>
                            {t.continue}
                          </button>
                        </>
                      ) : (
                        <button type="button" className="vq-button" onClick={() => enter(focusQuestion.id)}>
                          {answers[focusQuestion.id] ? t.changeAnswer : t.stepInside}
                        </button>
                      )}
                    </div>
                  )}
                </>
              )}

              {activeQuestion && !pendingOption && (
                <div className="vq-answers" role="group" aria-label={activeQuestion.prompt}>
                  {activeQuestion.options.map((option) => (
                    <button key={option.id} type="button" className={answers[activeQuestion.id] === option.id ? "is-done" : ""} onClick={() => setPendingId(option.id)}>
                      {option.label}
                    </button>
                  ))}
                </div>
              )}

              {activeQuestion && pendingOption && (
                <div className="vq-sheet" key={pendingOption.id}>
                  <h3 className="vq-h3">{pendingOption.label}</h3>
                  <p className="vq-copy is-small">{pendingOption.detail}</p>
                  <div className="vq-actions">
                    <button type="button" className="vq-button" onClick={confirm}>
                      {t.choose}
                    </button>
                    <button type="button" className="vq-button is-ghost" onClick={() => setPendingId(null)}>
                      {t.keepLooking}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {phase === "exclusions" && (
          <section className="vq-screen">
            <h2 className="vq-h2">{t.exclusionsTitle}</h2>
            <p className="vq-copy">{t.exclusionsBody}</p>
            <div className="vq-chips">
              {visibleExclusions.map((item) => {
                const on = restrictions.includes(item.id);
                return (
                  <button
                    key={item.id}
                    type="button"
                    aria-pressed={on}
                    className={on ? "is-on" : ""}
                    onClick={() => setRestrictions((prev) => (on ? prev.filter((id) => id !== item.id) : [...prev, item.id]))}
                  >
                    {localName(language, item.id, item.label)}
                  </button>
                );
              })}
              {!showAllExclusions && (
                <button type="button" className="is-more" onClick={() => setShowAllExclusions(true)}>
                  {t.moreIngredients}
                </button>
              )}
            </div>
            <p className="vq-meta">{t.passNote}</p>
            <div className="vq-actions">
              <button type="button" className="vq-button" onClick={() => void createCard()}>
                {t.createCard}
              </button>
              <button type="button" className="vq-button is-ghost" onClick={() => setPhase("worlds")}>
                {t.backToWorldsShort}
              </button>
            </div>
          </section>
        )}

        {phase === "mixing" && (
          <section className="vq-screen vq-intro" aria-live="polite">
            <div className="vq-bottle is-pouring" aria-hidden>
              <Image src="/velvique/velvique-bottle.webp" alt="" width={900} height={1200} sizes="120px" />
            </div>
            <h2 className="vq-h2">{t.composingTitle}</h2>
            <p className="vq-copy">{t.composingBody}</p>
          </section>
        )}

        {phase === "result" && card && (
          <section className="vq-result">
            <div className="vq-card-stage">
              {webgl && !zoomed ? (
                <VelviqueCollectible card={card} labels={t.card} flipped={flipped} onFlip={flip} />
              ) : webgl ? null : (
                <div className="vq-bottle" aria-hidden>
                  <Image src="/velvique/velvique-bottle.webp" alt="" width={900} height={1200} sizes="200px" />
                </div>
              )}
            </div>
            <p className="vq-meta is-center">{webgl ? t.dragHint : card.queueNumber > 0 ? t.cardOf(card.queueNumber) : ""}</p>
            {webgl && (
              <button type="button" className="vq-link vq-zoom" onClick={() => setZoomed(true)}>
                {t.viewFull}
              </button>
            )}

            {zoomed && (
              <div className="vq-card-full" role="dialog" aria-modal="true" aria-label={t.viewFull}>
                <div className="vq-card-full-bar">
                  <button type="button" className="vq-button is-ghost" onClick={() => setZoomed(false)} autoFocus>
                    {t.back}
                  </button>
                  <p className="vq-meta">{t.dragHint}</p>
                </div>
                <div className="vq-card-full-stage">
                  <VelviqueCollectible card={card} labels={t.card} flipped={flipped} onFlip={flip} />
                </div>
              </div>
            )}

            <div className="vq-result-body">
              <p className="vq-meta">{[card.queueNumber > 0 ? t.cardOf(card.queueNumber) : "", card.guestName ? t.madeFor(card.guestName) : ""].filter(Boolean).join(". ")}</p>
              <h1 className="vq-h1">{card.narrative?.name ?? "Velvique"}</h1>
              {card.narrative?.description && <p className="vq-copy">{card.narrative.description}</p>}

              <div className="vq-recipe">
                <h2 className="vq-h3">{t.yourRecipe}</h2>
                <ul>
                  {card.build.map((item) => (
                    <li key={item.ingredientId}>
                      <span>{item.name}</span>
                      <span>{item.ml.toFixed(1)} ml</span>
                    </li>
                  ))}
                </ul>
                {card.garnish && <p className="vq-copy is-small">{t.finishWith(card.garnish.name)}</p>}
              </div>

              <div className="vq-journey">
                {mint === "saved" && (
                  <>
                    <h2 className="vq-h3">{t.savedTitle}</h2>
                    {card.wallet && <p className="vq-copy is-small">{t.savedBody(card.wallet.slice(-4))}</p>}
                    <p className="vq-copy is-small is-alert">{t.savedDraw}</p>
                  </>
                )}
                {mint === "saving" && (
                  <>
                    <h2 className="vq-h3">{t.savingCard}</h2>
                    <p className="vq-copy is-small">{t.savingBody}</p>
                  </>
                )}
                {(mint === "error" || mint === "idle") && (
                  <>
                    <h2 className="vq-h3">{t.saveFailed}</h2>
                    {mintError && <p className="vq-copy is-small">{mintError}</p>}
                    <button type="button" className="vq-button" onClick={() => void createCard()}>
                      {t.retrySave}
                    </button>
                  </>
                )}
              </div>

              <p className="vq-meta">{t.signature(card.signatureHash.slice(0, 8))}</p>
            </div>
          </section>
        )}

        {phase === "error" && (
          <section className="vq-screen">
            <h2 className="vq-h2">
              {error === "questions"
                ? t.errorQuestions
                : error === "soldout"
                  ? t.errorSoldOut
                  : error === "pass-closed"
                    ? t.errorPassClosed
                    : error === "pass-browser"
                      ? t.errorPassBrowser
                      : t.errorRecipe}
            </h2>
            <div className="vq-actions">
              <button type="button" className="vq-button" onClick={() => (allAnswered ? void createCard() : setPhase("worlds"))}>
                {t.tryAgain}
              </button>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
