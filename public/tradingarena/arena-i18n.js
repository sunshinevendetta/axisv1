/* Trading Arena deck i18n.
   Default markup is Spanish (es). This swaps text by [data-i18n] key.
   Language comes from the site switcher via:
     - localStorage["axis:site-language"] on boot
     - window.postMessage({ type: "axis:language", language }) at runtime
   Supported: es | en | zh (Simplified) | zh-Hant (Traditional). */
(function () {
  var STORAGE_KEY = "axis:site-language";

  var I18N = {
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
      "zh-Hant": "拉丁美洲有史以來最激烈的交易錦標賽。"
    },
    "s1.p1.strong": { es: "Dos categorías:", en: "Two categories:", zh: "两大类别：", "zh-Hant": "兩大類別：" },
    "s1.p1.rest": {
      es: " Human Traders y AI Agents.",
      en: " Human Traders and AI Agents.",
      zh: " 人类交易员与 AI 智能体。",
      "zh-Hant": " 人類交易員與 AI 智能體。"
    },
    "s1.p2.strong": { es: "Objetivo:", en: "Goal:", zh: "目标：", "zh-Hant": "目標：" },
    "s1.p2.rest": {
      es: " transformar a Bar Oriente en el punto de encuentro donde trading, tecnología, competencia, cultura y comunidad convergen en una experiencia en vivo.",
      en: " turn Bar Oriente into the meeting point where trading, technology, competition, culture and community converge into a live experience.",
      zh: " 将 Bar Oriente 打造成交易、科技、竞技、文化与社群交汇的现场舞台。",
      "zh-Hant": " 將 Bar Oriente 打造成交易、科技、競技、文化與社群交匯的現場舞台。"
    },

    "s2.h2": { es: "Concepto", en: "Concept", zh: "理念", "zh-Hant": "理念" },
    "s2.lead": {
      es: "Trading Arena es una competencia de trading en vivo donde solo importa una cosa: El mayor profit gana.",
      en: "Trading Arena is a live trading competition where only one thing matters: the biggest profit wins.",
      zh: "Trading Arena 是一场现场交易竞赛，只看一件事：利润最高者胜出。",
      "zh-Hant": "Trading Arena 是一場現場交易競賽，只看一件事：利潤最高者勝出。"
    },
    "s2.p1": {
      es: "Todos compiten bajo las mismas reglas, el mismo mercado y el mismo límite de tiempo.",
      en: "Everyone competes under the same rules, the same market and the same time limit.",
      zh: "所有人在相同规则、相同市场与相同时限下同场竞技。",
      "zh-Hant": "所有人在相同規則、相同市場與相同時限下同場競技。"
    },
    "s2.p2": {
      es: "Durante cuatro horas, Bar Oriente se transforma en una arena donde 250 traders, builders, AI agents y espectadores siguen cada operación en pantallas gigantes, leaderboards en vivo y un sistema clasificatorio de eliminación directa por liquidación.",
      en: "For four hours, Bar Oriente becomes an arena where 250 traders, builders, AI agents and spectators follow every trade on giant screens, live leaderboards and a knockout ranking system driven by liquidation.",
      zh: "在四小时里，Bar Oriente 化身竞技场：250 名交易员、开发者、AI 智能体与观众通过巨型屏幕、实时排行榜以及以爆仓淘汰为核心的晋级系统紧盯每一笔交易。",
      "zh-Hant": "在四小時裡，Bar Oriente 化身競技場：250 名交易員、開發者、AI 智能體與觀眾透過巨型螢幕、即時排行榜以及以爆倉淘汰為核心的晉級系統緊盯每一筆交易。"
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
      "zh-Hant": "報名時，每位參賽者選擇所屬類別。整場活動可在模擬帳戶、沙盒或由主辦方設定的規則下運行。"
    },
    "s3.card1.b": { es: "Traders humanos", en: "Human traders", zh: "人类交易员", "zh-Hant": "人類交易員" },
    "s3.card1.s": {
      es: "Personas compiten con una estrategia manual durante ventanas cortas y leaderboard en vivo.",
      en: "People compete with a manual strategy across short windows and a live leaderboard.",
      zh: "选手以手动策略在多个短时窗口内竞技，并有实时排行榜。",
      "zh-Hant": "選手以手動策略在多個短時窗口內競技，並有即時排行榜。"
    },
    "s3.card2.b": { es: "AI Agents", en: "AI Agents", zh: "AI 智能体", "zh-Hant": "AI 智能體" },
    "s3.card2.s": {
      es: "Participantes presentan o ejecutan agentes, modelos o senales automatizadas bajo reglas claras.",
      en: "Participants present or run agents, models or automated signals under clear rules.",
      zh: "参赛者在明确规则下展示或运行智能体、模型或自动化信号。",
      "zh-Hant": "參賽者在明確規則下展示或運行智能體、模型或自動化訊號。"
    },
    "s3.card3.b": { es: "Final showcase", en: "Final showcase", zh: "决赛展示", "zh-Hant": "決賽展示" },
    "s3.card3.s": {
      es: "Ganadores de cada categoria se presentan en pantalla para cierre, premios y contenido.",
      en: "Winners of each category appear on screen for the finale, prizes and content.",
      zh: "各类别优胜者登上大屏，进行收官、颁奖与内容展示。",
      "zh-Hant": "各類別優勝者登上大螢幕，進行收官、頒獎與內容展示。"
    },

    "s4.h2": { es: "Agenda", en: "Agenda", zh: "议程", "zh-Hant": "議程" },
    "s4.r1.b": { es: "Registro + bienvenida", en: "Registration + welcome", zh: "签到 + 欢迎", "zh-Hant": "簽到 + 歡迎" },
    "s4.r1.s": {
      es: "Check-in, seleccion de categoria, bebidas y comida ligera desde apertura.",
      en: "Check-in, category selection, drinks and light food from opening.",
      zh: "签到、选择类别，开场即供应饮品与轻食。",
      "zh-Hant": "簽到、選擇類別，開場即供應飲品與輕食。"
    },
    "s4.r2.b": { es: "Brief de reglas", en: "Rules brief", zh: "规则说明", "zh-Hant": "規則說明" },
    "s4.r2.s": {
      es: "Formato, limites, herramientas permitidas, leaderboard y criterios de premio.",
      en: "Format, limits, allowed tools, leaderboard and prize criteria.",
      zh: "赛制、限制、允许工具、排行榜与评奖标准。",
      "zh-Hant": "賽制、限制、允許工具、排行榜與評獎標準。"
    },
    "s4.r3.b": { es: "Inicio del torneo", en: "Tournament start", zh: "赛事开始", "zh-Hant": "賽事開始" },
    "s4.r3.s": {
      es: "Human traders y AI trading corren en paralelo con pantallas y staff de apoyo.",
      en: "Human traders and AI trading run in parallel with screens and support staff.",
      zh: "人类交易与 AI 交易并行进行，配备屏幕与支持人员。",
      "zh-Hant": "人類交易與 AI 交易並行進行，配備螢幕與支援人員。"
    },
    "s4.r4.b": { es: "Awards + premiacion", en: "Awards + prizes", zh: "颁奖典礼", "zh-Hant": "頒獎典禮" },
    "s4.r4.s": {
      es: "Cierre de leaderboard, fotos, entrevistas cortas y menciones de marcas.",
      en: "Leaderboard close, photos, short interviews and brand mentions.",
      zh: "排行榜封榜、拍照、简短采访与品牌鸣谢。",
      "zh-Hant": "排行榜封榜、拍照、簡短採訪與品牌鳴謝。"
    },
    "s4.r5.b": { es: "Transicion a After Party", en: "Transition to After Party", zh: "过渡至余兴派对", "zh-Hant": "過渡至餘興派對" },
    "s4.r5.s": {
      es: "Los asistentes pueden quedarse en el Cuarto Rosa o el salon de Karaoke haciendo networking mientras el DJ inicia abajo para comenzar el after party y permitir el acceso al publico general.",
      en: "Guests can stay in the Cuarto Rosa or the Karaoke lounge networking while the DJ starts downstairs to kick off the after party and open access to the general public.",
      zh: "来宾可在 Cuarto Rosa 或卡拉 OK 厅继续交流，同时 DJ 在楼下开场，启动余兴派对并向公众开放。",
      "zh-Hant": "來賓可在 Cuarto Rosa 或卡拉 OK 廳繼續交流，同時 DJ 在樓下開場，啟動餘興派對並向公眾開放。"
    },
    "s4.r6.b": { es: "Afterparty", en: "Afterparty", zh: "余兴派对", "zh-Hant": "餘興派對" },
    "s4.r6.s": {
      es: "Acceso a publico general, clientes de Bar Oriente junto a los asistentes que han decidido quedarse a disfrutar el cierre.",
      en: "Open to the general public and Bar Oriente patrons alongside attendees who chose to stay for the closing.",
      zh: "向公众及 Bar Oriente 常客开放，与选择留下享受收官的与会者同乐。",
      "zh-Hant": "向公眾及 Bar Oriente 常客開放，與選擇留下享受收官的與會者同樂。"
    },

    "s5.h2": {
      es: "Sede, servicio y posibilidad de noche",
      en: "Venue, service and night option",
      zh: "场地、服务与夜间延展",
      "zh-Hant": "場地、服務與夜間延展"
    },
    "s5.f1.b": { es: "Cuarto Rosa", en: "Cuarto Rosa", zh: "Cuarto Rosa", "zh-Hant": "Cuarto Rosa" },
    "s5.f1.s": {
      es: "Talks, demos, pantallas y momentos de presentacion durante todo el evento.",
      en: "Talks, demos, screens and presentation moments throughout the event.",
      zh: "全程提供演讲、演示、屏幕与展示环节。",
      "zh-Hant": "全程提供演講、演示、螢幕與展示環節。"
    },
    "s5.f2.b": { es: "Operaciones", en: "Operations", zh: "运营", "zh-Hant": "營運" },
    "s5.f2.s": {
      es: "Bar, staff, acceso, seguridad y coordinacion con produccion.",
      en: "Bar, staff, access, security and coordination with production.",
      zh: "酒吧、人员、进出、安保及与制作团队协调。",
      "zh-Hant": "酒吧、人員、進出、安保及與製作團隊協調。"
    },
    "s5.f3.b": { es: "Bebidas", en: "Drinks", zh: "饮品", "zh-Hant": "飲品" },
    "s5.f3.s": {
      es: "Paquete incluido o permiso para que marcas patrocinadoras cubran drinks.",
      en: "Included package or clearance for sponsor brands to cover drinks.",
      zh: "含套餐，或授权赞助品牌承担饮品。",
      "zh-Hant": "含套餐，或授權贊助品牌承擔飲品。"
    },
    "s5.f4.b": { es: "Karaoke rooms", en: "Karaoke rooms", zh: "卡拉 OK 包厢", "zh-Hant": "卡拉 OK 包廂" },
    "s5.f4.s": {
      es: "Rooms superiores para networking, reuniones cortas y actividades especiales.",
      en: "Upstairs rooms for networking, short meetings and special activities.",
      zh: "楼上包厢用于社交、短会与特别活动。",
      "zh-Hant": "樓上包廂用於社交、短會與特別活動。"
    },
    "s5.f5.b": { es: "DJs noche", en: "Night DJs", zh: "夜间 DJ", "zh-Hant": "夜間 DJ" },
    "s5.f5.s": {
      es: "Booking para extender de torneo a after-party despues de las 9 PM.",
      en: "Booking to extend from tournament to after-party past 9 PM.",
      zh: "预约以在晚 9 点后将赛事延续为余兴派对。",
      "zh-Hant": "預約以在晚 9 點後將賽事延續為餘興派對。"
    },

    "s6.h2": { es: "Dos opciones comerciales", en: "Two commercial options", zh: "两种商务方案", "zh-Hant": "兩種商務方案" },
    "s6.a.h3": { es: "Opcion A / Todo incluido", en: "Option A / All-inclusive", zh: "方案 A / 全包", "zh-Hant": "方案 A / 全包" },
    "s6.a.li1": { es: "Sede para torneo de 4 PM a 9 PM.", en: "Venue for the tournament from 4 PM to 9 PM.", zh: "赛事场地，下午 4 点至 9 点。", "zh-Hant": "賽事場地，下午 4 點至 9 點。" },
    "s6.a.li2": { es: "Bebidas incluidas para asistentes segun paquete definido.", en: "Drinks included for attendees per the defined package.", zh: "按既定套餐为与会者提供饮品。", "zh-Hant": "按既定套餐為與會者提供飲品。" },
    "s6.a.li3": { es: "Comida o snacks incluidos durante la tarde.", en: "Food or snacks included during the afternoon.", zh: "下午提供餐食或小食。", "zh-Hant": "下午提供餐食或小食。" },
    "s6.a.li4": { es: "Staff, acceso, limpieza, seguridad y soporte operativo.", en: "Staff, access, cleaning, security and operational support.", zh: "人员、进出、清洁、安保与运营支持。", "zh-Hant": "人員、進出、清潔、安保與營運支援。" },
    "s6.a.li5": { es: "Opcion de continuidad con DJs y consumo nocturno.", en: "Option to continue with DJs and night consumption.", zh: "可选延续 DJ 与夜间消费。", "zh-Hant": "可選延續 DJ 與夜間消費。" },
    "s6.b.h3": { es: "Opcion B / Sede + sponsors", en: "Option B / Venue + sponsors", zh: "方案 B / 场地 + 赞助", "zh-Hant": "方案 B / 場地 + 贊助" },
    "s6.b.li1": { es: "Bar Oriente provee sede, horarios y operacion base.", en: "Bar Oriente provides venue, schedule and base operation.", zh: "Bar Oriente 提供场地、时段与基础运营。", "zh-Hant": "Bar Oriente 提供場地、時段與基礎營運。" },
    "s6.b.li2": { es: "AXIS trae marcas para patrocinar bebidas y comida.", en: "AXIS brings brands to sponsor drinks and food.", zh: "AXIS 引入品牌赞助饮品与餐食。", "zh-Hant": "AXIS 引入品牌贊助飲品與餐食。" },
    "s6.b.li3": { es: "Las marcas reciben presencia en pantallas, menciones y contenido.", en: "Brands get presence on screens, mentions and content.", zh: "品牌获得屏幕露出、鸣谢与内容曝光。", "zh-Hant": "品牌獲得螢幕露出、鳴謝與內容曝光。" },
    "s6.b.li4": { es: "El venue mantiene flujo de asistentes para la noche.", en: "The venue keeps attendee flow for the night.", zh: "场地为夜间保持人流。", "zh-Hant": "場地為夜間保持人流。" },
    "s6.b.li5": { es: "Ideal si queremos bajar costo fijo y sumar aliados.", en: "Ideal if we want to lower fixed cost and add partners.", zh: "适合降低固定成本并增加合作伙伴。", "zh-Hant": "適合降低固定成本並增加合作夥伴。" },
    "s6.note": {
      es: "Los montos finales quedan sujetos a disponibilidad, dia exacto, consumo minimo, menu, alcance de barra y requerimientos tecnicos.",
      en: "Final amounts are subject to availability, exact date, minimum spend, menu, bar scope and technical requirements.",
      zh: "最终金额取决于档期、具体日期、最低消费、菜单、酒水范围与技术需求。",
      "zh-Hant": "最終金額取決於檔期、具體日期、最低消費、菜單、酒水範圍與技術需求。"
    },

    "s7.h2": { es: "Marcas pagan la experiencia", en: "Brands fund the experience", zh: "品牌为体验买单", "zh-Hant": "品牌為體驗買單" },
    "s7.hub": { es: "AXIS<br>TOURNAMENT", en: "AXIS<br>TOURNAMENT", zh: "AXIS<br>锦标赛", "zh-Hant": "AXIS<br>錦標賽" },
    "s7.n1": { es: "Venue", en: "Venue", zh: "场地", "zh-Hant": "場地" },
    "s7.n1s": { es: "Bar Oriente", en: "Bar Oriente", zh: "Bar Oriente", "zh-Hant": "Bar Oriente" },
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
      "zh-Hant": "確認某個週三的檔期、250 人容量、場地套餐及兩條報價路徑。"
    },
    "s8.p": {
      es: "Despues de eso AXIS arma convocatoria, sponsors, reglas del torneo, visuales, registro y programacion musical para la noche.",
      en: "After that AXIS builds the call, sponsors, tournament rules, visuals, registration and the night's music programming.",
      zh: "随后 AXIS 负责招募、赞助、赛事规则、视觉、报名与当晚音乐编排。",
      "zh-Hant": "隨後 AXIS 負責招募、贊助、賽事規則、視覺、報名與當晚音樂編排。"
    },
    "s8.note": {
      es: "Nota: el torneo debe comunicarse como competencia educativa/de entretenimiento. No se promete rendimiento financiero ni se dan recomendaciones de inversion.",
      en: "Note: the tournament must be communicated as an educational/entertainment competition. No financial returns are promised and no investment advice is given.",
      zh: "注：赛事应作为教育/娱乐性竞赛进行传播。不承诺任何财务回报，亦不提供投资建议。",
      "zh-Hant": "註：賽事應作為教育/娛樂性競賽進行傳播。不承諾任何財務回報，亦不提供投資建議。"
    },

    /* Vertical-deck-only strings (shorter copy than horizontal). */
    "v.kicker03": { es: "Categorias", en: "Categories", zh: "类别", "zh-Hant": "類別" },
    "v.kicker08": { es: "Siguiente paso", en: "Next step", zh: "下一步", "zh-Hant": "下一步" },

    "v.s3.p": {
      es: "Los participantes eligen categoria al registrarse. Recomendado: entorno demo, sandbox o reglas controladas.",
      en: "Participants pick their category on registration. Recommended: demo, sandbox or controlled-rules environment.",
      zh: "参赛者报名时选择类别。建议：模拟、沙盒或受控规则环境。",
      "zh-Hant": "參賽者報名時選擇類別。建議：模擬、沙盒或受控規則環境。"
    },
    "v.s3.c1s": {
      es: "Estrategia manual, rondas cortas y leaderboard en vivo.",
      en: "Manual strategy, short rounds and a live leaderboard.",
      zh: "手动策略、短回合与实时排行榜。",
      "zh-Hant": "手動策略、短回合與即時排行榜。"
    },
    "v.s3.c2s": {
      es: "Agentes, modelos o senales automatizadas bajo reglas claras.",
      en: "Agents, models or automated signals under clear rules.",
      zh: "明确规则下的智能体、模型或自动化信号。",
      "zh-Hant": "明確規則下的智能體、模型或自動化訊號。"
    },
    "v.s3.c3s": {
      es: "Premiacion, fotos, contenido y menciones de marcas.",
      en: "Prizes, photos, content and brand mentions.",
      zh: "颁奖、拍照、内容与品牌鸣谢。",
      "zh-Hant": "頒獎、拍照、內容與品牌鳴謝。"
    },

    "v.s4.h2": { es: "4 PM + After", en: "4 PM + After", zh: "下午 4 点 + 余兴", "zh-Hant": "下午 4 點 + 餘興" },
    "v.s4.r1b": { es: "Registro", en: "Registration", zh: "签到", "zh-Hant": "簽到" },
    "v.s4.r1s": { es: "Check-in, categoria, food y drinks.", en: "Check-in, category, food and drinks.", zh: "签到、类别、餐食与饮品。", "zh-Hant": "簽到、類別、餐食與飲品。" },
    "v.s4.r2b": { es: "Reglas", en: "Rules", zh: "规则", "zh-Hant": "規則" },
    "v.s4.r2s": { es: "Brief de herramientas, limites y premios.", en: "Brief on tools, limits and prizes.", zh: "工具、限制与奖项说明。", "zh-Hant": "工具、限制與獎項說明。" },
    "v.s4.r3b": { es: "Inicio torneo", en: "Tournament start", zh: "赛事开始", "zh-Hant": "賽事開始" },
    "v.s4.r3s": { es: "Human traders y AI trading en paralelo.", en: "Human traders and AI trading in parallel.", zh: "人类交易与 AI 交易并行。", "zh-Hant": "人類交易與 AI 交易並行。" },
    "v.s4.r4b": { es: "Awards", en: "Awards", zh: "颁奖", "zh-Hant": "頒獎" },
    "v.s4.r4s": { es: "Leaderboard, premiacion y contenido.", en: "Leaderboard, prizes and content.", zh: "排行榜、颁奖与内容。", "zh-Hant": "排行榜、頒獎與內容。" },

    "v.s5.h2": { es: "Sede + servicio", en: "Venue + service", zh: "场地 + 服务", "zh-Hant": "場地 + 服務" },
    "v.s5.f1s": { es: "Talks, demos, pantallas y presentaciones durante el evento.", en: "Talks, demos, screens and presentations during the event.", zh: "活动期间的演讲、演示、屏幕与展示。", "zh-Hant": "活動期間的演講、演示、螢幕與展示。" },
    "v.s5.f2b": { es: "Karaoke rooms", en: "Karaoke rooms", zh: "卡拉 OK 包厢", "zh-Hant": "卡拉 OK 包廂" },
    "v.s5.f2s": { es: "Rooms superiores para networking y actividades especiales.", en: "Upstairs rooms for networking and special activities.", zh: "楼上包厢用于社交与特别活动。", "zh-Hant": "樓上包廂用於社交與特別活動。" },
    "v.s5.f3b": { es: "Bar", en: "Bar", zh: "酒吧", "zh-Hant": "酒吧" },
    "v.s5.f3s": { es: "Bebidas incluidas o patrocinadas por marcas aliadas.", en: "Drinks included or sponsored by partner brands.", zh: "含饮品或由合作品牌赞助。", "zh-Hant": "含飲品或由合作品牌贊助。" },
    "v.s5.f4b": { es: "Food", en: "Food", zh: "餐食", "zh-Hant": "餐食" },
    "v.s5.f4s": { es: "Comida ligera incluida o por sponsor/proveedor.", en: "Light food included or via sponsor/provider.", zh: "含轻食或由赞助商/供应商提供。", "zh-Hant": "含輕食或由贊助商/供應商提供。" },
    "v.s5.f5b": { es: "DJs", en: "DJs", zh: "DJ", "zh-Hant": "DJ" },
    "v.s5.f5s": { es: "Booking para extender a after-party.", en: "Booking to extend into the after-party.", zh: "预约以延续至余兴派对。", "zh-Hant": "預約以延續至餘興派對。" },

    "v.s6.h2": { es: "Dos opciones", en: "Two options", zh: "两种方案", "zh-Hant": "兩種方案" },
    "v.s6.a.h3": { es: "Todo incluido", en: "All-inclusive", zh: "全包", "zh-Hant": "全包" },
    "v.s6.a.li1": { es: "Sede 4 PM - 9 PM.", en: "Venue 4 PM - 9 PM.", zh: "场地 下午 4-9 点。", "zh-Hant": "場地 下午 4-9 點。" },
    "v.s6.a.li2": { es: "Bebidas incluidas segun paquete.", en: "Drinks included per package.", zh: "按套餐含饮品。", "zh-Hant": "按套餐含飲品。" },
    "v.s6.a.li3": { es: "Comida o snacks incluidos.", en: "Food or snacks included.", zh: "含餐食或小食。", "zh-Hant": "含餐食或小食。" },
    "v.s6.a.li4": { es: "Staff, acceso y seguridad.", en: "Staff, access and security.", zh: "人员、进出与安保。", "zh-Hant": "人員、進出與安保。" },
    "v.s6.a.li5": { es: "Continuidad a noche con DJs.", en: "Continuation into the night with DJs.", zh: "由 DJ 延续至夜间。", "zh-Hant": "由 DJ 延續至夜間。" },
    "v.s6.b.h3": { es: "Sede + sponsors", en: "Venue + sponsors", zh: "场地 + 赞助", "zh-Hant": "場地 + 贊助" },
    "v.s6.b.li1": { es: "Bar Oriente da sede y operacion base.", en: "Bar Oriente provides venue and base operation.", zh: "Bar Oriente 提供场地与基础运营。", "zh-Hant": "Bar Oriente 提供場地與基礎營運。" },
    "v.s6.b.li2": { es: "AXIS trae marcas para drinks y food.", en: "AXIS brings brands for drinks and food.", zh: "AXIS 引入品牌负责饮品与餐食。", "zh-Hant": "AXIS 引入品牌負責飲品與餐食。" },
    "v.s6.b.li3": { es: "Presencia de sponsors en pantallas y contenido.", en: "Sponsor presence on screens and content.", zh: "赞助商在屏幕与内容中的露出。", "zh-Hant": "贊助商在螢幕與內容中的露出。" },
    "v.s6.b.li4": { es: "Menor costo fijo y mas aliados.", en: "Lower fixed cost and more partners.", zh: "更低固定成本与更多伙伴。", "zh-Hant": "更低固定成本與更多夥伴。" },
    "v.s6.b.li5": { es: "Flujo hacia consumo nocturno.", en: "Flow into night consumption.", zh: "导流至夜间消费。", "zh-Hant": "導流至夜間消費。" },
    "v.s6.note": {
      es: "Montos sujetos a disponibilidad, consumo minimo, menu, barra y requerimientos tecnicos.",
      en: "Amounts subject to availability, minimum spend, menu, bar and technical requirements.",
      zh: "金额取决于档期、最低消费、菜单、酒水与技术需求。",
      "zh-Hant": "金額取決於檔期、最低消費、菜單、酒水與技術需求。"
    },

    "v.s7.n2s": { es: "Sponsor", en: "Sponsor", zh: "赞助", "zh-Hant": "贊助" },
    "v.s7.n3s": { es: "Package", en: "Package", zh: "套餐", "zh-Hant": "套餐" },
    "v.s7.n4s": { es: "After", en: "After", zh: "余兴", "zh-Hant": "餘興" },
    "v.s7.n5": { es: "AI Trading", en: "AI Trading", zh: "AI 交易", "zh-Hant": "AI 交易" },
    "v.s7.n5s": { es: "Agents", en: "Agents", zh: "智能体", "zh-Hant": "智能體" },
    "v.s7.n6": { es: "Human", en: "Human", zh: "人类", "zh-Hant": "人類" },
    "v.s7.n6s": { es: "Manual", en: "Manual", zh: "手动", "zh-Hant": "手動" },

    "v.s8.h2": { es: "Confirmar miercoles", en: "Confirm a Wednesday", zh: "确认周三", "zh-Hant": "確認週三" },
    "v.s8.lead": {
      es: "Necesitamos disponibilidad, capacidad, paquete all-in y ruta con sponsors.",
      en: "We need availability, capacity, all-in package and a sponsor route.",
      zh: "我们需要档期、容量、全包套餐及赞助路径。",
      "zh-Hant": "我們需要檔期、容量、全包套餐及贊助路徑。"
    },
    "v.s8.p": {
      es: "AXIS arma convocatoria, reglas, visuales, sponsors, registro y programacion musical.",
      en: "AXIS builds the call, rules, visuals, sponsors, registration and music programming.",
      zh: "AXIS 负责招募、规则、视觉、赞助、报名与音乐编排。",
      "zh-Hant": "AXIS 負責招募、規則、視覺、贊助、報名與音樂編排。"
    },
    "v.s8.note": {
      es: "Comunicacion como competencia educativa/de entretenimiento; no se prometen rendimientos ni recomendaciones de inversion.",
      en: "Communicated as an educational/entertainment competition; no returns or investment advice are promised.",
      zh: "作为教育/娱乐性竞赛传播；不承诺回报，亦不提供投资建议。",
      "zh-Hant": "作為教育/娛樂性競賽傳播；不承諾回報，亦不提供投資建議。"
    }
  };

  function normalize(value) {
    return value === "zh" || value === "zh-Hant" || value === "es" || value === "en" ? value : "es";
  }

  function apply(lang) {
    lang = normalize(lang);
    try { document.documentElement.lang = lang; } catch (e) {}
    var nodes = document.querySelectorAll("[data-i18n]");
    for (var i = 0; i < nodes.length; i += 1) {
      var el = nodes[i];
      var entry = I18N[el.getAttribute("data-i18n")];
      if (!entry) continue;
      var text = entry[lang];
      if (text == null) text = entry.es;
      if (el.hasAttribute("data-i18n-html")) {
        el.innerHTML = text;
      } else {
        el.textContent = text;
      }
    }
  }

  function boot() {
    var stored = "es";
    try { stored = localStorage.getItem(STORAGE_KEY) || "es"; } catch (e) {}
    apply(stored);
  }

  window.addEventListener("message", function (event) {
    var data = event && event.data;
    if (data && data.type === "axis:language" && data.language) {
      apply(data.language);
    }
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }

  window.__arenaApplyLang = apply;
})();
