(function () {
  "use strict";

  var SUPPORTED = ["en", "es", "zh"];
  var LABELS = { en: "EN", es: "ES", zh: "中文" };
  var TEXT = {
    en: {},
    es: {
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
      "creative-ai.organizers": "CONTENIDO CON ANANA / FLUJOS DE IA CON SUNSHINE VENDETTA",
      "workshop.asksLabel": "LO QUE EL WORKSHOP NECESITA DEL VENUE",
      "workshop.runOfShow": "ORDEN DE LA NOCHE",
      "workshop.phaseNightNote": "La pista abre a las 21:00 para 120 invitados más, además de los asistentes que se quedan.",
      "workshop.phaseNight": "AFTER PARTY",
      "workshop.phaseSeatedNote": "100 lugares; dos módulos de 70 minutos, más preparación, iteración y puesta en común.",
      "workshop.phaseSeated": "WORKSHOP SENTADO",
      "workshop.copy": "Anana: 70 minutos de contenido para arte y negocio, de imagen base con GPT image a edición en Midjourney y extensión a video. Sunshine Vendetta: 70 minutos de flujos estructurados con GPT/Claude e integración ElizaOS. Acción, iteración, evidencia y recursos para llevar; asistir no equivale a completar. Conversación complementaria sobre inversión blockchain, sin recomendaciones ni promesas; no se requiere wallet.",
      "workshop.title": "CREA CONTENIDO. HAZ QUE LA IA TRABAJE.",
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
      "nav.leaderboard": "TABLERO EN VIVO",
      "nav.measurement": "MEDICIÓN",
      "nav.activity-layer": "CAPA DE ACTIVIDADES",
      "nav.creative-ai": "CREATIVE AI",
      "nav.venue": "EL VENUE",
      "nav.production": "PRODUCCIÓN",
      "cover.poweredBy": "PRESENTADO POR: AXIS",
      "idea.kicker": "LA IDEA",
      "idea.title": "CREA. DELEGA. LLÉVATE EL RESULTADO.",
      "idea.human": "Arte y contenido de negocio.",
      "idea.machine": "Agentes y flujos útiles.",
      "idea.public": "Inversión blockchain: fundamentos.",
      "idea.copy": "AI Creative Club reúne práctica creativa, herramientas de IA y comunidad: crear, iterar, demostrar y llevarse un flujo reutilizable.",
      "idea.code": "Arte, música, tecnología, cultura, AI, código, comunidad, interacción operan como un solo entorno.",
      "event.kicker": "EL EVENTO",
      "event.attendees": "INVITADOS ESPERADOS",
      "event.status": "AI CREATIVE CLUB · 4 DE DICIEMBRE DE 2026 · CASA LUMA",
      "event.mainRoom": "SALÓN PRINCIPAL",
      "event.gallery": "LA GALERÍA",
      "event.mainRoomCount": "2 SETS",
      "event.galleryCount": "1 ESPACIO",
      "event.digitalCount": "3 NOMBRES",
      "event.arcCreation": "CREACIÓN",
      "event.arcClub": "CLUB",
      "event.arcAllNight": "TODA LA NOCHE",
      "event.liveCodingName": "LIVE CODING ALGORÍTMICO",
      "event.liveCodingNote": "3 artistas",
      "event.closingName": "DJ DE CIERRE + DJ DE APOYO",
      "event.closingNote": "UK techno hacia techno",
      "event.galleryName": "ARTE DIGITAL",
      "event.galleryNote": "Obras digitales curadas dentro del espacio",
      "event.digitalLineup": "LINE UP DE ARTISTAS DIGITALES",
      "program.art": "ARTE",
      "program.music": "MÚSICA",
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
      "leaderboard.kicker": "DEMO DE PARTICIPACIÓN",
      "leaderboard.title": "LA PARTICIPACIÓN SE VUELVE VISIBLE.",
      "leaderboard.rank": "POSICIÓN",
      "leaderboard.participant": "PARTICIPANTE",
      "leaderboard.role": "ROL",
      "leaderboard.missions": "ACTIVIDADES",
      "leaderboard.action": "ACCIÓN",
      "leaderboard.score": "PUNTAJE",
      "leaderboard.reward": "RECOMPENSA",
      "creative-ai.kicker": "CIUDAD DE MÉXICO | CREA + DELEGA",
      "creative-ai.title": "ARTE. NEGOCIO. AGENTES.",
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
      "close.official": "PROGRAMACIÓN INDEPENDIENTE DE AI CREATIVE CLUB",
      "close.hospitality": "HOSPITALIDAD DE CORTESÍA",
      "close.hospitalityValue": "FINANCIADA POR AXIS",
    },
    zh: {
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
      "creative-ai.organizers": "Anana 内容创作 / Sunshine Vendetta AI 工作流",
      "workshop.asksLabel": "工作坊需要场地配合的事项",
      "workshop.runOfShow": "当晚流程",
      "workshop.phaseNightNote": "21:00 开放舞池，另有 120 位宾客到场，再加上留下来的参与者。",
      "workshop.phaseNight": "派对环节",
      "workshop.phaseSeatedNote": "100 个座位；两个各 70 分钟的模块，另有准备、迭代与分享。",
      "workshop.phaseSeated": "坐式工作坊",
      "workshop.copy": "Anana：70 分钟艺术与商业内容创作，从 GPT image 基础图像到 Midjourney 编辑及视频延展。Sunshine Vendetta：70 分钟 GPT/Claude 结构化工作流与 ElizaOS 集成。行动、迭代、成果证明与课后资源；出席不等于完成。另有区块链投资素养讨论，不提供建议或收益承诺，无需钱包。",
      "workshop.title": "创作内容。让 AI 工作。",
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
      "nav.leaderboard": "实时排行榜",
      "nav.measurement": "衡量",
      "nav.activity-layer": "活动层",
      "nav.creative-ai": "CREATIVE AI",
      "nav.venue": "场地",
      "nav.production": "制作",
      "cover.poweredBy": "呈现方：AXIS",
      "idea.kicker": "理念",
      "idea.title": "创作。委托。带走成果。",
      "idea.human": "艺术与商业内容。",
      "idea.machine": "智能体与实用工作流。",
      "idea.public": "区块链投资基础。",
      "idea.copy": "AI Creative Club 连接创作实践、AI 工具与社区：创作、迭代、展示成果，并带走可复用工作流。",
      "idea.code": "艺术、音乐、技术、文化、人工智能、代码、社区、互动、款待与媒体，作为一个整体环境运作。",
      "event.kicker": "活动",
      "event.attendees": "预计宾客",
      "event.status": "AI CREATIVE CLUB · 2026年12月4日 · CASA LUMA",
      "event.musicProgram": "音乐编排",
      "event.mainRoom": "主厅阵容",
      "event.mainRoomLive": "算法实时编码音乐创作 — 3 位艺术家以代码实时创作音乐，由 AXIS 策划",
      "event.mainRoomClosing": "闭场 DJ + 助阵 DJ — 英式铁克诺 / 铁克诺",
      "event.gallery": "画廊",
      "event.mainRoomCount": "2 组",
      "event.galleryCount": "1 个空间",
      "event.digitalCount": "3 位",
      "event.arcCreation": "创作",
      "event.arcClub": "俱乐部",
      "event.arcAllNight": "全场",
      "event.liveCodingName": "算法现场编程",
      "event.liveCodingNote": "3 位艺术家",
      "event.closingName": "收场 DJ + 支援 DJ",
      "event.closingNote": "从 UK techno 进入 techno",
      "event.galleryName": "数字艺术",
      "event.galleryNote": "数字作品经过策划融入该空间",
      "event.digitalLineup": "数字艺术家阵容",
      "program.art": "艺术",
      "program.music": "音乐",
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
      "leaderboard.kicker": "参与记录演示",
      "leaderboard.title": "参与变得可见。",
      "leaderboard.rank": "排名",
      "leaderboard.participant": "参与者",
      "leaderboard.role": "角色",
      "leaderboard.missions": "活动",
      "leaderboard.action": "行动",
      "leaderboard.score": "分数",
      "leaderboard.reward": "奖励",
      "creative-ai.kicker": "墨西哥城 | 创作 + 委托",
      "creative-ai.title": "艺术。商业。智能体。",
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
      "close.official": "AI CREATIVE CLUB 独立活动",
      "close.hospitality": "免费款待",
      "close.hospitalityValue": "由 AXIS 提供",
    },
  };

  TEXT.es["event.digitalLineup"] = "ARTE DIGITAL";
  TEXT.zh["event.digitalLineup"] = "数字艺术";

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
  style.textContent = "#fr-language{position:fixed;z-index:110;top:12px;right:12px;display:flex;padding:3px;border:1px solid rgba(245,239,228,.25);background:rgba(0,0,0,.78);backdrop-filter:blur(10px)}#fr-language button{height:28px;min-width:35px;padding:0 8px;border:0;background:transparent;color:#C5B69C;font:600 10px/1 'Club Numerals','Afterglow Regular',serif;cursor:pointer}#fr-language button[aria-pressed=true]{background:#C9A05B;color:#000000}";
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
