import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { hasOwnerSession } from "@/src/lib/owner-session";
import { readRsvpStore } from "@/src/lib/rsvp-store";
import { brandLogoAttachment, brandShell } from "@/src/lib/brand-email";

export const runtime = "nodejs";

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, ctx: RouteContext) {
  if (!(await hasOwnerSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await ctx.params;
  const body = (await req.json().catch(() => ({}))) as { subject?: string; message?: string };
  const subject = (body.subject || "").trim();
  const message = (body.message || "").trim();

  if (!subject || !message) {
    return NextResponse.json({ error: "Subject and message are required." }, { status: 400 });
  }

  const data = await readRsvpStore();
  const entry = data.rsvps.find((r) => r.id === id);
  if (!entry) {
    return NextResponse.json({ error: "RSVP not found." }, { status: 404 });
  }

  const transporter = nodemailer.createTransport({
    host: process.env.BREVO_SMTP_HOST || "smtp-relay.brevo.com",
    port: Number(process.env.BREVO_SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.BREVO_SMTP_USER,
      pass: process.env.BREVO_SMTP_PASS,
    },
  });

  const safeMessage = escapeHtml(message).replace(/\n/g, "<br/>");
  const safeCommunity = escapeHtml(entry.communityName);

  const inner = `
    <tr><td style="padding:0 30px 8px;">
      <p style="margin:0; font-size:13px; color:#999;">Hi ${safeCommunity},</p>
    </td></tr>
    <tr><td style="padding:8px 30px 30px; font-size:15px; line-height:1.7; color:#ddd;">
      ${safeMessage}
    </td></tr>
  `;

  await transporter.sendMail({
    from: `"AXIS" <${process.env.CUSTOM_FROM || "rsvp@axis.show"}>`,
    to: entry.email,
    replyTo: process.env.ADMIN_EMAIL,
    subject,
    html: brandShell(inner),
    attachments: [brandLogoAttachment()],
  });

  return NextResponse.json({ success: true });
}
