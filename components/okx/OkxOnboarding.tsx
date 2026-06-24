"use client";

import type { FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  FiArrowRight,
  FiCamera,
  FiCheck,
  FiChevronDown,
  FiCopy,
  FiHelpCircle,
  FiLoader,
  FiMessageCircle,
  FiRefreshCw,
} from "react-icons/fi";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import ModelViewer from "@/components/arapp/ModelViewer";
import SpotlightCard from "@/components/SpotlightCard";
import "@/components/SpotlightCard.css";
import "./okx.css";

gsap.registerPlugin(useGSAP);

type Lang = "es" | "en";

type Mission = {
  id: string;
  drink: string;
  asset: string;
  title: Record<Lang, string>;
  visualTitle: Record<Lang, string>;
  short: Record<Lang, string>;
  action: Record<Lang, string>;
  steps: Record<Lang, string[]>;
  staff: Record<Lang, string>;
  doc: string;
  docLabel: string;
};

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

function formatChatText(text: string) {
  const normalized = text.replace(/\n{3,}/g, "\n\n").trim();
  return normalized.split("\n").map((line, lineIndex) => {
    const heading = line.match(/^#{1,3}\s+(.+)$/);
    const content = heading ? heading[1] : line;
    const parts = content.split(/(\*\*[^*]+\*\*|__[^_]+__)/g).filter(Boolean);

    return (
      <span
        key={`${line}-${lineIndex}`}
        className={heading ? "okx-chat-heading" : undefined}
      >
        {parts.map((part, partIndex) => {
          const bold = part.match(/^(\*\*|__)(.+)(\*\*|__)$/);
          return bold ? (
            <strong key={`${part}-${partIndex}`}>{bold[2]}</strong>
          ) : (
            <span key={`${part}-${partIndex}`}>{part}</span>
          );
        })}
        {lineIndex < normalized.split("\n").length - 1 ? <br /> : null}
      </span>
    );
  });
}

const missions: Mission[] = [
  {
    id: "verify",
    drink: "01",
    asset: "/okx/drink-01.svg",
    title: {
      es: "1° drink",
      en: "1st drink",
    },
    visualTitle: {
      es: "Haz tu cuenta",
      en: "Make your account",
    },
    short: {
      es: "Descarga OKX, crea tu cuenta y completa KYC.",
      en: "Download OKX, create your account, and complete KYC.",
    },
    action: {
      es: "Abre OKX y comienza el desafio",
      en: "Open OKX and start the challenge",
    },
    steps: {
      es: [
        "Abre la app de OKX.",
        "Crea tu cuenta o inicia sesion.",
        "Ve a Menu > Account settings > Identity verification.",
        "Completa KYC y ten tu UID listo.",
      ],
      en: [
        "Open the OKX app.",
        "Create your account or log in.",
        "Go to Menu > Account settings > Identity verification.",
        "Finish KYC and keep your UID ready.",
      ],
    },
    staff: {
      es: "Muestra tu verificacion al staff de OKX en sitio y recibe tu UID para canjear una bebida.",
      en: "Show your verification to OKX staff on-site and receive your UID to redeem one drink.",
    },
    doc: "https://www.okx.com/help/how-do-i-verify-an-individual-account",
    docLabel: "KYC",
  },
  {
    id: "outcomes",
    drink: "02",
    asset: "/okx/drink-02.svg",
    title: {
      es: "2° drink",
      en: "2nd drink",
    },
    visualTitle: {
      es: "Predice el partido",
      en: "Predict the match",
    },
    short: {
      es: "Entra a OKX Outcomes y toma posicion en un partido.",
      en: "Join OKX Outcomes and take a position on a match.",
    },
    action: {
      es: "Quien gana manana?",
      en: "Who wins tomorrow?",
    },
    steps: {
      es: [
        "En OKX, entra a Outcomes desde el banner o Trade > DEX > Outcomes.",
        "Participa en una campana para recibir puntos.",
        "Elige un partido de futbol.",
        "Toma posicion sobre el resultado y confirma.",
      ],
      en: [
        "In OKX, enter Outcomes from the banner or Trade > DEX > Outcomes.",
        "Join a campaign to receive points.",
        "Choose a football match.",
        "Take a position on the result and confirm.",
      ],
    },
    staff: {
      es: "Al participar sumas puntos en el ranking y entras al pool de premios que puede incluir Bitcoin y mas sorpresas.",
      en: "By participating, you earn ranking points and enter the prize pool, which may include Bitcoin and more surprises.",
    },
    doc: "https://www.okx.com/help/outcomes-user-guide",
    docLabel: "Outcomes",
  },
  {
    id: "fund",
    drink: "03",
    asset: "/okx/drink-03.svg",
    title: {
      es: "3° drink",
      en: "3rd drink",
    },
    visualTitle: {
      es: "Fondea $10",
      en: "Fund $10",
    },
    short: {
      es: "Fondea 10 USD; puedes recibir bonus si eres elegible.",
      en: "Fund 10 USD; you may receive a bonus if eligible.",
    },
    action: {
      es: "Recibe $10 USD extras. Duplicamos tu lana",
      en: "Get $10 USD extra. We double your money",
    },
    steps: {
      es: [
        "Fondea tu cuenta OKX con 10 USD.",
        "OKX puede bonificarte 10 USD si la dinamica aplica a tu cuenta.",
        "Activa OKX Pay/Card siguiendo las instrucciones de la app.",
        "Pide al staff el identificador para canjear otra bebida.",
      ],
      en: [
        "Fund your OKX account with 10 USD.",
        "OKX gives you a 10 USD bonus if the activation applies to your account.",
        "Activate OKX Pay/Card by following the in-app instructions.",
        "Ask staff for the identifier to redeem another drink.",
      ],
    },
    staff: {
      es: "Puedes activar tu OKX Card para pagar con tu saldo OKX en comercios compatibles donde se acepte Mastercard.",
      en: "You can activate your OKX Card to pay with your OKX balance at compatible merchants where Mastercard is accepted.",
    },
    doc: "https://www.okx.com/help/how-to-create-pay-account",
    docLabel: "Pay",
  },
];

const copy = {
  es: {
    language: "EN",
    eyebrow: "Bar Oriente - Junio 25, 2026",
    hero: "DRINKS POWERED BY: OKX",
    pass: "Pase de bebidas",
    next: "",
    intro:
      "Desbloquea hasta 3 bebidas. Haz una mision, muestra la pantalla al staff OKX, recibe tu bebida.",
    unlock: "Como desbloquear tus bebidas gratis esta noche",
    count: "Tus bebidas",
    limit:
      "Cupo limitado: 500 bebidas durante la noche. Maximo 3 bebidas gratis por persona. Todas las bebidas se validan con el staff de OKX en sitio.",
    terms:
      "Aplican Terminos y Condiciones oficiales de OKX, elegibilidad por pais y disponibilidad de la dinamica.",
    staff: "Ya lo mostre",
    done: "Listo",
    tapHere: "Toca aqui",
    tap: "Toca una mision",
    assistantTitle: "Asistente OKX",
    assistantIntro: "Pregunta algo simple: KYC, UID, Outcomes, fondeo o como canjear.",
    input: "Escribe tu duda",
    ask: "Preguntar",
    quick: ["Donde veo mi UID?", "Que hago primero?", "Como entro a Outcomes?"],
    fallback:
      "Estoy listo para ayudar con las 3 misiones. Si algo falla en la app, acercate al staff de OKX y pide validacion manual.",
    staffCta: "Cuando termines una mision, no busques otro formulario: ensena la pantalla al staff de OKX.",
    definitions: "KYC = revision de identidad. UID = tu ID de cuenta. Outcomes = prediccion de partidos. Fondear = agregar dinero.",
    ar: "Abrir AR",
    arHint: "Tap aqui para abrir la AR, toma una foto, subela, por un shot",
    sources: "Guias oficiales",
    reset: "Reiniciar progreso",
  },
  en: {
    language: "ES",
    eyebrow: "Bar Oriente - June 25, 2026",
    hero: "DRINKS POWERED BY: OKX",
    pass: "Drink pass",
    next: "",
    intro:
      "Unlock up to 3 drinks. Do one mission, show the screen to OKX staff, get your drink.",
    unlock: "How to unlock your free drinks tonight",
    count: "Your drinks",
    limit:
      "Limited availability: 500 drinks during the night. Maximum 3 free drinks per person. All drinks must be validated by OKX staff on-site.",
    terms:
      "Official OKX Terms and Conditions, country eligibility, and activation availability apply.",
    staff: "Show OKX staff",
    done: "Done",
    tapHere: "Tap here",
    tap: "Tap a mission",
    assistantTitle: "OKX Assistant",
    assistantIntro: "Ask something simple: KYC, UID, Outcomes, funding, or redemption.",
    input: "Type your question",
    ask: "Ask",
    quick: ["Where is my UID?", "What do I do first?", "How do I enter Outcomes?"],
    fallback:
      "I am ready to help with the 3 missions. If something fails in the app, go to OKX staff and ask for manual validation.",
    staffCta: "When you finish a mission, do not look for another form: show the screen to OKX staff.",
    definitions: "KYC = identity check. UID = your account ID. Outcomes = match prediction campaign. Fund = add money.",
    ar: "Open AR",
    arHint: "Tap here to open AR, take a photo, post it for a shot",
    sources: "Official guides",
    reset: "Reset progress",
  },
};

const initialAssistant: Record<Lang, string> = {
  es: "Estoy aqui para guiarte paso a paso. Dime si vas en KYC, UID, Outcomes o fondeo.",
  en: "I can guide you step by step. Tell me if you are on KYC, UID, Outcomes, or funding.",
};

export default function OkxOnboarding() {
  const rootRef = useRef<HTMLElement>(null);
  const chatLogRef = useRef<HTMLDivElement>(null);
  const [lang, setLang] = useState<Lang>("es");
  const [activeMission, setActiveMission] = useState<string | null>(null);
  const [completed, setCompleted] = useState<Record<string, boolean>>({});
  const [chatInput, setChatInput] = useState("");
  const [chatBusy, setChatBusy] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: initialAssistant.es,
    },
  ]);

  const t = copy[lang];
  const completedCount = useMemo(
    () => missions.filter((mission) => completed[mission.id]).length,
    [completed],
  );

  useEffect(() => {
    setMessages([{ role: "assistant", content: initialAssistant[lang] }]);
  }, [lang]);

  useEffect(() => {
    const log = chatLogRef.current;
    if (!log) return;
    log.scrollTop = log.scrollHeight;
  }, [messages, chatBusy]);

  useGSAP(
    () => {
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduceMotion) return;

      const tl = gsap.timeline({ defaults: { duration: 0.75, ease: "power3.out" } });
      tl.from(".okx-rise", { autoAlpha: 0, y: 22, stagger: 0.08 })
        .from(".okx-model-shell", { autoAlpha: 0, scale: 0.92, rotation: -2 }, "<0.1")
        .from(".okx-mission", { autoAlpha: 0, y: 18, stagger: 0.08 }, "<0.1");

      gsap.to(".okx-scanline", {
        yPercent: 105,
        repeat: -1,
        duration: 3.2,
        ease: "none",
      });
    },
    { scope: rootRef },
  );

  function toggleMission(id: string) {
    setActiveMission((current) => (current === id ? null : id));
    const element = document.querySelector(`[data-mission="${id}"]`);
    element?.animate(
      [
        { transform: "translateY(0) scale(1)" },
        { transform: "translateY(-4px) scale(1.012)" },
        { transform: "translateY(0) scale(1)" },
      ],
      {
        duration: 420,
        easing: "cubic-bezier(.2,.9,.2,1)",
      },
    );
  }

  function toggleDone(id: string) {
    setCompleted((current) => ({ ...current, [id]: !current[id] }));
  }

  function resetProgress() {
    setCompleted({});
  }

  async function askAssistant(event?: FormEvent<HTMLFormElement>, override?: string) {
    event?.preventDefault();
    const question = (override || chatInput).trim();
    if (!question || chatBusy) return;

    const nextMessages: ChatMessage[] = [...messages, { role: "user", content: question }];
    setMessages(nextMessages);
    setChatInput("");
    setChatBusy(true);

    try {
      const response = await fetch("/api/okx/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lang, messages: nextMessages }),
      });
      const data = (await response.json().catch(() => ({}))) as { message?: string };
      setMessages((current) => [
        ...current,
        { role: "assistant", content: data.message || t.fallback },
      ]);
    } catch {
      setMessages((current) => [...current, { role: "assistant", content: t.fallback }]);
    } finally {
      setChatBusy(false);
    }
  }

  return (
    <main ref={rootRef} className="okx-page">
      <div aria-hidden className="okx-bg">
        <div className="okx-grid" />
        <div className="okx-scanline" />
      </div>

      <header className="okx-topbar okx-rise">
        <Link href="/" aria-label="Go to AXIS home" className="okx-axis">
          <Image src="/logow.png" alt="" width={92} height={28} priority />
        </Link>
        <Image src="/okxproposal/okx-logo.svg" alt="OKX" width={96} height={29} priority />
        <button
          type="button"
          className="okx-lang"
          onClick={() => setLang((current) => (current === "es" ? "en" : "es"))}
          aria-label="Change language"
        >
          {t.language}
        </button>
      </header>

      <section className="okx-hero">
        <div className="okx-hero-copy">
          <p className="okx-kicker okx-rise">{t.eyebrow}</p>
          <h1 className="okx-title okx-rise">{t.hero}</h1>
          <p className="okx-intro okx-rise">{t.intro}</p>
          <div className="okx-count okx-rise">
            <span>{t.count}</span>
            <strong>{completedCount}/3</strong>
          </div>
          <div className="okx-pass-strip okx-rise" aria-label={t.pass}>
            {missions.map((mission) => (
              <button
                key={mission.id}
                type="button"
                className={`okx-pass-token ${activeMission === mission.id ? "is-active" : ""} ${completed[mission.id] ? "is-done" : ""}`}
                onClick={() => toggleMission(mission.id)}
                aria-label={`${mission.title[lang]} ${completed[mission.id] ? t.done : ""}`}
              >
                <Image src={mission.asset} alt="" width={96} height={96} />
                <span>{mission.drink}</span>
                {!completed[mission.id] && activeMission !== mission.id ? (
                  <b>{t.tapHere}</b>
                ) : null}
              </button>
            ))}
          </div>
        </div>

        <div className="okx-model-shell okx-rise">
          <ModelViewer
            src="/logos/rsvp/okx.glb"
            alt="OKX 3D logo"
            autoReveal
            className="okx-model"
            arButtonLabel={t.ar}
          />
          <span className="okx-model-note">OKX</span>
          <span className="okx-ar-hint">
            <FiCamera aria-hidden />
            {t.arHint}
          </span>
        </div>
      </section>

      <section className="okx-section" aria-labelledby="missions-title">
        <div className="okx-section-head okx-rise">
          <p className="okx-kicker">{t.tap}</p>
          <h2 id="missions-title">{t.unlock}</h2>
        </div>

        <div className="okx-missions">
          {missions.map((mission) => {
            const isActive = activeMission === mission.id;
            const isDone = Boolean(completed[mission.id]);

            return (
              <SpotlightCard
                key={mission.id}
                className={`okx-mission ${isActive ? "is-active" : ""} ${isDone ? "is-done" : ""}`}
                spotlightColor="rgba(255, 255, 255, 0.14)"
              >
                <article data-mission={mission.id}>
                  <button
                    type="button"
                    className="okx-mission-main"
                    onClick={() => toggleMission(mission.id)}
                    aria-expanded={isActive}
                    aria-controls={`okx-mission-${mission.id}`}
                  >
                    <span className="okx-voucher-art">
                      <Image src={mission.asset} alt="" width={160} height={160} />
                    </span>
                    <span className="okx-voucher-copy">
                      <small>{mission.title[lang]}</small>
                      <strong>{mission.visualTitle[lang]}</strong>
                      <em>{mission.action[lang]}</em>
                      {!isActive && !isDone ? <span className="okx-tap-signal">{t.tapHere}</span> : null}
                    </span>
                    <FiChevronDown aria-hidden className="okx-chevron" />
                  </button>

                  {isActive ? (
                    <div className="okx-mission-detail" id={`okx-mission-${mission.id}`}>
                      <p className="okx-big-staff">{mission.staff[lang]}</p>
                      <ol>
                        {mission.steps[lang].map((step) => (
                          <li key={step}>{step}</li>
                        ))}
                      </ol>
                      <div className="okx-mission-actions">
                        <button
                          type="button"
                          className="okx-done"
                          onClick={() => toggleDone(mission.id)}
                          aria-pressed={isDone}
                        >
                          <FiCheck aria-hidden />
                          {isDone ? t.done : t.staff}
                        </button>
                        <a href={mission.doc} target="_blank" rel="noreferrer">
                          {mission.docLabel}
                          <FiArrowRight aria-hidden />
                        </a>
                      </div>
                    </div>
                  ) : null}
                </article>
              </SpotlightCard>
            );
          })}
        </div>
      </section>

      <section className="okx-clarity okx-rise">
        <FiCopy aria-hidden />
        <p>{t.staffCta}</p>
      </section>

      <section className="okx-chat-shell okx-rise" aria-labelledby="assistant-title">
        <div className="okx-chat-head">
          <div>
            <p className="okx-kicker">AI Help</p>
            <h2 id="assistant-title">{t.assistantTitle}</h2>
          </div>
          <FiMessageCircle aria-hidden />
        </div>
        <p className="okx-chat-intro">{t.assistantIntro}</p>

        <div
          ref={chatLogRef}
          className="okx-chat-log"
          role="log"
          aria-live="polite"
          aria-relevant="additions"
        >
          {messages.map((message, index) => (
            <div key={`${message.role}-${index}`} className={`okx-bubble ${message.role}`}>
              {message.role === "assistant" ? formatChatText(message.content) : message.content}
            </div>
          ))}
          {chatBusy ? (
            <div className="okx-bubble assistant">
              <FiLoader aria-hidden className="okx-spin" /> OKX...
            </div>
          ) : null}
        </div>

        <div className="okx-quick">
          {t.quick.map((question) => (
            <button key={question} type="button" onClick={() => askAssistant(undefined, question)}>
              {question}
            </button>
          ))}
        </div>

        <form className="okx-chat-form" onSubmit={askAssistant}>
          <input
            value={chatInput}
            onChange={(event) => setChatInput(event.target.value)}
            placeholder={t.input}
            aria-label={t.input}
          />
          <button type="submit" disabled={chatBusy || !chatInput.trim()}>
            {chatBusy ? <FiLoader aria-hidden className="okx-spin" /> : <FiHelpCircle aria-hidden />}
            <span>{t.ask}</span>
          </button>
        </form>
      </section>

      <footer className="okx-footer">
        <p>{t.limit}</p>
        <p>{t.terms}</p>
        <div className="okx-source-row">
          <span>{t.sources}</span>
          {missions.map((mission) => (
            <a key={mission.id} href={mission.doc} target="_blank" rel="noreferrer">
              {mission.docLabel}
            </a>
          ))}
        </div>
        <button type="button" onClick={resetProgress}>
          <FiRefreshCw aria-hidden />
          {t.reset}
        </button>
      </footer>
    </main>
  );
}
