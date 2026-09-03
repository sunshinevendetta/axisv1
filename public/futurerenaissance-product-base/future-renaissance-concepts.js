(function () {
  "use strict";

  var circuit = window.FUTURE_RENAISSANCE;
  var night = circuit.night;
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

  var programLocales = {
    workshop: {
      es: ["Workshop de Claude", "Tres horas sentadas y prácticas para quienes trabajan en música, conducidas desde la pantalla al frente de la sala.", ["18:00 – 21:00", "200 lugares, una silla por asistente", "Productores, artistas, sellos, managers y estudios", "La pantalla de la sede lleva la sesión"]],
      zh: ["Claude 工作坊", "为音乐从业者准备的三小时实操课程，由房间前方的屏幕带领进行。", ["18:00 – 21:00", "200 个座位，每位参与者都有座", "制作人、艺术家、厂牌、经纪与录音室", "场地屏幕承载整场课程"]],
    },
    reset: {
      es: ["Cambio de sala", "La sala sentada se convierte en la noche. Producción, sonido e iluminación cambian de estado.", ["21:00 – 22:00", "Reconfiguración técnica completa", "El mismo espacio, otra función", "Los asistentes del workshop pueden quedarse"]],
      zh: ["场地转换", "落座的课堂变成夜晚。制作、声音与灯光切换状态。", ["21:00 – 22:00", "完整的技术重新配置", "同一空间，不同用途", "工作坊参与者可以留下"]],
    },
    warmup: {
      es: ["DJ de apertura", "Las puertas se abren de nuevo para el after party. Llegada, energía inicial y activación de la sala.", ["22:00", "+250 invitados adicionales", "Llegada y activación", "Entra gradualmente al programa central"]],
      zh: ["暖场 DJ", "为 after party 再次开门。到场、初始能量与空间激活。", ["22:00", "另外 250 位来宾", "到场与激活", "逐步进入核心环节"]],
    },
    "live-coding": {
      es: ["Live coding", "Música escrita, secuenciada y modificada con código en tiempo real, visible para toda la sala.", ["El centro creativo de la noche", "El código es visible mientras suena", "Alimenta el muro LED principal", "Momento de mayor captura de contenido"]],
      zh: ["实时编码", "音乐通过代码实时书写、编排与修改，全场可见。", ["整晚的创作核心", "代码在发声的同时可见", "驱动主 LED 墙", "内容拍摄的高峰时刻"]],
    },
    closing: {
      es: ["DJ de cierre", "Lleva la noche de su parte experimental a su estado final de club.", ["Cierre del programa", "Del experimento al club", "La sala en su punto más lleno", "Cierre de canjes y recompensas"]],
      zh: ["压轴 DJ", "把夜晚从实验部分带入最终的俱乐部状态。", ["节目收尾", "从实验走向俱乐部", "全场人数最密集的时段", "兑换与奖励在此结束"]],
    },
  };

  circuit.program.forEach(function (step, index) {
    add("program-" + step.id, "03 / " + String(index + 1).padStart(2, "0"), step.label, step.note, [
      step.time,
      step.arc,
      night.venue + ", " + night.city,
      night.displayDate,
    ], {
      es: { title: programLocales[step.id].es[0], summary: programLocales[step.id].es[1], details: programLocales[step.id].es[2] },
      zh: { title: programLocales[step.id].zh[0], summary: programLocales[step.id].zh[1], details: programLocales[step.id].zh[2] },
    });
  });

  var lineupLocales = {
    verse: {
      es: ["Verse Works", "Plataforma de arte generativo y digital fundada en Londres en 2022, que da a la obra hecha con código el tratamiento curatorial de una galería.", ["Plataforma y curaduría generativa", "2022 · Londres", "Ha presentado a Zancan y Mark Titchner", "La obra lee un hash al coleccionarse y se dibuja desde esa semilla"]],
      zh: ["Verse Works", "2022 年创立于伦敦的生成与数字艺术平台，让以代码创作的作品获得画廊级的策展待遇。", ["生成艺术平台与策展方", "2022 · 伦敦", "曾呈现 Zancan 与 Mark Titchner", "作品在被收藏时读取哈希并据此生成"]],
    },
    pixelord: {
      es: ["Pixelord", "Alexey Devyanin, productor y cofundador de Hyperboloid Records, publica sonido y visuales 3D juntos onchain.", ["Productor y artista audiovisual onchain", "Hyperboloid Records, cofundador", "IDM, breakbeat, bass y glitch", "Obra digital en el line up"]],
      zh: ["Pixelord", "Alexey Devyanin，制作人，Hyperboloid Records 联合创始人，将声音与 3D 视觉一同发布于链上。", ["制作人与链上视听艺术家", "Hyperboloid Records，联合创始人", "IDM、breakbeat、bass 与 glitch", "阵容中的数字作品"]],
    },
    public: {
      es: ["El público", "El público aparece en el line up porque la sala hace la obra.", ["Cada invitado en la sala", "Claude, en el muro LED principal", "Una foto, un video o un prompt cambian los visuales", "Resultados que cambian con la interacción"]],
      zh: ["公众", "公众之所以列入阵容，是因为作品由整个空间共同完成。", ["在场的每一位来宾", "Claude，呈现在主 LED 墙上", "一张照片、一段视频或一个提示即可改变视觉", "随互动而变化的输出"]],
    },
  };

  circuit.lineup.forEach(function (act, index) {
    add("lineup-" + act.id, "04 / " + String(index + 1).padStart(2, "0"), act.name, act.note, [
      act.kind,
      act.discipline,
      "On the line-up at " + night.venue,
      night.displayDate,
    ], {
      es: { title: lineupLocales[act.id].es[0], summary: lineupLocales[act.id].es[1], details: lineupLocales[act.id].es[2] },
      zh: { title: lineupLocales[act.id].zh[0], summary: lineupLocales[act.id].zh[1], details: lineupLocales[act.id].zh[2] },
    });
  });

  add("claude-rights", "05 / STATUS", "Claude community event", "The night is a Claude community event hosted, produced and operated by AXIS. That status is not available for resale.", [
    "Claude community event · Mexico City",
    "Hosted, produced and operated by AXIS",
    night.venue + " is the host venue",
    "Product partners participate through authored activities in permitted subordinate roles",
  ], {
    es: { title: "Evento de comunidad de Claude", summary: "La noche es un evento de comunidad de Claude, hospedado, producido y operado por AXIS. Ese estatus no está disponible para reventa.", details: ["Evento de comunidad de Claude · Ciudad de México", "Hospedado, producido y operado por AXIS", night.venue + " es la sede anfitriona", "Los partners de producto participan mediante actividades autoradas en roles subordinados permitidos"] },
    zh: { title: "Claude 社区活动", summary: "当晚是由 AXIS 主办、制作并运营的 Claude 社区活动，该身份不可转售。", details: ["Claude 社区活动 · 墨西哥城", "由 AXIS 主办、制作并运营", night.venue + " 为主办场地", "产品合作方通过获准的次级角色参与既定活动"] },
  });

  var flowCopy = {
    register: ["Register", "Create the readable guest record that begins the journey."],
    "check-in": ["Check in", "Confirm physical presence at the venue."],
    act: ["Act", "Complete the partner behavior defined for this activity."],
    validate: ["Validate", "Staff or system verifies the action before value unlocks."],
    unlock: ["Unlock", "Release the controlled benefit or reward."],
    progress: ["Progress", "Advance the participant's state through the evening."],
    collect: ["Collect", "Claim an object, access state, or documented completion."],
    report: ["Report", "Turn attendance, actions, redemptions and media into evidence."],
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

  /* @generated:concepts */
  /* @end */

  var tierTranslations = {
    "activity-partner": ["Partner de actividad", "活动合作伙伴"],
    "category-exclusive": ["Partner exclusivo de categoría", "品类独家合作伙伴"],
  };
  circuit.commercialTiers.forEach(function (item, index) {
    var price = item.price === null ? item.priceNote : money(item.price);
    var details = [item.scope, item.deployment].concat(item.rights);
    if (item.restriction) details.push(item.restriction);
    add("tier-" + item.id, "11 / " + String(index + 1).padStart(2, "0"), item.name, price + ". " + item.scope, details, {
      es: { title: tierTranslations[item.id][0], summary: price + ". " + item.scope, details: details.slice() },
      zh: { title: tierTranslations[item.id][1], summary: price + "。" + item.scope, details: details.slice() },
    });
  });

  window.FUTURE_RENAISSANCE_CONCEPTS = concepts;
})();
