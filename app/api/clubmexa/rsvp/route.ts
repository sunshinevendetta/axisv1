import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { brandLogoAttachment, brandShell, inlineImageAttachment } from "@/src/lib/brand-email";

const POSTER_CID = "clubmexa-poster";

export const runtime = "nodejs";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const name = String(body?.name || "").trim();
    const email = String(body?.email || "").trim().toLowerCase();

    if (!name || !email) {
      return NextResponse.json({ error: "Name and mail are required." }, { status: 400 });
    }

    if (!EMAIL_RE.test(email)) {
      return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
    }

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

    await transporter.verify();

    const safeName = escapeHtml(name);
    const safeEmail = escapeHtml(email);
    const submittedAt = new Date().toLocaleString("en-US", {
      timeZone: "America/Mexico_City",
      dateStyle: "medium",
      timeStyle: "short",
    });

    await transporter.sendMail({
      from: `"AXIS" <${process.env.CUSTOM_FROM || "rsvp@axis.show"}>`,
      to: process.env.ADMIN_EMAIL || "hello@axis.show",
      replyTo: email,
      subject: `Clubmexa RSVP - ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background:#000; color:#fff;">
          <h2>New Clubmexa RSVP</h2>
          <p><strong>Name:</strong> ${safeName}</p>
          <p><strong>Email:</strong> ${safeEmail}</p>
          <p><strong>Submitted:</strong> ${escapeHtml(submittedAt)} CDMX</p>
        </div>
      `,
    });

    const firstName = escapeHtml(name.split(" ")[0] || name);
    const pink = "#ff1b9f";

    // Attendee confirmation — isolated so its failure surfaces distinctly and
    // doesn't get masked by a successful admin send above.
    try {
      await transporter.sendMail({
        from: `"Club Mexa · AXIS" <${process.env.CUSTOM_FROM || "rsvp@axis.show"}>`,
        to: email,
        subject: `You're in, ${firstName} — Club Mexa · June 3`,
        html: brandShell(`
          <tr><td style="padding:0 24px 18px;">
            <img src="cid:${POSTER_CID}" alt="Club Mexa" width="100%" style="display:block; width:100%; max-width:552px; height:auto; border-radius:14px; border:1px solid rgba(255,27,159,0.4);" />
          </td></tr>
          <tr><td style="padding:0 30px 8px; text-align:center;">
            <p style="margin:0; font-size:12px; letter-spacing:3px; text-transform:uppercase; color:${pink};">You're checked in</p>
            <h1 style="margin:8px 0 0; font-size:30px; line-height:1.05; color:#ffffff; text-transform:uppercase;">See you there, ${firstName}.</h1>
            <p style="margin:12px 0 0; font-size:15px; line-height:1.7; color:#cccccc;">
              You're on the list for <strong style="color:#fff;">Club Mexa</strong> — dance your human.
            </p>
          </td></tr>
          <tr><td style="padding:6px 30px 4px; text-align:center;">
            <p style="margin:0; font-size:20px; color:#ffffff; text-transform:uppercase; letter-spacing:1px;">Miércoles 3 de Junio 2026</p>
            <p style="margin:6px 0 0; font-size:18px; color:${pink}; letter-spacing:4px;">9 PM — 2 AM</p>
          </td></tr>
          <tr><td style="padding:18px 30px 30px; font-size:15px; line-height:1.8; color:#dddddd;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #222; border-bottom:1px solid #222;">
              <tr><td style="padding:14px 0; color:#999; font-size:13px; text-transform:uppercase; letter-spacing:2px;">Where</td>
                  <td style="padding:14px 0; text-align:right; color:#fff;">Álvaro Obregón 180 · Roma Norte, CDMX</td></tr>
              <tr><td style="padding:14px 0; border-top:1px solid #1a1a1a; color:#999; font-size:13px; text-transform:uppercase; letter-spacing:2px;">Dress code</td>
                  <td style="padding:14px 0; border-top:1px solid #1a1a1a; text-align:right; color:#fff;">Indie Sleaze 2000s</td></tr>
              <tr><td style="padding:14px 0; border-top:1px solid #1a1a1a; color:#999; font-size:13px; text-transform:uppercase; letter-spacing:2px;">DJ sets</td>
                  <td style="padding:14px 0; border-top:1px solid #1a1a1a; text-align:right; color:${pink};">Gallo · Karlos Leon · Waxey G</td></tr>
              <tr><td style="padding:14px 0; border-top:1px solid #1a1a1a; color:#999; font-size:13px; text-transform:uppercase; letter-spacing:2px;">Guest</td>
                  <td style="padding:14px 0; border-top:1px solid #1a1a1a; text-align:right; color:#fff;">${safeName}</td></tr>
            </table>
            <p style="margin:22px 0 0; font-size:14px; line-height:1.7; color:#bbbbbb;">
              Hosted upstairs at MEXA Cocina del Alma. Produced by High Vibe Events. We respect your inbox — confirmation only, no spam.
            </p>
          </td></tr>
        `),
        attachments: [
          brandLogoAttachment(),
          inlineImageAttachment("clubmexa/poster.jpg", POSTER_CID),
        ],
      });
    } catch (mailErr) {
      console.error("[clubmexa] attendee confirmation email failed:", mailErr);
      // Admin record was saved; report partial success so the guest can be
      // followed up manually rather than seeing a hard failure.
      return NextResponse.json({ success: true, attendeeEmail: "failed" });
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error("Clubmexa RSVP error:", {
      message: error.message,
      stack: error.stack,
      code: (err as { code?: string })?.code,
      command: (err as { command?: string })?.command,
      responseCode: (err as { responseCode?: number })?.responseCode,
      response: (err as { response?: string })?.response,
    });

    return NextResponse.json({ error: "Failed to send RSVP." }, { status: 500 });
  }
}
