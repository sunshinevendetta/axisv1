"use client";

import type { ChangeEvent, FormEvent, ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import {
  FiCamera,
  FiCheck,
  FiHelpCircle,
  FiLoader,
  FiMessageCircle,
  FiShield,
  FiUpload,
  FiX,
} from "react-icons/fi";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import ModelViewer from "@/components/arapp/ModelViewer";
import "./okx.css";

gsap.registerPlugin(useGSAP);

type Lang = "es" | "en" | "zh" | "ja" | "ko" | "fr";
type MissionId = "verify" | "outcomes" | "fund";

type Mission = {
  id: MissionId;
  drink: string;
  asset: string;
  ctaUrl?: string;
  ctaLabel?: Record<Lang, string>;
  uidDeeplink?: string;
  videoSrc?: string;
  videoLabel?: Record<Lang, string>;
  uidGuide?: UidGuideItem[];
  title: Record<Lang, string>;
  visualTitle: Record<Lang, string>;
  action: Record<Lang, string>;
  staff: Record<Lang, string>;
  steps: Record<Lang, string[]>;
};

type UidGuideItem = {
  image: string;
  featured?: boolean;
  title: Record<Lang, string>;
  alt: Record<Lang, string>;
};

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

type Claim = {
  claimId: string;
  redeemUrl: string;
  qrUrl: string;
  missionId: MissionId;
  drinkId?: number;
  usedAt?: string | null;
  participantId?: string;
  duplicate?: boolean;
};

type ProofState = {
  proofName: string;
  proofDataUrl: string;
  status: "idle" | "submitting" | "ready" | "error";
  error: string;
  claim: Claim | null;
};

const flags: Array<{ lang: Lang; label: string; flag: string }> = [
  { lang: "es", label: "Espanol", flag: "🇲🇽" },
  { lang: "en", label: "English", flag: "🇺🇸" },
  { lang: "zh", label: "Chinese", flag: "🇨🇳" },
  { lang: "ja", label: "Japanese", flag: "🇯🇵" },
  { lang: "ko", label: "Korean", flag: "🇰🇷" },
  { lang: "fr", label: "French", flag: "🇫🇷" },
];

const guideStepLabel: Record<Lang, string> = {
  es: "Paso",
  en: "Step",
  zh: "步骤",
  ja: "ステップ",
  ko: "단계",
  fr: "Étape",
};

const missions: Mission[] = [
  {
    id: "verify",
    drink: "01",
    asset: "/okx/drink-01.webp",
    ctaUrl: "https://bit.ly/baroriente",
    uidDeeplink: "okx://",
    ctaLabel: {
      es: "Toca aquí para abrir tu cuenta OKX",
      en: "Tap here to open your OKX account",
      zh: "点击这里打开你的 OKX 账户",
      ja: "ここをタップしてOKXアカウントを開く",
      ko: "여기를 눌러 OKX 계정 열기",
      fr: "Appuie ici pour ouvrir ton compte OKX",
    },
    title: {
      es: "1° drink",
      en: "1st drink",
      zh: "第1杯",
      ja: "1杯目",
      ko: "1잔",
      fr: "1er verre",
    },
    visualTitle: {
      es: "Haz tu cuenta",
      en: "Make your account",
      zh: "创建账户",
      ja: "アカウント作成",
      ko: "계정 만들기",
      fr: "Cree ton compte",
    },
    action: {
      es: "Abre OKX y comienza el desafio",
      en: "Open OKX and start the challenge",
      zh: "打开 OKX，开始挑战",
      ja: "OKX を開いて開始",
      ko: "OKX를 열고 시작",
      fr: "Ouvre OKX et commence",
    },
    staff: {
      es: "Sube screenshot de la pantalla User Center > Profile de OKX donde se vea tu UID.",
      en: "Upload a screenshot of the OKX User Center > Profile screen where your UID is visible.",
      zh: "上传一张完整 OKX 屏幕截图，必须能看到 UID。",
      ja: "UIDが見えるOKXの全画面スクショをアップロードして。",
      ko: "UID가 보이는 OKX 전체 화면 스크린샷을 업로드해 주세요.",
      fr: "Ajoute une capture plein ecran OKX ou ton UID est visible.",
    },
    steps: {
      es: ["Toca aquí y abre tu cuenta", "Completa KYC", "Busca tu UID", "Sube screenshot de User Center > Profile"],
      en: ["Tap here and open your account", "Complete KYC", "Find your UID", "Upload User Center > Profile screenshot"],
      zh: ["打开 OKX", "创建账户", "找到 UID", "上传含 UID 的完整截图"],
      ja: ["OKXを開く", "アカウント作成", "UIDを探す", "UID入り全画面スクショをアップ"],
      ko: ["OKX 열기", "계정 만들기", "UID 찾기", "UID 포함 전체 스크린샷 업로드"],
      fr: ["Ouvre OKX", "Cree le compte", "Trouve ton UID", "Ajoute capture complete avec UID"],
    },
    uidGuide: [
      {
        image: "/okx/init.jpg",
        title: {
          es: "Abre el menú de perfil",
          en: "Open the profile menu",
          zh: "打开个人资料菜单",
          ja: "プロフィールメニューを開く",
          ko: "프로필 메뉴 열기",
          fr: "Ouvre le menu profil",
        },
        alt: {
          es: "Pantalla inicial de OKX señalando el menú de perfil",
          en: "OKX home screen pointing to the profile menu",
          zh: "OKX 首页，指向个人资料菜单",
          ja: "プロフィールメニューを示すOKXホーム画面",
          ko: "프로필 메뉴를 가리키는 OKX 홈 화면",
          fr: "Ecran d'accueil OKX indiquant le menu profil",
        },
      },
      {
        image: "/okx/second.jpg",
        title: {
          es: "Entra a Account settings",
          en: "Enter Account settings",
          zh: "进入账户设置",
          ja: "Account settingsへ進む",
          ko: "Account settings로 이동",
          fr: "Entre dans Account settings",
        },
        alt: {
          es: "Pantalla de perfil de OKX señalando Account settings",
          en: "OKX profile screen pointing to Account settings",
          zh: "OKX 个人资料页，指向账户设置",
          ja: "Account settingsを示すOKXプロフィール画面",
          ko: "Account settings를 가리키는 OKX 프로필 화면",
          fr: "Ecran profil OKX indiquant Account settings",
        },
      },
      {
        image: "/okx/exampleuid.jpg",
        featured: true,
        title: {
          es: "Toma screenshot de esta pantalla mostrando TU PERFIL",
          en: "Screenshot this exact screen showing YOUR PROFILE",
          zh: "截取这个完整页面",
          ja: "この画面をスクショ",
          ko: "이 화면을 스크린샷",
          fr: "Capture cet ecran exact",
        },
        alt: {
          es: "Ejemplo de pantalla User Center Profile de OKX con UID e Identity verification visibles",
          en: "Example OKX User Center Profile screen with UID and Identity verification visible",
          zh: "OKX User Center Profile 示例页面，包含 UID 和 Identity verification",
          ja: "UIDとIdentity verificationが見えるOKX User Center Profile画面の例",
          ko: "UID와 Identity verification이 보이는 OKX User Center Profile 예시 화면",
          fr: "Exemple d'ecran OKX User Center Profile avec UID et Identity verification visibles",
        },
      },
    ],
  },
  {
    id: "outcomes",
    drink: "02",
    asset: "/okx/drink-02.webp",
    videoSrc: "/okx/outcome.mp4",
    videoLabel: {
      es: "Guia rapida de OKX Outcomes",
      en: "Quick OKX Outcomes guide",
      zh: "Quick OKX Outcomes guide",
      ja: "Quick OKX Outcomes guide",
      ko: "Quick OKX Outcomes guide",
      fr: "Quick OKX Outcomes guide",
    },
    title: {
      es: "2° drink",
      en: "2nd drink",
      zh: "第2杯",
      ja: "2杯目",
      ko: "2잔",
      fr: "2e verre",
    },
    visualTitle: {
      es: "Predice el partido",
      en: "Predict the match",
      zh: "预测比赛",
      ja: "試合を予想",
      ko: "경기 예측",
      fr: "Predis le match",
    },
    action: {
      es: "Quien gana manana?",
      en: "Who wins tomorrow?",
      zh: "明天谁会赢？",
      ja: "明日どっちが勝つ？",
      ko: "내일 누가 이길까?",
      fr: "Qui gagne demain ?",
    },
    staff: {
      es: "Sube screenshot de tu participacion en OKX Outcomes.",
      en: "Upload a screenshot of your OKX Outcomes position.",
      zh: "上传 OKX Outcomes 参与截图。",
      ja: "OKX Outcomes の参加画面をアップ。",
      ko: "OKX Outcomes 참여 화면 업로드.",
      fr: "Ajoute une capture de ta position OKX Outcomes.",
    },
    steps: {
      es: ["Entra a Outcomes", "Elige un partido", "Toma posicion", "Sube screenshot"],
      en: ["Enter Outcomes", "Choose a match", "Take a position", "Upload screenshot"],
      zh: ["进入 Outcomes", "选择比赛", "做出预测", "上传截图"],
      ja: ["Outcomesへ", "試合を選ぶ", "予想する", "スクショをアップ"],
      ko: ["Outcomes 이동", "경기 선택", "예측 참여", "스크린샷 업로드"],
      fr: ["Ouvre Outcomes", "Choisis un match", "Prends position", "Ajoute capture"],
    },
  },
  {
    id: "fund",
    drink: "03",
    asset: "/okx/drink-03.webp",
    title: {
      es: "3rd drink",
      en: "3rd drink",
      zh: "3rd drink",
      ja: "3rd drink",
      ko: "3rd drink",
      fr: "3rd drink",
    },
    visualTitle: {
      es: "Fondea 10 USD",
      en: "Fund 10 USD",
      zh: "Fund 10 USD",
      ja: "Fund 10 USD",
      ko: "Fund 10 USD",
      fr: "Fund 10 USD",
    },
    action: {
      es: "Recibe 10 USD extras. Duplicamos tu lana",
      en: "Get 10 USD extra. We double your money",
      zh: "Get 10 USD extra. We double your money",
      ja: "Get 10 USD extra. We double your money",
      ko: "Get 10 USD extra. We double your money",
      fr: "Get 10 USD extra. We double your money",
    },
    staff: {
      es: "Sube screenshot de tu fondeo OKX de 10 USD.",
      en: "Upload a screenshot of your 10 USD OKX funding.",
      zh: "Upload a screenshot of your 10 USD OKX funding.",
      ja: "Upload a screenshot of your 10 USD OKX funding.",
      ko: "Upload a screenshot of your 10 USD OKX funding.",
      fr: "Upload a screenshot of your 10 USD OKX funding.",
    },
    steps: {
      es: ["Fondea 10 USD", "Espera confirmacion", "Sube screenshot", "Muestra tu QR"],
      en: ["Fund 10 USD", "Wait for confirmation", "Upload screenshot", "Show your QR"],
      zh: ["Fund 10 USD", "Wait for confirmation", "Upload screenshot", "Show your QR"],
      ja: ["Fund 10 USD", "Wait for confirmation", "Upload screenshot", "Show your QR"],
      ko: ["Fund 10 USD", "Wait for confirmation", "Upload screenshot", "Show your QR"],
      fr: ["Fund 10 USD", "Wait for confirmation", "Upload screenshot", "Show your QR"],
    },
  },
];

const copy = {
  es: {
    language: "Idioma",
    eyebrow: "Bar Oriente - Junio 25, 2026",
    hero: "DRINKS POWERED BY: OKX",
    intro: "Completa una mision. Sube prueba. Recibe un QR unico para tu bebida.",
    count: "Tus bebidas",
    missions: "MISIONES DE ESTA NOCHE",
    unlock: "Como desbloquear tus bebidas gratis esta noche",
    proof: "Subir screenshot",
    proofHint: "Debe ser esa pantalla: User Center > Profile, con Profile, Security, Preferences, Account information, UID e Identity verification visibles.",
    generate: "Generar QR drink",
    generating: "Generando",
    ready: "QR LISTO",
    showLive: "Muestra esta pantalla al staff. Cada QR se escanea una sola vez.",
    screenshot: "Proteccion: el QR se oculta en screenshots. Manten presionado solo frente al staff.",
    qrHold: "Manten presionado para mostrar QR",
    qrHidden: "QR protegido",
    close: "Cerrar",
    tapHere: "Abrir",
    ar: "Abrir AR",
    arHint: "Tap aqui para abrir la AR, toma una foto, subela, por un shot",
    chatTitle: "AYUDA",
    chatSub: "Hermes agent powered by NVIDIA, made by AXIS for OKX.",
    input: "Pregunta aqui",
    ask: "Enviar",
    quick: ["Que es OKX?", "Donde veo mi UID?", "Que screenshot subo?", "Como fondeo?", "Como uso OKX Card?", "Como hago trading?"],
    fallback: "Soy Petra. Si algo falla, ve directo con staff OKX y lo resolvemos ahi.",
    error: "Sube screenshot de User Center > Profile con Account information, UID e Identity verification visibles para generar tu QR.",
    limit: "Cupo limitado: 500 bebidas. Maximo 3 por persona. Staff OKX valida en sitio.",
  },
  en: {
    language: "Language",
    eyebrow: "Bar Oriente - June 25, 2026",
    hero: "DRINKS POWERED BY: OKX",
    intro: "Complete one mission. Upload proof. Get a unique QR for your drink.",
    count: "Your drinks",
    missions: "TONIGHT'S MISSIONS",
    unlock: "How to unlock your free drinks tonight",
    proof: "Upload screenshot",
    proofHint: "It must be that screen: User Center > Profile, with Profile, Security, Preferences, Account information, UID, and Identity verification visible.",
    generate: "Generate drink QR",
    generating: "Generating",
    ready: "QR LISTO",
    showLive: "Show this live screen to staff. Each QR scans once.",
    screenshot: "Protection: the QR hides in screenshots. Hold only in front of staff.",
    qrHold: "Hold to show QR",
    qrHidden: "Protected QR",
    close: "Close",
    tapHere: "Open",
    ar: "Open AR",
    arHint: "Tap here to open AR, take a photo, post it for a shot",
    chatTitle: "AYUDA",
    chatSub: "Hermes agent powered by NVIDIA, made by AXIS for OKX.",
    input: "Ask here",
    ask: "Send",
    quick: ["What is OKX?", "Where is my UID?", "Which screenshot?", "How do I fund?", "How do I use OKX Card?", "How do I trade?"],
    fallback: "I am Petra. If anything fails, go straight to OKX staff and we will sort it there.",
    error: "Upload the User Center > Profile screenshot with Account information, UID, and Identity verification visible to generate your QR.",
    limit: "Limited: 500 drinks. Max 3 per person. OKX staff validates on-site.",
  },
  zh: {
    language: "语言",
    eyebrow: "Bar Oriente - 2026年6月25日",
    hero: "DRINKS POWERED BY: OKX",
    intro: "完成任务，上传证明，领取饮品专属 QR。",
    count: "你的饮品",
    missions: "今晚任务",
    unlock: "今晚如何解锁免费饮品",
    proof: "上传截图",
    proofHint: "必须是完整 OKX 屏幕截图，并且能看到你的 UID。",
    generate: "生成饮品 QR",
    generating: "生成中",
    ready: "QR LISTO",
    showLive: "向工作人员展示此页面。每个 QR 只能扫描一次。",
    screenshot: "保护：动态 QR。请勿分享截图。",
    qrHold: "按住显示 QR",
    qrHidden: "QR 已保护",
    close: "关闭",
    tapHere: "打开",
    ar: "打开 AR",
    arHint: "点这里打开 AR，拍照发布，换一杯 shot",
    chatTitle: "AYUDA",
    chatSub: "Hermes agent powered by NVIDIA, made by AXIS for OKX.",
    input: "输入问题",
    ask: "发送",
    quick: ["OKX 是什么？", "UID 在哪里？", "上传什么截图？", "怎么入金？", "怎么用 OKX Card？", "怎么交易？"],
    fallback: "AYUDA 可以帮你。若失败，请找 OKX 工作人员。",
    error: "需要 UID 或截图才能生成 QR。",
    limit: "限量 500 杯。每人最多 3 杯。现场由 OKX 工作人员验证。",
  },
  ja: {
    language: "言語",
    eyebrow: "Bar Oriente - 2026年6月25日",
    hero: "DRINKS POWERED BY: OKX",
    intro: "ミッション完了、証明をアップ、ドリンク用QRを取得。",
    count: "あなたのドリンク",
    missions: "今夜のミッション",
    unlock: "今夜の無料ドリンク解放方法",
    proof: "スクショをアップ",
    proofHint: "OKXの全画面スクショで、UIDが見えている必要があります。",
    generate: "ドリンクQR生成",
    generating: "生成中",
    ready: "QR LISTO",
    showLive: "この画面をスタッフへ。QRは一度だけ有効。",
    screenshot: "保護：動的QR。スクショ共有しないで。",
    qrHold: "長押しで QR 表示",
    qrHidden: "保護された QR",
    close: "閉じる",
    tapHere: "開く",
    ar: "ARを開く",
    arHint: "ここをタップ、ARで撮影、投稿してshot",
    chatTitle: "AYUDA",
    chatSub: "Hermes agent powered by NVIDIA, made by AXIS for OKX.",
    input: "質問する",
    ask: "送信",
    quick: ["OKXとは？", "UIDはどこ？", "何をアップ？", "入金方法は？", "OKX Cardの使い方", "取引方法は？"],
    fallback: "AYUDAが案内します。失敗したらOKXスタッフへ。",
    error: "QR生成にはUIDまたはスクショが必要です。",
    limit: "500杯限定。1人最大3杯。OKXスタッフが現地確認。",
  },
  ko: {
    language: "언어",
    eyebrow: "Bar Oriente - 2026년 6월 25일",
    hero: "DRINKS POWERED BY: OKX",
    intro: "미션 완료, 증빙 업로드, 음료용 고유 QR 받기.",
    count: "내 음료",
    missions: "오늘 밤 미션",
    unlock: "오늘 무료 음료 받는 법",
    proof: "스크린샷 업로드",
    proofHint: "OKX 전체 화면 스크린샷이어야 하며 UID가 보여야 합니다.",
    generate: "드링크 QR 생성",
    generating: "생성 중",
    ready: "QR LISTO",
    showLive: "이 화면을 직원에게 보여주세요. QR은 1회만 스캔됩니다.",
    screenshot: "보호: 동적 QR. 스크린샷 공유 금지.",
    qrHold: "누르고 있으면 QR 표시",
    qrHidden: "보호된 QR",
    close: "닫기",
    tapHere: "열기",
    ar: "AR 열기",
    arHint: "여기를 눌러 AR 열고 사진 올리면 shot",
    chatTitle: "AYUDA",
    chatSub: "Hermes agent powered by NVIDIA, made by AXIS for OKX.",
    input: "질문 입력",
    ask: "전송",
    quick: ["OKX가 뭐예요?", "UID는 어디?", "무슨 스샷?", "입금은 어떻게?", "OKX Card 사용법", "거래는 어떻게?"],
    fallback: "AYUDA가 도와줄게요. 안 되면 OKX 직원에게 가세요.",
    error: "QR 생성을 위해 UID 또는 스크린샷이 필요합니다.",
    limit: "500잔 한정. 1인 최대 3잔. OKX 직원 현장 확인.",
  },
  fr: {
    language: "Langue",
    eyebrow: "Bar Oriente - 25 juin 2026",
    hero: "DRINKS POWERED BY: OKX",
    intro: "Complete une mission. Ajoute une preuve. Recois ton QR boisson.",
    count: "Tes verres",
    missions: "MISSIONS DE CE SOIR",
    unlock: "Comment debloquer tes verres gratuits ce soir",
    proof: "Ajouter capture",
    proofHint: "La capture doit montrer tout l'ecran OKX avec ton UID visible.",
    generate: "Generer QR drink",
    generating: "Generation",
    ready: "QR LISTO",
    showLive: "Montre cet ecran au staff. Chaque QR se scanne une fois.",
    screenshot: "Protection : QR dynamique. Ne partage pas de capture.",
    qrHold: "Maintiens pour afficher le QR",
    qrHidden: "QR protege",
    close: "Fermer",
    tapHere: "Ouvrir",
    ar: "Ouvrir AR",
    arHint: "Tape ici, ouvre AR, prends photo, poste pour un shot",
    chatTitle: "AYUDA",
    chatSub: "Hermes agent powered by NVIDIA, made by AXIS for OKX.",
    input: "Pose ta question",
    ask: "Envoyer",
    quick: ["C'est quoi OKX ?", "Ou est mon UID ?", "Quelle capture ?", "Comment deposer ?", "Comment utiliser OKX Card ?", "Comment trader ?"],
    fallback: "AYUDA peut aider. Si ca bloque, va voir le staff OKX.",
    error: "UID ou capture requis pour generer ton QR.",
    limit: "Limite : 500 verres. Max 3 par personne. Validation OKX sur place.",
  },
};

const initialAssistant: Record<Lang, string> = {
  es: "Soy Petra, agente Hermes de AXIS. Te ayudo para obtener tus bebidas esta noche.",
  en: "I am Petra, the AXIS Hermes agent. I help you get your drinks tonight.",
  zh: "我是 Petra，AXIS 的 Hermes agent。今晚我帮你完成饮品任务。",
  ja: "Petraです。AXIS Hermes agent として今夜のドリンクを案内します。",
  ko: "저는 Petra, AXIS Hermes agent입니다. 오늘 밤 음료 미션을 도와드려요.",
  fr: "Je suis Petra, agent Hermes AXIS. Je t'aide a obtenir tes verres ce soir.",
};

function renderChatInline(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*|__[^_]+__|`[^`]+`)/g).filter(Boolean);

  return parts.map((part, partIndex) => {
    const bold = part.match(/^(\*\*|__)(.+)(\*\*|__)$/);
    if (bold) return <strong key={`${part}-${partIndex}`}>{bold[2]}</strong>;

    const code = part.match(/^`(.+)`$/);
    if (code) return <code key={`${part}-${partIndex}`}>{code[1]}</code>;

    return <span key={`${part}-${partIndex}`}>{part}</span>;
  });
}

function formatChatText(text: string): ReactNode {
  const normalized = text.replace(/\n{3,}/g, "\n\n").trim();
  const lines = normalized.split("\n");

  return lines.map((line, lineIndex) => {
    const heading = line.match(/^#{1,3}\s+(.+)$/);
    if (heading) {
      return (
        <div key={`${line}-${lineIndex}`} className="okx-chat-heading">
          {renderChatInline(heading[1])}
        </div>
      );
    }

    if (!line.trim()) {
      return <div key={`${line}-${lineIndex}`} className="okx-chat-spacer" />;
    }

    const bullet = line.match(/^\s*[-*]\s+(.+)$/);
    if (bullet) {
      return (
        <div key={`${line}-${lineIndex}`} className="okx-chat-list-row">
          <span aria-hidden>•</span>
          <p>{renderChatInline(bullet[1])}</p>
        </div>
      );
    }

    const numbered = line.match(/^\s*(\d+)[.)]\s+(.+)$/);
    if (numbered) {
      return (
        <div key={`${line}-${lineIndex}`} className="okx-chat-list-row numbered">
          <span>{numbered[1]}</span>
          <p>{renderChatInline(numbered[2])}</p>
        </div>
      );
    }

    return (
      <p key={`${line}-${lineIndex}`} className="okx-chat-paragraph">
        {renderChatInline(line)}
      </p>
    );
  });
}

function makeProofState(): Record<MissionId, ProofState> {
  return {
    verify: { proofName: "", proofDataUrl: "", status: "idle", error: "", claim: null },
    outcomes: { proofName: "", proofDataUrl: "", status: "idle", error: "", claim: null },
    fund: { proofName: "", proofDataUrl: "", status: "idle", error: "", claim: null },
  };
}

const participantStorageKey = "axis-okx-participant-id-v2";
const claimsStorageKey = "axis-okx-claims-v2-live";

function makeParticipantId() {
  return `AXIS-OKX-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
}

function readStoredClaims() {
  try {
    const raw = window.localStorage.getItem(claimsStorageKey);
    if (!raw) return {};
    return JSON.parse(raw) as Partial<Record<MissionId, Claim>>;
  } catch {
    return {};
  }
}

function writeStoredClaim(missionId: MissionId, claim: Claim) {
  const current = readStoredClaims();
  window.localStorage.setItem(claimsStorageKey, JSON.stringify({ ...current, [missionId]: claim }));
}

function removeStoredClaim(missionId: MissionId) {
  const current = readStoredClaims();
  delete current[missionId];
  window.localStorage.setItem(claimsStorageKey, JSON.stringify(current));
}

function clearStoredOkxSession() {
  for (const storage of [window.localStorage, window.sessionStorage]) {
    const keys = Array.from({ length: storage.length }, (_, index) => storage.key(index)).filter(Boolean) as string[];
    keys.filter((key) => key.toLowerCase().includes("okx")).forEach((key) => storage.removeItem(key));
  }
}

function ensureParticipantId(current: string) {
  if (current) return current;
  let storedParticipantId = window.localStorage.getItem(participantStorageKey);
  if (!storedParticipantId) {
    storedParticipantId = makeParticipantId();
    window.localStorage.setItem(participantStorageKey, storedParticipantId);
  }
  return storedParticipantId;
}

function readImageFile(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : "");
    reader.onerror = () => reject(new Error("Could not read image"));
    reader.readAsDataURL(file);
  });
}

function loadProofImage(dataUrl: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new window.Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Could not load image"));
    image.src = dataUrl;
  });
}

async function prepareProofImage(file: File) {
  const dataUrl = await readImageFile(file);
  const image = await loadProofImage(dataUrl);
  const maxSide = 2200;
  const scale = Math.min(1, maxSide / Math.max(image.naturalWidth, image.naturalHeight));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
  canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
  const context = canvas.getContext("2d");
  if (!context) return dataUrl;
  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", 0.92);
}

function isSubmitting(proof: ProofState) {
  return proof.status === "submitting";
}

export default function OkxOnboarding() {
  const rootRef = useRef<HTMLElement>(null);
  const chatLogRef = useRef<HTMLDivElement>(null);
  const [lang, setLang] = useState<Lang>("es");
  const [activeMission, setActiveMission] = useState<MissionId | null>(null);
  const [proofs, setProofs] = useState<Record<MissionId, ProofState>>(makeProofState);
  const [participantId, setParticipantId] = useState("");
  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatBusy, setChatBusy] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "assistant", content: initialAssistant.es },
  ]);

  const t = copy[lang];
  const completedCount = useMemo(
    () => missions.filter((mission) => proofs[mission.id].claim).length,
    [proofs],
  );
  const active = activeMission ? missions.find((mission) => mission.id === activeMission) || null : null;

  useEffect(() => {
    const url = new URL(window.location.href);
    if (url.searchParams.get("resetOkx") === "1") {
      clearStoredOkxSession();
      setProofs(makeProofState());
      setParticipantId("");
      setActiveMission(null);
      setChatOpen(false);
      setChatInput("");
      setMessages([{ role: "assistant", content: initialAssistant[lang] }]);
      url.searchParams.delete("resetOkx");
      window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
    }

    let storedParticipantId = window.localStorage.getItem(participantStorageKey);
    if (!storedParticipantId) {
      storedParticipantId = makeParticipantId();
      window.localStorage.setItem(participantStorageKey, storedParticipantId);
    }

    setParticipantId(storedParticipantId);
    const storedClaims = readStoredClaims();
    setProofs((current) => {
      const next = { ...current };
      for (const mission of missions) {
        const claim = storedClaims[mission.id];
        if (claim?.claimId) {
          next[mission.id] = { ...next[mission.id], status: "ready", claim };
        }
      }
      return next;
    });
  }, []);

  useEffect(() => {
    setMessages([{ role: "assistant", content: initialAssistant[lang] }]);
  }, [lang]);

  useEffect(() => {
    const log = chatLogRef.current;
    if (!log) return;
    log.scrollTop = log.scrollHeight;
  }, [messages, chatBusy, chatOpen]);

  useEffect(() => {
    function protect() {
      document.documentElement.classList.add("okx-secure-blur");
      window.setTimeout(() => document.documentElement.classList.remove("okx-secure-blur"), 1400);
    }

    function protectKeys(event: KeyboardEvent) {
      const key = event.key.toLowerCase();
      if (
        key === "printscreen" ||
        (event.metaKey && event.shiftKey) ||
        (event.ctrlKey && key === "p")
      ) {
        protect();
      }
    }

    window.addEventListener("blur", protect);
    window.addEventListener("pagehide", protect);
    window.addEventListener("keydown", protectKeys);
    document.addEventListener("visibilitychange", protect);
    return () => {
      window.removeEventListener("blur", protect);
      window.removeEventListener("pagehide", protect);
      window.removeEventListener("keydown", protectKeys);
      document.removeEventListener("visibilitychange", protect);
    };
  }, []);

  useGSAP(
    () => {
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduceMotion) return;

      gsap.from(".okx-rise", { autoAlpha: 0, y: 18, stagger: 0.08, duration: 0.7, ease: "power3.out" });
      gsap.to(".okx-scanline", { yPercent: 105, repeat: -1, duration: 3.2, ease: "none" });
    },
    { scope: rootRef },
  );

  function updateProof(id: MissionId, patch: Partial<ProofState>) {
    setProofs((current) => ({ ...current, [id]: { ...current[id], ...patch } }));
  }

  async function handleProofFile(id: MissionId, event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const proofDataUrl = await prepareProofImage(file);
      updateProof(id, {
        proofName: file.name,
        proofDataUrl,
        error: "",
      });
    } catch (error) {
      updateProof(id, {
        error: error instanceof Error ? error.message : t.error,
      });
    }
  }

  async function generateClaim(mission: Mission) {
    const proof = proofs[mission.id];
    if (proof.claim) return;

    const hasProof = Boolean(proof.proofDataUrl);
    if (!hasProof) {
      updateProof(mission.id, { error: t.error });
      return;
    }

    updateProof(mission.id, { status: "submitting", error: "" });
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 90000);
    try {
      const currentParticipantId = ensureParticipantId(participantId);
      if (currentParticipantId !== participantId) setParticipantId(currentParticipantId);
      console.info("OKX claim upload starting", {
        missionId: mission.id,
        participantId: currentParticipantId,
        proofName: proof.proofName,
        proofBytes: proof.proofDataUrl.length,
      });
      const response = await fetch("/api/okx/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          lang,
          missionId: mission.id,
          participantId: currentParticipantId,
          proofName: proof.proofName,
          hasProofImage: Boolean(proof.proofDataUrl),
          proofImageDataUrl: proof.proofDataUrl,
        }),
      });
      const data = (await response.json().catch(() => ({}))) as Claim & { error?: string };
      if (!response.ok || !data.claimId) throw new Error(data.error || "Could not create QR");
      console.info("OKX claim upload complete", {
        missionId: mission.id,
        claimId: data.claimId,
        duplicate: Boolean(data.duplicate),
      });
      updateProof(mission.id, { status: "ready", claim: data, error: "" });
      writeStoredClaim(mission.id, data);
    } catch (error) {
      console.error("OKX claim upload failed", error);
      updateProof(mission.id, {
        status: "error",
        error:
          error instanceof DOMException && error.name === "AbortError"
            ? "La validacion tardo demasiado. Intenta otra vez o pide ayuda al staff OKX."
            : error instanceof Error
              ? error.message
              : t.error,
      });
    } finally {
      window.clearTimeout(timeout);
    }
  }

  async function askAssistant(event?: FormEvent<HTMLFormElement>, override?: string) {
    event?.preventDefault();
    const question = (override || chatInput).trim();
    if (!question || chatBusy) return;

    const nextMessages: ChatMessage[] = [...messages, { role: "user", content: question }];
    setMessages(nextMessages);
    setChatInput("");
    setChatBusy(true);

    try {
      const response = await fetch("/api/okx/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lang, messages: nextMessages }),
      });
      const data = (await response.json().catch(() => ({}))) as {
        message?: string;
        source?: string;
        model?: string;
        soulVersion?: string;
      };
      setMessages((current) => [
        ...current,
        { role: "assistant", content: data.message || t.fallback },
      ]);
      console.info("OKX Petra chat", {
        source: data.source,
        model: data.model,
        soulVersion: data.soulVersion,
        hasMessage: Boolean(data.message),
      });
    } catch {
      setMessages((current) => [...current, { role: "assistant", content: t.fallback }]);
    } finally {
      setChatBusy(false);
    }
  }

  return (
    <main ref={rootRef} className="okx-page">
      <div aria-hidden className="okx-bg">
        <div className="okx-grid" />
        <div className="okx-scanline" />
      </div>

      <header className="okx-topbar okx-rise">
        <Link href="/" aria-label="Go to AXIS home" className="okx-axis">
          <Image src="/logow.png" alt="" width={92} height={28} priority />
        </Link>
        <Image src="/okxproposal/okx-logo.svg" alt="OKX" width={96} height={29} priority />
        <div className="okx-lang-flags" aria-label={t.language}>
          {flags.map((item) => (
            <button
              key={item.lang}
              type="button"
              className={lang === item.lang ? "is-active" : ""}
              onClick={() => setLang(item.lang)}
              aria-label={item.label}
            >
              {item.flag}
            </button>
          ))}
        </div>
      </header>

      <section className="okx-hero">
        <div className="okx-hero-copy">
          <p className="okx-kicker okx-rise">{t.eyebrow}</p>
          <h1 className="okx-title okx-rise">{t.hero}</h1>
          <p className="okx-intro okx-rise">{t.intro}</p>
          <div className="okx-count okx-rise">
            <span>{t.count}</span>
            <strong>{completedCount}/3</strong>
          </div>
        </div>

        <div className="okx-model-shell okx-rise">
          <ModelViewer
            src="/logos/rsvp/okx.glb"
            iosSrc="/logos/rsvp/okx.usdz"
            alt="OKX 3D logo"
            autoReveal
            className="okx-model"
            arButtonLabel={t.arHint}
            arHintLabel={
              <>
                <FiCamera aria-hidden />
                {t.ar}
              </>
            }
          />
          <span className="okx-model-note">OKX</span>
        </div>
      </section>

      <section className="okx-section" aria-labelledby="missions-title">
        <div className="okx-section-head okx-rise">
          <p className="okx-kicker">{t.missions}</p>
          <h2 id="missions-title">{t.unlock}</h2>
        </div>

        <div className="okx-pass-strip okx-rise" aria-label={t.missions}>
          {missions.map((mission) => (
            <button
              key={mission.id}
              type="button"
              className={`okx-pass-token ${proofs[mission.id].claim ? "is-done" : ""}`}
              onClick={() => setActiveMission(mission.id)}
              aria-label={mission.visualTitle[lang]}
            >
              <Image src={mission.asset} alt="" width={96} height={96} />
              <span>{mission.title[lang]}</span>
              <b>{proofs[mission.id].claim ? t.ready : t.tapHere}</b>
            </button>
          ))}
        </div>
      </section>

      <section className="okx-clarity okx-rise">
        <FiShield aria-hidden />
        <p>{t.limit}</p>
      </section>

      {active ? (
        <MissionModal
          mission={active}
          lang={lang}
          t={t}
          proof={proofs[active.id]}
          onClose={() => setActiveMission(null)}
          onProofFile={handleProofFile}
          onUpdateProof={updateProof}
          onGenerate={generateClaim}
        />
      ) : null}

      <button type="button" className="okx-petra-bubble" onClick={() => setChatOpen(true)}>
        <FiMessageCircle aria-hidden />
        <span>AYUDA</span>
      </button>

      {chatOpen ? (
        <div className="okx-chat-modal" role="dialog" aria-modal="true" aria-labelledby="petra-title">
          <div className="okx-chat-panel">
            <button type="button" className="okx-close" onClick={() => setChatOpen(false)} aria-label={t.close}>
              <FiX aria-hidden />
            </button>
            <div className="okx-chat-head">
              <div>
                <p className="okx-kicker">AXIS / Hermes</p>
                <h2 id="petra-title">{t.chatTitle}</h2>
              </div>
              <FiMessageCircle aria-hidden />
            </div>
            <p className="okx-chat-intro">{t.chatSub}</p>

            <div ref={chatLogRef} className="okx-chat-log" role="log" aria-live="polite" aria-relevant="additions">
              {messages.map((message, index) => (
                <div key={`${message.role}-${index}`} className={`okx-bubble ${message.role}`}>
                  {message.role === "assistant" ? formatChatText(message.content) : message.content}
                </div>
              ))}
              {chatBusy ? (
                <div className="okx-bubble assistant">
                  <FiLoader aria-hidden className="okx-spin" /> Petra...
                </div>
              ) : null}
            </div>

            <div className="okx-quick">
              {t.quick.map((question) => (
                <button key={question} type="button" onClick={() => askAssistant(undefined, question)}>
                  {question}
                </button>
              ))}
            </div>

            <form className="okx-chat-form" onSubmit={askAssistant}>
              <input
                value={chatInput}
                onChange={(event) => setChatInput(event.target.value)}
                placeholder={t.input}
                aria-label={t.input}
              />
              <button type="submit" disabled={chatBusy || !chatInput.trim()}>
                {chatBusy ? <FiLoader aria-hidden className="okx-spin" /> : <FiHelpCircle aria-hidden />}
                <span>{t.ask}</span>
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </main>
  );
}

function MissionModal({
  mission,
  lang,
  t,
  proof,
  onClose,
  onProofFile,
  onUpdateProof,
  onGenerate,
}: {
  mission: Mission;
  lang: Lang;
  t: (typeof copy)[Lang];
  proof: ProofState;
  onClose: () => void;
  onProofFile: (id: MissionId, event: ChangeEvent<HTMLInputElement>) => void;
  onUpdateProof: (id: MissionId, patch: Partial<ProofState>) => void;
  onGenerate: (mission: Mission) => void;
}) {
  const [qrVisible, setQrVisible] = useState(false);
  const [activeGuide, setActiveGuide] = useState<UidGuideItem | null>(null);
  const busy = isSubmitting(proof);
  const redeemed = Boolean(proof.claim?.usedAt);
  const hideQr = () => {
    setQrVisible(false);
  };
  const showQr = () => {
    setQrVisible(true);
  };

  useEffect(() => {
    if (!proof.claim?.claimId || proof.claim.usedAt) return;
    let cancelled = false;

    async function refreshClaimStatus() {
      try {
        const response = await fetch(`/api/okx/claim/${encodeURIComponent(proof.claim!.claimId)}/status`, {
          cache: "no-store",
        });
        if (!cancelled && response.status === 404) {
          onUpdateProof(mission.id, { status: "idle", claim: null });
          removeStoredClaim(mission.id);
          hideQr();
          return;
        }
        const data = (await response.json().catch(() => ({}))) as { usedAt?: string | null };
        if (!cancelled && data.usedAt) {
          const nextClaim = { ...proof.claim!, usedAt: data.usedAt };
          onUpdateProof(mission.id, { claim: nextClaim });
          writeStoredClaim(mission.id, nextClaim);
          hideQr();
        }
      } catch {
        // The QR can still be redeemed through the scan route; status polling is best-effort UI sync.
      }
    }

    void refreshClaimStatus();
    const interval = window.setInterval(refreshClaimStatus, 2000);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [mission.id, onUpdateProof, proof.claim]);

  useEffect(() => {
    if (!qrVisible) return;

    function hideOnCaptureKey(event: KeyboardEvent) {
      const key = event.key.toLowerCase();
      if (
        key === "printscreen" ||
        (event.metaKey && event.shiftKey) ||
        (event.ctrlKey && key === "p") ||
        (event.ctrlKey && event.shiftKey)
      ) {
        hideQr();
      }
    }

    function hideOnPageSignal() {
      hideQr();
    }

    window.addEventListener("blur", hideOnPageSignal);
    window.addEventListener("pagehide", hideOnPageSignal);
    window.addEventListener("keydown", hideOnCaptureKey);
    document.addEventListener("visibilitychange", hideOnPageSignal);
    return () => {
      window.removeEventListener("blur", hideOnPageSignal);
      window.removeEventListener("pagehide", hideOnPageSignal);
      window.removeEventListener("keydown", hideOnCaptureKey);
      document.removeEventListener("visibilitychange", hideOnPageSignal);
    };
  }, [qrVisible]);

  return (
    <div className="okx-mission-modal" role="dialog" aria-modal="true" aria-labelledby="mission-modal-title">
      <div className="okx-mission-panel">
        <button type="button" className="okx-close" onClick={onClose} aria-label={t.close}>
          <FiX aria-hidden />
        </button>
        <div className="okx-modal-hero">
          <Image src={mission.asset} alt="" width={112} height={112} />
          <div>
            <p className="okx-kicker">{mission.title[lang]}</p>
            <h2 id="mission-modal-title">{mission.visualTitle[lang]}</h2>
            <p>{mission.action[lang]}</p>
          </div>
        </div>

        <ol className="okx-modal-steps">
          {mission.steps[lang].map((step, index) => (
            <Fragment key={`${mission.id}-${index}`}>
              <li>
                {mission.ctaUrl && index === 0 ? (
                  <a className="okx-step-link" href={mission.ctaUrl} target="_blank" rel="noopener noreferrer">
                    {step}
                  </a>
                ) : mission.uidDeeplink && index === 2 ? (
                  <a className="okx-step-link" href={mission.uidDeeplink}>
                    {step}
                  </a>
                ) : (
                  step
                )}
              </li>
              {mission.uidGuide && index === 2 ? (
                <li className="okx-uid-guide-row">
                  <div className="okx-uid-guide" aria-label={mission.steps[lang][2]}>
                    <div className="okx-uid-guide-scroller">
                      {mission.uidGuide.map((item, guideIndex) => (
                        <button
                          key={item.image}
                          type="button"
                          className={`okx-uid-guide-card ${item.featured ? "is-featured" : ""}`}
                          onClick={() => setActiveGuide(item)}
                          aria-label={`${guideStepLabel[lang]} ${guideIndex + 1}: ${item.title[lang]}`}
                        >
                          <img src={item.image} alt={item.alt[lang]} loading="lazy" />
                          <span>
                            <strong>
                              {guideStepLabel[lang]} {guideIndex + 1}
                            </strong>
                            {item.title[lang]}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </li>
              ) : null}
            </Fragment>
          ))}
        </ol>

        {mission.videoSrc ? (
          <div className="okx-mission-video">
            {mission.videoLabel ? <p>{mission.videoLabel[lang]}</p> : null}
            <video src={mission.videoSrc} controls playsInline preload="metadata" />
          </div>
        ) : null}

        <p className="okx-proof-intro">{mission.staff[lang]}</p>

        <label className="okx-upload">
          <FiUpload aria-hidden />
          <span>{proof.proofName || t.proof}</span>
          <input type="file" accept="image/*" onChange={(event) => onProofFile(mission.id, event)} />
        </label>
        <p className="okx-upload-hint">{t.proofHint}</p>

        {proof.proofDataUrl ? (
          <div className="okx-proof-preview">
            <Image src={proof.proofDataUrl} alt="" width={320} height={180} unoptimized />
          </div>
        ) : null}

        {proof.error ? <p className="okx-error">{proof.error}</p> : null}

        {proof.claim ? (
          <div className="okx-claim-card">
            <p className="okx-kicker">{t.ready}</p>
            {redeemed ? (
              <div className="okx-redeemed">
                <FiCheck aria-hidden />
                <span>Drink delivered</span>
              </div>
            ) : (
              <>
                <div className={`okx-qr-wrap ${qrVisible ? "is-visible" : ""}`}>
                  <img src={proof.claim.qrUrl} alt={t.ready} draggable={false} />
                  <div className="okx-qr-mask" aria-hidden={qrVisible}>
                    <span>{t.qrHidden}</span>
                  </div>
                </div>
                <button
                  type="button"
                  className="okx-qr-reveal"
                  onPointerDown={showQr}
                  onPointerUp={hideQr}
                  onPointerCancel={hideQr}
                  onPointerLeave={hideQr}
                  onBlur={hideQr}
                  onContextMenu={(event) => event.preventDefault()}
                >
                  {t.qrHold}
                </button>
              </>
            )}
            <code>{proof.claim.claimId}</code>
            {redeemed ? (
              <small>{proof.claim.usedAt ? new Date(proof.claim.usedAt).toLocaleTimeString() : ""}</small>
            ) : (
              <>
                <p>{t.showLive}</p>
                <small>{t.screenshot}</small>
              </>
            )}
          </div>
        ) : (
          <>
            {busy ? (
              <div className="okx-submit-progress" role="status" aria-live="polite">
                <span>
                  {lang === "es"
                    ? "Validando screenshot y enviando prueba a OKX..."
                    : "Validating screenshot and sending proof to OKX..."}
                </span>
                <div aria-hidden>
                  <i />
                </div>
              </div>
            ) : null}
            <button
              type="button"
              className="okx-primary"
              onClick={() => onGenerate(mission)}
              disabled={busy}
            >
              {busy ? <FiLoader aria-hidden className="okx-spin" /> : <FiCheck aria-hidden />}
              {busy ? t.generating : t.generate}
            </button>
          </>
        )}
      </div>

      {activeGuide ? (
        <button type="button" className="okx-guide-lightbox" onClick={() => setActiveGuide(null)} aria-label={t.close}>
          <img src={activeGuide.image} alt={activeGuide.alt[lang]} />
          <span>
            {activeGuide.title[lang]} <FiX aria-hidden />
          </span>
        </button>
      ) : null}
    </div>
  );
}
