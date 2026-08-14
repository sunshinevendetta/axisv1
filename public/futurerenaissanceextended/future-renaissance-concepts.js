(function () {
  "use strict";

  var circuit = window.FUTURE_RENAISSANCE;
  var concepts = {};

  function money(value) {
    return "$" + Number(value).toLocaleString("en-US") + " USD";
  }

  function add(id, code, title, summary, details, locales) {
    concepts[id] = {
      code: code,
      title: title,
      summary: summary,
      details: details,
      _base: { code: code, title: title, summary: summary, details: details.slice() },
      locales: locales || {},
    };
  }

  var eventLocales = {
    investors: {
      es: ["Investors House After Hours", "Una apertura social, premium y contenida para la comunidad de inversión.", ["Martes 27 de octubre", "Sede por confirmar", "Deep house, Balearic, minimal y electrónica elegante", "Fintech, banca, patrimonio, custodia, pagos y servicios profesionales"]],
      zh: ["投资人之家夜间活动", "面向投资社群的高端、克制、以社交为先的开幕夜。", ["10月27日，星期二", "场地待确认", "Deep house、Balearic、minimal 与优雅电子乐", "金融科技、银行、财富、托管、支付及专业服务"]],
    },
    claude: {
      es: ["Fiesta Oficial de Claude", "La noche oficial del miércoles en Bar Oriente, presentada por Claude y operada por AXIS.", ["Miércoles 28 de octubre · Bar Oriente", "Claude conserva el estatus de presentador", "AXIS hospeda y produce", "Las demás marcas participan solo en estatus subordinados permitidos"]],
      zh: ["Claude 官方派对", "周三在 Bar Oriente 举行的官方活动，由 Claude 呈现、AXIS 主办并执行。", ["10月28日，星期三 · Bar Oriente", "Claude 保留呈现方身份", "AXIS 主办并制作", "其他品牌仅能以获准的次级合作身份参与"]],
    },
    founders: {
      es: ["Founders House After Hours", "Una noche cálida, social y pulida donde el networking evoluciona naturalmente hacia la fiesta.", ["Jueves 29 de octubre", "Sede por confirmar", "House, minimal, disco adyacente y electro", "Pagos, tarjetas, banca, nómina, CRM, reclutamiento y herramientas para founders"]],
      zh: ["创始人之家夜间活动", "温暖、社交且精致，让交流自然过渡到派对。", ["10月29日，星期四", "场地待确认", "House、minimal、disco 邻近风格与 electro", "支付、银行卡、银行、薪资、CRM、招聘及创始人工具"]],
    },
    developers: {
      es: ["Developers House After Hours", "La noche más técnica y experimental del circuito de Houses.", ["Viernes 30 de octubre", "Sede por confirmar", "UKG, breaks, electro, acid, jungle y techno de izquierda", "APIs, nube, bases de datos, RPC, seguridad, observabilidad e infraestructura wallet"]],
      zh: ["开发者之家夜间活动", "House 系列中技术感与实验性最强的一夜。", ["10月30日，星期五", "场地待确认", "UKG、breaks、electro、acid、jungle 与左翼 techno", "API、云、数据库、RPC、安全、可观测性及钱包基础设施"]],
    },
    ai: {
      es: ["AI House After Hours", "La noche de mayor intensidad y fuerza visual, amplificada por el 31 de octubre.", ["Sábado 31 de octubre", "Sede por confirmar", "Rave, NXC, bass experimental, hard breaks, hyperclub y acid", "Compute, GPU, inferencia, datos, almacenamiento, seguridad y tooling de agentes"]],
      zh: ["AI 之家夜间活动", "强度与视觉表现最强的一夜，10月31日带来额外视觉潜力。", ["10月31日，星期六", "场地待确认", "Rave、NXC、实验 bass、hard breaks、hyperclub 与 acid", "算力、GPU、推理、数据、存储、安全及智能体工具"]],
    },
    wellness: {
      es: ["Wellness House After Hours / Cierre", "Un cierre sensorial y orientado a la recuperación, radicalmente distinto al sábado.", ["Domingo 1 de noviembre", "Sede por confirmar", "Ambient, downtempo, drone, electroacústica e instalación sonora", "Wearables, salud, sueño, recuperación, fitness, diagnóstico y nutrición"]],
      zh: ["健康之家夜间活动 / 闭幕", "以恢复与感官体验为核心、与周六截然不同的闭幕夜。", ["11月1日，星期日", "场地待确认", "Ambient、downtempo、drone、电声作品与声音装置", "可穿戴设备、健康、睡眠、恢复、健身、诊断及营养"]],
    },
  };

  circuit.events.forEach(function (event, index) {
    var code = "03 / " + String(index + 1).padStart(2, "0");
    var details = [
      event.day + ", " + event.displayDate + ", 2026",
      event.venue || "Venue to be confirmed",
      event.character,
      event.music,
      "Relevant categories: " + event.categories.join(", "),
    ];
    if (event.presenting) details.push(event.presenting.status + " · " + event.presenting.axisRole, event.presenting.restriction);
    if (event.rightsNote) details.push(event.rightsNote);
    add("event-" + event.id, code, event.name, event.character + ".", details, {
      es: { title: eventLocales[event.id].es[0], summary: eventLocales[event.id].es[1], details: eventLocales[event.id].es[2] },
      zh: { title: eventLocales[event.id].zh[0], summary: eventLocales[event.id].zh[1], details: eventLocales[event.id].zh[2] },
    });
    if (event.isHouse) {
      add("house-" + event.id, "04 / " + event.house.toUpperCase(), event.house + " House", "This House receives its own nighttime personality without losing the shared Future Renaissance system.", [event.character, event.music, "Sponsor categories are selected for this audience", "Venue details remain unannounced until confirmed"], {
        es: { title: event.house + " House", summary: "Esta House recibe una personalidad nocturna propia sin perder el sistema compartido de Future Renaissance.", details: eventLocales[event.id].es[2] },
        zh: { title: eventLocales[event.id].zh[0].replace("夜间活动", ""), summary: "每个 House 都有独特的夜间个性，同时保留统一的 Future Renaissance 系统。", details: eventLocales[event.id].zh[2] },
      });
    }
  });

  add("claude-rights", "05 / RIGHTS", "Claude presenting hierarchy", "Claude already owns presenting status for Wednesday’s official party. That right is not available for resale.", ["Presented by Claude", "Hosted and produced by AXIS", "Future Renaissance supplies the after-hours operating system", "Other brands may participate only in permitted subordinate roles", "Plastician is a booking target—not a confirmed artist"], {
    es: { title: "Jerarquía de presentación de Claude", summary: "Claude ya posee el estatus de presentador para su fiesta oficial del miércoles. Ese derecho no está disponible para reventa.", details: ["Presentado por Claude", "Hospedado y producido por AXIS", "Future Renaissance aporta el sistema operativo after-hours", "Otras marcas participan solo en roles subordinados permitidos", "Plastician es un objetivo de booking, no un artista confirmado"] },
    zh: { title: "Claude 呈现权层级", summary: "Claude 已拥有周三官方派对的呈现方身份，该权利不可再次出售。", details: ["由 Claude 呈现", "AXIS 主办并制作", "Future Renaissance 提供夜间运营系统", "其他品牌仅以获准的次级身份参与", "Plastician 仅为邀约目标，并未确认"] },
  });

  var flowCopy = {
    register: ["Register", "Create the readable guest record that begins the journey."],
    "check-in": ["Check in", "Confirm physical presence at the selected event."],
    act: ["Act", "Complete the sponsor behavior defined for this mission."],
    validate: ["Validate", "Staff or system verifies the action before value unlocks."],
    unlock: ["Unlock", "Release the controlled benefit or reward."],
    progress: ["Progress", "Advance the participant’s cross-event state."],
    collect: ["Collect", "Claim an object, access state, or documented completion."],
    report: ["Report", "Turn attendance, actions, redemptions, and media into evidence."],
  };
  var flowTranslations = {
    es: ["Registrar", "Check-in", "Actuar", "Validar", "Desbloquear", "Avanzar", "Coleccionar", "Reportar"],
    zh: ["注册", "签到", "行动", "验证", "解锁", "进阶", "领取", "报告"],
  };
  Object.keys(flowCopy).forEach(function (key, index) {
    add("flow-" + key, "07 / " + String(index + 1).padStart(2, "0"), flowCopy[key][0], flowCopy[key][1], ["A legible guest state", "A defined transition", "A measurable record"], {
      es: { title: flowTranslations.es[index], summary: "Una etapa legible del pasaporte de misiones.", details: ["Estado claro del invitado", "Transición definida", "Registro medible"] },
      zh: { title: flowTranslations.zh[index], summary: "任务护照中清晰可读的一步。", details: ["清晰的参与者状态", "明确的状态转换", "可衡量的记录"] },
    });
  });

  var functionIds = ["wallet", "exchange", "dex", "marketplace", "launchpad", "defi", "payments"];
  circuit.onchainFunctions.forEach(function (item, index) {
    add("function-" + functionIds[index], "08 / FUNCTION", item[0], item[1] + ".", ["One product", "One operational function", "One measurable behavior", "A distinct role—not interchangeable logo placement"], {
      es: { title: item[0], summary: "Función: " + item[1] + ".", details: ["Un producto", "Una función operativa", "Un comportamiento medible", "Un rol distinto, no un logo intercambiable"] },
      zh: { title: item[0], summary: "产品功能：" + item[1] + "。", details: ["一个产品", "一个运营功能", "一个可衡量行为", "独特角色，而非可互换的标志位"] },
    });
  });

  var weekExamples = [
    ["week-tuesday", "Account creation", "Investors House"],
    ["week-wednesday", "Product use", "Claude Official Party"],
    ["week-thursday", "Second action", "Founders House"],
    ["week-friday", "Technical action", "Developers House"],
    ["week-saturday", "Advanced interaction", "AI House"],
    ["week-sunday", "Completion / reward", "Wellness House"],
  ];
  weekExamples.forEach(function (item, index) {
    add(item[0], "09 / EXAMPLE " + String(index + 1).padStart(2, "0"), item[1], "An example of how one sponsor journey can accumulate value through the circuit.", [item[2], "The exact action is defined around the sponsor product", "This sequence is illustrative, not mandatory", "State and reporting can persist across events"], {
      es: { title: ["Creación de cuenta", "Uso del producto", "Segunda acción", "Acción técnica", "Interacción avanzada", "Finalización / recompensa"][index], summary: "Ejemplo de cómo una experiencia de marca puede acumular valor durante el circuito.", details: [item[2], "La acción exacta se define según el producto", "La secuencia es ilustrativa, no obligatoria", "El estado y el reporte pueden persistir entre eventos"] },
      zh: { title: ["创建账户", "使用产品", "第二次行动", "技术行动", "高级互动", "完成 / 奖励"][index], summary: "示例：同一品牌旅程如何在整个系列中逐步累积价值。", details: [item[2], "具体行动围绕赞助商产品设计", "此路径仅为示例，并非强制", "参与状态与报告可跨活动延续"] },
    });
  });

  var tierConceptIds = {
    "single-house": "tier-single-house",
    "claude-party": "tier-claude-party",
    "three-house": "tier-three-house",
    "tech-town-circuit": "tier-tech-town",
    "complete-week": "tier-complete-week",
    "category-exclusive": "tier-category-exclusive",
    "tech-town-presenting": "tier-tech-town-presenting",
  };
  var tierTranslations = {
    "single-house": ["Socio de una House", "单场 House 合作伙伴"],
    "claude-party": ["Socio de la Fiesta Oficial de Claude", "Claude 官方派对合作伙伴"],
    "three-house": ["Circuito de tres Houses", "三场 House 系列"],
    "tech-town-circuit": ["Circuito Tech Town", "Tech Town 五场系列"],
    "complete-week": ["Socio de la semana completa", "完整一周合作伙伴"],
    "category-exclusive": ["Socio exclusivo de categoría", "品类独家系列合作伙伴"],
    "tech-town-presenting": ["Socio presentador de Tech Town", "Tech Town 呈现合作伙伴"],
  };
  circuit.commercialTiers.forEach(function (item) {
    var details = [item.scope, item.deployment].concat(item.rights);
    if (item.restriction) details.push(item.restriction);
    add(tierConceptIds[item.id], "COMMERCIAL / " + money(item.price), item.name, money(item.price) + ". " + item.scope, details, {
      es: { title: tierTranslations[item.id][0], summary: money(item.price) + ". " + item.scope, details: details.slice() },
      zh: { title: tierTranslations[item.id][1], summary: money(item.price) + "。" + item.scope, details: details.slice() },
    });
  });

  add("tech-town-presenting-rights", "14 / RIGHTS", "Five-House presenting—not Wednesday", money(10000) + " buys one presenting position across the five Tech Town House events only.", ["Investors, Founders, Developers, AI, and Wellness", "Claude retains presenting status for the official Claude party", "At Claude, this brand receives only permitted subordinate partner integration", "The position cannot override existing event or category obligations"], {
    es: { title: "Presentación en cinco Houses, no el miércoles", summary: money(10000) + " compra una posición de presentación únicamente en los cinco eventos Tech Town House.", details: ["Investors, Founders, Developers, AI y Wellness", "Claude conserva el estatus de presentador en su fiesta oficial", "En Claude, la marca recibe solo integración subordinada permitida", "La posición no reemplaza obligaciones existentes"] },
    zh: { title: "五场 House 呈现权，不含周三", summary: money(10000) + " 仅购买五场 Tech Town House 活动的唯一呈现席位。", details: ["Investors、Founders、Developers、AI 与 Wellness", "Claude 保留官方派对的呈现方身份", "在 Claude 活动中，该品牌仅获准以次级合作身份参与", "该席位不能覆盖既有活动或品类权利"] },
  });

  window.FUTURE_RENAISSANCE_CONCEPTS = concepts;
})();
