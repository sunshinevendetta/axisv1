import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import {
  appendAttendeeToRsvp,
  appendAttendeeToSlot,
  readRsvpStore,
  updateAttendeeMainTicket,
} from "@/src/lib/rsvp-store";
import { RSV_PIZZA_PUBLIC_URL, submitRsvPizzaGuest } from "@/src/lib/rsv-pizza";
import { brandLogoAttachment, brandShellBilingual } from "@/src/lib/brand-email";

export const runtime = "nodejs";

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

async function sendAttendeeConfirmation(args: {
  name: string;
  email: string;
  slot: string;
  communityName: string;
  mainTicketSent: boolean;
}) {
  const transporter = nodemailer.createTransport({
    host: process.env.BREVO_SMTP_HOST || "smtp-relay.brevo.com",
    port: Number(process.env.BREVO_SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.BREVO_SMTP_USER,
      pass: process.env.BREVO_SMTP_PASS,
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
  });

  const safeName = escapeHtml(args.name);
  const safeSlot = escapeHtml(args.slot);
  const safeSlotEs = escapeHtml(args.slot.replace(/\s*-\s*/g, " a "));
  const safeSlotEn = escapeHtml(args.slot.replace(/\s*-\s*/g, " to "));
  const safeCommunity = escapeHtml(args.communityName);

  const ticketWarningEs = args.mainTicketSent
    ? ""
    : `<p style="margin:18px 0 0; padding:12px 14px; background:#1a1a0a; border:1px solid #f59e0b40; border-radius:8px; color:#fbbf24; font-size:14px;">⚠ No pudimos registrarte automáticamente al ticket oficial de Pizza Party. Por favor regístrate en <a href="${RSV_PIZZA_PUBLIC_URL}" style="color:#fbbf24;">${RSV_PIZZA_PUBLIC_URL}</a> para asegurar tu lugar en la puerta.</p>`;
  const ticketWarningEn = args.mainTicketSent
    ? ""
    : `<p style="margin:18px 0 0; padding:12px 14px; background:#1a1a0a; border:1px solid #f59e0b40; border-radius:8px; color:#fbbf24; font-size:14px;">⚠ Heads up — we couldn't auto-register you for the official Pizza Party ticket. Please RSVP yourself at <a href="${RSV_PIZZA_PUBLIC_URL}" style="color:#fbbf24;">${RSV_PIZZA_PUBLIC_URL}</a> to be on the door list.</p>`;

  const ticketLineEs = args.mainTicketSent
    ? `<p style="margin:18px 0 0; color:#86efac; font-size:14px;">✓ Tu ticket oficial de Global Pizza Party también está en camino.</p>`
    : "";
  const ticketLineEn = args.mainTicketSent
    ? `<p style="margin:18px 0 0; color:#86efac; font-size:14px;">✓ Your official Global Pizza Party ticket is also on its way.</p>`
    : "";

  const spanishBlock = `
    <tr><td style="padding:0 30px 20px; text-align:center;">
      <h1 style="margin:0; font-size:26px; color:#fff;">✓ Tu lugar en la mesa está confirmado</h1>
      <p style="margin:12px 0 0; font-size:15px; color:#ccc;">Hola ${safeName}, te apartamos un asiento en la mesa de AXIS para el Global Pizza Party CDMX.</p>
    </td></tr>
    <tr><td style="padding:0 30px 30px; font-size:15px; line-height:1.7; color:#ddd;">
      <p style="margin:0 0 8px;"><strong>Tu hora en la mesa:</strong></p>
      <ul style="margin:0; padding-left:20px; color:#ccc;">
        <li><strong>Horario:</strong> ${safeSlotEs}</li>
        <li><strong>Anfitrión:</strong> ${safeCommunity}</li>
        <li><strong>Lugar:</strong> studio berlin · Tonalá 145, Roma Nte., CDMX</li>
        <li><strong>Fecha:</strong> Jueves 22 de mayo · 3 PM a 12:30 AM</li>
      </ul>
      <p style="margin:24px 0 0;">Ojo: la sesión de mesa es una hora enfocada, pero la fiesta corre de 3 PM a 12:30 AM. Puedes llegar antes y quedarte después — comer pizza, conocer gente, ver la galería de arte y los DJ's. La mesa es tu asiento garantizado para esa hora, no una hora límite.</p>
      ${ticketLineEs}
      ${ticketWarningEs}
      <p style="margin:26px 0 0;">Nos vemos ahí.<br>— AXIS</p>
    </td></tr>
  `;

  const englishBlock = `
    <tr><td style="padding:0 30px 20px; text-align:center;">
      <h1 style="margin:0; font-size:26px; color:#fff;">✓ Your seat at the table is confirmed</h1>
      <p style="margin:12px 0 0; font-size:15px; color:#ccc;">Hey ${safeName}, you're locked in at the AXIS table for Global Pizza Party Mexico City.</p>
    </td></tr>
    <tr><td style="padding:0 30px 30px; font-size:15px; line-height:1.7; color:#ddd;">
      <p style="margin:0 0 8px;"><strong>Your hour at the table:</strong></p>
      <ul style="margin:0; padding-left:20px; color:#ccc;">
        <li><strong>Slot:</strong> ${safeSlotEn}</li>
        <li><strong>Host:</strong> ${safeCommunity}</li>
        <li><strong>Venue:</strong> studio berlin · Tonalá 145, Roma Nte., CDMX</li>
        <li><strong>Date:</strong> Thursday, May 22 · 3 PM to 12:30 AM</li>
      </ul>
      <p style="margin:24px 0 0;">Heads up — the table session is one focused hour, but the party itself runs from 3 PM to 12:30 AM. You can arrive earlier, stay later — eat pizza, meet people, see the art gallery, catch the DJs. The table is your guaranteed seat for that hour, not a curfew.</p>
      ${ticketLineEn}
      ${ticketWarningEn}
      <p style="margin:26px 0 0;">See you there.<br>— AXIS</p>
    </td></tr>
  `;

  await transporter.sendMail({
    from: `"AXIS" <${process.env.CUSTOM_FROM || "rsvp@axis.show"}>`,
    to: args.email,
    subject: `Estás dentro / You're in — AXIS table · ${args.slot}`,
    html: brandShellBilingual(spanishBlock, englishBlock),
    attachments: [brandLogoAttachment()],
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => ({}))) as {
      rsvpId?: string;
      slot?: string;
      name?: string;
      email?: string;
      ethereumAddress?: string;
      mailingListOptIn?: boolean;
      likedToppings?: string[];
      dislikedToppings?: string[];
      likedBeverages?: string[];
      dislikedBeverages?: string[];
    };
    const rsvpId = body.rsvpId?.trim();
    const slot = body.slot?.trim();
    const name = body.name?.trim();
    const email = body.email?.trim().toLowerCase();

    if ((!rsvpId && !slot) || !name || !email) {
      return NextResponse.json(
        { error: "slot or rsvpId, plus name and email are required." },
        { status: 400 },
      );
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Invalid email." }, { status: 400 });
    }

    const attendee = {
      name,
      email,
      createdAt: new Date().toISOString(),
      mainTicket: "pending" as const,
    };

    const { count } = slot
      ? await appendAttendeeToSlot(slot, attendee)
      : await appendAttendeeToRsvp(rsvpId!, attendee);

    let mainTicket: { status: "sent" | "failed"; reason?: string } = {
      status: "failed",
      reason: "no_slot",
    };

    if (slot) {
      const outcome = await submitRsvPizzaGuest({
        name,
        email,
        ethereumAddress: body.ethereumAddress,
        mailingListOptIn: body.mailingListOptIn,
        likedToppings: body.likedToppings,
        dislikedToppings: body.dislikedToppings,
        likedBeverages: body.likedBeverages,
        dislikedBeverages: body.dislikedBeverages,
      });
      mainTicket = outcome.ok
        ? { status: "sent" }
        : { status: "failed", reason: outcome.reason };
      await updateAttendeeMainTicket(slot, email, {
        status: mainTicket.status,
        reason: mainTicket.reason,
      });
    }

    if (slot) {
      try {
        const data = await readRsvpStore();
        const slotEntry = data.slots.find((s) => s.time === slot);
        const communityName = slotEntry?.community ?? "Reserved";
        await sendAttendeeConfirmation({
          name,
          email,
          slot,
          communityName,
          mainTicketSent: mainTicket.status === "sent",
        });
      } catch (mailErr) {
        console.error("[attend] confirmation email failed:", mailErr);
      }
    }

    return NextResponse.json({
      success: true,
      count,
      mainTicket: mainTicket.status,
      mainTicketReason: mainTicket.reason,
      mainTicketFallbackUrl:
        mainTicket.status === "failed" ? RSV_PIZZA_PUBLIC_URL : undefined,
    });
  } catch (err) {
    const e = err as Error & { code?: string };
    if (e.code === "FULL") {
      return NextResponse.json({ error: e.message }, { status: 409 });
    }
    return NextResponse.json(
      { error: e.message || "Failed to RSVP" },
      { status: e.message?.toLowerCase().includes("not found") ? 404 : 500 },
    );
  }
}
