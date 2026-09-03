(function () {
  "use strict";

  var SUPPORTED = ["en", "es", "zh"];
  var LABELS = { en: "EN", es: "ES", zh: "中文" };
  var TEXT = {
    en: {},
    es: {
      "nav.proposition": "LA PROPUESTA",
      "nav.claude": "FIESTA OFICIAL DE CLAUDE",
      "nav.system": "EL SISTEMA FUTURE RENAISSANCE",
      "nav.guestFlow": "FLUJO DEL INVITADO",
      "nav.brandFunction": "FUNCIÓN DE MARCA",
      "nav.crossWeek": "PARTICIPACIÓN SEMANAL",
      "nav.measurement": "MEDICIÓN",
      "proposition.kicker": "LA PROPUESTA",
      "system.kicker": "EL SISTEMA FUTURE RENAISSANCE",
      "system.art": "ARTE",
      "system.music": "MÚSICA",
      "system.technology": "TECNOLOGÍA",
      "system.culture": "CULTURA",
      "system.hospitality": "HOSPITALIDAD",
      "system.missions": "MISIONES",
      "system.media": "MEDIOS",
      "system.participation": "PARTICIPACIÓN",
      "guestFlow.kicker": "PASAPORTE DE MISIONES",
      "guestFlow.title": "LA PARTICIPACIÓN AVANZA POR UN CAMINO LEGIBLE.",
      "guestFlow.copy": "El sistema conecta entrada, interacción de producto, validación, recompensas y reporte en un viaje continuo.",
      "flow.register": "REGISTRAR",
      "flow.check-in": "CHECK-IN",
      "flow.act": "ACTUAR",
      "flow.validate": "VALIDAR",
      "flow.unlock": "DESBLOQUEAR",
      "flow.progress": "AVANZAR",
      "flow.collect": "COLECCIONAR",
      "flow.report": "REPORTAR",
      "guestFlow.ruleA": "UNA ACCIÓN SE VUELVE VISIBLE.",
      "guestFlow.ruleB": "UNA RECOMPENSA SE GANA.",
      "guestFlow.ruleC": "UN RESULTADO SE PUEDE REPORTAR.",
      "brandFunction.kicker": "FUNCIÓN DE MARCA",
      "brandFunction.title": "UN PRODUCTO. UNA FUNCIÓN. UN COMPORTAMIENTO MEDIBLE.",
      "brandFunction.copy": "El sponsor no compra colocación decorativa. Su producto posee una función útil y distinta dentro del sistema de misiones.",
      "brandFunction.noLogoWall": "NO SIETE LOGOS CRIPTO GENÉRICOS.",
      "brandFunction.distinctFunctions": "SIETE FUNCIONES DIFERENTES CON RESULTADOS MEDIBLES DISTINTOS.",
      "crossWeek.kicker": "PARTICIPACIÓN SEMANAL",
      "crossWeek.title": "UNA ACCIÓN DE SPONSOR PUEDE CRECER DURANTE LA SEMANA.",
      "crossWeek.copy": "Una arquitectura central puede persistir entre audiencias y adaptar su expresión a cada House.",
      "crossWeek.note": "RUTA DE EJEMPLO · CADA VIAJE SE DISEÑA ALREDEDOR DEL PRODUCTO.",
      "measurement.kicker": "MEDICIÓN",
      "measurement.title": "PRIMERO LA EVIDENCIA. MODELOS FINANCIEROS SOLO CUANDO LOS DATOS LOS RESPALDAN.",
      "measurement.verified": "VERIFICADO POR EL SISTEMA AXIS",
      "measurement.note": "SIN PROMESAS DE CONVERSIÓN FABRICADAS. EL REPORTE SEPARA ACCIONES OBSERVADAS DE RESULTADOS CALCULADOS.",
      "metrics.attendance": "ASISTENCIA",
      "metrics.mission-completion": "MISIONES COMPLETADAS",
      "metrics.qualified-actions": "ACCIONES CALIFICADAS",
      "metrics.stage-conversion": "CONVERSIÓN POR ETAPA",
      "metrics.reward-redemption": "REDENCIÓN DE RECOMPENSAS",
      "metrics.content-outputs": "CONTENIDOS PRODUCIDOS",
      "metrics.cpqa": "CPQA",
      "metrics.cpa": "CPA",
      "metrics.cac": "CAC",
      "metrics.roi": "ROI",
      "metrics.ltv-cac": "LTV:CAC",
      "metrics.npv": "NPV",
      "close.kicker": "PARTNERSHIP + APROBACIÓN OPERATIVA",
      "close.cta": "INICIAR LA CONVERSACIÓN DE PARTNERSHIP →",
      "brand.claudeEvent": "EVENTO DE COMUNIDAD DE CLAUDE",
      "nav.program": "RUN OF SHOW",
      "nav.lineup": "EL LINE UP",
      "nav.inventory": "INVENTARIO DE PARTNERS",
      "cover.kicker": "EVENTO DE COMUNIDAD DE CLAUDE · MEXICO TECH WEEK 2026",
      "cover.seated": "WORKSHOP SENTADO",
      "cover.afterParty": "AFTER PARTY",
      "cover.night": "NOCHE",
      "proposition.title": "UN WORKSHOP PARA LA INDUSTRIA MUSICAL QUE SE CONVIERTE EN LA NOCHE.",
      "proposition.copy": "Tres horas sentadas con Claude para productores, artistas, sellos, managers y estudios. A las 22:00 la sala cambia, las puertas se abren otra vez y el mismo espacio corre como Future Renaissance hasta el cierre.",
      "proposition.earlyLabel": "18:00 – 21:00",
      "proposition.earlyCopy": "200 ASISTENTES SENTADOS",
      "proposition.axisRole": "HOSPEDA + OPERA TODA LA NOCHE",
      "proposition.lateLabel": "22:00 – LATE",
      "proposition.lateCopy": "+250 INVITADOS ADICIONALES",
      "proposition.positioning": "UNA SALA. UNA NOCHE. DOS PÚBLICOS QUE SE CRUZAN.",
      "program.kicker": "RUN OF SHOW",
      "program.title": "UNA NOCHE QUE CAMBIA DE ESTADO TRES VECES.",
      "program.seats": "LUGARES",
      "program.guests": "INVITADOS AFTER PARTY",
      "program.venue": "SEDE",
      "program.workshop.arc": "SENTADO",
      "program.workshop.label": "WORKSHOP DE CLAUDE",
      "program.reset.arc": "CAMBIO",
      "program.reset.label": "CAMBIO DE SALA",
      "program.warmup.arc": "LLEGADA",
      "program.warmup.label": "DJ DE APERTURA",
      "program.live-coding.arc": "CREACIÓN",
      "program.live-coding.label": "LIVE CODING",
      "program.closing.arc": "CLUB",
      "program.closing.label": "DJ DE CIERRE",
      "lineup.kicker": "EL LINE UP",
      "lineup.title": "LA SALA APARECE EN EL LINE UP JUNTO A LOS ARTISTAS.",
      "lineup.copy": "El público aparece en el line up porque la sala hace la obra. Una foto, un video o un prompt de cualquier persona presente cambia los visuales que corren en el muro LED principal.",
      "lineup.verse.kind": "PLATAFORMA",
      "lineup.verse.discipline": "Arte generativo y digital · Londres",
      "lineup.pixelord.kind": "ARTISTA",
      "lineup.pixelord.discipline": "Sonido y visuales 3D · Hyperboloid Records",
      "lineup.public.kind": "CADA INVITADO",
      "lineup.public.discipline": "Visuales en tiempo real creados con Claude",
      "claude.kicker": "MIÉRCOLES · 28 OCT, 2026 · BAR ORIENTE",
      "claude.communityEvent": "EVENTO DE COMUNIDAD",
      "claude.copy": "Un workshop práctico de Claude para la industria musical, conducido desde la pantalla al frente de la sala, y la noche en la que se convierte.",
      "claude.status": "EVENTO DE COMUNIDAD DE CLAUDE",
      "claude.axisRole": "HOSPEDA, PRODUCE + OPERA",
      "claude.venueRole": "SEDE ANFITRIONA",
      "claude.constraint": "LA NOCHE ES UN EVENTO DE COMUNIDAD DE CLAUDE. ESE ESTATUS NO ESTÁ EN VENTA.",
      "claude.partnerStatus": "Los partners de producto participan mediante actividades autoradas dentro de la noche, en roles subordinados permitidos.",
      "system.title": "UNA SALA. UN LENGUAJE OPERATIVO AUTORADO.",
      "system.copy": "Cultura, captura de medios, acceso, hospitalidad, IA y código operan como un solo entorno y no como proveedores separados.",
      "system.core": "OPERA LA NOCHE",
      "measurement.copy": "La noche produce un registro operativo junto a sus medios. Las acciones observadas y los resultados de negocio calculados se reportan por separado.",
      "measurement.calculated": "CALCULADO CON DATOS DEL PARTNER",
      "metrics.check-ins": "CHECK-INS",
      "metrics.activity-participation": "PARTICIPACIÓN EN ACTIVIDADES",
      "single.kicker": "INVENTARIO DE PARTNERS",
      "single.title": "UNA NOCHE. UNA PRODUCCIÓN ALTAMENTE PERSONALIZADA.",
      "single.note": "PEQUEÑO · DISTRIBUIDO · INTERACTIVO · INTEGRADO. NO ES UN SALÓN DE CONFERENCIAS, UNA EXPO NI UNA FERIA DE STANDS.",
      "tiers.activity.name": "PARTNER DE ACTIVIDAD",
      "tiers.activity.scope": "28 OCT, 2026 · BAR ORIENTE",
      "tiers.activity.copy": "Una función de producto con misión, onboarding guiado por staff, validación, ruta de recompensa, presencia en pantalla, captura de medios y reporte post-evento.",
      "tiers.exclusive.name": "PARTNER EXCLUSIVO DE CATEGORÍA",
      "tiers.exclusive.scope": "ÚNICO PRODUCTO DE SU CATEGORÍA EN LA NOCHE",
      "tiers.exclusive.copy": "Una función hero con colocación prioritaria en onboarding, integración más profunda, medios dedicados de producto y reporte extendido.",
      "tiers.exclusive.restriction": "NO PUEDE SOBREPASAR LOS DERECHOS DE CLAUDE NI DE LA SEDE.",
      "nav.operates": "LO QUE OPERA AXIS",
      "nav.deliverables": "LO QUE RECIBE EL PARTNER",
      "operates.kicker": "LO QUE APORTA AXIS",
      "operates.title": "AXIS OPERA.",
      "operates.copy": "Todo lo siguiente es autorado, financiado u operado por AXIS. La sede aporta la sala, la barra y las pantallas.",
      "operates.core": "FINANCIA + OPERA LA NOCHE",
      "operates.investLabel": "DÓNDE INVIERTE AXIS",
      "operates.concept": "CONCEPTO + DIRECCIÓN",
      "operates.programming": "PROGRAMACIÓN MUSICAL",
      "operates.live-coding": "LIVE CODING",
      "operates.claude": "INTEGRACIÓN DE CLAUDE",
      "operates.claude-onboarding": "ONBOARDING DE CLAUDE",
      "operates.claude-code": "FLUJO CON CLAUDE CODE",
      "operates.interactive": "SISTEMAS INTERACTIVOS",
      "operates.digital-art": "ARTE DIGITAL",
      "operates.render": "RENDER + RUTEO",
      "operates.operators": "OPERADORES TÉCNICOS",
      "operates.activations": "COORDINACIÓN DE ACTIVIDADES",
      "operates.media": "DIRECCIÓN DE MEDIOS",
      "operates.artists": "COORDINACIÓN DE ARTISTAS",
      "operates.documentation": "DOCUMENTACIÓN",
      "operates.hospitality": "FONDEO DE BEBIDAS",
      "operates.production": "PRODUCCIÓN",
      "operates.guest-logic": "LÓGICA DE EXPERIENCIA",
      "operates.activity-mechanics": "MECÁNICAS DE ACTIVIDAD",
      "allocation.hospitality": "BEBIDAS + HOSPITALIDAD",
      "allocation.production": "PRODUCCIÓN",
      "allocation.audiovisual": "AUDIOVISUAL",
      "allocation.programming": "PROGRAMACIÓN",
      "allocation.claude": "WORKSHOP DE CLAUDE",
      "allocation.digital-art": "ARTE DIGITAL",
      "allocation.activations": "ACTIVACIONES TECH WEEK",
      "allocation.media": "MEDIOS",
      "allocation.operations": "OPERACIONES",
      "deliverables.kicker": "ENTREGA POST-EVENTO",
      "deliverables.title": "LA NOCHE REGRESA COMO MATERIAL Y COMO EVIDENCIA.",
      "deliverables.copy": "La producción de medios y el registro operativo se entregan por separado, para que la noche se lea como resultado cultural y como desempeño del sistema.",
      "deliverables.media": "PRODUCCIÓN DE MEDIOS INCLUIDA",
      "deliverables.report": "REPORTE POST-EVENTO",
      "deliverables.note": "LOS MEDIOS SE PRODUCEN PARA LA NOCHE. EL REPORTE SE PRODUCE A PARTIR DE LO QUE REALMENTE PASÓ EN ELLA.",
      "media.photography": "FOTOGRAFÍA",
      "media.aftermovie": "AFTERMOVIE",
      "media.live-recording": "GRABACIÓN EN VIVO",
      "media.short-clips": "CLIPS CORTOS",
      "media.environment": "AMBIENTE DE LA SEDE",
      "media.screen-moments": "MOMENTOS EN PANTALLA",
      "media.mapping": "VIDEO MAPPING",
      "media.guest-testimonials": "TESTIMONIOS DE INVITADOS",
      "media.artist-testimonials": "TESTIMONIOS DE ARTISTAS",
      "media.social": "CONTENIDO SOCIAL",
      "report.photo-folder": "CARPETA DE FOTOS",
      "report.aftermovie-material": "MATERIAL DE AFTERMOVIE",
      "report.clips": "CLIPS DE VIDEO",
      "report.attendance": "ESTIMADO DE ASISTENCIA",
      "report.participation": "PARTICIPACIÓN EN ACTIVIDADES",
      "report.claude-activations": "ACTIVACIONES DE CLAUDE",
      "report.live-coding": "INTERACCIÓN CON LIVE CODING",
      "report.redemptions": "CANJES DE RECOMPENSA",
      "report.hospitality": "USO DE HOSPITALIDAD",
      "report.screens": "INTERACCIONES EN PANTALLA",
      "report.social-actions": "ACCIONES SOCIALES",
      "report.written-report": "REPORTE ESCRITO",
      "close.title": "EVENTO DE COMUNIDAD DE CLAUDE",
      "close.seated": "WORKSHOP SENTADO",
      "close.afterParty": "AFTER PARTY",
      "close.night": "NOCHE",
      "close.statement": "UN WORKSHOP PARA LA INDUSTRIA MUSICAL.<br>LA NOCHE EN LA QUE SE CONVIERTE.",
      /* @generated:es */
      /* @end */
    },
    zh: {
      "nav.proposition": "提案",
      "nav.claude": "CLAUDE 官方派对",
      "nav.system": "FUTURE RENAISSANCE 系统",
      "nav.guestFlow": "参与者流程",
      "nav.brandFunction": "品牌功能",
      "nav.crossWeek": "跨周参与",
      "nav.measurement": "衡量",
      "proposition.kicker": "提案",
      "system.kicker": "FUTURE RENAISSANCE 系统",
      "system.art": "艺术",
      "system.music": "音乐",
      "system.technology": "科技",
      "system.culture": "文化",
      "system.hospitality": "款待",
      "system.missions": "任务",
      "system.media": "媒体",
      "system.participation": "参与",
      "guestFlow.kicker": "任务护照",
      "guestFlow.title": "参与沿一条清晰可读的路径推进。",
      "guestFlow.copy": "任务系统将入场、产品互动、验证、奖励与报告连接成一条连续旅程。",
      "flow.register": "注册",
      "flow.check-in": "签到",
      "flow.act": "行动",
      "flow.validate": "验证",
      "flow.unlock": "解锁",
      "flow.progress": "进阶",
      "flow.collect": "领取",
      "flow.report": "报告",
      "guestFlow.ruleA": "一个行动变得可见。",
      "guestFlow.ruleB": "一份奖励通过行动获得。",
      "guestFlow.ruleC": "一个结果变得可报告。",
      "brandFunction.kicker": "品牌功能",
      "brandFunction.title": "一个产品。一个功能。一个可衡量行为。",
      "brandFunction.copy": "赞助商购买的不是装饰性露出，而是任务系统中有用、独特的产品功能。",
      "brandFunction.noLogoWall": "不是七个泛化的加密品牌标志。",
      "brandFunction.distinctFunctions": "而是七种不同功能与七类可衡量结果。",
      "crossWeek.kicker": "跨周参与",
      "crossWeek.title": "一个赞助行动可以贯穿整周逐步累积。",
      "crossWeek.copy": "同一套核心激活架构可跨越多个社群，同时适配每个 House 的语境。",
      "crossWeek.note": "示例路径 · 每条品牌旅程都围绕具体产品设计。",
      "measurement.kicker": "衡量",
      "measurement.title": "证据优先。只有数据支持时才计算财务模型。",
      "measurement.verified": "由 AXIS 系统验证",
      "measurement.note": "不承诺虚构的转化数字。报告明确区分已观察行动与计算得出的商业结果。",
      "metrics.attendance": "到场人数",
      "metrics.mission-completion": "任务完成",
      "metrics.qualified-actions": "有效行动",
      "metrics.stage-conversion": "阶段转化",
      "metrics.reward-redemption": "奖励兑换",
      "metrics.content-outputs": "内容产出",
      "metrics.cpqa": "CPQA",
      "metrics.cpa": "CPA",
      "metrics.cac": "CAC",
      "metrics.roi": "ROI",
      "metrics.ltv-cac": "LTV:CAC",
      "metrics.npv": "NPV",
      "close.kicker": "合作讨论 + 运营批准",
      "close.cta": "开启合作讨论 →",
      "brand.claudeEvent": "CLAUDE 社区活动",
      "nav.program": "流程安排",
      "nav.lineup": "阵容",
      "nav.inventory": "合作伙伴权益",
      "cover.kicker": "CLAUDE 社区活动 · 墨西哥科技周 2026",
      "cover.seated": "落座工作坊",
      "cover.afterParty": "AFTER PARTY",
      "cover.night": "一夜",
      "proposition.title": "一场为音乐行业举办的工作坊，最终成为当晚的派对。",
      "proposition.copy": "与 Claude 共度三小时的落座实操，面向制作人、艺术家、厂牌、经纪与录音室。22:00 房间转换，门再次打开，同一空间以 Future Renaissance 的形式运行至结束。",
      "proposition.earlyLabel": "18:00 – 21:00",
      "proposition.earlyCopy": "200 位落座参与者",
      "proposition.axisRole": "主办并运营整晚",
      "proposition.lateLabel": "22:00 – 深夜",
      "proposition.lateCopy": "另有 250 位来宾",
      "proposition.positioning": "一个空间。一个夜晚。两类彼此交叠的人群。",
      "program.kicker": "流程安排",
      "program.title": "一个夜晚，三次状态切换。",
      "program.seats": "座位",
      "program.guests": "AFTER PARTY 来宾",
      "program.venue": "场地",
      "program.workshop.arc": "落座",
      "program.workshop.label": "CLAUDE 工作坊",
      "program.reset.arc": "转换",
      "program.reset.label": "场地转换",
      "program.warmup.arc": "到场",
      "program.warmup.label": "暖场 DJ",
      "program.live-coding.arc": "创作",
      "program.live-coding.label": "实时编码",
      "program.closing.arc": "俱乐部",
      "program.closing.label": "压轴 DJ",
      "lineup.kicker": "阵容",
      "lineup.title": "整个空间与艺术家一同列入阵容。",
      "lineup.copy": "公众之所以列入阵容，是因为作品由整个空间共同完成。在场任何人的一张照片、一段视频或一个提示，都会改变主 LED 墙上运行的视觉。",
      "lineup.verse.kind": "平台",
      "lineup.verse.discipline": "生成与数字艺术 · 伦敦",
      "lineup.pixelord.kind": "艺术家",
      "lineup.pixelord.discipline": "声音与 3D 视觉 · Hyperboloid Records",
      "lineup.public.kind": "每一位来宾",
      "lineup.public.discipline": "与 Claude 共同创作的实时视觉",
      "claude.kicker": "星期三 · 2026年10月28日 · BAR ORIENTE",
      "claude.communityEvent": "社区活动",
      "claude.copy": "一场面向音乐行业的 Claude 实操工作坊，由房间前方的屏幕带领，以及它所转变成的那个夜晚。",
      "claude.status": "CLAUDE 社区活动",
      "claude.axisRole": "主办、制作并运营",
      "claude.venueRole": "主办场地",
      "claude.constraint": "当晚是 CLAUDE 社区活动，该身份不可转售。",
      "claude.partnerStatus": "产品合作方通过夜晚中既定的活动参与，身份为获准的次级角色。",
      "system.title": "一个空间。一套完整的运营语言。",
      "system.copy": "文化、影像记录、通行、款待、AI 与代码作为同一个环境运作，而不是各自独立的供应商。",
      "system.core": "运营整晚",
      "measurement.copy": "当晚在产出影像的同时产生一份运营记录。实际观察到的行为与据此计算的商业结果分开呈现。",
      "measurement.calculated": "结合合作方数据计算",
      "metrics.check-ins": "签到数",
      "metrics.activity-participation": "活动参与",
      "single.kicker": "合作伙伴权益",
      "single.title": "一个夜晚。一次高度定制的制作。",
      "single.note": "小规模 · 分布式 · 可互动 · 深度整合。不是会议厅、展会或展位区。",
      "tiers.activity.name": "活动合作伙伴",
      "tiers.activity.scope": "2026年10月28日 · BAR ORIENTE",
      "tiers.activity.copy": "一项产品功能，包含任务、人员引导的上手环节、验证、奖励路径、屏幕呈现、影像记录与活动后报告。",
      "tiers.exclusive.name": "品类独家合作伙伴",
      "tiers.exclusive.scope": "当晚该品类的唯一产品",
      "tiers.exclusive.copy": "核心功能位，享有优先的上手位置、更深度的整合、专属产品影像与扩展报告。",
      "tiers.exclusive.restriction": "不得覆盖 CLAUDE 或场地的既有权利。",
      "nav.operates": "AXIS 负责什么",
      "nav.deliverables": "合作方获得什么",
      "operates.kicker": "AXIS 带来什么",
      "operates.title": "AXIS 全程操盘。",
      "operates.copy": "以下全部由 AXIS 策划、出资或执行。场地提供空间、吧台与屏幕。",
      "operates.core": "出资并运营整晚",
      "operates.investLabel": "AXIS 的投入方向",
      "operates.concept": "概念与创意方向",
      "operates.programming": "音乐编排",
      "operates.live-coding": "实时编码",
      "operates.claude": "CLAUDE 整合",
      "operates.claude-onboarding": "CLAUDE 上手引导",
      "operates.claude-code": "CLAUDE CODE 工作流",
      "operates.interactive": "互动系统",
      "operates.digital-art": "数字艺术",
      "operates.render": "渲染与信号路由",
      "operates.operators": "技术操作人员",
      "operates.activations": "活动协调",
      "operates.media": "影像总监",
      "operates.artists": "艺术家统筹",
      "operates.documentation": "活动记录",
      "operates.hospitality": "饮品额度出资",
      "operates.production": "制作统筹",
      "operates.guest-logic": "来宾体验逻辑",
      "operates.activity-mechanics": "活动机制",
      "allocation.hospitality": "饮品与款待",
      "allocation.production": "制作",
      "allocation.audiovisual": "视听",
      "allocation.programming": "节目编排",
      "allocation.claude": "CLAUDE 工作坊",
      "allocation.digital-art": "数字艺术",
      "allocation.activations": "科技周活动",
      "allocation.media": "影像",
      "allocation.operations": "运营",
      "deliverables.kicker": "活动后交付",
      "deliverables.title": "这一夜以素材与证据两种形式回到合作方手中。",
      "deliverables.copy": "影像制作与运营记录分开交付，让这一夜既可作为文化产出，也可作为系统表现来阅读。",
      "deliverables.media": "已包含的影像制作",
      "deliverables.report": "活动后报告",
      "deliverables.note": "影像为这一夜而制作。报告则来自这一夜真实发生的事。",
      "media.photography": "摄影",
      "media.aftermovie": "活动纪录片",
      "media.live-recording": "现场录制",
      "media.short-clips": "短片段",
      "media.environment": "场地氛围",
      "media.screen-moments": "屏幕瞬间",
      "media.mapping": "投影映射",
      "media.guest-testimonials": "来宾采访",
      "media.artist-testimonials": "艺术家采访",
      "media.social": "社交内容",
      "report.photo-folder": "照片文件夹",
      "report.aftermovie-material": "纪录片素材",
      "report.clips": "短视频片段",
      "report.attendance": "到场人数估算",
      "report.participation": "活动参与数",
      "report.claude-activations": "CLAUDE 启用次数",
      "report.live-coding": "实时编码互动",
      "report.redemptions": "奖励兑换数",
      "report.hospitality": "款待使用情况",
      "report.screens": "屏幕互动次数",
      "report.social-actions": "社交行为数",
      "report.written-report": "书面报告",
      "close.title": "CLAUDE 社区活动",
      "close.seated": "落座工作坊",
      "close.afterParty": "AFTER PARTY",
      "close.night": "一夜",
      "close.statement": "一场为音乐行业举办的工作坊。<br>以及它所成为的那个夜晚。",
      /* @generated:zh */
      /* @end */
    }
  };

  function normalize(value) {
    if (!value) return null;
    var lang = String(value).toLowerCase();
    if (lang.indexOf("zh") === 0) return "zh";
    if (lang.indexOf("es") === 0) return "es";
    if (lang.indexOf("en") === 0) return "en";
    return null;
  }

  function parentLanguage() {
    try {
      var url = window.parent && window.parent !== window ? new URL(window.parent.location.href) : new URL(window.location.href);
      return normalize(url.searchParams.get("lang"));
    } catch {
      return null;
    }
  }

  var originals = new WeakMap();
  var activeLanguage = "en";

  function translateConcepts(lang) {
    var concepts = window.FUTURE_RENAISSANCE_CONCEPTS || {};
    Object.keys(concepts).forEach(function (id) {
      var concept = concepts[id];
      var base = concept._base || concept;
      var localized = concept.locales && concept.locales[lang];
      concept.code = localized && localized.code ? localized.code : base.code;
      concept.title = localized && localized.title ? localized.title : base.title;
      concept.summary = localized && localized.summary ? localized.summary : base.summary;
      concept.details = localized && localized.details ? localized.details.slice() : base.details.slice();
    });
  }

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
    translateConcepts(lang);
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
