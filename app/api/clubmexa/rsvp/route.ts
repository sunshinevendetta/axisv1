import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { brandLogoAttachment, brandShell } from "@/src/lib/brand-email";

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

    await transporter.sendMail({
      from: `"AXIS" <${process.env.CUSTOM_FROM || "rsvp@axis.show"}>`,
      to: email,
      subject: "Clubmexa RSVP received",
      html: brandShell(`
        <tr><td style="padding:0 30px 20px; text-align:center;">
          <h1 style="margin:0; font-size:28px; color:#ffffff;">RSVP received, ${safeName}.</h1>
          <p style="margin:12px 0 0; font-size:15px; line-height:1.7; color:#cccccc;">
            You are on the Clubmexa list. We will use this email only for your confirmation and event-related details.
          </p>
        </td></tr>
        <tr><td style="padding:0 30px 30px; font-size:15px; line-height:1.7; color:#dddddd;">
          <p style="margin:0 0 10px;"><strong>Your check-in:</strong></p>
          <ul style="margin:0; padding-left:20px; color:#cccccc;">
            <li><strong>Name:</strong> ${safeName}</li>
            <li><strong>Mail:</strong> ${safeEmail}</li>
          </ul>
          <p style="margin:24px 0 0; color:#aaaaaa; font-size:13px;">
            We respect your inbox. No spam.
          </p>
        </td></tr>
      `),
      attachments: [brandLogoAttachment()],
    });

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
