(function () {
  "use strict";

  var SUPPORTED = ["en", "es", "zh"];
  var LABELS = { en: "EN", es: "ES", zh: "中文" };
  var TEXT = {
    en: {},
    es: {
      "brand.techWeek": "EDICIÓN TECH WEEK MÉXICO",
      "nav.idea": "LA IDEA",
      "nav.event": "EL EVENTO",
      "nav.audience": "LA AUDIENCIA",
      "nav.event-format": "FORMATO DEL EVENTO",
      "nav.how-it-works": "CÓMO FUNCIONA",
      "nav.experience-components": "COMPONENTES",
      "nav.claude-to-screen": "DE CLAUDE A PANTALLA",
      "nav.leaderboard": "TABLERO EN VIVO",
      "nav.measurement": "MEDICIÓN",
      "nav.activity-layer": "CAPA DE ACTIVIDADES",
      "nav.claude": "CLAUDE",
      "nav.venue": "EL VENUE",
      "nav.production": "PRODUCCIÓN",
      "cover.poweredBy": "PRESENTADO POR: AXIS",
      "idea.kicker": "LA IDEA",
      "idea.title": "FUTURE RENAISSANCE ES UN SISTEMA VIVO.",
      "idea.human": "Con dirección humana.",
      "idea.machine": "Extensión inmersiva.",
      "idea.public": "Transformando la interacción del público.",
      "idea.copy": "Future Renaissance se inspira en la conexión del arte en el presente a través de la tecnología.",
      "idea.code": "Arte, música, tecnología, cultura, AI, código, comunidad, interacción operan como un solo entorno.",
      "event.kicker": "EL EVENTO",
      "event.attendees": "INVITADOS ESPERADOS",
      "event.status": "PRIMERA FIESTA OFICIAL DE LA COMUNIDAD ANTHROPIC CLAUDE AI · MEXICO TECH WEEK 2026",
      "event.mainRoom": "SALÓN PRINCIPAL",
      "event.cuartoRosa": "CUARTO ROSA",
      "event.mainRoomCount": "2 SETS",
      "event.cuartoRosaCount": "1 ACTIVIDAD",
      "event.digitalCount": "3 NOMBRES",
      "event.arcCreation": "CREACIÓN",
      "event.arcClub": "CLUB",
      "event.arcAllNight": "TODA LA NOCHE",
      "event.liveCodingName": "LIVE CODING ALGORÍTMICO",
      "event.liveCodingNote": "3 artistas",
      "event.closingName": "DJ DE CIERRE + DJ DE APOYO",
      "event.closingNote": "UK techno hacia techno",
      "event.sunoName": "MÚSICA GENERATIVA",
      "event.sunoNote": "Generative Music On Site en el segundo salón",
      "event.digitalLineup": "LINE UP DE ARTISTAS DIGITALES",
      "program.art": "ARTE",
      "program.music": "MÚSICA",
      "program.technology": "TECNOLOGÍA",
      "program.culture": "CULTURA",
      "program.hospitality": "HOSPITALIDAD",
      "program.missions": "ACTIVIDADES",
      "program.claude": "CLAUDE",
      "audience.kicker": "LA AUDIENCIA",
      "audience.title": "INVITADOS ESPERADOS.",
      "audience.copy": "Artistas, músicos, builders, fundadores, coleccionistas, curadores, creadores, medios, operadores e invitados culturales seleccionados.",
      "audience.openCopy": "Esta es la audiencia esperada de Future Renaissance, no el aforo total del venue. Donde se acuerde operativamente, el venue puede seguir recibiendo a su clientela habitual, y esos invitados pueden descubrir y participar en actividades seleccionadas.",
      "audience.accessState": "AUDIENCIA OBJETIVO",
      "leaderboard.kicker": "TABLERO EN VIVO",
      "leaderboard.title": "LA PARTICIPACIÓN SE VUELVE VISIBLE.",
      "leaderboard.rank": "POSICIÓN",
      "leaderboard.participant": "PARTICIPANTE",
      "leaderboard.role": "ROL",
      "leaderboard.missions": "ACTIVIDADES",
      "leaderboard.action": "ACCIÓN",
      "leaderboard.score": "PUNTAJE",
      "leaderboard.reward": "RECOMPENSA",
      "claude.kicker": "CLAUDE DE ANTHROPIC",
      "claude.title": "PRIMERA FIESTA OFICIAL DE LA COMUNIDAD ANTHROPIC CLAUDE AI.",
      "claude.flagship": "UN EVENTO INSIGNIA DE FUTURE RENAISSANCE IMPULSADO POR AXIS",
      "venue.kicker": "INTEGRACIÓN CON EL VENUE",
      "venue.definition": "Un flujo de experiencia propuesto para la noche. Las zonas son conceptuales hasta confirmar el inventario técnico del venue.",
      "venue.note": "Los invitados de Future Renaissance y la clientela habitual del venue pueden compartir el mismo entorno donde se acuerde. Es una capa de evento dentro del venue, no una burbuja cerrada.",
      "continuation.kicker": "ANTES / EN VIVO / DESPUÉS",
      "continuation.title": "QUÉ OPERA AXIS. QUÉ PROVEE EL VENUE.",
      "continuation.world": "ANTES",
      "continuation.before": "MONTAJE",
      "continuation.beforeCopy": "Acceso técnico · ensayo · prueba de sonido · ruteo de pantallas",
      "continuation.people": "EN VIVO",
      "continuation.live": "LA NOCHE",
      "continuation.liveCopy": "Programación · actividad Claude · live coding · hospitalidad",
      "continuation.systems": "DESPUÉS",
      "continuation.after": "DOCUMENTACIÓN",
      "continuation.afterCopy": "Contenido · material de recap · resumen de participación",
      "continuation.proof": "REQUERIDO",
      "continuation.screens": "SE REQUIERE INFRAESTRUCTURA DE PANTALLAS DEL VENUE",
      "close.kicker": "FUTURE RENAISSANCE EN BAR ORIENTE",
      "close.official": "PRIMERA FIESTA OFICIAL DE LA COMUNIDAD ANTHROPIC CLAUDE AI",
      "close.hospitality": "HOSPITALIDAD DE CORTESÍA",
      "close.hospitalityValue": "FINANCIADA POR AXIS",
    },
    zh: {
      "brand.techWeek": "墨西哥科技周特别版",
      "nav.idea": "理念",
      "nav.event": "活动",
      "nav.audience": "观众",
      "nav.event-format": "活动形式",
      "nav.how-it-works": "运作方式",
      "nav.experience-components": "体验模块",
      "nav.claude-to-screen": "从 CLAUDE 到屏幕",
      "nav.leaderboard": "实时排行榜",
      "nav.measurement": "衡量",
      "nav.activity-layer": "活动层",
      "nav.claude": "CLAUDE",
      "nav.venue": "场地",
      "nav.production": "制作",
      "cover.poweredBy": "呈现方：AXIS",
      "idea.kicker": "理念",
      "idea.title": "FUTURE RENAISSANCE 是一个活的系统。",
      "idea.human": "人类的方向。",
      "idea.machine": "机器的延伸。",
      "idea.public": "公共的转变。",
      "idea.copy": "文艺复兴连接了艺术、科学、建筑与公共知识。Future Renaissance 通过艺术家、机器与参与的宾客，呈现它们在当代的交汇。",
      "idea.code": "艺术、音乐、技术、文化、人工智能、代码、社区、互动、款待与媒体，作为一个整体环境运作。",
      "event.kicker": "活动",
      "event.attendees": "预计宾客",
      "event.status": "首个官方 ANTHROPIC CLAUDE AI 社区派对 · 墨西哥科技周 2026",
      "event.musicProgram": "音乐编排",
      "event.mainRoom": "主厅阵容",
      "event.mainRoomLive": "算法实时编码音乐创作 — 3 位艺术家以代码实时创作音乐，由 Claude 与 AXIS 策划",
      "event.mainRoomClosing": "闭场 DJ + 助阵 DJ — 英式铁克诺 / 铁克诺",
      "event.cuartoRosa": "CUARTO ROSA",
      "event.mainRoomCount": "2 组",
      "event.cuartoRosaCount": "1 项活动",
      "event.digitalCount": "3 位",
      "event.arcCreation": "创作",
      "event.arcClub": "俱乐部",
      "event.arcAllNight": "全场",
      "event.liveCodingName": "算法现场编程",
      "event.liveCodingNote": "3 位艺术家",
      "event.closingName": "收场 DJ + 支援 DJ",
      "event.closingNote": "从 UK techno 进入 techno",
      "event.sunoName": "生成式音乐",
      "event.sunoNote": "Generative Music On Site，于第二个房间呈现",
      "event.digitalLineup": "数字艺术家阵容",
      "program.art": "艺术",
      "program.music": "音乐",
      "program.technology": "技术",
      "program.culture": "文化",
      "program.hospitality": "款待",
      "program.missions": "活动",
      "program.claude": "CLAUDE",
      "audience.kicker": "观众",
      "audience.title": "预计宾客。",
      "audience.copy": "艺术家、音乐人、开发者、创始人、收藏家、策展人、创作者、媒体、运营者与受邀的文化嘉宾。",
      "audience.openCopy": "这是 Future Renaissance 的预计观众人数，而非场地的绝对容量。在双方同意的运营范围内，场地可以继续接待其常客，这些客人也可以发现并参与部分活动。",
      "audience.accessState": "目标受众",
      "leaderboard.kicker": "实时排行榜",
      "leaderboard.title": "参与变得可见。",
      "leaderboard.rank": "排名",
      "leaderboard.participant": "参与者",
      "leaderboard.role": "角色",
      "leaderboard.missions": "活动",
      "leaderboard.action": "行动",
      "leaderboard.score": "分数",
      "leaderboard.reward": "奖励",
      "claude.kicker": "CLAUDE BY ANTHROPIC",
      "claude.title": "首个官方 ANTHROPIC CLAUDE AI 社区派对。",
      "claude.flagship": "由 AXIS 呈现的 FUTURE RENAISSANCE 旗舰活动",
      "venue.kicker": "场地整合",
      "venue.definition": "这是当晚的体验流程提案。在确认场地技术清单之前，各区域仅为概念性安排。",
      "venue.note": "在双方同意的情况下，Future Renaissance 的宾客与场地常客可以共处同一空间。这是场地之内的一层活动，而不是封闭的孤立空间。",
      "continuation.kicker": "之前 / 现场 / 之后",
      "continuation.title": "AXIS 负责什么。场地提供什么。",
      "continuation.world": "之前",
      "continuation.before": "进场",
      "continuation.beforeCopy": "技术进入 · 彩排 · 试音 · 屏幕信号路由",
      "continuation.people": "现场",
      "continuation.live": "当晚",
      "continuation.liveCopy": "节目编排 · Claude 活动 · 实时编程 · 款待",
      "continuation.systems": "之后",
      "continuation.after": "记录",
      "continuation.afterCopy": "内容 · 回顾素材 · 参与情况总结",
      "continuation.proof": "必需",
      "continuation.screens": "必须由场地提供显示设备",
      "close.kicker": "FUTURE RENAISSANCE · BAR ORIENTE",
      "close.official": "首个官方 ANTHROPIC CLAUDE AI 社区派对",
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
  window.__futureRenaissanceGetLanguage = function () { return activeLanguage; };

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
  style.textContent = "#fr-language{position:fixed;z-index:110;top:12px;right:12px;display:flex;padding:3px;border:1px solid rgba(241,226,200,.25);background:rgba(4,27,51,.78);backdrop-filter:blur(10px)}#fr-language button{height:28px;min-width:35px;padding:0 8px;border:0;background:transparent;color:#7F9676;font:600 10px/1 Bingo,sans-serif;cursor:pointer}#fr-language button[aria-pressed=true]{background:#D4AA67;color:#041B33}";
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

  window.__futureRenaissanceSetLanguage = translate;
})();
