"use client";

import type { FormEvent } from "react";
import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { FiArrowRight, FiCheck, FiLoader, FiMail, FiPhone, FiUser } from "react-icons/fi";
import ModelViewer from "@/components/arapp/ModelViewer";

type SubmitState = "idle" | "submitting" | "success" | "error";

const PINK = "#ff1b9f";

const TICKER = [
  "Miercoles 3 de Junio",
  "9 PM -- 2 AM",
  "Indie Sleaze 2000s",
  "Gallo / Karlos Leon / Waxey G",
  "Alvaro Obregon 180 / Roma Norte",
];

export default function ClubMexaRsvp() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState<SubmitState>("idle");
  const [message, setMessage] = useState("");

  const canSubmit = useMemo(
    () =>
      name.trim().length > 1 &&
      email.trim().includes("@") &&
      phone.trim().length > 6 &&
      status !== "submitting",
    [email, name, phone, status],
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) return;

    setStatus("submitting");
    setMessage("");

    try {
      const response = await fetch("/api/clubmexa/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
        }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data?.error || "Could not send your RSVP.");
      }

      setStatus("success");
      setMessage("You are checked in. Check your inbox for your Club Mexa confirmation.");
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Could not send your RSVP.");
    }
  }

  return (
    <main className="relative isolate min-h-screen w-full overflow-hidden bg-black text-white">
      <div aria-hidden className="pointer-events-none fixed inset-0 z-0">
        <Image
          src="/clubmexa/bg.jpg"
          alt=""
          fill
          priority
          className="scale-110 object-cover blur-[2px] saturate-[1.15]"
        />
        <div className="absolute inset-0 bg-black/48" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_38%,rgba(0,90,40,0.28),transparent_60%)] mix-blend-screen" />
        <div
          className="absolute inset-0 mix-blend-screen"
          style={{
            background: `radial-gradient(circle at 50% 30%, ${PINK}33, transparent 55%)`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-transparent to-black" />
        <div
          className="absolute inset-0 opacity-[0.16] mix-blend-overlay"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          }}
        />
        <div className="absolute inset-0 opacity-[0.05] [background-image:repeating-linear-gradient(0deg,#fff_0,#fff_1px,transparent_1px,transparent_3px)]" />
      </div>

      <div
        className="relative z-10 overflow-hidden border-y py-2"
        style={{ borderColor: `${PINK}40`, background: "rgba(0,0,0,0.45)" }}
      >
        <div className="cm-marquee flex w-max gap-8 whitespace-nowrap font-bingo text-sm uppercase tracking-[0.25em] sm:text-base">
          {[...TICKER, ...TICKER, ...TICKER].map((t, i) => (
            <span key={i} className="flex items-center gap-8" style={{ color: i % 2 ? PINK : "#fff" }}>
              {t}
              <span style={{ color: PINK }}>*</span>
            </span>
          ))}
        </div>
      </div>

      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-44px)] w-full max-w-2xl flex-col items-center px-5 pb-14 pt-8 text-center sm:px-8">
        <header className="flex w-full items-center justify-between">
          <Link
            href="/"
            aria-label="Go to AXIS home"
            className="inline-flex items-center gap-2.5 text-[10px] uppercase tracking-[0.34em] text-white/60 transition hover:text-white"
          >
            <Image src="/logow.png" alt="" width={84} height={26} className="h-6 w-auto opacity-90" priority />
          </Link>
          <span
            className="rounded-full border px-3 py-1 text-[9px] uppercase tracking-[0.3em] backdrop-blur"
            style={{ borderColor: `${PINK}55`, color: PINK }}
          >
            RSVP / Check-in
          </span>
        </header>

        <p className="cm-rise mt-9 font-bingo text-[11px] uppercase tracking-[0.45em] text-white/55" style={{ animationDelay: "60ms" }}>
          High Vibe Events presents
        </p>

        <h1
          className="cm-rise mt-3 font-bingo text-[3.6rem] uppercase leading-[0.78] tracking-[0] sm:text-[5.5rem]"
          style={{
            color: PINK,
            textShadow: `0 0 28px ${PINK}99, 0 0 64px ${PINK}55, 2px 2px 0 rgba(0,255,170,0.35)`,
            animationDelay: "120ms",
          }}
        >
          Club
          <br />
          Mexa
        </h1>
        <p
          className="cm-rise mt-4 font-bingo text-base uppercase tracking-[0.4em] text-white sm:text-lg"
          style={{ animationDelay: "200ms" }}
        >
          Dance your human.
        </p>

        <div className="cm-rise relative mt-9 w-full" style={{ animationDelay: "260ms" }}>
          <div
            className="relative mx-auto aspect-square w-full max-w-[400px] rounded-[28px] p-[2px]"
            style={{ background: `linear-gradient(140deg, ${PINK}, transparent 45%, rgba(0,255,170,0.4))` }}
          >
            <div className="relative h-full w-full overflow-hidden rounded-[26px] bg-black/30 backdrop-blur-sm">
              <ModelViewer
                src="/clubmexa/poster.glb"
                poster="/clubmexa/poster.jpg"
                alt="Club Mexa 3D poster"
                className="!rounded-[26px] !bg-transparent"
              />
              <span
                className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full border px-3 py-1 text-[9px] uppercase tracking-[0.3em] text-white/75 backdrop-blur"
                style={{ borderColor: `${PINK}55`, background: "rgba(0,0,0,0.4)" }}
              >
                Drag to spin
              </span>
            </div>
          </div>
        </div>

        <div className="cm-rise mt-9 flex flex-col items-center gap-2" style={{ animationDelay: "320ms" }}>
          <p className="font-bingo text-2xl uppercase tracking-[0.12em] text-white sm:text-3xl">
            Miercoles 3 de Junio
          </p>
          <p className="font-bingo text-xl uppercase tracking-[0.3em]" style={{ color: PINK }}>
            9 PM -- 2 AM
          </p>
          <div className="mt-2 flex flex-wrap items-center justify-center gap-2 text-[10px] uppercase tracking-[0.22em]">
            <span className="border border-white/15 bg-white/[0.04] px-3 py-1.5 text-white/75 backdrop-blur">
              Dress code / Indie Sleaze 2000s
            </span>
            <span
              className="border px-3 py-1.5 backdrop-blur"
              style={{ borderColor: `${PINK}40`, background: `${PINK}14`, color: "#fff" }}
            >
              DJ sets / Gallo / Karlos Leon / Waxey G
            </span>
          </div>
          <p className="mt-1 text-xs uppercase tracking-[0.26em] text-white/65">
            Alvaro Obregon 180 / Roma Norte / CDMX
          </p>
        </div>

        <div className="cm-rise mt-9 max-w-md space-y-4 text-sm leading-6 text-white/75" style={{ animationDelay: "380ms" }}>
          <p>
            Club Mexa es una serie de nightlife centrada en la musica, inspirada en la cultura
            vinyl, cocteles de autor, movimiento y conexion autentica. Hosteada mensualmente en
            el segundo piso de MEXA Cocina del Alma, en Roma Norte.
          </p>
          <p className="text-white/55">
            A music-first nightlife series rooted in vinyl culture, specialty cocktails, movement,
            and real connection. Hosted monthly upstairs at MEXA Cocina del Alma in Roma Norte.
          </p>
          <p className="font-bingo text-base uppercase tracking-[0.3em]" style={{ color: PINK }}>
            Produced by High Vibe Events
          </p>
        </div>

        <div
          className="cm-rise mt-10 w-full max-w-md rounded-[20px] p-[1.5px] text-left"
          style={{
            background: `linear-gradient(160deg, ${PINK}66, rgba(255,255,255,0.08) 45%, rgba(0,255,170,0.25))`,
            animationDelay: "440ms",
          }}
        >
          <div className="rounded-[19px] border border-white/5 bg-black/65 p-6 backdrop-blur-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-bingo text-[11px] uppercase tracking-[0.34em]" style={{ color: PINK }}>
                  Check in
                </p>
                <h2 className="mt-1 font-bingo text-2xl uppercase leading-tight text-white">
                  Join the list
                </h2>
              </div>
              <span
                className="mt-1 inline-flex h-10 w-10 items-center justify-center rounded-full border text-white"
                style={{ borderColor: `${PINK}66`, background: `${PINK}1f` }}
              >
                {status === "success" ? <FiCheck aria-hidden /> : <FiMail aria-hidden />}
              </span>
            </div>

            {status === "success" ? (
              <div className="mt-6 border border-white/12 bg-white/[0.04] p-5">
                <p className="font-bingo text-xs uppercase tracking-[0.32em]" style={{ color: PINK }}>
                  Confirmed
                </p>
                <h3 className="mt-2 font-bingo text-2xl uppercase leading-tight text-white">
                  See you there, {name.split(" ")[0] || "friend"}.
                </h3>
                <p className="mt-3 text-sm leading-6 text-white/64">{message}</p>
                <button
                  type="button"
                  onClick={() => {
                    setName("");
                    setEmail("");
                    setPhone("");
                    setStatus("idle");
                    setMessage("");
                  }}
                  className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/16 bg-white/[0.06] px-5 py-3 text-sm text-white transition hover:border-white/28 hover:bg-white/[0.1]"
                >
                  Add another guest
                </button>
              </div>
            ) : (
              <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
                <label className="block">
                  <span className="mb-2 block text-[10px] uppercase tracking-[0.28em] text-white/50">
                    Name
                  </span>
                  <div className="group relative">
                    <FiUser
                      aria-hidden
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/34"
                      style={{ color: PINK }}
                    />
                    <input
                      autoComplete="name"
                      required
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      placeholder="Your name"
                      className="cm-input h-[50px] w-full rounded-none border border-white/12 bg-black/55 px-11 py-3 text-sm text-white outline-none transition placeholder:text-white/28"
                    />
                  </div>
                </label>

                <label className="block">
                  <span className="mb-2 block text-[10px] uppercase tracking-[0.28em] text-white/50">
                    Mail
                  </span>
                  <div className="group relative">
                    <FiMail
                      aria-hidden
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/34"
                      style={{ color: PINK }}
                    />
                    <input
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="you@example.com"
                      className="cm-input h-[50px] w-full rounded-none border border-white/12 bg-black/55 px-11 py-3 text-sm text-white outline-none transition placeholder:text-white/28"
                    />
                  </div>
                </label>

                <label className="block">
                  <span className="mb-2 block text-[10px] uppercase tracking-[0.28em] text-white/50">
                    Phone
                  </span>
                  <div className="group relative">
                    <FiPhone
                      aria-hidden
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/34"
                      style={{ color: PINK }}
                    />
                    <input
                      type="tel"
                      autoComplete="tel"
                      required
                      value={phone}
                      onChange={(event) => setPhone(event.target.value)}
                      placeholder="+52 55 0000 0000"
                      className="cm-input h-[50px] w-full rounded-none border border-white/12 bg-black/55 px-11 py-3 text-sm text-white outline-none transition placeholder:text-white/28"
                    />
                  </div>
                </label>

                <p className="text-xs leading-5 text-white/42">
                  We respect your inbox: confirmation only, no spam.
                </p>

                {status === "error" ? (
                  <div className="border border-white/16 bg-white/[0.04] px-4 py-3 text-sm text-white/76">
                    {message}
                  </div>
                ) : null}

                <button
                  type="submit"
                  disabled={!canSubmit}
                  className="group inline-flex h-[52px] w-full items-center justify-center gap-2 rounded-full px-5 font-bingo text-base uppercase tracking-[0.2em] text-black transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-45"
                  style={{ background: PINK, boxShadow: `0 0 30px ${PINK}66` }}
                >
                  {status === "submitting" ? (
                    <>
                      <FiLoader aria-hidden className="animate-spin" />
                      Sending
                    </>
                  ) : (
                    <>
                      RSVP
                      <FiArrowRight aria-hidden className="transition group-hover:translate-x-0.5" />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* sponsor logos */}
        <div className="mt-10 flex items-center justify-center gap-5 opacity-65">
          <Image src="/clubmexa/highvibelogo.png" alt="High Vibe" width={70} height={26} className="h-7 w-auto" />
          <span className="h-5 w-px bg-white/20" />
          <Image src="/clubmexa/logo.png" alt="MEXA Cocina del Alma" width={70} height={26} className="h-7 w-auto" />
        </div>
      </div>

      <style>{`
        @keyframes cm-marquee-kf {
          from { transform: translateX(0); }
          to { transform: translateX(-33.333%); }
        }
        .cm-marquee { animation: cm-marquee-kf 28s linear infinite; }
        @keyframes cm-rise-kf {
          from { opacity: 0; transform: translateY(18px); filter: blur(6px); }
          to { opacity: 1; transform: translateY(0); filter: blur(0); }
        }
        .cm-rise { opacity: 0; animation: cm-rise-kf 0.9s cubic-bezier(0.16,1,0.3,1) forwards; }
        .cm-input:focus {
          border-color: ${PINK};
          background: rgba(0,0,0,0.7);
          box-shadow: 0 0 0 1px ${PINK}, 0 0 22px ${PINK}40;
        }
        @media (prefers-reduced-motion: reduce) {
          .cm-marquee, .cm-rise { animation: none; }
          .cm-rise { opacity: 1; transform: none; filter: none; }
        }
      `}</style>
    </main>
  );
}
