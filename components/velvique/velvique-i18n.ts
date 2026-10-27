import type { SiteLanguage } from "@/components/site-language";

/* Guest-facing copy for the four site languages. Question, ingredient and
   garnish IDs come from the server catalog; their translations live here so
   the engine keeps one canonical (English) catalog. */

type Copy = {
  start: string;
  loading: string;
  introTitle: string;
  introBody: string;
  followTitle: string;
  followBody: string;
  openInstagram: string;
  continueIn: (n: number) => string;
  continue: string;
  alreadyFollow: string;
  progress: (done: number, total: number) => string;
  worldMeta: (n: number, total: number, dimension: string) => string;
  backToWorlds: string;
  questionMeta: (n: number, total: number) => string;
  stepInside: string;
  notAnswered: string;
  giveaway: string;
  nameTitle: string;
  nameBody: string;
  namePlaceholder: string;
  skipName: string;
  madeFor: (name: string) => string;
  savedDraw: string;
  viewFull: string;
  back: string;
  changeAnswer: string;
  choose: string;
  keepLooking: string;
  openingWorlds: string;
  exclusionsTitle: string;
  exclusionsBody: string;
  moreIngredients: string;
  createCard: string;
  backToWorldsShort: string;
  composingTitle: string;
  composingBody: string;
  dragHint: string;
  cardOf: (n: number) => string;
  yourRecipe: string;
  finishWith: (garnish: string) => string;
  keepTitle: string;
  keepBody: string;
  startJourney: string;
  startingJourney: string;
  savedTitle: string;
  savedBody: (last4: string) => string;
  signature: (hash: string) => string;
  tryAgain: string;
  errorQuestions: string;
  errorRecipe: string;
  errorPassBrowser: string;
  errorPassClosed: string;
  errorPassSave: string;
  card: {
    number: (n: number) => string;
    recipe: string;
    finishedWith: (garnish: string) => string;
    madeOnce: string;
    signature: string;
    madeFor: (name: string) => string;
  };
};

const en: Copy = {
  start: "Start",
  loading: "Loading",
  introTitle: "One shot, made only for you",
  introBody:
    "Answer five questions inside five small worlds. You get a one-of-a-kind trading card holding a 45 ml Velvique Añejo Cristalino recipe made for you alone, yours to keep and take home.",
  followTitle: "Follow Velvique first",
  followBody: "Open Velvique on Instagram, tap Follow, then come back here to begin.",
  openInstagram: "Open Instagram",
  continueIn: (n) => `Continue in ${n}`,
  continue: "Continue",
  alreadyFollow: "I already follow Velvique",
  progress: (done, total) => `${done} of ${total}`,
  worldMeta: (n, total, dimension) => `World ${n} of ${total}: ${dimension}`,
  backToWorlds: "Back to all worlds",
  questionMeta: (n, total) => `Question ${n} of ${total}`,
  stepInside: "Step inside",
  notAnswered: "Not answered yet",
  giveaway: "One guest wins a free bottle of Velvique tonight. Save your card at the end to enter.",
  nameTitle: "What name goes on your card?",
  nameBody: "It's printed on your trading card. You can leave it blank.",
  namePlaceholder: "Your name",
  skipName: "Skip",
  madeFor: (name) => `Made for ${name}`,
  savedDraw: "You're in tonight's draw for a free bottle of Velvique.",
  viewFull: "View full screen",
  back: "Back",
  changeAnswer: "Change answer",
  choose: "Choose",
  keepLooking: "Keep looking",
  openingWorlds: "Opening the worlds",
  exclusionsTitle: "Anything we should leave out?",
  exclusionsBody: "Only for allergies or things you don't drink. It won't change your profile.",
  moreIngredients: "More ingredients",
  createCard: "Create my card",
  backToWorldsShort: "Back to the worlds",
  composingTitle: "Composing your recipe",
  composingBody: "Picking a formula no one else will ever receive.",
  dragHint: "Drag to turn your card. Tap it to see the recipe.",
  cardOf: (n) => `Card ${n} of 100`,
  yourRecipe: "Your recipe",
  finishWith: (garnish) => `Finish it with ${garnish.toLowerCase()}.`,
  keepTitle: "Keep this card",
  keepBody:
    "Start your journey to save this trading card to a Velvique pass on your phone. It takes one tap with Face ID or your fingerprint, costs nothing, and enters you in tonight's draw for a free bottle.",
  startJourney: "Start the journey",
  startingJourney: "Starting your journey",
  savedTitle: "Your card is saved",
  savedBody: (last4) => `It's held in your Velvique pass ending in ${last4}. You can open it again from this page any time.`,
  signature: (hash) => `Recipe signature ${hash}. No other card carries it.`,
  tryAgain: "Try again",
  errorQuestions: "The questions didn't load. Check your connection, then try again.",
  errorRecipe: "Your card couldn't be created. Check your connection, then try again.",
  errorPassBrowser: "Passes can't be set up in this browser. Open this page in Safari or Chrome and try again.",
  errorPassClosed: "Setup was closed before it finished. Tap the button to try again.",
  errorPassSave: "Your card didn't save. Try again.",
  card: {
    number: (n) => `No. ${String(n).padStart(3, "0")} of 100`,
    recipe: "RECIPE",
    finishedWith: (garnish) => `Finished with ${garnish.toLowerCase()}`,
    madeOnce: "A 45 ml Velvique Añejo Cristalino recipe, made once",
    signature: "Signature",
    madeFor: (name) => `Made for ${name}`,
  },
};

const es: Copy = {
  start: "Comenzar",
  loading: "Cargando",
  introTitle: "Un shot hecho solo para ti",
  introBody:
    "Responde cinco preguntas dentro de cinco pequeños mundos. Recibes una carta coleccionable única con una receta de 45 ml de Velvique Añejo Cristalino hecha solo para ti, para quedártela y llevarla a casa.",
  followTitle: "Primero sigue a Velvique",
  followBody: "Abre Velvique en Instagram, toca Seguir y vuelve aquí para empezar.",
  openInstagram: "Abrir Instagram",
  continueIn: (n) => `Continuar en ${n}`,
  continue: "Continuar",
  alreadyFollow: "Ya sigo a Velvique",
  progress: (done, total) => `${done} de ${total}`,
  worldMeta: (n, total, dimension) => `Mundo ${n} de ${total}: ${dimension}`,
  backToWorlds: "Volver a todos los mundos",
  questionMeta: (n, total) => `Pregunta ${n} de ${total}`,
  stepInside: "Entrar",
  notAnswered: "Sin responder",
  giveaway: "Esta noche un invitado gana una botella de Velvique. Guarda tu carta al final para participar.",
  nameTitle: "¿Qué nombre va en tu carta?",
  nameBody: "Se imprime en tu carta coleccionable. Puedes dejarlo en blanco.",
  namePlaceholder: "Tu nombre",
  skipName: "Omitir",
  madeFor: (name) => `Hecha para ${name}`,
  savedDraw: "Ya participas en el sorteo de una botella de Velvique esta noche.",
  viewFull: "Ver en pantalla completa",
  back: "Volver",
  changeAnswer: "Cambiar respuesta",
  choose: "Elegir",
  keepLooking: "Seguir viendo",
  openingWorlds: "Abriendo los mundos",
  exclusionsTitle: "¿Algo que debamos dejar fuera?",
  exclusionsBody: "Solo para alergias o cosas que no tomas. No cambia tu perfil.",
  moreIngredients: "Más ingredientes",
  createCard: "Crear mi carta",
  backToWorldsShort: "Volver a los mundos",
  composingTitle: "Componiendo tu receta",
  composingBody: "Eligiendo una fórmula que nadie más recibirá.",
  dragHint: "Arrastra para girar tu carta. Tócala para ver la receta.",
  cardOf: (n) => `Carta ${n} de 100`,
  yourRecipe: "Tu receta",
  finishWith: (garnish) => `Termínala con ${garnish.toLowerCase()}.`,
  keepTitle: "Guarda esta carta",
  keepBody:
    "Empieza tu viaje para guardar esta carta coleccionable en un pase Velvique en tu teléfono. Es un solo toque con Face ID o tu huella, no cuesta nada y te inscribe en el sorteo de una botella esta noche.",
  startJourney: "Empezar el viaje",
  startingJourney: "Empezando tu viaje",
  savedTitle: "Tu carta está guardada",
  savedBody: (last4) => `Está en tu pase Velvique que termina en ${last4}. Puedes volver a abrirla desde esta página cuando quieras.`,
  signature: (hash) => `Firma de receta ${hash}. Ninguna otra carta la tiene.`,
  tryAgain: "Intentar de nuevo",
  errorQuestions: "Las preguntas no cargaron. Revisa tu conexión e intenta de nuevo.",
  errorRecipe: "No se pudo crear tu carta. Revisa tu conexión e intenta de nuevo.",
  errorPassBrowser: "Este navegador no permite crear el pase. Abre esta página en Safari o Chrome e intenta de nuevo.",
  errorPassClosed: "La configuración se cerró antes de terminar. Toca el botón para intentar de nuevo.",
  errorPassSave: "Tu carta no se guardó. Intenta de nuevo.",
  card: {
    number: (n) => `No. ${String(n).padStart(3, "0")} de 100`,
    recipe: "RECETA",
    finishedWith: (garnish) => `Terminada con ${garnish.toLowerCase()}`,
    madeOnce: "Una receta de 45 ml de Velvique Añejo Cristalino, hecha una sola vez",
    signature: "Firma",
    madeFor: (name) => `Hecha para ${name}`,
  },
};

const zh: Copy = {
  start: "开始",
  loading: "加载中",
  introTitle: "一杯，只为你调制",
  introBody:
    "在五个小世界里回答五个问题。你将获得一张独一无二的收藏卡，上面是专为你定制的 45 毫升 Velvique Añejo Cristalino 配方，可以留存并带回家。",
  followTitle: "先关注 Velvique",
  followBody: "在 Instagram 打开 Velvique，点击「关注」，然后回到这里开始。",
  openInstagram: "打开 Instagram",
  continueIn: (n) => `${n} 秒后继续`,
  continue: "继续",
  alreadyFollow: "我已关注 Velvique",
  progress: (done, total) => `${done} / ${total}`,
  worldMeta: (n, total, dimension) => `第 ${n} 个世界（共 ${total} 个）：${dimension}`,
  backToWorlds: "返回所有世界",
  questionMeta: (n, total) => `第 ${n} 题，共 ${total} 题`,
  stepInside: "进入",
  notAnswered: "尚未回答",
  giveaway: "今晚将有一位来宾获得一瓶免费的 Velvique。最后保存你的卡片即可参与。",
  nameTitle: "卡片上写什么名字？",
  nameBody: "它会印在你的收藏卡上，也可以留空。",
  namePlaceholder: "你的名字",
  skipName: "跳过",
  madeFor: (name) => `为${name}定制`,
  savedDraw: "你已参加今晚的 Velvique 整瓶抽奖。",
  viewFull: "全屏查看",
  back: "返回",
  changeAnswer: "修改答案",
  choose: "选择",
  keepLooking: "再看看",
  openingWorlds: "正在打开世界",
  exclusionsTitle: "有什么需要避开的吗？",
  exclusionsBody: "仅用于过敏或你不喝的东西，不会改变你的个人画像。",
  moreIngredients: "更多原料",
  createCard: "生成我的卡片",
  backToWorldsShort: "返回世界",
  composingTitle: "正在调配你的配方",
  composingBody: "正在挑选一个不会给任何其他人的配方。",
  dragHint: "拖动旋转卡片，轻点查看配方。",
  cardOf: (n) => `第 ${n} 张，共 100 张`,
  yourRecipe: "你的配方",
  finishWith: (garnish) => `最后加上${garnish}。`,
  keepTitle: "保存这张卡片",
  keepBody: "开启旅程，把这张收藏卡保存到手机上的 Velvique 通行证。只需用面容 ID 或指纹轻点一次，完全免费，并自动参加今晚的整瓶抽奖。",
  startJourney: "开启旅程",
  startingJourney: "正在开启旅程",
  savedTitle: "卡片已保存",
  savedBody: (last4) => `它保存在尾号为 ${last4} 的 Velvique 通行证中，你可以随时从这个页面再次打开。`,
  signature: (hash) => `配方签名 ${hash}。没有其他卡片拥有它。`,
  tryAgain: "重试",
  errorQuestions: "问题没有加载出来。请检查网络后重试。",
  errorRecipe: "无法生成你的卡片。请检查网络后重试。",
  errorPassBrowser: "此浏览器无法创建通行证。请在 Safari 或 Chrome 中打开此页面后重试。",
  errorPassClosed: "设置在完成前被关闭了。轻点按钮重试。",
  errorPassSave: "卡片没有保存成功，请重试。",
  card: {
    number: (n) => `No. ${String(n).padStart(3, "0")} / 100`,
    recipe: "配方",
    finishedWith: (garnish) => `搭配${garnish}`,
    madeOnce: "45 毫升 Velvique Añejo Cristalino 配方，仅此一份",
    signature: "签名",
    madeFor: (name) => `为${name}定制`,
  },
};

const zhHant: Copy = {
  start: "開始",
  loading: "載入中",
  introTitle: "一杯，只為你調製",
  introBody:
    "在五個小世界裡回答五個問題。你將獲得一張獨一無二的收藏卡，上面是專為你訂製的 45 毫升 Velvique Añejo Cristalino 配方，可以留存並帶回家。",
  followTitle: "先追蹤 Velvique",
  followBody: "在 Instagram 打開 Velvique，點擊「追蹤」，然後回到這裡開始。",
  openInstagram: "打開 Instagram",
  continueIn: (n) => `${n} 秒後繼續`,
  continue: "繼續",
  alreadyFollow: "我已追蹤 Velvique",
  progress: (done, total) => `${done} / ${total}`,
  worldMeta: (n, total, dimension) => `第 ${n} 個世界（共 ${total} 個）：${dimension}`,
  backToWorlds: "返回所有世界",
  questionMeta: (n, total) => `第 ${n} 題，共 ${total} 題`,
  stepInside: "進入",
  notAnswered: "尚未回答",
  giveaway: "今晚將有一位來賓獲得一瓶免費的 Velvique。最後保存你的卡片即可參加。",
  nameTitle: "卡片上要寫什麼名字？",
  nameBody: "它會印在你的收藏卡上，也可以留空。",
  namePlaceholder: "你的名字",
  skipName: "跳過",
  madeFor: (name) => `為${name}訂製`,
  savedDraw: "你已參加今晚的 Velvique 整瓶抽獎。",
  viewFull: "全螢幕查看",
  back: "返回",
  changeAnswer: "修改答案",
  choose: "選擇",
  keepLooking: "再看看",
  openingWorlds: "正在開啟世界",
  exclusionsTitle: "有什麼需要避開的嗎？",
  exclusionsBody: "僅用於過敏或你不喝的東西，不會改變你的個人檔案。",
  moreIngredients: "更多原料",
  createCard: "生成我的卡片",
  backToWorldsShort: "返回世界",
  composingTitle: "正在調配你的配方",
  composingBody: "正在挑選一個不會給任何其他人的配方。",
  dragHint: "拖動旋轉卡片，輕點查看配方。",
  cardOf: (n) => `第 ${n} 張，共 100 張`,
  yourRecipe: "你的配方",
  finishWith: (garnish) => `最後加上${garnish}。`,
  keepTitle: "保存這張卡片",
  keepBody: "開啟旅程，把這張收藏卡保存到手機上的 Velvique 通行證。只需用 Face ID 或指紋輕點一次，完全免費，並自動參加今晚的整瓶抽獎。",
  startJourney: "開啟旅程",
  startingJourney: "正在開啟旅程",
  savedTitle: "卡片已保存",
  savedBody: (last4) => `它保存在尾號為 ${last4} 的 Velvique 通行證中，你可以隨時從這個頁面再次開啟。`,
  signature: (hash) => `配方簽名 ${hash}。沒有其他卡片擁有它。`,
  tryAgain: "重試",
  errorQuestions: "問題沒有載入。請檢查網路後重試。",
  errorRecipe: "無法生成你的卡片。請檢查網路後重試。",
  errorPassBrowser: "此瀏覽器無法建立通行證。請在 Safari 或 Chrome 中打開此頁面後重試。",
  errorPassClosed: "設定在完成前被關閉了。輕點按鈕重試。",
  errorPassSave: "卡片沒有保存成功，請重試。",
  card: {
    number: (n) => `No. ${String(n).padStart(3, "0")} / 100`,
    recipe: "配方",
    finishedWith: (garnish) => `搭配${garnish}`,
    madeOnce: "45 毫升 Velvique Añejo Cristalino 配方，僅此一份",
    signature: "簽名",
    madeFor: (name) => `為${name}訂製`,
  },
};

export const VELVIQUE_COPY: Record<SiteLanguage, Copy> = { en, es, zh, "zh-Hant": zhHant };

type QuestionText = { dimension: string; prompt: string; options: Record<string, [label: string, detail: string]> };

const QUESTION_TEXT: Record<Exclude<SiteLanguage, "en">, Record<string, QuestionText>> = {
  es: {
    q1: {
      dimension: "Personalidad",
      prompt: "¿Cómo describirías tu personalidad?",
      options: {
        A: ["Magnetismo", "Expresiva, sorprendente, atraída por el contraste."],
        B: ["Misterio", "En capas, terrosa, intensa en silencio."],
        C: ["Audacia", "Afilada, aventurera, de combinaciones poco comunes."],
        D: ["Serenidad", "Mínima, floral, herbal, equilibrada."],
      },
    },
    q2: {
      dimension: "Lo desconocido",
      prompt: "¿Qué te atrae de lo desconocido?",
      options: {
        A: ["Descubrimiento", "Caminos nuevos, aromas frescos, la primera vez."],
        B: ["Intensidad", "La adrenalina, el límite, la atracción fuerte."],
        C: ["Complejidad", "Muchas capas, reveladas poco a poco."],
        D: ["Emoción", "Lo que te hace sentir, más que lo que es."],
      },
    },
    q3: {
      dimension: "Atmósfera",
      prompt: "¿Qué atmósfera se parece más a ti?",
      options: {
        A: ["Después de la lluvia", "Verde, fresca, aire limpio."],
        B: ["Medianoche", "Oscura, profunda, tostada."],
        C: ["Hora dorada", "Luz cálida, fruta tropical madura."],
        D: ["Ciudad eléctrica", "Contraste neón, afilado y brillante."],
      },
    },
    q4: {
      dimension: "Expresión",
      prompt: "¿Cómo te expresas?",
      options: {
        A: ["Sutileza y precisión", "Detalles silenciosos, nada fuera de lugar."],
        B: ["Fuerza y claridad", "Claro, fuerte, inconfundible."],
        C: ["Lo inesperado", "El giro que nadie vio venir."],
        D: ["Por capas", "Una cosa, luego otra, y otra más."],
      },
    },
    q5: {
      dimension: "Sensación",
      prompt: "¿Qué sensación prefieres vivir?",
      options: {
        A: ["Refrescante", "Brillante, fresca, final limpio."],
        B: ["Cálida", "Especia, tostado, un brillo largo."],
        C: ["Intrigante", "Floral, terrosa, un toque de sal."],
        D: ["Intensa", "Toda la fuerza, bordes afilados."],
      },
    },
  },
  zh: {
    q1: {
      dimension: "个性",
      prompt: "你会如何形容自己的个性？",
      options: {
        A: ["魅力", "富有表现力，出人意料，喜欢反差。"],
        B: ["神秘", "层次丰富，质朴，内敛而强烈。"],
        C: ["无畏", "犀利，爱冒险，偏爱少见的组合。"],
        D: ["宁静", "简约，花香，草本，平衡。"],
      },
    },
    q2: {
      dimension: "未知",
      prompt: "未知的什么最吸引你？",
      options: {
        A: ["发现", "新的道路，新鲜的香气，第一次。"],
        B: ["强烈", "刺激，边缘，强大的吸引力。"],
        C: ["复杂", "层层叠叠，慢慢揭开。"],
        D: ["情感", "它带给你的感受，胜过它是什么。"],
      },
    },
    q3: {
      dimension: "氛围",
      prompt: "哪种氛围最像你？",
      options: {
        A: ["雨后", "青绿，清凉，空气清新。"],
        B: ["午夜", "幽暗，深沉，烘焙感。"],
        C: ["黄金时刻", "温暖的光，成熟的热带水果。"],
        D: ["电光城市", "霓虹般的反差，锐利而明亮。"],
      },
    },
    q4: {
      dimension: "表达",
      prompt: "你如何表达自己？",
      options: {
        A: ["含蓄而精准", "安静的细节，一丝不苟。"],
        B: ["大胆而直接", "清晰，有力，不会认错。"],
        C: ["出人意料", "没人预料到的转折。"],
        D: ["层次分明", "一层接一层，再一层。"],
      },
    },
    q5: {
      dimension: "感受",
      prompt: "你更想体验哪种感受？",
      options: {
        A: ["清爽", "明亮，清凉，干净的收尾。"],
        B: ["温暖", "香料，烘焙，悠长的余温。"],
        C: ["耐人寻味", "花香，泥土气息，一丝咸味。"],
        D: ["浓烈", "全力以赴，锋芒毕露。"],
      },
    },
  },
  "zh-Hant": {
    q1: {
      dimension: "個性",
      prompt: "你會如何形容自己的個性？",
      options: {
        A: ["魅力", "富有表現力，出人意料，喜歡反差。"],
        B: ["神秘", "層次豐富，質樸，內斂而強烈。"],
        C: ["無畏", "犀利，愛冒險，偏愛少見的組合。"],
        D: ["寧靜", "簡約，花香，草本，平衡。"],
      },
    },
    q2: {
      dimension: "未知",
      prompt: "未知的什麼最吸引你？",
      options: {
        A: ["發現", "新的道路，新鮮的香氣，第一次。"],
        B: ["強烈", "刺激，邊緣，強大的吸引力。"],
        C: ["複雜", "層層疊疊，慢慢揭開。"],
        D: ["情感", "它帶給你的感受，勝過它是什麼。"],
      },
    },
    q3: {
      dimension: "氛圍",
      prompt: "哪種氛圍最像你？",
      options: {
        A: ["雨後", "青綠，清涼，空氣清新。"],
        B: ["午夜", "幽暗，深沉，烘焙感。"],
        C: ["黃金時刻", "溫暖的光，成熟的熱帶水果。"],
        D: ["電光城市", "霓虹般的反差，銳利而明亮。"],
      },
    },
    q4: {
      dimension: "表達",
      prompt: "你如何表達自己？",
      options: {
        A: ["含蓄而精準", "安靜的細節，一絲不苟。"],
        B: ["大膽而直接", "清晰，有力，不會認錯。"],
        C: ["出人意料", "沒人預料到的轉折。"],
        D: ["層次分明", "一層接一層，再一層。"],
      },
    },
    q5: {
      dimension: "感受",
      prompt: "你更想體驗哪種感受？",
      options: {
        A: ["清爽", "明亮，清涼，乾淨的收尾。"],
        B: ["溫暖", "香料，烘焙，悠長的餘溫。"],
        C: ["耐人尋味", "花香，泥土氣息，一絲鹹味。"],
        D: ["濃烈", "全力以赴，鋒芒畢露。"],
      },
    },
  },
};

/* Ingredient and garnish IDs, plus the allergen exclusion tags. */
const NAMES: Record<Exclude<SiteLanguage, "en">, Record<string, string>> = {
  es: {
    F01: "Cordial clarificado de guayaba rosa",
    F02: "Cordial de piña asada",
    F03: "Cordial de tamarindo",
    F04: "Cordial de jamaica",
    B01: "Cordial de pepino y shiso",
    B02: "Infusión de hoja santa",
    B03: "Cordial de té limón y jengibre",
    E01: "Infusión de maíz azul tostado",
    E02: "Infusión de cascarilla de cacao",
    M01: "Jarabe de agave diluido",
    M02: "Mezcla estandarizada ácido-salina",
    G01: "Guayaba deshidratada",
    G02: "Crujiente de maíz azul",
    G03: "Cristal de jamaica",
    G04: "Lasca de cacao",
    G05: "Piña deshidratada",
    G06: "Hoja santa de grado alimenticio",
    G07: "Gel de tamarindo",
    G08: "Trozo de jengibre confitado",
    corn: "Maíz",
    cacao: "Cacao",
    ginger: "Jengibre",
  },
  zh: {
    F01: "澄清粉红番石榴糖浆",
    F02: "烤菠萝糖浆",
    F03: "罗望子糖浆",
    F04: "洛神花糖浆",
    B01: "黄瓜紫苏糖浆",
    B02: "墨西哥圣叶浸液",
    B03: "香茅姜糖浆",
    E01: "烤蓝玉米浸液",
    E02: "可可壳浸液",
    M01: "稀释龙舌兰糖浆",
    M02: "标准酸咸调和液",
    G01: "番石榴干",
    G02: "蓝玉米脆片",
    G03: "洛神花晶片",
    G04: "可可碎片",
    G05: "菠萝干",
    G06: "食用级墨西哥圣叶",
    G07: "罗望子凝胶",
    G08: "糖渍姜片",
    corn: "玉米",
    cacao: "可可",
    ginger: "姜",
  },
  "zh-Hant": {
    F01: "澄清粉紅番石榴糖漿",
    F02: "烤鳳梨糖漿",
    F03: "羅望子糖漿",
    F04: "洛神花糖漿",
    B01: "黃瓜紫蘇糖漿",
    B02: "墨西哥聖葉浸液",
    B03: "香茅薑糖漿",
    E01: "烤藍玉米浸液",
    E02: "可可殼浸液",
    M01: "稀釋龍舌蘭糖漿",
    M02: "標準酸鹹調和液",
    G01: "番石榴乾",
    G02: "藍玉米脆片",
    G03: "洛神花晶片",
    G04: "可可碎片",
    G05: "鳳梨乾",
    G06: "食用級墨西哥聖葉",
    G07: "羅望子凝膠",
    G08: "糖漬薑片",
    corn: "玉米",
    cacao: "可可",
    ginger: "薑",
  },
};

export function localName(language: SiteLanguage, id: string, fallback: string) {
  return language === "en" ? fallback : NAMES[language][id] ?? fallback;
}

export function localizeQuestions<Q extends { id: string; dimension: string; prompt: string; options: Array<{ id: string; label: string; detail: string }> }>(
  questions: Q[],
  language: SiteLanguage,
): Q[] {
  if (language === "en") return questions;
  return questions.map((question) => {
    const text = QUESTION_TEXT[language][question.id];
    if (!text) return question;
    return {
      ...question,
      dimension: text.dimension,
      prompt: text.prompt,
      options: question.options.map((option) => {
        const [label, detail] = text.options[option.id] ?? [option.label, option.detail];
        return { ...option, label, detail };
      }),
    };
  });
}
