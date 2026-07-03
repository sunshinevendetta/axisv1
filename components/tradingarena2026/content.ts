import type { SiteLanguage } from "@/components/site-language";

/* Trading Arena 2026 deck copy, ported from public/tradingarena/arena-i18n.js.
   Pure data: copy changes never touch animation code. Default language: es. */

type Entry = Record<SiteLanguage, string>;

export const ARENA_I18N = {
  "kicker.01": { es: "Propuesta", en: "Proposal", zh: "提案", "zh-Hant": "提案" },
  "kicker.02": { es: "Concepto", en: "Concept", zh: "理念", "zh-Hant": "理念" },
  "kicker.03": { es: "Formato", en: "Format", zh: "赛制", "zh-Hant": "賽制" },
  "kicker.04": { es: "Agenda", en: "Agenda", zh: "议程", "zh-Hant": "議程" },
  "kicker.05": { es: "Sede", en: "Venue", zh: "场地", "zh-Hant": "場地" },
  "kicker.06": { es: "Cotizacion solicitada", en: "Quote requested", zh: "所需报价", "zh-Hant": "所需報價" },
  "kicker.07": { es: "System design", en: "System design", zh: "系统设计", "zh-Hant": "系統設計" },
  "kicker.08": { es: "Cierre", en: "Close", zh: "结语", "zh-Hant": "結語" },

  "s1.h1": { es: "Trading Arena", en: "Trading Arena", zh: "Trading Arena", "zh-Hant": "Trading Arena" },
  "s1.lead": {
    es: "El torneo de trading más intenso jamás realizado en LATAM.",
    en: "The most intense trading tournament ever held in LATAM.",
    zh: "拉丁美洲有史以来最激烈的交易锦标赛。",
    "zh-Hant": "拉丁美洲有史以來最激烈的交易錦標賽。",
  },
  "s1.p1.strong": { es: "Dos categorías:", en: "Two categories:", zh: "两大类别：", "zh-Hant": "兩大類別：" },
  "s1.p1.rest": {
    es: " Human Traders y AI Agents.",
    en: " Human Traders and AI Agents.",
    zh: " 人类交易员与 AI 智能体。",
    "zh-Hant": " 人類交易員與 AI 智能體。",
  },
  "s1.p2.strong": { es: "Objetivo:", en: "Goal:", zh: "目标：", "zh-Hant": "目標：" },
  "s1.p2.rest": {
    es: " transformar un venue aliado en el punto de encuentro donde trading, tecnología, competencia, cultura y comunidad convergen en una experiencia en vivo.",
    en: " turn a partner venue into the meeting point where trading, technology, competition, culture and community converge into a live experience.",
    zh: " 将合作场地打造成交易、科技、竞技、文化与社群交汇的现场舞台。",
    "zh-Hant": " 將合作場地打造成交易、科技、競技、文化與社群交匯的現場舞台。",
  },

  "s2.h2": { es: "Concepto", en: "Concept", zh: "理念", "zh-Hant": "理念" },
  "s2.lead": {
    es: "Trading Arena es una competencia de trading en vivo donde solo importa una cosa: El mayor profit gana.",
    en: "Trading Arena is a live trading competition where only one thing matters: the biggest profit wins.",
    zh: "Trading Arena 是一场现场交易竞赛，只看一件事：利润最高者胜出。",
    "zh-Hant": "Trading Arena 是一場現場交易競賽，只看一件事：利潤最高者勝出。",
  },
  "s2.p1": {
    es: "Todos compiten bajo las mismas reglas, el mismo mercado y el mismo límite de tiempo.",
    en: "Everyone competes under the same rules, the same market and the same time limit.",
    zh: "所有人在相同规则、相同市场与相同时限下同场竞技。",
    "zh-Hant": "所有人在相同規則、相同市場與相同時限下同場競技。",
  },
  "s2.p2": {
    es: "Durante cuatro horas, el venue se transforma en una arena donde 250 traders, builders, AI agents y espectadores siguen cada operación en pantallas gigantes, leaderboards en vivo y un sistema clasificatorio de eliminación directa por liquidación.",
    en: "For four hours, the venue becomes an arena where 250 traders, builders, AI agents and spectators follow every trade on giant screens, live leaderboards and a knockout ranking system driven by liquidation.",
    zh: "在四小时里，合作场地化身竞技场：250 名交易员、开发者、AI 智能体与观众通过巨型屏幕、实时排行榜以及以爆仓淘汰为核心的晋级系统紧盯每一笔交易。",
    "zh-Hant": "在四小時裡，合作場地化身競技場：250 名交易員、開發者、AI 智能體與觀眾透過巨型螢幕、即時排行榜以及以爆倉淘汰為核心的晉級系統緊盯每一筆交易。",
  },
  "s2.kpi1": { es: "asistentes objetivo", en: "target attendees", zh: "目标到场人数", "zh-Hant": "目標到場人數" },
  "s2.kpi2": { es: "horario torneo", en: "tournament hours", zh: "赛事时段", "zh-Hant": "賽事時段" },
  "s2.kpi3": { es: "categorias", en: "categories", zh: "类别", "zh-Hant": "類別" },
  "s2.kpi4": { es: "after-party", en: "after-party", zh: "余兴派对", "zh-Hant": "餘興派對" },

  "s3.h2": { es: "Dos categorias", en: "Two categories", zh: "两大类别", "zh-Hant": "兩大類別" },
  "s3.p": {
    es: "Al registrarse, cada participante elige su categoria. La experiencia debe poder correr con cuentas demo, sandbox o reglas controladas por la organizacion.",
    en: "On registration, each participant picks their category. The experience must be able to run on demo accounts, sandbox or organizer-controlled rules.",
    zh: "报名时，每位参赛者选择所属类别。整场活动可在模拟账户、沙盒或由主办方设定的规则下运行。",
    "zh-Hant": "報名時，每位參賽者選擇所屬類別。整場活動可在模擬帳戶、沙盒或由主辦方設定的規則下運行。",
  },
  "s3.card1.b": { es: "Traders humanos", en: "Human traders", zh: "人类交易员", "zh-Hant": "人類交易員" },
  "s3.card1.s": {
    es: "Personas compiten con una estrategia manual durante ventanas cortas y leaderboard en vivo.",
    en: "People compete with a manual strategy across short windows and a live leaderboard.",
    zh: "选手以手动策略在多个短时窗口内竞技，并有实时排行榜。",
    "zh-Hant": "選手以手動策略在多個短時窗口內競技，並有即時排行榜。",
  },
  "s3.card2.b": { es: "AI Agents", en: "AI Agents", zh: "AI 智能体", "zh-Hant": "AI 智能體" },
  "s3.card2.s": {
    es: "Participantes presentan o ejecutan agentes, modelos o senales automatizadas bajo reglas claras.",
    en: "Participants present or run agents, models or automated signals under clear rules.",
    zh: "参赛者在明确规则下展示或运行智能体、模型或自动化信号。",
    "zh-Hant": "參賽者在明確規則下展示或運行智能體、模型或自動化訊號。",
  },
  "s3.card3.b": { es: "Final showcase", en: "Final showcase", zh: "决赛展示", "zh-Hant": "決賽展示" },
  "s3.card3.s": {
    es: "Ganadores de cada categoria se presentan en pantalla para cierre, premios y contenido.",
    en: "Winners of each category appear on screen for the finale, prizes and content.",
    zh: "各类别优胜者登上大屏，进行收官、颁奖与内容展示。",
    "zh-Hant": "各類別優勝者登上大螢幕，進行收官、頒獎與內容展示。",
  },

  "s4.h2": { es: "Agenda", en: "Agenda", zh: "议程", "zh-Hant": "議程" },
  "s4.r1.b": { es: "Registro + bienvenida", en: "Registration + welcome", zh: "签到 + 欢迎", "zh-Hant": "簽到 + 歡迎" },
  "s4.r1.s": {
    es: "Check-in, seleccion de categoria, bebidas y comida ligera desde apertura.",
    en: "Check-in, category selection, drinks and light food from opening.",
    zh: "签到、选择类别，开场即供应饮品与轻食。",
    "zh-Hant": "簽到、選擇類別，開場即供應飲品與輕食。",
  },
  "s4.r2.b": { es: "Brief de reglas", en: "Rules brief", zh: "规则说明", "zh-Hant": "規則說明" },
  "s4.r2.s": {
    es: "Formato, limites, herramientas permitidas, leaderboard y criterios de premio.",
    en: "Format, limits, allowed tools, leaderboard and prize criteria.",
    zh: "赛制、限制、允许工具、排行榜与评奖标准。",
    "zh-Hant": "賽制、限制、允許工具、排行榜與評獎標準。",
  },
  "s4.r3.b": { es: "Inicio del torneo", en: "Tournament start", zh: "赛事开始", "zh-Hant": "賽事開始" },
  "s4.r3.s": {
    es: "Human traders y AI trading corren en paralelo con pantallas y staff de apoyo.",
    en: "Human traders and AI trading run in parallel with screens and support staff.",
    zh: "人类交易与 AI 交易并行进行，配备屏幕与支持人员。",
    "zh-Hant": "人類交易與 AI 交易並行進行，配備螢幕與支援人員。",
  },
  "s4.r4.b": { es: "Awards + premiacion", en: "Awards + prizes", zh: "颁奖典礼", "zh-Hant": "頒獎典禮" },
  "s4.r4.s": {
    es: "Cierre de leaderboard, fotos, entrevistas cortas y menciones de marcas.",
    en: "Leaderboard close, photos, short interviews and brand mentions.",
    zh: "排行榜封榜、拍照、简短采访与品牌鸣谢。",
    "zh-Hant": "排行榜封榜、拍照、簡短採訪與品牌鳴謝。",
  },
  "s4.r5.b": { es: "Transicion a After Party", en: "Transition to After Party", zh: "过渡至余兴派对", "zh-Hant": "過渡至餘興派對" },
  "s4.r5.s": {
    es: "Los asistentes pueden quedarse en areas de networking mientras el DJ inicia abajo para comenzar el after party y permitir el acceso al publico general.",
    en: "Guests can stay in networking areas while the DJ starts downstairs to kick off the after party and open access to the general public.",
    zh: "来宾可在交流区继续社交，同时 DJ 在楼下开场，启动余兴派对并向公众开放。",
    "zh-Hant": "來賓可在交流區繼續社交，同時 DJ 在樓下開場，啟動餘興派對並向公眾開放。",
  },
  "s4.r6.b": { es: "Afterparty", en: "Afterparty", zh: "余兴派对", "zh-Hant": "餘興派對" },
  "s4.r6.s": {
    es: "Acceso a publico general y comunidad del venue junto a los asistentes que han decidido quedarse a disfrutar el cierre.",
    en: "Open to the general public and the venue community alongside attendees who chose to stay for the closing.",
    zh: "向公众及场地社群开放，与选择留下享受收官的与会者同乐。",
    "zh-Hant": "向公眾及場地社群開放，與選擇留下享受收官的與會者同樂。",
  },

  "s5.h2": {
    es: "Sede, servicio y posibilidad de noche",
    en: "Venue, service and night option",
    zh: "场地、服务与夜间延展",
    "zh-Hant": "場地、服務與夜間延展",
  },
  "s5.f1.b": { es: "Main room", en: "Main room", zh: "主厅", "zh-Hant": "主廳" },
  "s5.f1.s": {
    es: "Talks, demos, pantallas y momentos de presentacion durante todo el evento.",
    en: "Talks, demos, screens and presentation moments throughout the event.",
    zh: "全程提供演讲、演示、屏幕与展示环节。",
    "zh-Hant": "全程提供演講、演示、螢幕與展示環節。",
  },
  "s5.f2.b": { es: "Operaciones", en: "Operations", zh: "运营", "zh-Hant": "營運" },
  "s5.f2.s": {
    es: "Bar, staff, acceso, seguridad y coordinacion con produccion.",
    en: "Bar, staff, access, security and coordination with production.",
    zh: "酒吧、人员、进出、安保及与制作团队协调。",
    "zh-Hant": "酒吧、人員、進出、安保及與製作團隊協調。",
  },
  "s5.f3.b": { es: "Bebidas", en: "Drinks", zh: "饮品", "zh-Hant": "飲品" },
  "s5.f3.s": {
    es: "Paquete incluido o permiso para que marcas patrocinadoras cubran drinks.",
    en: "Included package or clearance for sponsor brands to cover drinks.",
    zh: "含套餐，或授权赞助品牌承担饮品。",
    "zh-Hant": "含套餐，或授權贊助品牌承擔飲品。",
  },
  "s5.f4.b": { es: "Breakout rooms", en: "Breakout rooms", zh: "分组空间", "zh-Hant": "分組空間" },
  "s5.f4.s": {
    es: "Rooms superiores para networking, reuniones cortas y actividades especiales.",
    en: "Upstairs rooms for networking, short meetings and special activities.",
    zh: "楼上包厢用于社交、短会与特别活动。",
    "zh-Hant": "樓上包廂用於社交、短會與特別活動。",
  },
  "s5.f5.b": { es: "DJs noche", en: "Night DJs", zh: "夜间 DJ", "zh-Hant": "夜間 DJ" },
  "s5.f5.s": {
    es: "Booking para extender de torneo a after-party despues de las 9 PM.",
    en: "Booking to extend from tournament to after-party past 9 PM.",
    zh: "预约以在晚 9 点后将赛事延续为余兴派对。",
    "zh-Hant": "預約以在晚 9 點後將賽事延續為餘興派對。",
  },

  "s6.h2": { es: "Dos opciones comerciales", en: "Two commercial options", zh: "两种商务方案", "zh-Hant": "兩種商務方案" },
  "s6.a.h3": { es: "Opcion A / Todo incluido", en: "Option A / All-inclusive", zh: "方案 A / 全包", "zh-Hant": "方案 A / 全包" },
  "s6.a.li1": { es: "Sede para torneo de 4 PM a 9 PM.", en: "Venue for the tournament from 4 PM to 9 PM.", zh: "赛事场地，下午 4 点至 9 点。", "zh-Hant": "賽事場地，下午 4 點至 9 點。" },
  "s6.a.li2": { es: "Bebidas incluidas para asistentes segun paquete definido.", en: "Drinks included for attendees per the defined package.", zh: "按既定套餐为与会者提供饮品。", "zh-Hant": "按既定套餐為與會者提供飲品。" },
  "s6.a.li3": { es: "Comida o snacks incluidos durante la tarde.", en: "Food or snacks included during the afternoon.", zh: "下午提供餐食或小食。", "zh-Hant": "下午提供餐食或小食。" },
  "s6.a.li4": { es: "Staff, acceso, limpieza, seguridad y soporte operativo.", en: "Staff, access, cleaning, security and operational support.", zh: "人员、进出、清洁、安保与运营支持。", "zh-Hant": "人員、進出、清潔、安保與營運支援。" },
  "s6.a.li5": { es: "Opcion de continuidad con DJs y consumo nocturno.", en: "Option to continue with DJs and night consumption.", zh: "可选延续 DJ 与夜间消费。", "zh-Hant": "可選延續 DJ 與夜間消費。" },
  "s6.b.h3": { es: "Opcion B / Sede + sponsors", en: "Option B / Venue + sponsors", zh: "方案 B / 场地 + 赞助", "zh-Hant": "方案 B / 場地 + 贊助" },
  "s6.b.li1": { es: "El venue provee sede, horarios y operacion base.", en: "The venue provides venue, schedule and base operation.", zh: "合作场地提供场地、时段与基础运营。", "zh-Hant": "合作場地提供場地、時段與基礎營運。" },
  "s6.b.li2": { es: "AXIS trae marcas para patrocinar bebidas y comida.", en: "AXIS brings brands to sponsor drinks and food.", zh: "AXIS 引入品牌赞助饮品与餐食。", "zh-Hant": "AXIS 引入品牌贊助飲品與餐食。" },
  "s6.b.li3": { es: "Las marcas reciben presencia en pantallas, menciones y contenido.", en: "Brands get presence on screens, mentions and content.", zh: "品牌获得屏幕露出、鸣谢与内容曝光。", "zh-Hant": "品牌獲得螢幕露出、鳴謝與內容曝光。" },
  "s6.b.li4": { es: "El venue mantiene flujo de asistentes para la noche.", en: "The venue keeps attendee flow for the night.", zh: "场地为夜间保持人流。", "zh-Hant": "場地為夜間保持人流。" },
  "s6.b.li5": { es: "Ideal si queremos bajar costo fijo y sumar aliados.", en: "Ideal if we want to lower fixed cost and add partners.", zh: "适合降低固定成本并增加合作伙伴。", "zh-Hant": "適合降低固定成本並增加合作夥伴。" },
  "s6.note": {
    es: "Los montos finales quedan sujetos a disponibilidad, dia exacto, consumo minimo, menu, alcance de barra y requerimientos tecnicos.",
    en: "Final amounts are subject to availability, exact date, minimum spend, menu, bar scope and technical requirements.",
    zh: "最终金额取决于档期、具体日期、最低消费、菜单、酒水范围与技术需求。",
    "zh-Hant": "最終金額取決於檔期、具體日期、最低消費、菜單、酒水範圍與技術需求。",
  },

  "s7.h2": { es: "Marcas pagan la experiencia", en: "Brands fund the experience", zh: "品牌为体验买单", "zh-Hant": "品牌為體驗買單" },
  "s7.hub.l1": { es: "AXIS", en: "AXIS", zh: "AXIS", "zh-Hant": "AXIS" },
  "s7.hub.l2": { es: "TOURNAMENT", en: "TOURNAMENT", zh: "锦标赛", "zh-Hant": "錦標賽" },
  "s7.n1": { es: "Venue", en: "Venue", zh: "场地", "zh-Hant": "場地" },
  "s7.n1s": { es: "Partner venue", en: "Partner venue", zh: "合作场地", "zh-Hant": "合作場地" },
  "s7.n2": { es: "Drinks", en: "Drinks", zh: "饮品", "zh-Hant": "飲品" },
  "s7.n2s": { es: "Sponsor or all-in", en: "Sponsor or all-in", zh: "赞助或全包", "zh-Hant": "贊助或全包" },
  "s7.n3": { es: "Food", en: "Food", zh: "餐食", "zh-Hant": "餐食" },
  "s7.n3s": { es: "Sponsor or package", en: "Sponsor or package", zh: "赞助或套餐", "zh-Hant": "贊助或套餐" },
  "s7.n4": { es: "DJs", en: "DJs", zh: "DJ", "zh-Hant": "DJ" },
  "s7.n4s": { es: "After-party", en: "After-party", zh: "余兴派对", "zh-Hant": "餘興派對" },
  "s7.n5": { es: "AI Trading", en: "AI Trading", zh: "AI 交易", "zh-Hant": "AI 交易" },
  "s7.n5s": { es: "Agents + signals", en: "Agents + signals", zh: "智能体 + 信号", "zh-Hant": "智能體 + 訊號" },
  "s7.n6": { es: "Human Traders", en: "Human Traders", zh: "人类交易员", "zh-Hant": "人類交易員" },
  "s7.n6s": { es: "Manual rounds", en: "Manual rounds", zh: "手动回合", "zh-Hant": "手動回合" },

  "s8.h2": { es: "Proximo paso", en: "Next step", zh: "下一步", "zh-Hant": "下一步" },
  "s8.lead": {
    es: "Confirmar disponibilidad de un miercoles, capacidad para 250 personas, paquete de venue y dos rutas de precio.",
    en: "Confirm a Wednesday's availability, capacity for 250 people, venue package and two pricing routes.",
    zh: "确认某个周三的档期、250 人容量、场地套餐及两条报价路径。",
    "zh-Hant": "確認某個週三的檔期、250 人容量、場地套餐及兩條報價路徑。",
  },
  "s8.p": {
    es: "Despues de eso AXIS arma convocatoria, sponsors, reglas del torneo, visuales, registro y programacion musical para la noche.",
    en: "After that AXIS builds the call, sponsors, tournament rules, visuals, registration and the night's music programming.",
    zh: "随后 AXIS 负责招募、赞助、赛事规则、视觉、报名与当晚音乐编排。",
    "zh-Hant": "隨後 AXIS 負責招募、贊助、賽事規則、視覺、報名與當晚音樂編排。",
  },
  "s8.note": {
    es: "Nota: el torneo debe comunicarse como competencia educativa/de entretenimiento. No se promete rendimiento financiero ni se dan recomendaciones de inversion.",
    en: "Note: the tournament must be communicated as an educational/entertainment competition. No financial returns are promised and no investment advice is given.",
    zh: "注：赛事应作为教育/娱乐性竞赛进行传播。不承诺任何财务回报，亦不提供投资建议。",
    "zh-Hant": "註：賽事應作為教育/娛樂性競賽進行傳播。不承諾任何財務回報，亦不提供投資建議。",
  },

  /* Rules summary slide (Slide04RulesSummary). Phase names, "PnL", "API" and
     article refs are league jargon — identical across languages by design. */
  "kicker.rules": { es: "Reglas", en: "Rules", zh: "规则", "zh-Hant": "規則" },
  "s4r.h2": {
    es: "Reglas de competencia",
    en: "Competition rules",
    zh: "竞赛规则",
    "zh-Hant": "競賽規則",
  },
  "s4r.p": {
    es: "El pitch solo necesita las restricciones que definen la liga: condiciones iguales, competencia autonoma y ranking objetivo por PnL final.",
    en: "The pitch only needs the operating constraints that define the league: equal conditions, autonomous competition, and objective ranking by final PnL.",
    zh: "提案只需列出定义联赛的核心约束：同等条件、自主竞技、以最终 PnL 客观排名。",
    "zh-Hant": "提案只需列出定義聯賽的核心約束：同等條件、自主競技、以最終 PnL 客觀排名。",
  },
  "s4r.note": {
    es: "Las Regulaciones Deportivas y Tecnicas Oficiales completas estan disponibles en el Rulebook.",
    en: "Full Official Sporting & Technical Regulations available in the Rulebook.",
    zh: "完整的官方竞赛与技术规则见规则手册。",
    "zh-Hant": "完整的官方競賽與技術規則見規則手冊。",
  },
  "s4r.open": {
    es: "Abrir Rulebook",
    en: "Open Rulebook",
    zh: "打开规则手册",
    "zh-Hant": "打開規則手冊",
  },
  "s4r.r1.b": { es: "3 fases", en: "3 phases", zh: "三个阶段", "zh-Hant": "三個階段" },
  "s4r.r1.s": {
    es: "Sandboxxing · Liquidation Madness · PnLMaxxing",
    en: "Sandboxxing · Liquidation Madness · PnLMaxxing",
    zh: "Sandboxxing · Liquidation Madness · PnLMaxxing",
    "zh-Hant": "Sandboxxing · Liquidation Madness · PnLMaxxing",
  },
  "s4r.r2.b": {
    es: "Presupuestos de computo iguales",
    en: "Equal compute budgets",
    zh: "同等算力预算",
    "zh-Hant": "同等算力預算",
  },
  "s4r.r2.s": {
    es: "API, tokens, computo y rate limits",
    en: "API, tokens, compute and rate limits",
    zh: "API、token、算力与速率限制",
    "zh-Hant": "API、token、算力與速率限制",
  },
  "s4r.r3.b": {
    es: "Divisiones AI y Human",
    en: "AI and Human divisions",
    zh: "AI 与人类分组",
    "zh-Hant": "AI 與人類分組",
  },
  "s4r.r3.s": {
    es: "Campeonatos independientes",
    en: "Independent championships",
    zh: "各自独立的冠军头衔",
    "zh-Hant": "各自獨立的冠軍頭銜",
  },
  "s4r.r4.b": {
    es: "Solo trading autonomo",
    en: "Autonomous trading only",
    zh: "仅限自主交易",
    "zh-Hant": "僅限自主交易",
  },
  "s4r.r4.s": {
    es: "La intervencion humana es DSQ inmediata",
    en: "Human intervention is immediate DSQ",
    zh: "人工干预即取消资格",
    "zh-Hant": "人工干預即取消資格",
  },
  "s4r.r5.b": {
    es: "Solo el Exchange Oficial",
    en: "Official Exchange only",
    zh: "仅限官方交易所",
    "zh-Hant": "僅限官方交易所",
  },
  "s4r.r5.s": {
    es: "El trading externo esta prohibido",
    en: "External trading is prohibited",
    zh: "禁止场外交易",
    "zh-Hant": "禁止場外交易",
  },
  "s4r.r6.b": {
    es: "Gana el mayor PnL final",
    en: "Highest final PnL wins",
    zh: "最终 PnL 最高者胜",
    "zh-Hant": "最終 PnL 最高者勝",
  },
  "s4r.r6.s": {
    es: "Los mercados deciden",
    en: "Markets decide",
    zh: "市场说了算",
    "zh-Hant": "市場說了算",
  },

  /* Bracket diagram (Phase 1 table in the design spec). */
  "br.cat": { es: "CATEGORIA", en: "CATEGORY", zh: "类别", "zh-Hant": "類別" },
  "br.title": { es: "2 CATEGORIAS", en: "2 CATEGORIES", zh: "两大类别", "zh-Hant": "兩大類別" },
  "br.subtitle": { es: "PROFIT WINS", en: "PROFIT WINS", zh: "利润最高者胜", "zh-Hant": "利潤最高者勝" },
  "br.elim": { es: "ELIMINACION POR LIQUIDACION", en: "KNOCKOUT BY LIQUIDATION", zh: "爆仓即淘汰", "zh-Hant": "爆倉即淘汰" },
} as const satisfies Record<string, Entry>;

export type ArenaKey = keyof typeof ARENA_I18N;

export function makeT(language: SiteLanguage) {
  return (key: ArenaKey): string => ARENA_I18N[key][language] ?? ARENA_I18N[key].es;
}

export type ArenaT = ReturnType<typeof makeT>;

export interface SlideProps {
  t: ArenaT;
  language: SiteLanguage;
  /** 1-based slide index, e.g. 3 for "03". */
  index: number;
}
