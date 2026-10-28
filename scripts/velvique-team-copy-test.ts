/* Sends the two emails a Velvique guest triggers, through Brevo: the team's
   registration email with the guest's full data, then the guest's card
   email with the team copy (BCC). Checks every team address is on both.
   Run: npx tsx --env-file=.env scripts/velvique-team-copy-test.ts [guest@email] */
import { GROVE_ASSETS } from "@/src/lib/velvique-page";
import { sendCard, sendRegistrationToTeam, TEAM_COPY } from "@/src/lib/velvique-email";

const guestEmail = process.argv[2] ?? "hello@axis.show";

const realFetch = globalThis.fetch;
globalThis.fetch = async (input, init) => {
  const response = await realFetch(input, init);
  if (String(input).endsWith("/smtp/email")) {
    const sent = JSON.parse(String(init?.body)) as { subject: string; to: Array<{ email: string }>; bcc?: Array<{ email: string }> };
    const to = sent.to.map((item) => item.email);
    const bcc = (sent.bcc ?? []).map((item) => item.email);
    console.log("\nsubject:", sent.subject);
    console.log("to:", to.join(", "));
    console.log("bcc:", bcc.join(", ") || "(none)");
    console.log("brevo:", response.status, await response.clone().text());
    const missing = TEAM_COPY.filter((email) => email !== guestEmail && !to.includes(email) && !bcc.includes(email));
    if (!response.ok || missing.length) {
      console.error(missing.length ? `FAIL: missing team copy for ${missing.join(", ")}` : "FAIL: Brevo rejected the email");
      process.exitCode = 1;
    }
  }
  return response;
};

await sendRegistrationToTeam({ name: "Test Guest", email: guestEmail, phone: "+52 55 1234 5678", lang: "es" });

await sendCard(
  { email: guestEmail, name: "Test Guest", lang: "es" },
  {
    name: "Prueba de Registro",
    description: "Test registration: this email checks the AXIS and Velvique team copy.",
    number: 0,
    imageUrl: GROVE_ASSETS.bottle,
    pageUrl: "https://axis.show/velvique",
    signatureHash: "test0000",
    components: [{ ingredientId: "velvique", ml: 45 }],
    garnishId: null,
  },
);
if (!process.exitCode) console.log("PASS: registration data and card copy accepted by Brevo for the whole team");
