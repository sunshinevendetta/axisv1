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
      "nav.program": "EL PROGRAMA",
      "nav.roles": "ROLES Y ACCESO",
      "nav.missions": "PASAPORTE DE MISIONES",
      "nav.function": "FUNCIÓN DE MARCA",
      "nav.leaderboard": "TABLERO EN VIVO",
      "nav.measurement": "MEDICIÓN",
      "nav.eventPartner": "EVENT PARTNER",
      "nav.presenting": "PRESENTING PRODUCT",
      "nav.signature": "EXPERIENCIA FIRMA",
      "nav.continuation": "ANTES / EN VIVO / DESPUÉS",
      "idea.kicker": "LA IDEA",
      "idea.title": "FUTURE RENAISSANCE ES UN SISTEMA VIVO.",
      "idea.human": "Dirección humana.",
      "idea.machine": "Extensión de la máquina.",
      "idea.public": "Transformación pública.",
      "idea.copy": "El Renacimiento conectó arte, ciencia, arquitectura y conocimiento público. Future Renaissance escenifica su convergencia contemporánea a través de artistas, máquinas e invitados participantes.",
      "event.kicker": "EL EVENTO",
      "event.attendees": "ASISTENTES",
      "event.musicCuration": "CURADURÍA MUSICAL / RITMOS DE LA NOCHE",
      "audience.kicker": "LA AUDIENCIA",
      "audience.title": "INVITADOS SELECCIONADOS.",
      "audience.copy": "Artistas, músicos, builders, founders, coleccionistas, curadores, creadores, medios, operadores e invitados culturales seleccionados.",
      "audience.accessState": "ROL / ACCESO / AUTORIDAD",
      "program.kicker": "EL PROGRAMA",
      "program.title": "EL ARTE ES LA INTERFAZ.",
      "program.copy": "Una sola noche donde la cultura en vivo, el espacio y el sistema de misiones operan como un entorno diseñado.",
      "program.art": "ARTE",
      "program.music": "MÚSICA",
      "program.technology": "TECNOLOGÍA",
      "program.culture": "CULTURA",
      "program.hospitality": "HOSPITALIDAD",
      "program.missions": "MISIONES",
      "program.livestream": "TRANSMISIÓN EN VIVO",
      "program.gallery": "GALERÍA / OBRAS DIGITALES",
      "program.liveSystems": "SISTEMAS EN VIVO",
      "program.mapping": "LED 12 M / VIDEO MAPPING",
      "program.hospitalityDetail": "CERVEZA + CANAPÉS",
      "program.function": "FUNCIÓN DEFINIDA",
      "program.rewardLogic": "ACCIÓN / RECOMPENSA / PRUEBA",
      "program.media": "MEDIOS / DOCUMENTACIÓN",
      "roles.kicker": "SISTEMA DE ROL + ACCESO",
      "roles.title": "CADA PARTICIPANTE ENTRA CON UN ESTADO LEGIBLE.",
      "roles.copy": "Rol, acceso y autoridad se vuelven visibles antes de que comience la primera misión.",
      "roles.state": "ESTADO EN VIVO",
      "mission.kicker": "PASAPORTE DE MISIONES",
      "mission.titleA": "COMPLETA LAS MISIONES.",
      "mission.titleB": "CAMBIA EL ESPACIO.",
      "mission.trigger": "DISPARADOR",
      "mission.action": "ACCIÓN",
      "mission.consequence": "CONSECUENCIA",
      "mission.reward": "RECOMPENSA",
      "mission.measurement": "MEDICIÓN",
      "mission.note": "Una misión activa recibe una señal en vivo. Una misión verificada recibe el estado de estrella dorada.",
      "function.kicker": "SE CONVIERTE EN UNA FUNCIÓN",
      "function.title": "TU PRODUCTO SE VUELVE PARTE DE LA NOCHE.",
      "function.rule": "UNA [brand]. UNA FUNCIÓN. UN COMPORTAMIENTO MEDIBLE.",
      "function.defined": "FUNCIÓN DEFINIDA DEL EVENTO",
      "function.requiredActions": "ACCIONES [brand] REQUERIDAS",
      "leaderboard.kicker": "TABLERO EN VIVO",
      "leaderboard.title": "LA PARTICIPACIÓN SE VUELVE VISIBLE.",
      "leaderboard.synthetic": "DATOS SINTÉTICOS DE DEMOSTRACIÓN",
      "leaderboard.rank": "RANGO",
      "leaderboard.participant": "PARTICIPANTE",
      "leaderboard.role": "ROL",
      "leaderboard.missions": "MISIONES",
      "leaderboard.score": "PUNTAJE",
      "leaderboard.reward": "RECOMPENSA",
      "leaderboard.caption": "Demostración sintética de participación en vivo",
      "measurement.kicker": "MEDICIÓN",
      "measurement.title": "CADA ACCIÓN SE CONVIERTE EN PRUEBA.",
      "measurement.verified": "ACCIONES [brand] REQUERIDAS",
      "measurement.live": "SEGUIMIENTO VERIFICADO EN VIVO",
      "measurement.coverage": "COBERTURA DE MISIÓN DISEÑADA",
      "measurement.report": "REPORTE DE COHORTE POST-EVENTO",
      "measurement.rewards": "CANJES DE RECOMPENSA",
      "measurement.content": "SALIDAS DE CONTENIDO",
      "measurement.primary": "MÉTRICAS PRIMARIAS",
      "measurement.primaryList": "Asistencia · Tasa de misión completada · Acciones calificadas · Conversión por etapa · Canje de recompensa",
      "measurement.secondary": "MÉTRICAS FINANCIERAS POST-EVENTO",
      "measurement.note": "Las métricas financieras secundarias se calculan después del evento a partir de resultados verificados cuando los datos económicos del patrocinador lo permiten.",
      "partner.kicker": "INVERSIÓN DEL PATROCINADOR",
      "partner.title": "EVENT PARTNER",
      "partner.proposition": "Una activación completa de [brand] para el evento Future Renaissance de 120 personas.",
      "partner.core": "SISTEMA COMPLETO DE ACTIVACIÓN",
      "partner.n1": "COHORTE DE 120 PERSONAS",
      "partner.n1s": "UNA FUNCIÓN DEFINIDA",
      "partner.n2": "MISIÓN REQUERIDA",
      "partner.n2s": "UX DE MISIÓN + DISEÑO DE RECOMPENSA",
      "partner.n3": "VALIDACIÓN",
      "partner.n3s": "EJECUCIÓN DEL STAFF + USO DE PRODUCTO",
      "partner.n4": "SISTEMAS DEL EVENTO",
      "partner.n4s": "INTEGRACIÓN EN PANTALLA + TRANSMISIÓN",
      "partner.n5": "CAPTURA DE MEDIOS",
      "partner.n5s": "FOTOGRAFÍA + VIDEO + DOCUMENTACIÓN",
      "partner.n6": "PRUEBA",
      "partner.n6s": "MEDICIÓN EN VIVO + REPORTE POST-EVENTO",
      "presenting.exclusive": "EXCLUSIVE PRESENTING PRODUCT",
      "presenting.title": "SE VUELVE UNA PARTE FIRMA DE FUTURE RENAISSANCE.",
      "presenting.position": "POSICIÓN",
      "presenting.signature": "EXPERIENCIA\nDE PRODUCTO\nFIRMA",
      "presenting.includes": "TODO LO INCLUIDO EN EVENT PARTNER",
      "presenting.listA": "EXCLUSIVIDAD DE CATEGORÍA · MISIÓN HERO [brand] · INTEGRACIÓN PRIORITARIA",
      "presenting.listB": "MEDIOS DEDICADOS · CONTINUACIÓN DE 30 DÍAS · UNA ACTIVACIÓN AXIS ADICIONAL · REPORTE EXTENDIDO",
      "signature.kicker": "SIGNATURE PRODUCT EXPERIENCE",
      "signature.title": "EL PRESENTING PRODUCT SE CONVIERTE EN UNA FIRMA.",
      "signature.definition": "AXIS crea una expresión específica de [brand] que los invitados usan, consumen, visten, coleccionan, activan, desbloquean, crean o experimentan dentro de Future Renaissance.",
      "signature.example": "DEMOSTRACIÓN DE CONCEPTO",
      "signature.serve": "Expresión firma de Future Renaissance por [brand]",
      "signature.serveType": "SERVICIO FIRMA",
      "signature.object": "OBJETO LIMITADO",
      "signature.ritual": "RITUAL DE PRODUCTO",
      "signature.creation": "CREACIÓN IMPULSADA POR PRODUCTO",
      "signature.edition": "EDICIÓN DEL EVENTO",
      "signature.reward": "RECOMPENSA NOMBRADA",
      "signature.note": "La expresión se diseña para la categoría del patrocinador. Es un marco de posibilidades, no un compromiso preseleccionado.",
      "continuation.kicker": "ANTES / EN VIVO / DESPUÉS",
      "continuation.title": "LA RELACIÓN SE MUEVE A TRAVÉS DEL TIEMPO.",
      "continuation.world": "MUNDO",
      "continuation.people": "PERSONAS",
      "continuation.systems": "SISTEMAS",
      "continuation.proof": "PRUEBA",
      "continuation.before": "ANTES",
      "continuation.live": "EN VIVO",
      "continuation.after": "DESPUÉS",
      "continuation.beforeCopy": "Diseño de activación · UX de misión · sistema de recompensa",
      "continuation.liveCopy": "Acción requerida · uso de producto · medios · medición",
      "continuation.afterCopy": "Contenido · reporte · análisis verificado",
      "continuation.presentingOnly": "SOLO PRESENTING PRODUCT · CONTINUACIÓN + UNA ACTIVACIÓN AXIS MENOR",
      "continuation.eventPartner": "FUTURE RENAISSANCE · ACTIVACIÓN EN VIVO · MEDIOS · MEDICIÓN · REPORTE",
      "continuation.presentingProduct": "FUTURE RENAISSANCE + CONTINUACIÓN DE 30 DÍAS + 1 ACTIVACIÓN AXIS MENOR ADICIONAL",
      "close.kicker": "INVERSIÓN + CIERRE",
      "close.rewards": "RECOMPENSAS",
      "close.operations": "OPERACIONES",
      "close.media": "CAPTURA DE MEDIOS",
      "close.integration": "INTEGRACIÓN"
    },
    zh: {
      "brand.techWeek": "墨西哥科技周特别版",
      "nav.idea": "理念",
      "nav.event": "活动",
      "nav.audience": "观众",
      "nav.program": "节目",
      "nav.roles": "角色与权限",
      "nav.missions": "任务护照",
      "nav.function": "品牌功能",
      "nav.leaderboard": "实时排行榜",
      "nav.measurement": "衡量",
      "nav.eventPartner": "活动合作伙伴",
      "nav.presenting": "独家呈现产品",
      "nav.signature": "标志性产品体验",
      "nav.continuation": "之前 / 现场 / 之后",
      "idea.kicker": "理念",
      "idea.title": "未来文艺复兴是一个实时系统。",
      "idea.human": "人类引导。",
      "idea.machine": "机器延伸。",
      "idea.public": "公共转化。",
      "idea.copy": "文艺复兴连接了艺术、科学、建筑与公共知识。未来文艺复兴通过艺术家、机器和参与式来宾，呈现它们在当代的汇合。",
      "event.kicker": "活动",
      "event.attendees": "参与者",
      "event.musicCuration": "音乐策划 / RITMOS DE LA NOCHE",
      "audience.kicker": "观众",
      "audience.title": "精选来宾。",
      "audience.copy": "艺术家、音乐人、建设者、创始人、收藏家、策展人、创作者、媒体、运营者及精选文化来宾。",
      "audience.accessState": "角色 / 权限 / 授权",
      "program.kicker": "节目",
      "program.title": "艺术即界面。",
      "program.copy": "在同一个夜晚，现场文化、空间和任务系统共同构成一个完整的策划环境。",
      "program.art": "艺术",
      "program.music": "音乐",
      "program.technology": "科技",
      "program.culture": "文化",
      "program.hospitality": "款待",
      "program.missions": "任务",
      "program.livestream": "直播",
      "program.gallery": "画廊 / 数字作品",
      "program.liveSystems": "实时系统",
      "program.mapping": "12 米 LED / 影像映射",
      "program.hospitalityDetail": "啤酒 + 小食",
      "program.function": "明确功能",
      "program.rewardLogic": "行动 / 奖励 / 证明",
      "program.media": "媒体 / 记录",
      "roles.kicker": "角色 + 权限系统",
      "roles.title": "每位参与者都以清晰的身份进入。",
      "roles.copy": "在第一个任务开始前，角色、权限和授权就清晰可见。",
      "roles.state": "实时状态",
      "mission.kicker": "任务护照",
      "mission.titleA": "完成任务。",
      "mission.titleB": "改变现场。",
      "mission.trigger": "触发",
      "mission.action": "行动",
      "mission.consequence": "结果",
      "mission.reward": "奖励",
      "mission.measurement": "衡量",
      "mission.note": "进行中的任务获得实时信号；已验证任务获得金星状态。",
      "function.kicker": "成为一种功能",
      "function.title": "你的产品成为夜晚的一部分。",
      "function.rule": "一个 [brand]。一个功能。一种可衡量行为。",
      "function.defined": "明确的活动功能",
      "function.requiredActions": "必需的 [brand] 行动",
      "leaderboard.kicker": "实时排行榜",
      "leaderboard.title": "参与变得可见。",
      "leaderboard.synthetic": "合成演示数据",
      "leaderboard.rank": "排名",
      "leaderboard.participant": "参与者",
      "leaderboard.role": "角色",
      "leaderboard.missions": "任务",
      "leaderboard.score": "分数",
      "leaderboard.reward": "奖励",
      "leaderboard.caption": "实时参与的合成演示",
      "measurement.kicker": "衡量",
      "measurement.title": "每个行动都成为证明。",
      "measurement.verified": "必需的 [brand] 行动",
      "measurement.live": "实时验证追踪",
      "measurement.coverage": "设计任务覆盖率",
      "measurement.report": "活动后群组报告",
      "measurement.rewards": "奖励兑换",
      "measurement.content": "内容产出",
      "measurement.primary": "主要指标",
      "measurement.primaryList": "出席 · 任务完成率 · 有效行动 · 阶段转化 · 奖励兑换",
      "measurement.secondary": "活动后财务指标",
      "measurement.note": "当品牌方经济数据支持时，次级财务指标将在活动后根据验证结果计算。",
      "partner.kicker": "赞助投入",
      "partner.title": "活动合作伙伴",
      "partner.proposition": "覆盖整个 120 人 Future Renaissance 活动的完整 [brand] 激活。",
      "partner.core": "完整激活系统",
      "partner.n1": "120 人参与群组",
      "partner.n1s": "一个明确功能",
      "partner.n2": "必需任务",
      "partner.n2s": "任务体验 + 奖励设计",
      "partner.n3": "验证",
      "partner.n3s": "工作人员执行 + 产品使用",
      "partner.n4": "活动系统",
      "partner.n4s": "屏幕 + 直播整合",
      "partner.n5": "媒体采集",
      "partner.n5s": "摄影 + 视频 + 记录",
      "partner.n6": "证明",
      "partner.n6s": "实时衡量 + 活动后报告",
      "presenting.exclusive": "独家呈现产品",
      "presenting.title": "成为 FUTURE RENAISSANCE 的标志性组成部分。",
      "presenting.position": "席位",
      "presenting.signature": "标志性\n产品\n体验",
      "presenting.includes": "包含活动合作伙伴的全部权益",
      "presenting.listA": "品类独家 · 核心 [brand] 任务 · 优先整合",
      "presenting.listB": "专属产品媒体 · 30 天延续 · 一次额外 AXIS 激活 · 延展报告",
      "signature.kicker": "标志性产品体验",
      "signature.title": "呈现产品成为一个标志。",
      "signature.definition": "AXIS 为 [brand] 创作一种活动专属表达，让来宾在 Future Renaissance 中使用、品尝、穿戴、收藏、激活、解锁、创作或互动。",
      "signature.example": "概念演示",
      "signature.serve": "由 [brand] 呈现的 Future Renaissance 标志性表达",
      "signature.serveType": "标志性饮品",
      "signature.object": "限量物件",
      "signature.ritual": "产品仪式",
      "signature.creation": "产品驱动创作",
      "signature.edition": "活动限定版",
      "signature.reward": "命名奖励",
      "signature.note": "表达将针对赞助品类进行创作；这是可能性框架，并非预设承诺。",
      "continuation.kicker": "之前 / 现场 / 之后",
      "continuation.title": "合作关系随时间延展。",
      "continuation.world": "世界",
      "continuation.people": "人群",
      "continuation.systems": "系统",
      "continuation.proof": "证明",
      "continuation.before": "之前",
      "continuation.live": "现场",
      "continuation.after": "之后",
      "continuation.beforeCopy": "激活设计 · 任务体验 · 奖励系统",
      "continuation.liveCopy": "必需行动 · 产品使用 · 媒体 · 衡量",
      "continuation.afterCopy": "内容 · 报告 · 验证分析",
      "continuation.presentingOnly": "仅呈现产品 · 延续 + 一次较小 AXIS 激活",
      "continuation.eventPartner": "FUTURE RENAISSANCE · 现场激活 · 媒体 · 衡量 · 报告",
      "continuation.presentingProduct": "FUTURE RENAISSANCE + 30 天延续 + 1 次额外 AXIS 激活",
      "close.kicker": "投入 + 收束",
      "close.rewards": "奖励",
      "close.operations": "运营",
      "close.media": "媒体采集",
      "close.integration": "整合"
    }
  };

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
  style.textContent = "#fr-language{position:fixed;z-index:110;top:12px;right:12px;display:flex;padding:3px;border:1px solid rgba(241,226,200,.25);background:rgba(4,27,51,.78);backdrop-filter:blur(10px)}#fr-language button{height:28px;min-width:35px;padding:0 8px;border:0;background:transparent;color:#7F9676;font:600 10px/1 Consolas,monospace;cursor:pointer}#fr-language button[aria-pressed=true]{background:#D4AA67;color:#041B33}";
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
