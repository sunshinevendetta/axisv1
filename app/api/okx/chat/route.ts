import { NextResponse } from "next/server";
import { OKX_PETRA_SOUL_VERSION, okxPetraSoul } from "./soul";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type SupportedLang = "es" | "en" | "zh" | "ja" | "ko" | "fr";

type IncomingMessage = {
  role?: string;
  content?: string;
};

type ChatBody = {
  lang?: SupportedLang;
  messages?: IncomingMessage[];
};

type CleanMessage = {
  role: "user" | "assistant";
  content: string;
};

type ChatCompletionPayload = {
  choices?: Array<{ message?: { content?: string } }>;
  error?: { message?: string };
};

type FallbackIntent = "kyc" | "uid" | "what" | "screenshot" | "outcomes" | "fund" | "card" | "pay" | "trade" | "ar" | "default";

const NVIDIA_BASE_URL = "https://integrate.api.nvidia.com/v1";
const NVIDIA_MODEL = "nvidia/llama-3.3-nemotron-super-49b-v1.5";
const HERMES_AGENT_NAME = "AXIS Petra Hermes";

const fallbackAnswers: Record<SupportedLang, Record<FallbackIntent, string>> = {
  es: {
    kyc: "Para KYC: abre OKX > Menu > Account settings > Identity verification. Elige cuenta individual, llena tus datos y sube ID vigente con buena luz; si pide selfie, hazla ahi mismo. No subas tu ID aqui: solo muestra al staff cuando quede listo.",
    uid: "Va: abre OKX, entra a User Center > Profile. El screenshot debe mostrar Profile, Security, Preferences, Account information, UID e Identity verification. Sube esa pantalla para la bebida.",
    what: "OKX es una app de crypto. Esta noche solo necesitas lo basico: cuenta, KYC y UID visible para que staff valide tu bebida.",
    screenshot: "Para bebida 1 sube screenshot de User Center > Profile: debe verse Profile, Security, Preferences, Account information, UID e Identity verification. Para bebida 2, Outcomes. Para bebida 3, fondeo de 10 USD.",
    outcomes: "En OKX busca Outcomes desde el banner o Trade > DEX > Outcomes. Entra al partido, toma posicion y guarda captura para staff.",
    fund: "Va: en OKX abre Deposit desde home, o ve a Assets/Portfolio > Deposit. Si ya tienes crypto, elige Deposit crypto, moneda y red; manda desde tu otro wallet usando la direccion/QR. Si quieres comprar con MXN, prueba Buy > Buy crypto o Assets > Deposit. Cuando entren 10 USD, captura y staff valida.",
    card: "La OKX Card es una tarjeta virtual en la app, no fisica. Depende de tu region y elegibilidad. Normalmente necesitas cuenta verificada, OKX Pay activo y balance disponible; si no aparece en tu app, puede no estar disponible para tu pais.",
    pay: "OKX Pay sirve para mover o usar balance dentro del ecosistema OKX cuando esta disponible. Para usarlo, revisa Pay en la app, completa verificacion si te la pide y confirma que tu pais/region sea elegible.",
    trade: "Para tradear en OKX, primero fondea o compra crypto, luego entra a Trade. Si eres nuevo, usa lo basico y no operes con apalancamiento. Para el evento, lo que cuenta es tu screenshot de Outcomes o fondeo, no hacer trading riesgoso.",
    ar: "Para AR, toca el boton AR del modelo. Si no abre camara, prueba Chrome en Android o Safari en iPhone. Si se atora, staff te ayuda.",
    default: "Te ayudo. Dime si quieres resolver algo del evento (KYC, UID, screenshot, Outcomes o fondeo) o algo general de OKX como Card, Pay, deposito o compra.",
  },
  en: {
    kyc: "For KYC: open OKX > Menu > Account settings > Identity verification. Choose individual account, fill your details, upload a valid ID in good light, and do the selfie if asked. Do not upload your ID here; show staff once it is done.",
    uid: "Open OKX User Center > Profile. The screenshot must show Profile, Security, Preferences, Account information, UID, and Identity verification. Upload that screen for the drink.",
    what: "OKX is a crypto app. For tonight: download OKX, create an account, complete KYC, then show your UID to staff for drink validation.",
    screenshot: "For drink 1 upload the User Center > Profile screenshot: Profile, Security, Preferences, Account information, UID, and Identity verification must be visible. For drink 2, OKX Outcomes. For drink 3, 10 USD funding.",
    outcomes: "In the OKX app, open Outcomes from the homepage banner or Trade > DEX > Outcomes. Join the match, take a position, and save a screenshot for staff.",
    fund: "For the third drink: in OKX, tap Deposit on home, or go to Assets/Portfolio > Deposit. If you already have crypto, choose Deposit crypto, asset, and network, then send from your other wallet using the address/QR. If buying with local currency, try Buy > Buy crypto or Assets > Deposit. Once 10 USD lands, screenshot it for staff.",
    card: "OKX Card is a virtual card in the app, not a physical card. Availability depends on region and eligibility. You usually need a verified account, OKX Pay access, and available balance; if it is not shown in your app, it may not be available in your country.",
    pay: "OKX Pay lets eligible users use or move balance inside OKX. Open Pay in the app, finish verification if prompted, and confirm your country/region is eligible.",
    trade: "To trade in OKX, fund or buy crypto first, then open Trade. If you are new, stick to basic spot actions and avoid leverage. For tonight's event, the useful proof is Outcomes or funding, not risky trading.",
    ar: "For AR, tap the AR button on the model. If the camera does not open, try Chrome on Android or Safari with AR support; if it still blocks, ask staff.",
    default: "I can help. Ask me about the event flow (KYC, UID, screenshot, Outcomes, funding) or general OKX features like Card, Pay, deposits, or buying crypto.",
  },
  zh: {
    kyc: "KYC 路径：打开 OKX > Menu > Account settings > Identity verification。选择个人账户，填写资料，上传清晰有效证件；如果要求自拍，就在 OKX app 内完成。不要把证件上传到这里，完成后给工作人员看。",
    uid: "UID 在 OKX app 的个人资料或账户设置里。如果看不到，请先完成身份验证。换饮品时，请上传能看到 UID 的截图。",
    what: "OKX 是一款加密货币应用。今晚的任务是：下载 OKX、创建账户、完成身份验证，然后向工作人员出示 UID。",
    screenshot: "请上传能证明任务的截图：第 1 杯是已验证账户/UID，第 2 杯是 OKX Outcomes 参与截图，第 3 杯是 10 USD 入金截图。",
    outcomes: "在 OKX app 首页横幅或 Trade > DEX > Outcomes 进入活动，选择比赛并参与，然后保存截图给工作人员。",
    fund: "第 3 杯需要在符合条件时入金 10 USD。确认后上传截图，或给现场工作人员查看。",
    card: "OKX Card 是 app 内的虚拟卡，不是实体卡。是否可用取决于地区和资格，通常需要已验证账户、OKX Pay 权限和可用余额。",
    pay: "OKX Pay 可让符合条件的用户在 OKX 内使用或转移余额。请在 app 中打开 Pay，按提示完成验证，并确认所在地区可用。",
    trade: "要在 OKX 交易，先入金或买币，然后进入 Trade。新手建议只了解基础现货操作，避免杠杆。今晚活动主要看 Outcomes 或入金截图。",
    ar: "点击模型上的 AR 按钮。如果相机没有打开，请尝试 Android Chrome 或支持 AR 的 Safari；仍然不行就找现场工作人员。",
    default: "我可以帮你处理活动流程，也可以回答 OKX Card、Pay、入金或买币等问题。",
  },
  ja: {
    kyc: "KYC は OKX > Menu > Account settings > Identity verification。個人口座を選び、情報入力、有効なIDを明るい場所で撮影、必要ならセルフィー。IDはここに送らず、完了後スタッフへ。",
    uid: "UID は OKX app のプロフィールまたはアカウント設定にあります。表示されない場合は本人確認を完了してください。ドリンク用にはUIDが見えるスクショをアップしてください。",
    what: "OKX は暗号資産アプリです。今夜は OKX をダウンロードし、アカウント作成、本人確認、UID提示でドリンク確認です。",
    screenshot: "ミッション証明のスクリーンショットをアップしてください：本人確認/UID、Outcomes参加、または10 USD入金。",
    outcomes: "OKX app のホームバナー、または Trade > DEX > Outcomes から入り、試合に参加してスクリーンショットを保存してください。",
    fund: "3杯目は対象国/方法で10 USD入金が必要です。確認後、スクリーンショットをアップまたはスタッフに見せてください。",
    card: "OKX Card はアプリ内のバーチャルカードです。利用可否は地域と条件によります。通常は本人確認、OKX Pay、利用可能残高が必要です。",
    pay: "OKX Pay は対象ユーザーがOKX内で残高を使う/移動する機能です。アプリでPayを開き、必要な確認と地域 eligibility を確認してください。",
    trade: "OKXで取引するには、先に入金または購入してからTradeを開きます。初心者は基本の現物だけにして、レバレッジは避けてください。今夜の証明はOutcomesか入金スクショです。",
    ar: "モデルの AR ボタンをタップしてください。カメラが開かない場合は対応ブラウザで試し、だめならスタッフへ。",
    default: "イベント手順のほか、OKX Card、Pay、入金、購入についても案内できます。",
  },
  ko: {
    kyc: "KYC: OKX > Menu > Account settings > Identity verification. 개인 계정 선택, 정보 입력, 유효한 신분증을 밝게 촬영, 필요하면 셀피까지 진행하세요. 신분증은 여기 올리지 말고 완료 후 직원에게 보여주세요.",
    uid: "UID는 OKX 앱 프로필 또는 계정 설정에 있습니다. 보이지 않으면 먼저 본인 인증을 완료하세요. 음료를 받으려면 UID가 보이는 스크린샷을 업로드하세요.",
    what: "OKX는 crypto 앱입니다. 오늘은 OKX 설치, 계정 생성, KYC 완료, UID 제시로 음료를 확인합니다.",
    screenshot: "미션 증명 스크린샷을 올리세요: 인증 계정/UID, OKX Outcomes 참여, 또는 10 USD 충전 화면.",
    outcomes: "OKX 앱 홈 배너 또는 Trade > DEX > Outcomes 에서 참여하고, 포지션을 잡은 뒤 스크린샷을 저장하세요.",
    fund: "세 번째 음료는 조건이 맞으면 10 USD 충전이 필요합니다. 확인 후 스크린샷을 업로드하거나 직원에게 보여주세요.",
    card: "OKX Card는 앱 안의 가상 카드이며 실물 카드는 아닙니다. 지역과 자격에 따라 가능 여부가 달라지고, 보통 인증 계정, OKX Pay 접근, 사용 가능한 잔액이 필요합니다.",
    pay: "OKX Pay는 자격이 되는 사용자가 OKX 안에서 잔액을 쓰거나 이동하는 기능입니다. 앱에서 Pay를 열고 필요한 인증과 지역 가능 여부를 확인하세요.",
    trade: "OKX에서 거래하려면 먼저 입금하거나 crypto를 산 뒤 Trade로 들어가세요. 처음이면 기본 현물만 보고 레버리지는 피하세요. 오늘 이벤트 증빙은 Outcomes 또는 입금 스크린샷입니다.",
    ar: "모델의 AR 버튼을 누르세요. 카메라가 열리지 않으면 지원 브라우저에서 다시 시도하고, 안 되면 직원에게 문의하세요.",
    default: "이벤트 플로우뿐 아니라 OKX Card, Pay, 입금, 구매도 도와줄 수 있어요.",
  },
  fr: {
    kyc: "Pour le KYC : OKX > Menu > Account settings > Identity verification. Choisis compte individuel, remplis les infos, ajoute une piece d'identite valide bien lisible, puis selfie si demande. N'envoie pas ton ID ici; montre au staff une fois valide.",
    uid: "Ton UID est dans le profil ou les reglages du compte OKX. Si tu ne le vois pas, termine la verification. Pour le verre, ajoute une capture ou ton UID est visible.",
    what: "OKX est une app crypto. Ce soir : telecharge OKX, cree ton compte, verifie ton identite, puis montre ton UID au staff.",
    screenshot: "Ajoute une capture qui prouve la mission : compte/UID verifie, position OKX Outcomes, ou depot de 10 USD.",
    outcomes: "Dans OKX, ouvre Outcomes depuis la banniere ou Trade > DEX > Outcomes. Prends position sur le match et garde une capture.",
    fund: "Pour le troisieme verre, depose 10 USD si ton pays/moyen est eligible. Une fois confirme, montre ou ajoute la capture.",
    card: "OKX Card est une carte virtuelle dans l'app, pas une carte physique. Disponibilite selon region et eligibilite; il faut generalement un compte verifie, OKX Pay et du solde disponible.",
    pay: "OKX Pay permet aux utilisateurs eligibles d'utiliser ou de transferer un solde dans OKX. Ouvre Pay dans l'app, termine la verification si demande, et verifie l'eligibilite de ta region.",
    trade: "Pour trader dans OKX, depose ou achete d'abord de la crypto, puis ouvre Trade. Si tu debutes, reste sur du spot simple et evite le levier. Pour l'event, la preuve utile est Outcomes ou depot.",
    ar: "Pour AR, touche le bouton AR du modele. Si la camera ne s'ouvre pas, essaie un navigateur compatible ou demande au staff.",
    default: "Je peux aider avec le flow de l'event ou avec OKX Card, Pay, depot et achat crypto.",
  },
};

function cleanModelText(text: string) {
  const cleaned = text
    .replace(/`/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  return cleaned
    .replace(/^["“”]+/, "")
    .replace(/["“”]+$/, "")
    .trim();
}

function normalizeIntentText(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[¿?¡!.,;:()[\]{}"']/g, " ");
}

function detectIntent(text: string): FallbackIntent {
  const normalized = normalizeIntentText(text);
  if (/\b(card|tarjeta|visa|mastercard|virtual card|okx card|apple pay|google pay)\b/.test(normalized)) return "card";
  if (/\b(pay|okx pay|pagar|pago|pagos|spend|wallet balance|balance pay)\b/.test(normalized)) return "pay";
  if (/\b(trade|trading|tradear|operar|spot|swap|perp|perpetual|apalancamiento|leverage|orden|order|market order|limit order)\b/.test(normalized)) return "trade";
  if (/\b(kyc|identity verification|identidad|verificacion|verificar|verify|verification|ine|pasaporte|passport|selfie)\b/.test(normalized)) return "kyc";
  if (/\b(uid|perfil|profile|account settings|user center|cuenta)\b/.test(normalized)) return "uid";
  if (/\b(screenshot|screen shot|captura|foto|proof|prueba|upload|subo|subir)\b/.test(normalized)) return "screenshot";
  if (/\b(outcomes|partido|match|predic|position|posicion|dex)\b/.test(normalized)) return "outcomes";
  if (/\b(fund|fondea|fondeo|deposit|deposito|10 usd|tercera|third)\b/.test(normalized)) return "fund";
  if (/\b(ar|camara|camera|foto ar|3d)\b/.test(normalized)) return "ar";
  if (/\b(que es okx|what is okx|cual es okx|okx que es)\b/.test(normalized)) return "what";
  return "default";
}

function asksForDetail(text: string) {
  const normalized = normalizeIntentText(text);
  return /\b(como|donde|paso a paso|detalle|detallado|explica|explicame|mas info|no entiendo|que hago|how|where|step by step|details|explain)\b/.test(normalized);
}

function getFallbackAnswer(cleanMessages: CleanMessage[], lang: SupportedLang) {
  const lastUserMessage = [...cleanMessages].reverse().find((message) => message.role === "user")?.content || "";
  return fallbackAnswers[lang][detectIntent(lastUserMessage)];
}

function getIntentGuide(intent: FallbackIntent) {
  if (intent === "default") return "";

  const guides: Record<FallbackIntent, string> = {
    kyc: [
      "Official OKX identity verification facts:",
      "- Bar Oriente event signup link: https://bit.ly/baroriente.",
      "- App path: OKX app > Menu > Account settings > Identity verification under Profile.",
      "- User chooses individual verification, fills required info, uploads a clear valid ID, and completes selfie/liveness if requested.",
      "- Never ask for ID documents in this chat. Tell them to complete ID steps only inside OKX.",
    ].join("\n"),
    uid: [
      "Official OKX UID facts:",
      "- If the attendee has not opened an OKX account yet, send them to https://bit.ly/baroriente first.",
      "- App path: OKX app > Menu > User Center > Account settings.",
      "- UID appears in the Profile/account area and can be copied.",
      "- For tonight, the attendee must upload the OKX User Center > Profile screenshot with Profile, Security, Preferences, Account information, UID, and Identity verification visible.",
    ].join("\n"),
    what: [
      "OKX explanation for this event:",
      "- OKX is the crypto app powering tonight's drink missions.",
      "- First drink starts at https://bit.ly/baroriente.",
      "- Keep it event-focused: account, KYC, UID, Outcomes, funding, staff validation.",
    ].join("\n"),
    screenshot: [
      "Proof screenshot rules:",
      "- Drink 1 proof: OKX User Center > Profile screenshot with Profile, Security, Preferences, Account information, UID, and Identity verification visible.",
      "- Drink 2 proof: OKX Outcomes participation/position screen.",
      "- Drink 3 proof: 10 USD funding/deposit/buy confirmation screen.",
      "- Do not ask for passwords, full card numbers, private keys, seed phrases, or ID documents.",
    ].join("\n"),
    outcomes: [
      "Official OKX Outcomes facts:",
      "- App path: homepage banner or Trade > DEX > Outcomes.",
      "- First-time users may need account initialization.",
      "- User joins the match activation, takes a position, and saves proof.",
      "- Do not tell the user what team/outcome to pick.",
    ].join("\n"),
    fund: [
      "Official OKX funding/deposit facts:",
      "- Crypto deposit app paths: tap Deposit from home, or go to Assets/Portfolio > Deposit > Deposit crypto.",
      "- Then choose crypto asset and deposit network. The app generates deposit details/address/QR.",
      "- The user sends funds from another wallet/exchange using the same asset and network.",
      "- Mexico/LATAM cash-buy path: home Buy > Buy crypto, Assets > Deposit, or User Center > Buy, then Buy Crypto with local currency such as MXN when available.",
      "- Availability depends on country, payment method, verification, limits, and OKX terms.",
      "- For tonight, once about 10 USD is confirmed, they upload/show the funding screenshot to staff.",
    ].join("\n"),
    card: [
      "Official OKX Card facts from OKX help:",
      "- OKX Card is an international debit card, Visa or Mastercard depending on region.",
      "- It connects to the user's OKX Pay account and is issued as a virtual card only in the app; OKX says it does not issue physical cards.",
      "- Availability depends on region, eligibility, terms, and app/account status.",
      "- Some transaction categories are unsupported and may be rejected, including money transfer, cash disbursement, and quasi-cash type purchases.",
      "- If the user asks how to use it: tell them to open OKX Card/Pay in the app, complete verification/Pay setup if prompted, add or use the virtual card where available, and check eligibility with OKX staff if it does not appear.",
    ].join("\n"),
    pay: [
      "Official OKX Pay / balance facts:",
      "- OKX Pay/Card availability may require a verified personal account, eligible country/region, and updated app.",
      "- Users should open Pay in the OKX app, follow setup prompts, and only complete sensitive identity steps inside OKX.",
      "- If Pay or Card is missing, it may be because country, account status, verification, or product availability does not qualify.",
      "- Do not redirect Pay/Card questions to UID unless the user explicitly asks about the drink mission proof.",
    ].join("\n"),
    trade: [
      "OKX trading help context:",
      "- Give practical app navigation for basic trading questions: user needs funds first, then opens Trade.",
      "- If user is new, recommend simple spot-only understanding and warn against leverage/perpetuals without experience.",
      "- Do not provide financial advice, price predictions, or tell the user what to buy or sell.",
      "- If relevant to tonight, circle back gently: event proof is OKX Outcomes participation or 10 USD funding screenshot, not risky trading.",
    ].join("\n"),
    ar: [
      "AR facts:",
      "- The OKX logo has an AR button.",
      "- Android should use Chrome/Scene Viewer; iPhone should use Safari/Quick Look.",
      "- If the browser blocks camera/AR, ask staff for the shot flow.",
    ].join("\n"),
    default: "",
  };

  return guides[intent];
}

async function requestChatCompletion({
  apiKey,
  baseUrl,
  model,
  maxTokens,
  messages,
}: {
  apiKey: string;
  baseUrl: string;
  model: string;
  maxTokens: number;
  messages: Array<{ role: "system" | "user"; content: string }>;
}) {
  const response = await fetch(`${baseUrl.replace(/\/$/, "")}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    signal: AbortSignal.timeout(12000),
    body: JSON.stringify({
      model,
      temperature: 0.35,
      top_p: 0.9,
      max_tokens: maxTokens,
      stream: false,
      messages,
    }),
  });

  const payload = (await response.json().catch(() => ({}))) as ChatCompletionPayload;
  if (!response.ok) {
    throw new Error(payload.error?.message || `Chat provider failed with ${response.status}`);
  }

  const content = payload.choices?.[0]?.message?.content?.trim();
  if (!content) throw new Error("Chat provider returned an empty response");
  return cleanModelText(content);
}

function getSystemPrompt(soul: string, lang: SupportedLang, intent: FallbackIntent, detailed: boolean) {
  const guide = getIntentGuide(intent);
  return [
    soul,
    `Agent name: ${HERMES_AGENT_NAME}.`,
    `Soul version: ${OKX_PETRA_SOUL_VERSION}.`,
    `Current page language: ${lang}.`,
    guide ? `Relevant OKX guide context for this message:\n${guide}` : "",
    detailed
      ? "The attendee is asking for detail. Give a real answer with enough steps to complete the action. Use Markdown with short sections, bullets, or numbered steps. Include where to tap, what to expect, what screenshot to show, and what to do if the option does not appear."
      : "The attendee is asking a quick question. Keep it direct, but still answer the specific question.",
    "Production guardrail: answer from the soul, the relevant OKX guide context, and tonight's event context. If the user asks about a general OKX feature such as Card, Pay, deposit, buy, trading, or fees, answer that feature directly and do not force the answer back to UID or drink proof. After answering, add one short event tie-back only if it is useful.",
    "Answer the newest attendee message specifically. Do not repeat a previous answer unless the newest message asks the same thing.",
    "If the newest message is a follow-up, use the previous assistant answer and explain the missing detail instead of repeating yourself.",
    "If the newest message asks what OKX is, explain OKX in one short sentence first, then give the next event action.",
    "If the newest message asks about UID, answer only where UID is and what to show staff.",
    "If the newest message asks about KYC or identity verification, give the exact OKX app path: Menu > Account settings > Identity verification, mention valid ID/selfie if needed, and tell them not to upload ID documents into this chat.",
    "If the newest message asks how or where to fund, give the actual OKX tap path: Deposit from home, or Assets/Portfolio > Deposit. Mention Deposit crypto with same asset/network, or Buy > Buy crypto / Assets > Deposit for local currency when available.",
    "If the newest message asks about OKX Card or OKX Pay, answer the Card/Pay question directly using eligibility, virtual-card, Pay-account, region, and unsupported-transaction context. Do not mention UID unless the user asks how to redeem the event drink.",
    "If the newest message asks about trading, answer the trading/navigation question directly, avoid financial advice, warn gently about leverage for new users, and only then circle back to the event proof if useful.",
    "If the newest message asks about screenshot/proof, answer only which screenshot is needed.",
    "Return only the helpful answer for the attendee. No preamble, no disclaimers unless needed by the soul.",
    "Tone: natural, cool, event-floor Spanish/English. Do not sound like a corporate support bot. In Spanish, sound like a real person in Mexico City helping at a party.",
    "Do not wrap the answer in quotation marks.",
    detailed
      ? "No tables. Aim for 120-220 words only if that helps the attendee actually finish the flow."
      : "No tables. Keep it under 80 words unless the user asks for more.",
  ].filter(Boolean).join("\n\n");
}

function buildHermesUserPrompt(cleanMessages: CleanMessage[], lang: SupportedLang) {
  const newestUserMessage = [...cleanMessages].reverse().find((message) => message.role === "user")?.content || "What do I do?";
  const transcript = cleanMessages.length
    ? cleanMessages
        .map((message) => `${message.role === "user" ? "Attendee" : "Petra"}: ${message.content}`)
        .join("\n")
    : "none";

  return [
    `Current page language: ${lang}.`,
    `Newest attendee message: ${newestUserMessage}`,
    "",
    "Conversation transcript, oldest to newest:",
    transcript,
    "",
    "Reply as Petra / Hermes now. Use the transcript, avoid repeating your previous answer, and give the next useful action for the newest attendee message.",
  ].join("\n");
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as ChatBody;
  const lang: SupportedLang =
    body.lang === "en" ||
    body.lang === "zh" ||
    body.lang === "ja" ||
    body.lang === "ko" ||
    body.lang === "fr"
      ? body.lang
      : "es";
  const messages = Array.isArray(body.messages) ? body.messages : [];
  const cleanMessages: CleanMessage[] = messages
    .filter((message) => message.role === "user" || message.role === "assistant")
    .slice(-10)
    .map((message) => ({
      role: message.role === "assistant" ? "assistant" : "user",
      content: String(message.content || "").slice(0, 900),
  }));
  const latestUserMessage = [...cleanMessages].reverse().find((message) => message.role === "user")?.content || "";
  const intent = detectIntent(latestUserMessage);
  const detailed = asksForDetail(latestUserMessage);

  const providerMessages = [
    { role: "system" as const, content: getSystemPrompt(okxPetraSoul, lang, intent, detailed) },
    { role: "user" as const, content: buildHermesUserPrompt(cleanMessages, lang) },
  ];

  const nvidiaKey =
    process.env.NVIDIA_API_KEY?.trim() ||
    process.env.NVIDIA_BUILD_API_KEY?.trim() ||
    process.env.NVAPI_KEY?.trim();
  const nvidiaBaseUrl = process.env.NVIDIA_BASE_URL?.trim() || NVIDIA_BASE_URL;
  const nvidiaModel = process.env.NVIDIA_MODEL?.trim() || NVIDIA_MODEL;

  if (nvidiaKey) {
    try {
      console.info("OKX Petra Hermes NVIDIA request", {
        agent: HERMES_AGENT_NAME,
        source: "nvidia-build",
        model: nvidiaModel,
        lang,
        soulVersion: OKX_PETRA_SOUL_VERSION,
        soulChars: okxPetraSoul.length,
        transcriptMessages: cleanMessages.length,
        intent,
        detailed,
      });
      const message = await requestChatCompletion({
        apiKey: nvidiaKey,
        baseUrl: nvidiaBaseUrl,
        model: nvidiaModel,
        maxTokens: detailed ? 720 : 360,
        messages: providerMessages,
      });
      console.info("OKX Petra Hermes NVIDIA success", {
        agent: HERMES_AGENT_NAME,
        source: "nvidia-build",
        model: nvidiaModel,
        lang,
        soulVersion: OKX_PETRA_SOUL_VERSION,
        answerChars: message.length,
      });
      return NextResponse.json({
        message,
        source: "nvidia-build-hermes",
        model: nvidiaModel,
        soulVersion: OKX_PETRA_SOUL_VERSION,
      });
    } catch (error) {
      console.error("OKX Petra Hermes NVIDIA failed", {
        agent: HERMES_AGENT_NAME,
        model: nvidiaModel,
        lang,
        soulVersion: OKX_PETRA_SOUL_VERSION,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  const message = getFallbackAnswer(cleanMessages, lang);
  console.warn("OKX Petra Hermes fallback", {
    agent: HERMES_AGENT_NAME,
    lang,
    hasNvidiaKey: Boolean(nvidiaKey),
    intent,
    soulVersion: OKX_PETRA_SOUL_VERSION,
  });
  return NextResponse.json({
    message,
    source: "fallback-hermes",
    soulVersion: OKX_PETRA_SOUL_VERSION,
  });
}
