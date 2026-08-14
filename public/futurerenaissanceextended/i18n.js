(function () {
  "use strict";

  var SUPPORTED = ["en", "es", "zh"];
  var LABELS = { en: "EN", es: "ES", zh: "中文" };
  var TEXT = {
    en: {},
    es: {
      "brand.afterHours": "MEXICO TECH WEEK AFTER HOURS",
      "nav.proposition": "LA PROPUESTA",
      "nav.circuit": "EL CIRCUITO COMPLETO",
      "nav.houses": "CINCO HOUSES / CINCO IDENTIDADES",
      "nav.claude": "FIESTA OFICIAL DE CLAUDE",
      "nav.system": "EL SISTEMA FUTURE RENAISSANCE",
      "nav.guestFlow": "FLUJO DEL INVITADO",
      "nav.brandFunction": "FUNCIÓN DE MARCA",
      "nav.crossWeek": "PARTICIPACIÓN SEMANAL",
      "nav.measurement": "MEDICIÓN",
      "nav.singleInventory": "INVENTARIO DE UN EVENTO",
      "nav.circuitInventory": "INVENTARIO DEL CIRCUITO",
      "nav.categoryExclusive": "EXCLUSIVIDAD DE CATEGORÍA",
      "nav.techTownPresenting": "PRESENTACIÓN TECH TOWN",
      "cover.kicker": "MEXICO TECH WEEK AFTER HOURS",
      "cover.dates": "27 OCT – 1 NOV, 2026\nCIUDAD DE MÉXICO",
      "cover.nights": "NOCHES",
      "cover.houses": "HOUSES",
      "cover.program": "PROGRAMA CONTINUO",
      "proposition.kicker": "LA PROPUESTA",
      "proposition.title": "EL DÍA CREA COMUNIDADES CONCENTRADAS. EL AFTER HOURS LAS MANTIENE EN MOVIMIENTO.",
      "proposition.copy": "Mexico Tech Town reúne cinco comunidades House durante el día. Future Renaissance las extiende hacia experiencias nocturnas coordinadas mediante cultura, música, tecnología, hospitalidad y participación.",
      "proposition.dayLabel": "DE DÍA",
      "proposition.dayCopy": "CINCO COMUNIDADES HOUSE",
      "proposition.axisRole": "HOSPEDA + OPERA LA CAPA AFTER-HOURS",
      "proposition.nightLabel": "AFTER HOURS",
      "proposition.nightCopy": "UN PROGRAMA CULTURAL CONTINUO",
      "proposition.positioning": "MEXICO TECH TOWN DE DÍA. FUTURE RENAISSANCE AFTER HOURS.",
      "circuit.kicker": "EL CIRCUITO COMPLETO",
      "circuit.title": "SEIS NOCHES CONSECUTIVAS. UNA CAPA OPERATIVA RECONOCIBLE.",
      "circuit.events": "EVENTOS",
      "circuit.techTownHouses": "TECH TOWN HOUSES",
      "circuit.claudeParty": "FIESTA OFICIAL DE CLAUDE",
      "circuit.axisEveryNight": "AXIS APARECE CADA NOCHE",
      "events.venueTba": "SEDE POR CONFIRMAR",
      "events.investors.day": "MARTES",
      "events.investors.date": "27 DE OCTUBRE",
      "events.investors.name": "INVESTORS HOUSE AFTER HOURS",
      "events.claude.day": "MIÉRCOLES",
      "events.claude.date": "28 DE OCTUBRE",
      "events.claude.name": "FIESTA OFICIAL DE CLAUDE",
      "events.founders.day": "JUEVES",
      "events.founders.date": "29 DE OCTUBRE",
      "events.founders.name": "FOUNDERS HOUSE AFTER HOURS",
      "events.developers.day": "VIERNES",
      "events.developers.date": "30 DE OCTUBRE",
      "events.developers.name": "DEVELOPERS HOUSE AFTER HOURS",
      "events.ai.day": "SÁBADO",
      "events.ai.date": "31 DE OCTUBRE",
      "events.ai.name": "AI HOUSE AFTER HOURS",
      "events.wellness.day": "DOMINGO",
      "events.wellness.date": "1 DE NOVIEMBRE",
      "events.wellness.name": "WELLNESS HOUSE AFTER HOURS / CIERRE",
      "houses.kicker": "CINCO HOUSES / CINCO IDENTIDADES",
      "houses.title": "EL SISTEMA SE REPITE. LA NOCHE CAMBIA CON LA AUDIENCIA.",
      "houses.copy": "Cada House recibe un ritmo social, lenguaje musical, contexto de patrocinio y curva de energía distintos.",
      "houses.investors.label": "INVESTORS HOUSE",
      "houses.investors.character": "SOCIAL, PREMIUM Y CONTENIDA",
      "houses.investors.music": "Deep house, Balearic, minimal y electrónica elegante · 116–126 BPM",
      "houses.founders.label": "FOUNDERS HOUSE",
      "houses.founders.character": "CÁLIDA, SOCIAL Y PULIDA",
      "houses.founders.music": "House, minimal, selecciones disco-adjacent y electro · 120–132 BPM",
      "houses.developers.label": "DEVELOPERS HOUSE",
      "houses.developers.character": "TÉCNICA Y EXPERIMENTAL",
      "houses.developers.music": "UKG, breaks, electro, acid, jungle y techno de izquierda · 132–145 BPM",
      "houses.ai.label": "AI HOUSE",
      "houses.ai.character": "MÁXIMA INTENSIDAD Y FUERZA VISUAL",
      "houses.ai.music": "Rave, NXC, bass experimental, hard breaks, hyperclub y acid · 140–160 BPM",
      "houses.wellness.label": "WELLNESS HOUSE",
      "houses.wellness.character": "RECUPERACIÓN Y CIERRE SENSORIAL",
      "houses.wellness.music": "Ambient, downtempo, drone, electroacústica e instalación sonora",
      "claude.kicker": "MIÉRCOLES · 28 DE OCTUBRE · BAR ORIENTE",
      "claude.officialParty": "FIESTA OFICIAL",
      "claude.copy": "Una noche de gran credibilidad dentro del circuito, con jerarquía de derechos clara e identidad club de izquierda.",
      "claude.presented": "PRESENTADO POR CLAUDE",
      "claude.axisRole": "HOSPEDADO + PRODUCIDO POR AXIS",
      "claude.systemRole": "SISTEMA AFTER-HOURS",
      "claude.constraint": "NO HAY POSICIÓN DE PRESENTACIÓN PARA TERCEROS EL MIÉRCOLES.",
      "claude.partnerStatus": "Otras marcas pueden participar en roles subordinados de partner o activación permitidos.",
      "claude.bookingNote": "Plastician es un objetivo de booking, no un artista confirmado.",
      "system.kicker": "EL SISTEMA FUTURE RENAISSANCE",
      "system.title": "SEIS ESTADOS. UN LENGUAJE OPERATIVO AUTORAL.",
      "system.copy": "AXIS lleva el mismo marco reconocible de cultura y participación a cada noche.",
      "system.core": "CAPA OPERATIVA CONTINUA",
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
      "functions.wallet.name": "WALLET",
      "functions.wallet.role": "Identidad o flujo de claim",
      "functions.exchange.name": "EXCHANGE",
      "functions.exchange.role": "Adquisición o interacción de trading",
      "functions.dex.name": "DEX",
      "functions.dex.role": "Ejecución onchain",
      "functions.marketplace.name": "MARKETPLACE",
      "functions.marketplace.role": "Coleccionar",
      "functions.launchpad.name": "LAUNCHPAD",
      "functions.launchpad.role": "Experimentación de creators o tokens",
      "functions.defi.name": "DEFI",
      "functions.defi.role": "Interacción financiera",
      "functions.payments.name": "PAGOS / TARJETA",
      "functions.payments.role": "Pago físico o redención",
      "crossWeek.kicker": "PARTICIPACIÓN SEMANAL",
      "crossWeek.title": "UNA ACCIÓN DE SPONSOR PUEDE CRECER DURANTE LA SEMANA.",
      "crossWeek.copy": "Una arquitectura central puede persistir entre audiencias y adaptar su expresión a cada House.",
      "crossWeek.account": "CREACIÓN DE CUENTA",
      "crossWeek.productUse": "USO DEL PRODUCTO",
      "crossWeek.secondAction": "SEGUNDA ACCIÓN",
      "crossWeek.technical": "ACCIÓN TÉCNICA",
      "crossWeek.advanced": "INTERACCIÓN AVANZADA",
      "crossWeek.completion": "FINALIZACIÓN / RECOMPENSA",
      "crossWeek.note": "RUTA DE EJEMPLO · CADA VIAJE SE DISEÑA ALREDEDOR DEL PRODUCTO.",
      "measurement.kicker": "MEDICIÓN",
      "measurement.title": "PRIMERO LA EVIDENCIA. MODELOS FINANCIEROS SOLO CUANDO LOS DATOS LOS RESPALDAN.",
      "measurement.copy": "Cada evento recibe un registro operativo. Los socios de circuito reciben contexto por evento y una vista combinada.",
      "measurement.verified": "VERIFICADO POR EL SISTEMA AXIS",
      "measurement.calculated": "CALCULADO CON DATOS DEL SPONSOR",
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
      "single.kicker": "INVENTARIO DE UN EVENTO",
      "single.title": "ALTA PERSONALIZACIÓN PARA UNA AUDIENCIA ENFOCADA.",
      "single.note": "UN EVENTO = PRODUCCIÓN ALTAMENTE PERSONALIZADA. LOS CIRCUITOS USAN UN SISTEMA CENTRAL REPETIBLE.",
      "tiers.singleHouse.name": "SOCIO DE UNA HOUSE",
      "tiers.singleHouse.scope": "UNA HOUSE · INVESTORS / FOUNDERS / DEVELOPERS / AI / WELLNESS",
      "tiers.singleHouse.copy": "Función, misión, validación, recompensa, integración, media, medición de acciones y reporte para un evento.",
      "tiers.claude.name": "SOCIO DE LA FIESTA OFICIAL DE CLAUDE",
      "tiers.claude.scope": "MIÉRCOLES · BAR ORIENTE · ESTATUS DE PARTNER BAJO CLAUDE",
      "tiers.claude.copy": "Activación, misión, media, medición y reporte para la fiesta oficial.",
      "tiers.claude.restriction": "CLAUDE CONSERVA EL ESTATUS DE PRESENTADOR.",
      "circuitInventory.kicker": "INVENTARIO DEL CIRCUITO",
      "circuitInventory.title": "LA REPETICIÓN CREA RECONOCIMIENTO SIN PRETENDER QUE CADA NOCHE ES UNA CAMPAÑA NUEVA.",
      "tiers.threeHouse.name": "CIRCUITO DE TRES HOUSES",
      "tiers.threeHouse.scope": "CUALQUIER TRES TECH TOWN HOUSES",
      "tiers.threeHouse.copy": "Un concepto principal con adaptación contextual y reporte combinado.",
      "tiers.techTown.name": "CIRCUITO TECH TOWN",
      "tiers.techTown.scope": "LAS CINCO HOUSES",
      "tiers.techTown.copy": "Un sistema en Investors, Founders, Developers, AI y Wellness.",
      "tiers.completeWeek.name": "SOCIO DE LA SEMANA COMPLETA",
      "tiers.completeWeek.scope": "CLAUDE + LAS CINCO HOUSES",
      "tiers.completeWeek.copy": "Integración permitida en Claude más integración normal en las cinco Houses.",
      "tiers.completeWeek.restriction": "PARTNER, NO PRESENTADOR, EN CLAUDE.",
      "circuitInventory.ruleTitle": "UNA ARQUITECTURA CENTRAL DE ACTIVACIÓN",
      "circuitInventory.ruleCopy": "DESPLIEGUE REPETIDO · CONTEXTO POR HOUSE · REPORTE COMBINADO",
      "exclusive.kicker": "SOCIO EXCLUSIVO DE CATEGORÍA",
      "exclusive.title": "POSEE UNA FUNCIÓN DISTINTA EN TODO EL CIRCUITO.",
      "exclusive.scope": "ACCESO A SEIS EVENTOS",
      "exclusive.hero": "MISIÓN HERO DEL SPONSOR",
      "exclusive.b1": "EXCLUSIVIDAD DE CATEGORÍA",
      "exclusive.b2": "ADAPTACIONES POR HOUSE",
      "exclusive.b3": "MEDIA DEDICADA DE PRODUCTO",
      "exclusive.b4": "REPORTE POR EVENTO + COMBINADO",
      "exclusive.b5": "CAPTURA DE CONTENIDO PRIORITARIA",
      "exclusive.restriction": "LA EXCLUSIVIDAD SE LIMITA AL INVENTARIO CONTROLADO POR AXIS Y NO REEMPLAZA DERECHOS DE CLAUDE O TECH WEEK.",
      "presenting.kicker": "SOCIO PRESENTADOR DE TECH TOWN",
      "presenting.title": "UNA POSICIÓN. PRESENTACIÓN EN CINCO EVENTOS HOUSE.",
      "presenting.position": "POSICIÓN",
      "presenting.copy": "El sistema presentador recorre Investors, Founders, Developers, AI y Wellness con prioridad de misión, integración, media y reporte.",
      "presenting.houseCircuit": "SOCIO PRESENTADOR DEL CIRCUITO DE HOUSES",
      "presenting.fiveHouses": "CINCO TECH TOWN HOUSES",
      "presenting.constraint": "CLAUDE CONSERVA EL ESTATUS DE PRESENTADOR PARA LA FIESTA OFICIAL DE CLAUDE.",
      "presenting.constraintCopy": "El miércoles este partner recibe solo integración subordinada permitida, no estatus de presentación.",
      "close.kicker": "PARTNERSHIP + APROBACIÓN OPERATIVA",
      "close.title": "MEXICO TECH WEEK AFTER HOURS",
      "close.events": "EVENTOS",
      "close.houses": "TECH TOWN HOUSES",
      "close.claude": "FIESTA OFICIAL DE CLAUDE",
      "close.dates": "27 DE OCTUBRE – 1 DE NOVIEMBRE · CIUDAD DE MÉXICO",
      "close.statement": "MEXICO TECH TOWN DE DÍA.\nFUTURE RENAISSANCE AFTER HOURS.",
      "close.cta": "INICIAR LA CONVERSACIÓN DE PARTNERSHIP →"
    },
    zh: {
      "brand.afterHours": "墨西哥科技周夜间计划",
      "nav.proposition": "提案",
      "nav.circuit": "完整系列",
      "nav.houses": "五个 HOUSE / 五种个性",
      "nav.claude": "CLAUDE 官方派对",
      "nav.system": "FUTURE RENAISSANCE 系统",
      "nav.guestFlow": "参与者流程",
      "nav.brandFunction": "品牌功能",
      "nav.crossWeek": "跨周参与",
      "nav.measurement": "衡量",
      "nav.singleInventory": "单场合作权益",
      "nav.circuitInventory": "系列合作权益",
      "nav.categoryExclusive": "品类独家",
      "nav.techTownPresenting": "TECH TOWN 呈现",
      "cover.kicker": "墨西哥科技周夜间计划",
      "cover.dates": "2026年10月27日 – 11月1日\n墨西哥城",
      "cover.nights": "晚",
      "cover.houses": "个 HOUSE",
      "cover.program": "连续计划",
      "proposition.kicker": "提案",
      "proposition.title": "白天汇聚社群，夜间让连接继续发生。",
      "proposition.copy": "Mexico Tech Town 白天汇聚五个 House 社群。Future Renaissance 通过文化、音乐、科技、款待与参与，将这些社群延伸为协调一致的夜间体验。",
      "proposition.dayLabel": "白天",
      "proposition.dayCopy": "五个 HOUSE 社群",
      "proposition.axisRole": "主办并运营夜间文化层",
      "proposition.nightLabel": "夜间",
      "proposition.nightCopy": "一个连续文化计划",
      "proposition.positioning": "白天是 MEXICO TECH TOWN。夜间是 FUTURE RENAISSANCE。",
      "circuit.kicker": "完整系列",
      "circuit.title": "连续六晚，一个清晰可识别的运营层。",
      "circuit.events": "场活动",
      "circuit.techTownHouses": "个 TECH TOWN HOUSE",
      "circuit.claudeParty": "场 CLAUDE 官方派对",
      "circuit.axisEveryNight": "AXIS 每晚出现",
      "events.venueTba": "场地待确认",
      "events.investors.day": "星期二",
      "events.investors.date": "10月27日",
      "events.investors.name": "投资人之家夜间活动",
      "events.claude.day": "星期三",
      "events.claude.date": "10月28日",
      "events.claude.name": "CLAUDE 官方派对",
      "events.founders.day": "星期四",
      "events.founders.date": "10月29日",
      "events.founders.name": "创始人之家夜间活动",
      "events.developers.day": "星期五",
      "events.developers.date": "10月30日",
      "events.developers.name": "开发者之家夜间活动",
      "events.ai.day": "星期六",
      "events.ai.date": "10月31日",
      "events.ai.name": "AI 之家夜间活动",
      "events.wellness.day": "星期日",
      "events.wellness.date": "11月1日",
      "events.wellness.name": "健康之家夜间活动 / 闭幕",
      "houses.kicker": "五个 HOUSE / 五种个性",
      "houses.title": "系统保持一致，夜晚随人群而变化。",
      "houses.copy": "每个 House 都有独特的社交节奏、音乐语言、赞助场景与能量曲线。",
      "houses.investors.label": "投资人之家",
      "houses.investors.character": "以社交为先，高端而克制",
      "houses.investors.music": "Deep house、Balearic、minimal 与优雅电子乐 · 116–126 BPM",
      "houses.founders.label": "创始人之家",
      "houses.founders.character": "温暖、社交、精致",
      "houses.founders.music": "House、minimal、disco 邻近风格与 electro · 120–132 BPM",
      "houses.developers.label": "开发者之家",
      "houses.developers.character": "技术感与实验性",
      "houses.developers.music": "UKG、breaks、electro、acid、jungle 与左翼 techno · 132–145 BPM",
      "houses.ai.label": "AI 之家",
      "houses.ai.character": "峰值强度与最强视觉表现",
      "houses.ai.music": "Rave、NXC、实验 bass、hard breaks、hyperclub 与 acid · 140–160 BPM",
      "houses.wellness.label": "健康之家",
      "houses.wellness.character": "恢复导向的感官闭幕",
      "houses.wellness.music": "Ambient、downtempo、drone、电声作品与声音装置",
      "claude.kicker": "星期三 · 10月28日 · BAR ORIENTE",
      "claude.officialParty": "官方派对",
      "claude.copy": "系列中的重要信用之夜，拥有清晰的权益层级与左翼俱乐部音乐个性。",
      "claude.presented": "由 CLAUDE 呈现",
      "claude.axisRole": "AXIS 主办并制作",
      "claude.systemRole": "夜间运营系统",
      "claude.constraint": "周三不提供任何第三方呈现席位。",
      "claude.partnerStatus": "其他品牌仅能以获准的次级合作或激活身份参与。",
      "claude.bookingNote": "Plastician 仅为邀约目标，并非已确认艺人。",
      "system.kicker": "FUTURE RENAISSANCE 系统",
      "system.title": "六种状态，一套统一的策划运营语言。",
      "system.copy": "AXIS 将同一套可识别的文化与参与框架贯穿每一晚。",
      "system.core": "连续运营层",
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
      "functions.wallet.name": "钱包",
      "functions.wallet.role": "身份或领取流程",
      "functions.exchange.name": "中心化交易所",
      "functions.exchange.role": "获客或交易互动",
      "functions.dex.name": "DEX",
      "functions.dex.role": "链上执行",
      "functions.marketplace.name": "数字艺术市场",
      "functions.marketplace.role": "收藏",
      "functions.launchpad.name": "代币发行平台",
      "functions.launchpad.role": "创作者或代币实验",
      "functions.defi.name": "DEFI",
      "functions.defi.role": "金融互动",
      "functions.payments.name": "支付 / 卡",
      "functions.payments.role": "线下支付或兑换",
      "crossWeek.kicker": "跨周参与",
      "crossWeek.title": "一个赞助行动可以贯穿整周逐步累积。",
      "crossWeek.copy": "同一套核心激活架构可跨越多个社群，同时适配每个 House 的语境。",
      "crossWeek.account": "创建账户",
      "crossWeek.productUse": "使用产品",
      "crossWeek.secondAction": "第二次行动",
      "crossWeek.technical": "技术行动",
      "crossWeek.advanced": "高级互动",
      "crossWeek.completion": "完成 / 奖励",
      "crossWeek.note": "示例路径 · 每条品牌旅程都围绕具体产品设计。",
      "measurement.kicker": "衡量",
      "measurement.title": "证据优先。只有数据支持时才计算财务模型。",
      "measurement.copy": "每场活动都有运营记录；系列合作伙伴同时获得单场语境与综合表现视图。",
      "measurement.verified": "由 AXIS 系统验证",
      "measurement.calculated": "结合赞助商数据计算",
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
      "single.kicker": "单场合作权益",
      "single.title": "为一个聚焦社群提供高度定制。",
      "single.note": "单场活动 = 高度定制制作。系列套餐 = 一个可重复部署的核心系统。",
      "tiers.singleHouse.name": "单场 HOUSE 合作伙伴",
      "tiers.singleHouse.scope": "任选一场 · INVESTORS / FOUNDERS / DEVELOPERS / AI / WELLNESS",
      "tiers.singleHouse.copy": "包含单场功能、任务、验证、奖励、整合、媒体、有效行动衡量与活动报告。",
      "tiers.claude.name": "CLAUDE 官方派对合作伙伴",
      "tiers.claude.scope": "星期三 · BAR ORIENTE · CLAUDE 之下的合作身份",
      "tiers.claude.copy": "官方派对中的品牌激活、任务、媒体、衡量与报告。",
      "tiers.claude.restriction": "CLAUDE 保留呈现方身份。",
      "circuitInventory.kicker": "系列合作权益",
      "circuitInventory.title": "重复带来识别度，但不把每一晚假装成全新独立项目。",
      "tiers.threeHouse.name": "三场 HOUSE 系列",
      "tiers.threeHouse.scope": "任选三个 TECH TOWN HOUSE",
      "tiers.threeHouse.copy": "一个核心概念，按 House 调整，并提供综合报告。",
      "tiers.techTown.name": "TECH TOWN 系列",
      "tiers.techTown.scope": "全部五个 HOUSE",
      "tiers.techTown.copy": "同一系统覆盖 Investors、Founders、Developers、AI 与 Wellness。",
      "tiers.completeWeek.name": "完整一周合作伙伴",
      "tiers.completeWeek.scope": "CLAUDE + 全部五个 HOUSE",
      "tiers.completeWeek.copy": "在 Claude 获准以合作身份整合，并覆盖五个 House 的常规系列权益。",
      "tiers.completeWeek.restriction": "在 CLAUDE 是合作伙伴，不是呈现方。",
      "circuitInventory.ruleTitle": "一个核心激活架构",
      "circuitInventory.ruleCopy": "重复部署 · 按 HOUSE 适配 · 综合报告",
      "exclusive.kicker": "品类独家系列合作伙伴",
      "exclusive.title": "在完整系列中拥有一种独特功能。",
      "exclusive.scope": "六场活动权益",
      "exclusive.hero": "主赞助任务",
      "exclusive.b1": "品类独家",
      "exclusive.b2": "按 HOUSE 深度适配",
      "exclusive.b3": "专属产品媒体",
      "exclusive.b4": "单场 + 综合报告",
      "exclusive.b5": "优先内容拍摄",
      "exclusive.restriction": "独家权仅适用于 AXIS 控制的权益，不能覆盖 CLAUDE 或 TECH WEEK 的既有权利。",
      "presenting.kicker": "TECH TOWN 呈现合作伙伴",
      "presenting.title": "一个席位，呈现五场 HOUSE 活动。",
      "presenting.position": "个席位",
      "presenting.copy": "呈现系统贯穿 Investors、Founders、Developers、AI 与 Wellness，并获得任务、整合、媒体及报告优先权。",
      "presenting.houseCircuit": "HOUSE 系列呈现合作伙伴",
      "presenting.fiveHouses": "五个 TECH TOWN HOUSE",
      "presenting.constraint": "CLAUDE 保留官方 CLAUDE 派对的呈现方身份。",
      "presenting.constraintCopy": "周三该品牌仅获得获准的次级合作整合，而不拥有呈现方身份。",
      "close.kicker": "合作讨论 + 运营批准",
      "close.title": "墨西哥科技周夜间计划",
      "close.events": "场活动",
      "close.houses": "个 TECH TOWN HOUSE",
      "close.claude": "场 CLAUDE 官方派对",
      "close.dates": "10月27日 – 11月1日 · 墨西哥城",
      "close.statement": "白天是 MEXICO TECH TOWN。\n夜间是 FUTURE RENAISSANCE。",
      "close.cta": "开启合作讨论 →"
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
