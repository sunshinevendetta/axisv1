(function () {
  "use strict";

  var SUPPORTED = ["en", "es", "zh"];
  var LABELS = { en: "EN", es: "ES", zh: "中文" };
  var TEXT = {
    en: {},
    es: {
      "close.details": "DETALLES",
      "nav.tournament": "TORNEO DE TRADING",
      "tournament.kicker": "TORNEO DE TRADING",
      "tournament.title": "MISMO CAPITAL. GANA LA MAYOR GANANCIA.",
      "tournament.live": "EN VIVO TODA LA NOCHE, MIENTRAS SUCEDE EL EVENTO",
      "tournament.start": "MISMO CAPITAL INICIAL",
      "tournament.floor": "LIQUIDACIÓN = DSQ",
      "tournament.doors": "APERTURA",
      "tournament.workshop": "WORKSHOP",
      "tournament.afterParty": "AFTER PARTY",
      "tournament.finalBell": "CAMPANA FINAL",
      "tournament.illustrative": "CARRERA ILUSTRATIVA",
      "tournament.standings": "POSICIONES EN VIVO",
      "tournament.profit": "GANANCIA",
      "tournament.trader": "TRADER",
      "tournament.tba": "Premio y nombres de traders por anunciar.",
      "tournament.r1t": "MISMO INICIO",
      "tournament.r1": "Los cuatro traders comienzan con el mismo capital.",
      "tournament.r2t": "GANA LA MAYOR GANANCIA",
      "tournament.r2": "Al cerrar el torneo, la mayor ganancia se lleva el premio.",
      "tournament.r3t": "LIQUIDADO = DSQ",
      "tournament.r3": "Una cuenta liquidada queda descalificada en ese momento.",
      "tournament.winner": "PREMIO",
      "tournament.dsq": "LIQUIDADO / DSQ",
      "sponsorship.per-brand": "POR MARCA PATROCINADORA",
      "nav.speakers": "PONENTES",
      "speakers.kicker": "LOS PONENTES",
      "speakers.title": "DOS PRÁCTICAS. POSIBILIDADES COMPARTIDAS.",
      "speakers.anana.role": "ARTE + CONTENIDO DE NEGOCIO",
      "speakers.anana.copy": "Usa tu propio negocio como brief. Crea y refina contenido visual, explora video y conserva recursos útiles para tus productos y comunicación.",
      "speakers.anana.result": "PARA LLEVAR / Un recurso visual útil y las instrucciones para crearlo.",
      "speakers.sunshine.role": "INTEGRACIONES DE AGENTES",
      "speakers.sunshine.copy": "Automatiza una tarea real de tu negocio. Organiza entradas y pasos, construye agentes e integraciones y revisa la ejecución para conservar un flujo reutilizable.",
      "speakers.sunshine.result": "PARA LLEVAR / Una tarea completada y un flujo reutilizable.",
      "nav.past-events": "EVENTOS ANTERIORES",
      "past-events.kicker": "EVENTOS ANTERIORES DE AXIS",
      "past-events.title": "LO QUE CONSTRUIMOS JUNTOS.",
      "past-events.copy": "Herramientas compartidas, demostraciones en vivo, música y comunidad. Una mirada a nuestros encuentros anteriores.",
      "past-events.photo-01": "EN EL ESPACIO",
      "past-events.photo-02": "MÚSICA",
      "past-events.photo-03": "CONEXIONES",
      "past-events.photo-04": "COMUNIDAD",
      "past-events.photo-05": "DEMOSTRACIONES",
      "past-events.photo-06": "CONVERSACIONES",
      "past-events.photo-07": "PRÁCTICA",
      "past-events.photo-08": "PARTICIPACIÓN",
      "past-events.photo-09": "APRENDIZAJE COMPARTIDO",
      "past-events.photo-10": "DESPUÉS DE LA SESIÓN",
      "nav.axis-operates": "QUÉ OPERA AXIS",
      "creative-ai.host": "SEDE ANFITRIONA: CASA LUMA",
      "creative-ai.organizers": "ANANA / CONTENIDO DE NEGOCIO · SUNSHINE VENDETTA / AUTOMATIZACIÓN + AGENTES",
      "workshop.asksLabel": "LO QUE EL WORKSHOP NECESITA DEL VENUE",
      "workshop.runOfShow": "ORDEN DE LA NOCHE",
      "workshop.phaseNightNote": "El after party empieza a las 21:30 para 120 invitados más, además de los asistentes que se quedan.",
      "workshop.phaseNight": "AFTER PARTY",
      "workshop.phaseSeatedNote": "100 lugares; dos módulos de 70 minutos, más preparación, iteración y puesta en común.",
      "workshop.phaseSeated": "WORKSHOP SENTADO",
      "workshop.copy": "Dos módulos de 70 minutos parten de tu negocio: Anana guía la creación de contenido con IA; Sunshine Vendetta, la automatización de flujos, agentes e integraciones. Crea, itera y demuestra resultados reutilizables. Después explora cómo invertir ganancias onchain; sin promesas de rendimiento. Asistir no equivale a completar.",
      "workshop.title": "CREA. AUTOMATIZA. INVIERTE.",
      "workshop.kicker": "EVENTO DE LA COMUNIDAD DE CREATIVE AI",
      "event.afterParty": "AFTER PARTY",
      "event.seatedWorkshop": "WORKSHOP SENTADO",
      "nav.workshop": "EL WORKSHOP",
      "brand.artWeek": "AI CREATIVE CLUB · 4 DIC 2026",
      "nav.idea": "LA IDEA",
      "nav.event": "EL EVENTO",
      "nav.audience": "LA AUDIENCIA",
      "nav.event-format": "FORMATO DEL EVENTO",
      "nav.how-it-works": "CÓMO FUNCIONA",
      "nav.experience-components": "COMPONENTES",
      "nav.creative-ai-to-screen": "DE CREATIVE AI A PANTALLA",
      "nav.leaderboard": "TORNEO DE TRADING",
      "nav.measurement": "MEDICIÓN",
      "nav.activity-layer": "CAPA DE ACTIVIDADES",
      "nav.creative-ai": "CREATIVE AI",
      "nav.venue": "EL VENUE",
      "nav.production": "PRODUCCIÓN",
      "cover.poweredBy": "PRESENTADO POR: AXIS",
      "idea.kicker": "LA IDEA",
      "loop.kicker": "CÓMO FUNCIONA EL WORKSHOP",
      "loop.title": "DE LA TAREA AL RESULTADO.",
      "loop.hub": "PRÁCTICO",
      "loop.hubCopy": "Trae una tarea real. Llévate un resultado que puedes repetir.",
      "idea.title": "CREA. AUTOMATIZA. INVIERTE.",
      "idea.human": "Crea contenido para tu negocio o para ti como creador de contenido.",
      "idea.machine": "Construye agentes que trabajen para ti. Automatiza sus flujos para generar más dinero.",
      "idea.public": "Invierte las ganancias de tu negocio onchain.",
      "idea.copy": "Crea contenido para tu negocio. Automatiza flujos con agentes de IA. Invierte ganancias onchain.",
      "idea.code": "Tu negocio -> contenido con IA -> automatización y agentes -> inversión onchain.",
      "event.kicker": "EL EVENTO",
      "event.attendees": "INVITADOS ESPERADOS",
      "event.status": "AI CREATIVE CLUB · 4 DE DICIEMBRE DE 2026 · CASA LUMA",
      "event.mainRoom": "SALÓN PRINCIPAL",
      "event.gallery": "LA GALERÍA",
      "event.mainRoomCount": "TORNEO + AFTER PARTY",
      "event.galleryCount": "1 ESPACIO",
      "event.galleryRow": "ARTE ONCHAIN · TODA LA NOCHE",
      "event.digitalCount": "ARTISTAS CURADOS",
      "event.arcCreation": "CREA",
      "event.arcClub": "AUTOMATIZA",
      "event.arcAllNight": "INVIERTE",
      "event.liveCodingName": "TORNEO DE TRADING",
      "event.liveCodingNote": "4 traders",
      "event.closingName": "AFTER PARTY",
      "event.closingNote": "Convivencia después del workshop",
      "event.galleryName": "ARTE ONCHAIN",
      "event.galleryNote": "Artistas locales, internacionales y creadores en el sitio",
      "event.digitalLineup": "SELECCIÓN DE ARTE ONCHAIN",
      "program.art": "ARTE",
      "program.music": "AFTER PARTY",
      "program.technology": "TECNOLOGÍA",
      "program.culture": "CULTURA",
      "program.hospitality": "HOSPITALIDAD",
      "program.missions": "ACTIVIDADES",
      "program.creative-ai": "CREATIVE AI",
      "audience.kicker": "LA AUDIENCIA",
      "audience.title": "INVITADOS ESPERADOS.",
      "audience.copy": "Artistas, creadores de contenido, negocios, fundadores, builders, coleccionistas y personas curiosas que exploran IA, flujos prácticos y blockchain.",
      "audience.openCopy": "Esta es la audiencia esperada de AI Creative Club, no el aforo total del venue. Donde se acuerde operativamente, el venue puede seguir recibiendo a su clientela habitual, y esos invitados pueden descubrir y participar en actividades seleccionadas.",
      "audience.accessState": "AUDIENCIA OBJETIVO",
      "leaderboard.kicker": "TORNEO DE TRADING EN VIVO",
      "leaderboard.title": "4 TRADERS. GANA LA MAYOR GANANCIA.",
      "leaderboard.copy": "Mismo capital inicial. La mayor ganancia al final gana el premio; liquidado = DSQ. Premio y nombres de traders por anunciar.",
      "leaderboard.rank": "PLAZA",
      "leaderboard.participant": "TRADER",
      "leaderboard.role": "FORMATO",
      "leaderboard.missions": "CAPITAL",
      "leaderboard.action": "ESTADO",
      "leaderboard.score": "PROGRESO",
      "leaderboard.reward": "PREMIO",
      "creative-ai.kicker": "CIUDAD DE MÉXICO | CREA + DELEGA",
      "creative-ai.title": "NEGOCIO. CONTENIDO. AUTOMATIZACIÓN. INVERSIÓN.",
      "venue.kicker": "INTEGRACIÓN CON EL VENUE",
      "venue.definition": "Un flujo de experiencia propuesto para la noche. Las zonas son conceptuales hasta confirmar el inventario técnico del venue.",
      "venue.note": "Los invitados de AI Creative Club y la clientela habitual del venue pueden compartir el mismo entorno donde se acuerde. Es una capa de evento dentro del venue, no una burbuja cerrada.",
      "continuation.kicker": "ANTES / EN VIVO / DESPUÉS",
      "continuation.title": "QUÉ OPERA AXIS. QUÉ PROVEE EL VENUE.",
      "continuation.world": "ANTES",
      "continuation.before": "MONTAJE",
      "continuation.beforeCopy": "Acceso técnico · ensayo · prueba de sonido · ruteo de pantallas",
      "continuation.people": "EN VIVO",
      "continuation.live": "LA NOCHE",
      "continuation.liveCopy": "Contenido · agentes · blockchain · cultura",
      "continuation.systems": "DESPUÉS",
      "continuation.after": "DOCUMENTACIÓN",
      "continuation.afterCopy": "Contenido · material de recap · resumen de participación",
      "continuation.proof": "REQUERIDO",
      "continuation.screens": "SE REQUIERE INFRAESTRUCTURA DE PANTALLAS DEL VENUE",
      "close.kicker": "AI CREATIVE CLUB EN CASA LUMA",
      "close.budget": "LO QUE CUBRE EL PRESUPUESTO",
      "close.official": "PROGRAMACIÓN INDEPENDIENTE DE AI CREATIVE CLUB",
      "close.hospitality": "HOSPITALIDAD DE CORTESÍA",
      "close.hospitalityValue": "FINANCIADA POR AXIS",
    },
    zh: {
      "close.details": "详情",
      "nav.tournament": "交易比赛",
      "tournament.kicker": "交易锦标赛",
      "tournament.title": "相同资金。盈利最高者胜。",
      "tournament.live": "整晚直播，与活动同步进行",
      "tournament.start": "相同起始资金",
      "tournament.floor": "清算 = DSQ",
      "tournament.doors": "开门",
      "tournament.workshop": "工作坊",
      "tournament.afterParty": "课后派对",
      "tournament.finalBell": "终场钟声",
      "tournament.illustrative": "示意赛况",
      "tournament.standings": "实时排名",
      "tournament.profit": "盈利",
      "tournament.trader": "交易者",
      "tournament.tba": "奖品与交易者姓名待公布。",
      "tournament.r1t": "相同起点",
      "tournament.r1": "四位交易者以相同资金起步。",
      "tournament.r2t": "盈利最高者胜",
      "tournament.r2": "比赛结束时，盈利最高者赢得奖品。",
      "tournament.r3t": "清算 = DSQ",
      "tournament.r3": "账户被清算即当场取消资格。",
      "tournament.winner": "奖品",
      "tournament.dsq": "已清算 / DSQ",
      "sponsorship.per-brand": "每个赞助品牌",
      "nav.speakers": "讲者",
      "speakers.kicker": "讲者",
      "speakers.title": "两种实践，共同探索可能性。",
      "speakers.anana.role": "艺术与商业内容",
      "speakers.anana.copy": "以自己的业务为需求。创作与优化视觉内容、探索视频，为产品与商业传播保留实用素材。",
      "speakers.anana.result": "带走成果 / 一份实用视觉素材及其创作说明。",
      "speakers.sunshine.role": "智能体集成",
      "speakers.sunshine.copy": "自动化真实业务任务。组织输入与步骤、构建智能体与集成、检查执行，并保留可复用工作流。",
      "speakers.sunshine.result": "带走成果 / 已完成的任务与可复用工作流。",
      "nav.past-events": "往期活动",
      "past-events.kicker": "AXIS 往期活动",
      "past-events.title": "我们共同创造的体验。",
      "past-events.copy": "共享工具、现场演示、音乐与社区。回顾我们以往的聚会。",
      "past-events.photo-01": "相聚现场",
      "past-events.photo-02": "音乐",
      "past-events.photo-03": "交流",
      "past-events.photo-04": "社区",
      "past-events.photo-05": "现场演示",
      "past-events.photo-06": "讨论",
      "past-events.photo-07": "动手实践",
      "past-events.photo-08": "参与",
      "past-events.photo-09": "共同学习",
      "past-events.photo-10": "课后交流",
      "nav.axis-operates": "AXIS 负责什么",
      "creative-ai.host": "主办场地：CASA LUMA",
      "creative-ai.organizers": "ANANA / 业务内容 · SUNSHINE VENDETTA / 自动化与智能体",
      "workshop.asksLabel": "工作坊需要场地配合的事项",
      "workshop.runOfShow": "当晚流程",
      "workshop.phaseNightNote": "21:30 开始课后派对，另有 120 位宾客到场，再加上留下来的参与者。",
      "workshop.phaseNight": "派对环节",
      "workshop.phaseSeatedNote": "100 个座位；两个各 70 分钟的模块，另有准备、迭代与分享。",
      "workshop.phaseSeated": "坐式工作坊",
      "workshop.copy": "两个各 70 分钟的模块以自己的业务为起点：Anana 指导 AI 内容创作；Sunshine Vendetta 指导工作流自动化、智能体与集成。创作、迭代并展示可复用成果，之后探索如何将利润投入链上，不承诺回报。出席不等于完成。",
      "workshop.title": "创作。自动化。投资。",
      "workshop.kicker": "CREATIVE AI 社区活动",
      "event.afterParty": "派对环节",
      "event.seatedWorkshop": "坐式工作坊",
      "nav.workshop": "工作坊",
      "brand.artWeek": "AI CREATIVE CLUB · 2026年12月4日",
      "nav.idea": "理念",
      "nav.event": "活动",
      "nav.audience": "观众",
      "nav.event-format": "活动形式",
      "nav.how-it-works": "运作方式",
      "nav.experience-components": "体验模块",
      "nav.creative-ai-to-screen": "从 CREATIVE AI 到屏幕",
      "nav.leaderboard": "交易锦标赛",
      "nav.measurement": "衡量",
      "nav.activity-layer": "活动层",
      "nav.creative-ai": "CREATIVE AI",
      "nav.venue": "场地",
      "nav.production": "制作",
      "cover.poweredBy": "呈现方：AXIS",
      "idea.kicker": "理念",
      "loop.kicker": "工作坊如何进行",
      "loop.title": "从任务到成果。",
      "loop.hub": "动手实践",
      "loop.hubCopy": "带来一项真实任务，带走一个可以重复的成果。",
      "idea.title": "创作。自动化。投资。",
      "idea.human": "为你的业务，或为作为内容创作者的自己创作内容。",
      "idea.machine": "构建为你工作的智能体，自动化它们的工作流，获得更多收入。",
      "idea.public": "将业务利润投入链上。",
      "idea.copy": "创作商业内容，用 AI 智能体自动化工作流，将利润投入链上。",
      "idea.code": "自己的业务 -> AI 内容 -> 自动化与智能体 -> 链上投资。",
      "event.kicker": "活动",
      "event.attendees": "预计宾客",
      "event.status": "AI CREATIVE CLUB · 2026年12月4日 · CASA LUMA",
      "event.musicProgram": "现场节目",
      "event.mainRoom": "主厅阵容",
      "event.mainRoomLive": "现场交易锦标赛：4 位交易者，相同起始资金，盈利最高者获奖",
      "event.mainRoomClosing": "课后派对：工作坊之后的次要社交环节",
      "event.gallery": "画廊",
      "event.mainRoomCount": "比赛与课后派对",
      "event.galleryCount": "1 个空间",
      "event.galleryRow": "链上艺术 · 整晚",
      "event.digitalCount": "策展艺术家",
      "event.arcCreation": "创作",
      "event.arcClub": "自动化",
      "event.arcAllNight": "投资",
      "event.liveCodingName": "交易锦标赛",
      "event.liveCodingNote": "4 位交易者",
      "event.closingName": "课后派对",
      "event.closingNote": "工作坊之后的社交",
      "event.galleryName": "链上艺术",
      "event.galleryNote": "本地与国际艺术家与现场创作者",
      "event.digitalLineup": "链上艺术策展",
      "program.art": "艺术",
      "program.music": "课后派对",
      "program.technology": "技术",
      "program.culture": "文化",
      "program.hospitality": "款待",
      "program.missions": "活动",
      "program.creative-ai": "CREATIVE AI",
      "audience.kicker": "观众",
      "audience.title": "预计宾客。",
      "audience.copy": "艺术家、内容创作者、商家、创始人、开发者、收藏家，以及探索 AI、实用工作流和区块链的新参与者。",
      "audience.openCopy": "这是 AI Creative Club 的预计观众人数，而非场地的绝对容量。在双方同意的运营范围内，场地可以继续接待其常客，这些客人也可以发现并参与部分活动。",
      "audience.accessState": "目标受众",
      "leaderboard.kicker": "现场交易锦标赛",
      "leaderboard.title": "4 位交易者。盈利最高者胜。",
      "leaderboard.copy": "相同起始资金。结束时盈利最高者获奖；被清算 = DSQ。奖品与交易者姓名待公布。",
      "leaderboard.rank": "席位",
      "leaderboard.participant": "交易者",
      "leaderboard.role": "形式",
      "leaderboard.missions": "资金",
      "leaderboard.action": "状态",
      "leaderboard.score": "进度",
      "leaderboard.reward": "奖品",
      "creative-ai.kicker": "墨西哥城 | 创作 + 委托",
      "creative-ai.title": "业务。内容。自动化。投资。",
      "venue.kicker": "场地整合",
      "venue.definition": "这是当晚的体验流程提案。在确认场地技术清单之前，各区域仅为概念性安排。",
      "venue.note": "在双方同意的情况下，AI Creative Club 的宾客与场地常客可以共处同一空间。这是场地之内的一层活动，而不是封闭的孤立空间。",
      "continuation.kicker": "之前 / 现场 / 之后",
      "continuation.title": "AXIS 负责什么。场地提供什么。",
      "continuation.world": "之前",
      "continuation.before": "进场",
      "continuation.beforeCopy": "技术进入 · 彩排 · 试音 · 屏幕信号路由",
      "continuation.people": "现场",
      "continuation.live": "当晚",
      "continuation.liveCopy": "内容创作 · 智能体 · 区块链 · 文化",
      "continuation.systems": "之后",
      "continuation.after": "记录",
      "continuation.afterCopy": "内容 · 回顾素材 · 参与情况总结",
      "continuation.proof": "必需",
      "continuation.screens": "必须由场地提供显示设备",
      "close.kicker": "AI CREATIVE CLUB · CASA LUMA",
      "close.budget": "预算涵盖内容",
      "close.official": "AI CREATIVE CLUB 独立活动",
      "close.hospitality": "免费款待",
      "close.hospitalityValue": "由 AXIS 提供",
    },
  };

  TEXT.es["event.digitalLineup"] = "ARTE ONCHAIN";
  TEXT.zh["event.digitalLineup"] = "链上艺术";

  function normalize(value) {
    var lang = String(value || "").toLowerCase();
    if (lang.indexOf("zh") === 0) return "zh";
    if (lang.indexOf("es") === 0) return "es";
    if (lang.indexOf("en") === 0) return "en";
    return null;
  }

  function parentLanguage() {
    try {
      var url = window.parent && window.parent !== window ? new URL(window.parent.location.href) : new URL(window.location.href);
      return normalize(url.searchParams.get("lang"));
    } catch { return null; }
  }

  var originals = new WeakMap();
  var activeLanguage = "en";
  window.__aiCreativeClubGetLanguage = function () { return activeLanguage; };

  function translate(language) {
    var lang = normalize(language) || "en";
    activeLanguage = lang;
    document.documentElement.lang = lang === "zh" ? "zh-CN" : lang;
    document.querySelectorAll("[data-i18n]").forEach(function (element) {
      var key = element.dataset.i18n;
      if (!originals.has(element)) originals.set(element, element.textContent);
      var value = TEXT[lang] && TEXT[lang][key];
      element.textContent = value === undefined ? originals.get(element) : value;
    });
    document.querySelectorAll("#fr-language button").forEach(function (button) {
      button.setAttribute("aria-pressed", button.dataset.lang === lang ? "true" : "false");
    });
    window.dispatchEvent(new CustomEvent("axis:languagechange", { detail: { language: lang } }));
  }

  function injectControl() {
    if (window.parent && window.parent !== window) return;
    var control = document.createElement("div");
    control.id = "fr-language";
    control.setAttribute("aria-label", "Language");
    SUPPORTED.forEach(function (language) {
      var button = document.createElement("button");
      button.type = "button";
      button.dataset.lang = language;
      button.textContent = LABELS[language];
      button.addEventListener("click", function () {
        translate(language);
        try {
          var url = new URL(window.location.href);
          if (language === "en") url.searchParams.delete("lang");
          else url.searchParams.set("lang", language);
          window.history.replaceState(null, "", url.toString());
        } catch {}
      });
      control.appendChild(button);
    });
    document.body.appendChild(control);
  }

  var style = document.createElement("style");
  style.textContent = "#fr-language{position:fixed;z-index:110;top:12px;right:12px;display:flex;padding:3px;border:1px solid rgba(245,239,228,.25);background:rgba(0,0,0,.78);backdrop-filter:blur(10px)}#fr-language button{height:28px;min-width:35px;padding:0 8px;border:0;background:transparent;color:#C5B69C;font:600 10px/1 Bingo,sans-serif;cursor:pointer}#fr-language button[aria-pressed=true]{background:#C9A05B;color:#000000}";
  document.head.appendChild(style);
  injectControl();
  translate(parentLanguage() || normalize(document.documentElement.lang) || "en");

  window.addEventListener("message", function (event) {
    if (event.origin !== window.location.origin) return;
    var data = event.data || {};
    if (data.type !== "axis:language") return;
    var language = normalize(data.language);
    if (language && language !== activeLanguage) translate(language);
  });

  window.__aiCreativeClubSetLanguage = translate;
})();
