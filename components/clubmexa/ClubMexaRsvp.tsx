"use client";

import type { FormEvent } from "react";
import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { FiArrowRight, FiCheck, FiLoader, FiMail, FiUser } from "react-icons/fi";

type SubmitState = "idle" | "submitting" | "success" | "error";

export default function ClubMexaRsvp() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<SubmitState>("idle");
  const [message, setMessage] = useState("");

  const canSubmit = useMemo(
    () => name.trim().length > 1 && email.trim().includes("@") && status !== "submitting",
    [email, name, status],
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
        }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data?.error || "Could not send your RSVP.");
      }

      setStatus("success");
      setMessage("You are on the list. Check your inbox for the confirmation.");
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Could not send your RSVP.");
    }
  }

  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-black text-white">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(255,255,255,0.16),transparent_24%),radial-gradient(circle_at_82%_72%,rgba(0,122,74,0.18),transparent_26%),radial-gradient(circle_at_62%_20%,rgba(206,17,38,0.14),transparent_22%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.12] [background-image:linear-gradient(rgba(255,255,255,0.22)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.22)_1px,transparent_1px)] [background-size:42px_42px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/45 to-transparent"
      />

      <div className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col overflow-hidden px-5 py-6 sm:px-8 lg:px-10">
        <header className="flex items-center justify-between gap-4">
          <Link
            href="/"
            aria-label="Go to AXIS home"
            className="inline-flex items-center gap-3 text-[11px] uppercase tracking-[0.32em] text-white/58 transition hover:text-white"
          >
            <Image
              src="/logow.png"
              alt=""
              width={90}
              height={28}
              className="h-7 w-auto opacity-85"
              priority
            />
            AXIS
          </Link>
          <div className="hidden rounded-full border border-white/12 bg-black/35 px-3 py-1.5 text-[10px] uppercase tracking-[0.28em] text-white/52 backdrop-blur sm:block">
            RSVP Check-In
          </div>
        </header>

        <section className="grid min-w-0 flex-1 grid-cols-[minmax(0,1fr)] items-center gap-10 overflow-hidden py-12 lg:grid-cols-[minmax(0,1fr)_minmax(360px,440px)] lg:py-16">
          <div className="min-w-0 max-w-3xl overflow-hidden">
            <p className="text-[11px] uppercase tracking-[0.38em] text-white/46">
              AXIS presents
            </p>
            <h1 className="mt-5 max-w-full overflow-hidden text-[2.35rem] font-light uppercase leading-[0.9] tracking-[-0.01em] text-white sm:text-[3.5rem] lg:text-[4rem]">
              <span className="block sm:inline">Club</span>
              <span className="block sm:inline">mexa</span>
            </h1>
            <p className="mt-5 max-w-md text-xs leading-5 text-white/68 sm:text-sm sm:leading-6">
              A quick RSVP check-in for the night. Drop your name and email so we can
              confirm your spot and keep the door moving.
            </p>

            <div className="mt-6 grid max-w-md gap-3 sm:grid-cols-3">
              {["Simple entry", "Inbox respected", "No wallet needed"].map((item) => (
                <div
                  key={item}
                  className="border border-white/10 bg-white/[0.035] px-4 py-2.5 text-xs leading-5 text-white/66 backdrop-blur"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="min-w-0 border border-white/14 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.025))] p-4 shadow-[0_30px_120px_-40px_rgba(0,0,0,0.95)] backdrop-blur-2xl">
            <div className="min-w-0 border border-white/10 bg-black/45 p-5 sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.32em] text-white/42">
                    Check in
                  </p>
                  <h2 className="mt-2 text-lg leading-tight tracking-[-0.01em] text-white sm:text-xl">
                    Join the list
                  </h2>
                </div>
                <span className="mt-1 inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/12 bg-white/[0.06] text-white/72">
                  {status === "success" ? <FiCheck aria-hidden /> : <FiMail aria-hidden />}
                </span>
              </div>

              {status === "success" ? (
                <div className="mt-7 border border-white/12 bg-white/[0.04] p-5">
                  <p className="text-[10px] uppercase tracking-[0.3em] text-white/48">
                    Confirmed
                  </p>
                  <h3 className="mt-3 text-xl leading-tight tracking-[-0.02em] text-white sm:text-2xl">
                    See you there, {name.split(" ")[0] || "friend"}.
                  </h3>
                  <p className="mt-4 text-sm leading-6 text-white/64">{message}</p>
                  <button
                    type="button"
                    onClick={() => {
                      setName("");
                      setEmail("");
                      setStatus("idle");
                      setMessage("");
                    }}
                    className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/16 bg-white/[0.06] px-5 py-3 text-sm text-white transition hover:border-white/28 hover:bg-white/[0.1]"
                  >
                    Add another guest
                  </button>
                </div>
              ) : (
                <form className="mt-7 space-y-5" onSubmit={handleSubmit}>
                  <label className="block">
                    <span className="mb-2 block text-[10px] uppercase tracking-[0.26em] text-white/45">
                      Name
                    </span>
                    <div className="relative">
                      <FiUser
                        aria-hidden
                        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/34"
                      />
                      <input
                        autoComplete="name"
                        required
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                        placeholder="Your name"
                        className="h-[48px] w-full rounded-none border border-white/12 bg-black/45 px-11 py-3 text-sm text-white outline-none transition placeholder:text-white/28 focus:border-white/34 focus:bg-black/60"
                      />
                    </div>
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-[10px] uppercase tracking-[0.26em] text-white/45">
                      Mail
                    </span>
                    <div className="relative">
                      <FiMail
                        aria-hidden
                        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/34"
                      />
                      <input
                        type="email"
                        autoComplete="email"
                        required
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        placeholder="you@example.com"
                        className="h-[48px] w-full rounded-none border border-white/12 bg-black/45 px-11 py-3 text-sm text-white outline-none transition placeholder:text-white/28 focus:border-white/34 focus:bg-black/60"
                      />
                    </div>
                  </label>

                  <p className="text-xs leading-5 text-white/42">
                    We promise we respect your inbox: confirmation only, no spam.
                  </p>

                  {status === "error" ? (
                    <div className="border border-white/16 bg-white/[0.04] px-4 py-3 text-sm text-white/76">
                      {message}
                    </div>
                  ) : null}

                  <button
                    type="submit"
                    disabled={!canSubmit}
                    className="group inline-flex h-[48px] w-full items-center justify-center gap-2 rounded-full bg-white px-5 text-sm font-medium text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-45"
                  >
                    {status === "submitting" ? (
                      <>
                        <FiLoader aria-hidden className="animate-spin" />
                        Sending
                      </>
                    ) : (
                      <>
                        RSVP
                        <FiArrowRight
                          aria-hidden
                          className="transition group-hover:translate-x-0.5"
                        />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
