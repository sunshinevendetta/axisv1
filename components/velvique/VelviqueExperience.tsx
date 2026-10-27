"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { Component, useCallback, useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";
import { useAccount, useConnect } from "wagmi";
import { useSiteLanguage } from "@/components/site-language";
import { VELVIQUE_COPY, localName, localizeQuestions } from "./velvique-i18n";
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

type AssignmentCard = CollectibleCard & {
  assignmentId: string;
  status: "queued" | "preparing" | "ready" | "served" | "void";
  narrative: { name: string; description: string; reading: string; provider: string } | null;
  collectible: { walletAddress: string; status: string } | null;
};

type Phase = "intro" | "follow" | "name" | "worlds" | "exclusions" | "mixing" | "result" | "error";

const GUEST_KEY = "velvique-guest-id";
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
  const [assignment, setAssignment] = useState<AssignmentCard | null>(null);
  const [error, setError] = useState("");
  const [tag, setTag] = useState<string | null>(null);
  const [webgl, setWebgl] = useState(true);
  const [sceneReady, setSceneReady] = useState(false);
  const [followClock, setFollowClock] = useState<number | null>(null);
  const [flipped, setFlipped] = useState(false);
  const [guestName, setGuestName] = useState("");
  const [zoomed, setZoomed] = useState(false);
  const [journey, setJourney] = useState<"idle" | "working" | "error">("idle");
  const [journeyError, setJourneyError] = useState("");
  const markSceneReady = useCallback(() => setSceneReady(true), []);
  const flip = useCallback(() => setFlipped((value) => !value), []);
  const { address } = useAccount();
  const { connectAsync, connectors } = useConnect();
  const { language } = useSiteLanguage();
  const t = VELVIQUE_COPY[language];
  /* The catalog arrives in English; every guest-facing label is localized here. */
  const shown = useMemo(() => localizeQuestions(questions, language), [questions, language]);
  const sceneText = useMemo(() => ({ words: language === "en" || language === "es", notAnswered: t.notAnswered }), [language, t]);

  const guestId = useCallback(() => (tag ? `tag-${tag}` : readStored(GUEST_KEY)), [tag]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const fromUrl = params.get("tag") || params.get("nfc") || params.get("qr");
    setTag(fromUrl);
    setWebgl(hasWebGL());
    setGuestName(readStored(NAME_KEY) ?? "");
    const id = fromUrl ? `tag-${fromUrl}` : readStored(GUEST_KEY);

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

    if (id) {
      void fetch(`/api/velvique/assignments/${encodeURIComponent(id)}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((data: { assignment?: AssignmentCard } | null) => {
          if (data?.assignment) {
            setAssignment(data.assignment);
            setPhase("result");
          }
        })
        .catch(() => undefined);
    }
  }, []);

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

  const mix = useCallback(async () => {
    setPhase("mixing");
    setError("");
    try {
      const ordered = questions.map((question) => answers[question.id]);
      const profileRes = await fetch("/api/velvique/guests/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: ordered, restrictions, tag, guestId: readStored(GUEST_KEY), displayName: guestName }),
      });
      const profile = (await profileRes.json()) as { ok: boolean; guest?: { guestId: string }; error?: string };
      if (!profile.ok || !profile.guest) throw new Error(profile.error);
      store(GUEST_KEY, profile.guest.guestId);

      const assignRes = await fetch("/api/velvique/assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guestId: profile.guest.guestId, idempotencyKey: `guest-${profile.guest.guestId}`, lang: language }),
      });
      const assigned = (await assignRes.json()) as { ok: boolean; assignment?: AssignmentCard; error?: string };
      if (!assigned.ok || !assigned.assignment) throw new Error(assigned.error);
      setAssignment(assigned.assignment);
      setPhase("result");
    } catch {
      setError("recipe");
      setPhase("error");
    }
  }, [answers, questions, restrictions, tag, language, guestName]);

  /* "Start the journey": opens a Base Account (passkey, no seed phrase) and links it to this card. */
  const startJourney = async () => {
    const id = guestId();
    if (!id) return;
    setJourney("working");
    setJourneyError("");
    try {
      let account = address;
      if (!account) {
        const connector = connectors.find((item) => item.id === "baseAccount") ?? connectors.find((item) => item.id === "coinbaseWalletSDK");
        if (!connector) throw new Error(t.errorPassBrowser);
        const result = await connectAsync({ connector });
        account = result.accounts[0];
      }
      const res = await fetch("/api/velvique/collectibles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guestId: id, walletAddress: account }),
      });
      const data = (await res.json()) as { ok: boolean; assignment?: AssignmentCard; error?: string };
      if (!data.ok || !data.assignment) throw new Error(t.errorPassSave);
      setAssignment(data.assignment);
      setJourney("idle");
    } catch (err) {
      const message = err instanceof Error ? err.message : "";
      setJourneyError(/reject|denied|cancel/i.test(message) ? t.errorPassClosed : message === t.errorPassBrowser ? message : t.errorPassSave);
      setJourney("error");
    }
  };

  const visibleExclusions = useMemo(() => (showAllExclusions ? exclusionOptions : exclusionOptions.slice(0, 3)), [exclusionOptions, showAllExclusions]);
  const saved = assignment?.collectible;
  const card = useMemo(
    () =>
      assignment && {
        ...assignment,
        build: assignment.build.map((item) => ({ ...item, name: localName(language, item.ingredientId, item.name) })),
        garnish: assignment.garnish && { ...assignment.garnish, name: localName(language, assignment.garnish.id, assignment.garnish.name) },
      },
    [assignment, language],
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
            <div className="vq-actions">
              <button type="button" className="vq-button" onClick={mix}>
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
            <p className="vq-meta is-center">{webgl ? t.dragHint : t.cardOf(card.queueNumber)}</p>
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
              <p className="vq-meta">{card.guestName ? `${t.cardOf(card.queueNumber)}. ${t.madeFor(card.guestName)}` : t.cardOf(card.queueNumber)}</p>
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
                {saved ? (
                  <>
                    <h2 className="vq-h3">{t.savedTitle}</h2>
                    <p className="vq-copy is-small">{t.savedBody(saved.walletAddress.slice(-4))}</p>
                    <p className="vq-copy is-small is-alert">{t.savedDraw}</p>
                  </>
                ) : (
                  <>
                    <h2 className="vq-h3">{t.keepTitle}</h2>
                    <p className="vq-copy is-small">{t.keepBody}</p>
                    <button type="button" className="vq-button" disabled={journey === "working"} onClick={startJourney}>
                      {journey === "working" ? t.startingJourney : t.startJourney}
                    </button>
                    {journey === "error" && <p className="vq-copy is-small is-alert">{journeyError}</p>}
                  </>
                )}
              </div>

              <p className="vq-meta">{t.signature(card.signatureHash.slice(0, 8))}</p>
            </div>
          </section>
        )}

        {phase === "error" && (
          <section className="vq-screen">
            <h2 className="vq-h2">{error === "questions" ? t.errorQuestions : t.errorRecipe}</h2>
            <div className="vq-actions">
              <button type="button" className="vq-button" onClick={() => (allAnswered ? void mix() : setPhase("worlds"))}>
                {t.tryAgain}
              </button>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
