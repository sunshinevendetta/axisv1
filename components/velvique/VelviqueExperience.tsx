"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { Component, useCallback, useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";
import { useSiteLanguage } from "@/components/site-language";
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
  email: string;
  recipeCode: string;
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
  email: string | null;
};

type MintState = "idle" | "saving" | "saved" | "error";
type Existing = { number: number; metadata: NonNullable<CardMetadata> };

type Phase = "intro" | "follow" | "name" | "worlds" | "exclusions" | "mixing" | "result" | "error";

const CARD_KEY = "velvique-card";
const ANSWERS_KEY = "velvique-answers";
const FOLLOW_KEY = "velvique-follow-ok";
const NAME_KEY = "velvique-name";
const GUEST_KEY = "velvique-guest";
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

function cardFromQuote(quote: Quote, number: number): DisplayCard {
  return {
    queueNumber: number,
    guestName: quote.guestName,
    recipeId: `VLQ-${quote.signatureHash.slice(0, 8).toUpperCase()}`,
    signatureHash: quote.signatureHash,
    assignedAt: new Date().toISOString(),
    build: buildOf(quote.components),
    garnish: quote.garnishId ? { id: quote.garnishId, name: EN_NAMES[quote.garnishId] ?? quote.garnishId } : null,
    narrative: quote.narrative,
    email: quote.email,
  };
}

function cardFromMetadata({ number, metadata }: Existing, email: string): DisplayCard {
  const p = metadata.properties;
  return {
    queueNumber: number,
    guestName: p.guest_name,
    recipeId: `VLQ-${p.recipe_signature.slice(0, 8).toUpperCase()}`,
    signatureHash: p.recipe_signature,
    assignedAt: p.created_at,
    build: buildOf(p.recipe),
    garnish: p.garnish_id ? { id: p.garnish_id, name: EN_NAMES[p.garnish_id] ?? p.garnish_id } : null,
    narrative: { name: metadata.name, description: metadata.description, reading: p.sensory_reading },
    email,
  };
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
  const [guestEmail, setGuestEmail] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [signupError, setSignupError] = useState("");
  const [signingUp, setSigningUp] = useState(false);
  const [zoomed, setZoomed] = useState(false);
  const [mint, setMint] = useState<MintState>("idle");
  const [mintError, setMintError] = useState("");
  const markSceneReady = useCallback(() => setSceneReady(true), []);
  const flip = useCallback(() => setFlipped((value) => !value), []);
  const { language } = useSiteLanguage();
  const t = VELVIQUE_COPY[language];
  /* The catalog arrives in English; every guest-facing label is localized here. */
  const shown = useMemo(() => localizeQuestions(questions, language), [questions, language]);
  const sceneText = useMemo(() => ({ words: language === "en" || language === "es", notAnswered: t.notAnswered }), [language, t]);

  useEffect(() => {
    setWebgl(hasWebGL());
    setGuestName(readStored(NAME_KEY) ?? "");
    /* Reopen the last card this browser showed. */
    try {
      const guest = JSON.parse(readStored(GUEST_KEY) ?? "null") as { email?: string; phone?: string } | null;
      if (guest) {
        setGuestEmail(guest.email ?? "");
        setGuestPhone(guest.phone ?? "");
      }
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

  /* Name, email and phone join the Brevo guest list for the draw; the card email comes at the end. */
  const signUp = async () => {
    const name = guestName.trim().slice(0, 24);
    const email = guestEmail.trim().toLowerCase();
    const phone = guestPhone.trim();
    setSignupError("");
    setSigningUp(true);
    try {
      const res = await fetch("/api/velvique/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, lang: language }),
      });
      const data = (await res.json().catch(() => ({ ok: false }))) as { ok: boolean; field?: string; name?: string; existing?: Existing };
      if (!data.ok) {
        setSignupError(data.field === "name" ? t.errorName : data.field === "email" ? t.errorEmail : data.field === "phone" ? t.errorPhone : t.errorSignup);
        return;
      }
      setGuestName(data.name ?? name);
      store(NAME_KEY, data.name ?? name);
      store(GUEST_KEY, JSON.stringify({ email, phone }));
      setGuestEmail(email);
      if (data.existing) {
        showCard(cardFromMetadata(data.existing, email));
        setMint("saved");
        setPhase("result");
        return;
      }
      setPhase("worlds");
    } catch {
      setSignupError(t.errorSignup);
    } finally {
      setSigningUp(false);
    }
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

  /* Render the card and publish it: Grove keeps the image, Brevo records the recipe and emails it. */
  const saveCard = async (quote: Quote, token: string, number: number): Promise<{ number: number } | Existing | "taken"> => {
    const { renderCardImage } = await import("./VelviqueCollectible");
    const image = await renderCardImage(cardFromQuote(quote, number), t.card);
    const res = await fetch("/api/velvique/publish", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, image }),
    });
    const data = (await res.json().catch(() => ({ ok: false }))) as { ok: boolean; taken?: boolean; number?: number; existing?: Existing };
    if (data.taken) return "taken";
    if (data.existing) return data.existing;
    if (!data.ok || !data.number) throw new Error("save");
    return { number: data.number };
  };

  const createCard = useCallback(async () => {
    const email = guestEmail.trim().toLowerCase();
    if (!email) {
      setPhase("name");
      return;
    }
    setPhase("mixing");
    setError("");
    setMintError("");
    store(ANSWERS_KEY, JSON.stringify({ answers, restrictions }));
    let revealed = false;
    try {
      const ordered = questions.map((question) => answers[question.id]);
      const avoid: string[] = [];
      for (let attempt = 0; attempt < 3; attempt += 1) {
        const res = await fetch("/api/velvique/quote", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ answers: ordered, restrictions, email, lang: language, avoid }),
        });
        const data = (await res.json().catch(() => ({ ok: false }))) as { ok: boolean; quote?: Quote; token?: string; number?: number; existing?: Existing };
        if (data.existing) {
          showCard(cardFromMetadata(data.existing, email));
          setMint("saved");
          setPhase("result");
          return;
        }
        if (res.status === 403) {
          setPhase("name");
          return;
        }
        if (!data.ok || !data.quote || !data.token) {
          setError(res.status === 409 ? "soldout" : "recipe");
          setPhase("error");
          return;
        }
        showCard(cardFromQuote(data.quote, data.number ?? 0));
        setPhase("result");
        setMint("saving");
        revealed = true;
        const outcome = await saveCard(data.quote, data.token, data.number ?? 0);
        if (outcome === "taken") {
          avoid.push(data.quote.recipeCode);
          continue;
        }
        showCard("metadata" in outcome ? cardFromMetadata(outcome, email) : cardFromQuote(data.quote, outcome.number));
        setMint("saved");
        return;
      }
      setMint("error");
    } catch {
      if (revealed) {
        setMintError(t.errorSave);
        setMint("error");
      } else {
        setError("recipe");
        setPhase("error");
      }
    }
    // saveCard reads the latest copy on each call.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answers, questions, restrictions, guestEmail, language, t, showCard]);

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
                void signUp();
              }}
            >
              <input
                className="vq-input"
                type="text"
                name="name"
                autoComplete="given-name"
                enterKeyHint="next"
                maxLength={24}
                required
                placeholder={t.namePlaceholder}
                aria-label={t.namePlaceholder}
                value={guestName}
                onChange={(event) => setGuestName(event.target.value)}
              />
              <input
                className="vq-input"
                type="email"
                name="email"
                autoComplete="email"
                inputMode="email"
                enterKeyHint="next"
                maxLength={254}
                required
                placeholder={t.emailPlaceholder}
                aria-label={t.emailPlaceholder}
                value={guestEmail}
                onChange={(event) => setGuestEmail(event.target.value)}
              />
              <input
                className="vq-input"
                type="tel"
                name="phone"
                autoComplete="tel"
                inputMode="tel"
                enterKeyHint="done"
                maxLength={24}
                required
                placeholder={t.phonePlaceholder}
                aria-label={t.phonePlaceholder}
                value={guestPhone}
                onChange={(event) => setGuestPhone(event.target.value)}
              />
              {signupError && (
                <p className="vq-copy is-small is-alert" role="alert">
                  {signupError}
                </p>
              )}
              <div className="vq-actions">
                <button type="submit" className="vq-button" disabled={signingUp || !guestName.trim() || !guestEmail.trim() || !guestPhone.trim()}>
                  {signingUp ? t.signingUp : t.continue}
                </button>
              </div>
            </form>
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
                    {card.email && <p className="vq-copy is-small">{t.savedBody(card.email)}</p>}
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
                {/* The 10:30 pm bottle draw stays on screen: entered once the card is saved. */}
                <p className="vq-copy is-small is-alert">{mint === "saved" ? t.savedDraw : t.giveaway}</p>
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
