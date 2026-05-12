import { NextRequest, NextResponse } from "next/server";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import nodemailer from "nodemailer";
import { appendRsvp, type RsvpEntry } from "@/src/lib/rsvp-store";
import { brandLogoAttachment, brandShellBilingual } from "@/src/lib/brand-email";

export const runtime = "nodejs";

function makeId() {
  return `rsvp_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

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
      console.log(`[rsvp ${elapsed}] ${msg}`, extra);
    } else {
      console.log(`[rsvp ${elapsed}] ${msg}`);
    }
  };

  log("POST /api/rsvp received", {
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

    log("parsing form data");
    const form = await req.formData();

    const communityName = String(form.get("communityName") || "").trim();
    const email = String(form.get("email") || "").trim();
    const topic = String(form.get("topic") || "").trim();
    const language = String(form.get("language") || "").trim();
    const slot = String(form.get("slot") || "").trim();
    const notes = String(form.get("notes") || "").trim();
    const logo = form.get("logo");

    log("form fields", { communityName, email, topic, language, slot, hasNotes: Boolean(notes), hasLogo: Boolean(logo) });

    if (!communityName || !email || !topic || !slot) {
      log("validation failed: missing required fields");
      return NextResponse.json(
        { error: "Community name, email, topic, and slot are required." },
        { status: 400 },
      );
    }

    const attachments: { filename: string; content: Buffer; contentType?: string }[] = [];
    if (logo && typeof logo === "object" && "arrayBuffer" in logo) {
      const file = logo as File;
      if (file.size > 0) {
        if (file.size > 5 * 1024 * 1024) {
          return NextResponse.json(
            { error: "Logo must be 5MB or smaller." },
            { status: 400 },
          );
        }
        const buf = Buffer.from(await file.arrayBuffer());
        attachments.push({
          filename: file.name || "logo",
          content: buf,
          contentType: file.type || undefined,
        });
      }
    }
    if (attachments.length) {
      // capture filename for admin display
    }

    const entry: RsvpEntry = {
      id: makeId(),
      type: slot === "WAITLIST" ? "waitlist" : "rsvp",
      communityName,
      email,
      topic,
      language: language || "english",
      notes,
      slot,
      logoFilename: undefined,
      createdAt: new Date().toISOString(),
    };

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
    try {
      await transporter.verify();
      log("transporter.verify OK");
    } catch (verifyErr) {
      const e = verifyErr instanceof Error ? verifyErr : new Error(String(verifyErr));
      log("transporter.verify FAILED", {
        message: e.message,
        code: (verifyErr as { code?: string })?.code,
        command: (verifyErr as { command?: string })?.command,
        responseCode: (verifyErr as { responseCode?: number })?.responseCode,
        response: (verifyErr as { response?: string })?.response,
      });
      throw verifyErr;
    }

    const safeCommunity = escapeHtml(communityName);
    const safeEmail = escapeHtml(email);
    const safeTopic = escapeHtml(topic);
    const safeLanguage = language ? escapeHtml(language === "spanish" ? "Spanish" : "English") : "n/a";
    const safeSlotEs = escapeHtml(slot.replace(/\s*-\s*/g, " a "));
    const safeSlotEn = escapeHtml(slot.replace(/\s*-\s*/g, " to "));
    const safeSlot = safeSlotEn;
    const safeNotes = notes ? escapeHtml(notes) : "n/a";

    log("sending admin notification", { to: process.env.ADMIN_EMAIL, attachments: attachments.length });
    const adminInfo = await transporter.sendMail({
      from: `"AXIS" <${process.env.CUSTOM_FROM || "rsvp@axis.show"}>`,
      to: process.env.ADMIN_EMAIL || "hello@axis.show",
      replyTo: email,
      subject: `New Pizza DAO RSVP: ${communityName} (${slot.replace(/\s*-\s*/g, " to ")})`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background:#000; color:#fff;">
          <h2>New Pizza DAO Community RSVP</h2>
          <p><strong>Community:</strong> ${safeCommunity}</p>
          <p><strong>Email:</strong> ${safeEmail}</p>
          <p><strong>Slot:</strong> ${safeSlot}</p>
          <p><strong>Topic / Activity:</strong> ${safeTopic}</p>
          <p><strong>Language:</strong> ${safeLanguage}</p>
          <p><strong>Notes:</strong> ${safeNotes}</p>
          <p><strong>Logo attached:</strong> ${attachments.length ? "Yes" : "No"}</p>
        </div>
      `,
      attachments,
    });
    log("admin notification sent", { messageId: adminInfo.messageId, response: adminInfo.response, accepted: adminInfo.accepted, rejected: adminInfo.rejected });

    const spanishBlock = `
      <tr><td style="padding:0 30px 20px; text-align:center;">
        <h1 style="margin:0; font-size:26px; color:#fff;">¡Recibimos tu RSVP, ${safeCommunity}!</h1>
        <p style="margin:12px 0 0; font-size:15px; color:#ccc;">
          Tenemos tu solicitud para la AXIS Pizza DAO Party del 22 de mayo.
        </p>
      </td></tr>
      <tr><td style="padding:0 30px 30px; font-size:15px; line-height:1.7; color:#ddd;">
        <p style="margin:0 0 8px;"><strong>Esto reservaste:</strong></p>
        <ul style="margin:0; padding-left:20px; color:#ccc;">
          <li><strong>Horario:</strong> ${safeSlotEs}</li>
          <li><strong>Tema / Actividad:</strong> ${safeTopic}</li>
          <li><strong>Idioma:</strong> ${safeLanguage}</li>
          <li><strong>Contacto:</strong> ${safeEmail}</li>
        </ul>
        <p style="margin:24px 0 8px;"><strong>Qué incluye:</strong></p>
        <ul style="margin:0; padding-left:20px; color:#ccc;">
          <li>Pizza para tu hora</li>
          <li>Mesa compartida grande, hasta 15 personas</li>
          <li>Actividad libre: charla, taller, juego, debate, lo que quieras</li>
          <li>Logo en el flyer + mención en redes una vez confirmado</li>
        </ul>
        <p style="margin:26px 0 0;">
          Revisaremos y confirmaremos tu horario pronto. Si tu comunidad queda confirmada, tu horario desaparecerá del flyer público y te contactaremos con la dirección y detalles de llegada.
        </p>
      </td></tr>
    `;

    const englishBlock = `
      <tr><td style="padding:0 30px 20px; text-align:center;">
        <h1 style="margin:0; font-size:26px; color:#fff;">RSVP received, ${safeCommunity}!</h1>
        <p style="margin:12px 0 0; font-size:15px; color:#ccc;">
          We&rsquo;ve got your request for the AXIS Pizza DAO Party on May 22.
        </p>
      </td></tr>
      <tr><td style="padding:0 30px 30px; font-size:15px; line-height:1.7; color:#ddd;">
        <p style="margin:0 0 8px;"><strong>Here's what you reserved:</strong></p>
        <ul style="margin:0; padding-left:20px; color:#ccc;">
          <li><strong>Slot:</strong> ${safeSlotEn}</li>
          <li><strong>Topic / Activity:</strong> ${safeTopic}</li>
          <li><strong>Language:</strong> ${safeLanguage}</li>
          <li><strong>Contact:</strong> ${safeEmail}</li>
        </ul>
        <p style="margin:24px 0 8px;"><strong>What's included:</strong></p>
        <ul style="margin:0; padding-left:20px; color:#ccc;">
          <li>Pizza for your hour</li>
          <li>Big shared table, seats up to 15</li>
          <li>Free activity: talk, workshop, game, debate, anything</li>
          <li>Logo on the flyer + social shoutout once confirmed</li>
        </ul>
        <p style="margin:26px 0 0;">
          We&rsquo;ll review and confirm your slot shortly. If your community is locked in, your slot will disappear from the public flyer and we&rsquo;ll reach back out with the address and arrival details.
        </p>
      </td></tr>
    `;

    log("sending user confirmation", { to: email });
    const userInfo = await transporter.sendMail({
      from: `"AXIS" <${process.env.CUSTOM_FROM || "rsvp@axis.show"}>`,
      to: email,
      subject: `RSVP recibido / received · ${communityName} · AXIS Pizza DAO Party`,
      html: brandShellBilingual(spanishBlock, englishBlock),
      attachments: [brandLogoAttachment()],
    });
    log("user confirmation sent", { messageId: userInfo.messageId, response: userInfo.response, accepted: userInfo.accepted, rejected: userInfo.rejected });

    if (attachments.length) {
      const att = attachments[0];
      entry.logoFilename = att.filename;
      try {
        const safeName = att.filename.replace(/[^a-zA-Z0-9._-]/g, "_");
        const fileName = `${entry.id}-${safeName}`;
        const dir = path.join(process.cwd(), "public", "uploads", "rsvp");
        await mkdir(dir, { recursive: true });
        await writeFile(path.join(dir, fileName), att.content);
        entry.logoUrl = `/uploads/rsvp/${fileName}`;
        log("logo persisted", { logoUrl: entry.logoUrl });
      } catch (logoErr) {
        log("logo persist failed", { error: logoErr instanceof Error ? logoErr.message : String(logoErr) });
      }
    }
    log("persisting entry", { id: entry.id, type: entry.type });
    try {
      await appendRsvp(entry);
      log("entry persisted");
    } catch (storeErr) {
      const e = storeErr instanceof Error ? storeErr : new Error(String(storeErr));
      log("STORE WRITE FAILED", { message: e.message, stack: e.stack });
    }

    log("DONE — returning success");
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
