import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import {
  brandLogoAttachment,
  brandLogoSrc,
  clubMexaPosterAttachment,
} from "@/src/lib/brand-email";

const FLYER_CID = "clubmexa-flyer";

/**
 * Club Mexa confirmation shell: event flyer at the top (instead of the AXIS
 * logo), AXIS logo retained in the footer with a "Built on AXIS" credit line.
 */
function clubMexaShell(innerHtml: string): string {
  const logoSrc = brandLogoSrc();
  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"/></head>
<body style="margin:0; padding:0; font-family: Arial, Helvetica, sans-serif; background:#000; color:#fff;">
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px; margin:0 auto; background:#000;">
    <tr><td align="center" style="padding:0 0 12px;">
      <img src="cid:${FLYER_CID}" alt="Club Mexa" width="600" style="display:block; width:100%; max-width:600px; height:auto;"/>
    </td></tr>
    ${innerHtml}
    <tr><td align="center" style="padding:30px; font-size:12px; color:#777; border-top:1px solid #222;">
      <img src="${logoSrc}" alt="AXIS" width="80" style="display:block; margin:0 auto 10px; max-width:80px; height:auto; opacity:0.7;"/>
      <p style="margin:0; letter-spacing:2px; text-transform:uppercase; font-size:11px;">Built on AXIS</p>
      <p style="margin:8px 0 0;">Unexpected experiences at unusual places</p>
      <p style="margin:8px 0 0;"><a href="https://axis.show" style="color:#00d1ff; text-decoration:none;">axis.show</a></p>
    </td></tr>
  </table>
</body></html>`;
}

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
  const t0 = Date.now();
  const log = (msg: string, extra?: unknown) => {
    const elapsed = `${Date.now() - t0}ms`;
    if (extra !== undefined) {
      console.log(`[clubmexa ${elapsed}] ${msg}`, extra);
    } else {
      console.log(`[clubmexa ${elapsed}] ${msg}`);
    }
  };

  log("POST /api/clubmexa/rsvp received", {
    method: req.method,
    contentType: req.headers.get("content-type"),
  });

  try {
    log("env check", {
      BREVO_SMTP_HOST: process.env.BREVO_SMTP_HOST ?? "(missing)",
      BREVO_SMTP_PORT: process.env.BREVO_SMTP_PORT ?? "(missing)",
      BREVO_SMTP_USER: process.env.BREVO_SMTP_USER ?? "(missing)",
      BREVO_SMTP_PASS_present: Boolean(process.env.BREVO_SMTP_PASS),
      BREVO_SMTP_PASS_len: process.env.BREVO_SMTP_PASS?.length ?? 0,
      CUSTOM_FROM: process.env.CUSTOM_FROM ?? "(missing)",
      ADMIN_EMAIL: process.env.ADMIN_EMAIL ?? "(missing)",
    });

    const body = await req.json();
    const name = String(body?.name || "").trim();
    const email = String(body?.email || "").trim().toLowerCase();
    const phone = String(body?.phone || "").trim();

    log("parsed payload", { name, email, phonePresent: Boolean(phone) });

    if (!name || !email || !phone) {
      return NextResponse.json(
        { error: "Name, email, and phone are required." },
        { status: 400 },
      );
    }

    if (!EMAIL_RE.test(email)) {
      return NextResponse.json(
        { error: "Enter a valid email address." },
        { status: 400 },
      );
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

    log("transporter created, verifying connection");
    await transporter.verify();
    log("transporter.verify OK");

    const safeName = escapeHtml(name);
    const safeEmail = escapeHtml(email);
    const safePhone = escapeHtml(phone);
    const submittedAt = new Date().toLocaleString("en-US", {
      timeZone: "America/Mexico_City",
      dateStyle: "medium",
      timeStyle: "short",
    });
    const firstName = escapeHtml(name.split(" ")[0] || name);

    log("sending admin notification", { to: process.env.ADMIN_EMAIL });
    const adminInfo = await transporter.sendMail({
      from: `"AXIS" <${process.env.CUSTOM_FROM || "rsvp@axis.show"}>`,
      to: process.env.ADMIN_EMAIL || "hello@axis.show",
      cc: "clubmexa.events@gmail.com",
      replyTo: email,
      subject: `New Club Mexa RSVP: ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background:#000; color:#fff;">
          <h2>New Club Mexa RSVP</h2>
          <p><strong>Name:</strong> ${safeName}</p>
          <p><strong>Email:</strong> ${safeEmail}</p>
          <p><strong>Phone:</strong> ${safePhone}</p>
          <p><strong>Submitted:</strong> ${escapeHtml(submittedAt)} CDMX</p>
        </div>
      `,
    });
    log("admin notification sent", {
      messageId: adminInfo.messageId,
      response: adminInfo.response,
      accepted: adminInfo.accepted,
      rejected: adminInfo.rejected,
    });

    const confirmationHtml = clubMexaShell(`
      <tr><td style="padding:0 30px 20px; text-align:center;">
        <p style="margin:0; font-size:12px; letter-spacing:3px; text-transform:uppercase; color:#ff1b9f;">You're on the list</p>
        <h1 style="margin:10px 0 0; font-size:30px; line-height:1.05; color:#ffffff; text-transform:uppercase;">See you there, ${firstName}.</h1>
        <p style="margin:12px 0 0; font-size:15px; line-height:1.7; color:#cccccc;">
          Your Club Mexa RSVP is confirmed. Dance your human.
        </p>
      </td></tr>
      <tr><td style="padding:6px 30px 4px; text-align:center;">
        <p style="margin:0; font-size:20px; color:#ffffff; text-transform:uppercase; letter-spacing:1px;">Wednesday, June 3, 2026</p>
        <p style="margin:6px 0 0; font-size:18px; color:#ff1b9f; letter-spacing:4px;">9 PM - 2 AM</p>
      </td></tr>
      <tr><td style="padding:18px 30px 30px; font-size:15px; line-height:1.8; color:#dddddd;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #222; border-bottom:1px solid #222;">
          <tr>
            <td style="padding:14px 0; color:#999; font-size:13px; text-transform:uppercase; letter-spacing:2px;">Where</td>
            <td style="padding:14px 0; text-align:right; color:#fff;">Alvaro Obregon 180, Roma Norte, CDMX</td>
          </tr>
          <tr>
            <td style="padding:14px 0; border-top:1px solid #1a1a1a; color:#999; font-size:13px; text-transform:uppercase; letter-spacing:2px;">Dress code</td>
            <td style="padding:14px 0; border-top:1px solid #1a1a1a; text-align:right; color:#fff;">Indie Sleaze 2000s</td>
          </tr>
          <tr>
            <td style="padding:14px 0; border-top:1px solid #1a1a1a; color:#999; font-size:13px; text-transform:uppercase; letter-spacing:2px;">DJ sets</td>
            <td style="padding:14px 0; border-top:1px solid #1a1a1a; text-align:right; color:#ff1b9f;">Gallo, Karlos Leon, Waxey G</td>
          </tr>
          <tr>
            <td style="padding:14px 0; border-top:1px solid #1a1a1a; color:#999; font-size:13px; text-transform:uppercase; letter-spacing:2px;">Guest</td>
            <td style="padding:14px 0; border-top:1px solid #1a1a1a; text-align:right; color:#fff;">${safeName}</td>
          </tr>
          <tr>
            <td style="padding:14px 0; border-top:1px solid #1a1a1a; color:#999; font-size:13px; text-transform:uppercase; letter-spacing:2px;">Phone</td>
            <td style="padding:14px 0; border-top:1px solid #1a1a1a; text-align:right; color:#fff;">${safePhone}</td>
          </tr>
        </table>
        <p style="margin:22px 0 0; font-size:14px; line-height:1.7; color:#bbbbbb;">
          Hosted upstairs at MEXA Cocina del Alma. Produced by High Vibe Events. Confirmation only, no spam.
        </p>
      </td></tr>
    `);

    log("sending attendee confirmation", { to: email });
    const attendeeInfo = await transporter.sendMail({
      from: `"Club Mexa - AXIS" <${process.env.CUSTOM_FROM || "rsvp@axis.show"}>`,
      to: email,
      subject: `Club Mexa confirmation - ${firstName} - June 3`,
      html: confirmationHtml,
      attachments: [
        brandLogoAttachment(),
        clubMexaPosterAttachment(FLYER_CID),
      ],
    });
    log("attendee confirmation sent", {
      messageId: attendeeInfo.messageId,
      response: attendeeInfo.response,
      accepted: attendeeInfo.accepted,
      rejected: attendeeInfo.rejected,
    });

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error(String(err));
    log("FATAL ERROR", {
      message: error.message,
      stack: error.stack,
      code: (err as { code?: string })?.code,
      command: (err as { command?: string })?.command,
      responseCode: (err as { responseCode?: number })?.responseCode,
      response: (err as { response?: string })?.response,
      errno: (err as { errno?: number })?.errno,
      syscall: (err as { syscall?: string })?.syscall,
    });

    return NextResponse.json(
      { error: error.message || "Failed to send RSVP" },
      { status: 500 },
    );
  }
}
