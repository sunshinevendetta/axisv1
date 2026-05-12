import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { hasOwnerSession } from "@/src/lib/owner-session";
import { setRsvpDecision, type RsvpEntry } from "@/src/lib/rsvp-store";
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

function approvalHtml(entry: RsvpEntry): string {
  const community = escapeHtml(entry.communityName);
  const slotEs = escapeHtml(entry.slot.replace(/\s*-\s*/g, " a "));
  const slotEn = escapeHtml(entry.slot.replace(/\s*-\s*/g, " to "));
  const topic = escapeHtml(entry.topic);

  const spanish = `
    <tr><td style="padding:0 30px 20px; text-align:center;">
      <h1 style="margin:0; font-size:26px; color:#fff;">¡Estás confirmado, ${community}!</h1>
      <p style="margin:12px 0 0; font-size:15px; color:#ccc;">
        Tu hora en la AXIS Pizza DAO Party del 22 de mayo está reservada.
      </p>
    </td></tr>
    <tr><td style="padding:0 30px 30px; font-size:15px; line-height:1.7; color:#ddd;">
      <p style="margin:0 0 8px;"><strong>Detalles confirmados:</strong></p>
      <ul style="margin:0; padding-left:20px; color:#ccc;">
        <li><strong>Horario:</strong> ${slotEs}</li>
        <li><strong>Tema / Actividad:</strong> ${topic}</li>
      </ul>
      <p style="margin:24px 0 0;">Pronto te enviaremos la dirección y los detalles de llegada. La pizza de tu hora corre por nuestra cuenta.</p>
      <p style="margin:16px 0 0;">Trae a tu comunidad, trae tu energía. Nos vemos el 22 de mayo.</p>
    </td></tr>
  `;

  const english = `
    <tr><td style="padding:0 30px 20px; text-align:center;">
      <h1 style="margin:0; font-size:26px; color:#fff;">You're confirmed, ${community}!</h1>
      <p style="margin:12px 0 0; font-size:15px; color:#ccc;">
        Your slot at the AXIS Pizza DAO Party on May 22 is locked in.
      </p>
    </td></tr>
    <tr><td style="padding:0 30px 30px; font-size:15px; line-height:1.7; color:#ddd;">
      <p style="margin:0 0 8px;"><strong>Confirmed details:</strong></p>
      <ul style="margin:0; padding-left:20px; color:#ccc;">
        <li><strong>Slot:</strong> ${slotEn}</li>
        <li><strong>Topic / Activity:</strong> ${topic}</li>
      </ul>
      <p style="margin:24px 0 0;">We'll send you the venue address and arrival details shortly. Pizza for your hour is on us.</p>
      <p style="margin:16px 0 0;">Bring your community, bring your energy. See you on May 22.</p>
    </td></tr>
  `;

  return brandShellBilingual(spanish, english);
}

function rejectionHtml(entry: RsvpEntry): string {
  const community = escapeHtml(entry.communityName);

  const spanish = `
    <tr><td style="padding:0 30px 20px; text-align:center;">
      <h1 style="margin:0; font-size:24px; color:#fff;">${community}, estás en lista de espera</h1>
      <p style="margin:12px 0 0; font-size:15px; color:#ccc;">
        El espacio para la AXIS Pizza DAO Party está lleno por ahora.
      </p>
    </td></tr>
    <tr><td style="padding:0 30px 30px; font-size:15px; line-height:1.7; color:#ddd;">
      <p style="margin:0;">
        Tranquilo, te añadimos a la lista de espera. Si se libera un espacio antes del 22 de mayo, te avisamos al instante para que lo tomes.
      </p>
      <p style="margin:16px 0 0;">
        Gracias por querer ser anfitrión. El interés de comunidades como la tuya es lo que hace que valga la pena hacer esta fiesta.
      </p>
    </td></tr>
  `;

  const english = `
    <tr><td style="padding:0 30px 20px; text-align:center;">
      <h1 style="margin:0; font-size:24px; color:#fff;">${community}, you're on the waitlist</h1>
      <p style="margin:12px 0 0; font-size:15px; color:#ccc;">
        Space for the AXIS Pizza DAO Party is full right now.
      </p>
    </td></tr>
    <tr><td style="padding:0 30px 30px; font-size:15px; line-height:1.7; color:#ddd;">
      <p style="margin:0;">
        Don't worry, we've added you to the waitlist. If a slot opens up before May 22, we'll reach out immediately so you can claim it.
      </p>
      <p style="margin:16px 0 0;">
        Thanks for wanting to host. The interest from communities like yours is what makes this party worth doing.
      </p>
    </td></tr>
  `;

  return brandShellBilingual(spanish, english);
}

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, ctx: RouteContext) {
  if (!(await hasOwnerSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await ctx.params;
  const body = (await req.json().catch(() => ({}))) as { decision?: "approved" | "rejected" };
  const decision = body.decision;

  if (decision !== "approved" && decision !== "rejected") {
    return NextResponse.json({ error: "Invalid decision." }, { status: 400 });
  }

  let result;
  try {
    result = await setRsvpDecision(id, decision);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to update RSVP" },
      { status: 400 },
    );
  }

  const { data, entry } = result;

  const transporter = nodemailer.createTransport({
    host: process.env.BREVO_SMTP_HOST || "smtp-relay.brevo.com",
    port: Number(process.env.BREVO_SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.BREVO_SMTP_USER,
      pass: process.env.BREVO_SMTP_PASS,
    },
  });

  const subject =
    decision === "approved"
      ? `Confirmado / Confirmed · AXIS Pizza DAO Party · ${entry.communityName}`
      : `Lista de espera / Waitlist · AXIS Pizza DAO Party · ${entry.communityName}`;

  let emailSent = true;
  let emailError: string | undefined;
  try {
    await transporter.sendMail({
      from: `"AXIS" <${process.env.CUSTOM_FROM || "rsvp@axis.show"}>`,
      to: entry.email,
      replyTo: process.env.ADMIN_EMAIL,
      subject,
      html: decision === "approved" ? approvalHtml(entry) : rejectionHtml(entry),
      attachments: [brandLogoAttachment()],
    });
  } catch (err) {
    emailSent = false;
    emailError = err instanceof Error ? err.message : String(err);
  }

  return NextResponse.json({ success: true, data, emailSent, emailError });
}
