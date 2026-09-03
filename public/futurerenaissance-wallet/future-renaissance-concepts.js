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
  var mechanics = [
    ["connect", "Connect", "Entry and wallet connection are the same movement, so the wallet is opened while a host is standing there to help.", ["The scan that admits the guest is the scan that opens the session","No sign-up form, no email capture, no password at the door","Measured as connections completed at entry, not app installs","A failure here is visible immediately and fixed on the spot"], "Conectar", "La entrada y la conexión de la wallet son el mismo movimiento, así que la wallet se abre con un anfitrión al lado.", ["El escaneo que da acceso es el que abre la sesión","Sin formulario, sin correo, sin contraseña en la puerta","Se mide como conexiones completadas en la entrada","Una falla aquí se ve y se resuelve al momento"], "连接", "入场与钱包连接是同一个动作，钱包在有人协助时被打开。", ["刷码入场的同时开启会话","门口无需表单、邮箱或密码","以入口完成的连接数计量","此处的失败可当场发现并解决"]],
    ["passport", "Passport", "The night's mission passport is issued into the wallet, which makes the wallet the thing a guest needs to move through the evening.", ["Activity state is held in the wallet, not in a separate event app","Progress through the night is read from the same object","Measured as passports claimed and activities opened","The wallet earns a reason to be reopened all evening"], "Pasaporte", "El pasaporte de misiones de la noche se emite dentro de la wallet, lo que la convierte en lo que hace falta para moverse por la noche.", ["El estado de actividad vive en la wallet, no en otra app","El avance de la noche se lee del mismo objeto","Se mide como pasaportes reclamados y actividades abiertas","La wallet gana motivos para volver a abrirse toda la noche"], "任务护照", "当晚的任务护照直接发放到钱包中，钱包因此成为穿行整晚所需之物。", ["活动状态存在钱包内，而非另一个活动应用","整晚的进度读取自同一对象","以已领取的护照与开启的活动计量","钱包获得整晚被反复打开的理由"]],
    ["sign", "Sign", "Mission validation is a signature from the guest's own key, so a completed action is provable rather than asserted by staff.", ["Each completion is a signed message from the guest's key","Staff validation and signature must agree or nothing unlocks","Measured as qualified signed actions, separate from attendance","This is the number the post-event report is built on"], "Firmar", "La validación de misiones es una firma con la llave del invitado: la acción se prueba, no la afirma el staff.", ["Cada acción completada es un mensaje firmado","La validación del staff y la firma deben coincidir","Se mide como acciones firmadas calificadas","Es la cifra sobre la que se construye el reporte"], "签名", "任务验证使用参与者自己的密钥签名，完成的行为可被证明，而非由工作人员口头认定。", ["每次完成都是一次签名消息","工作人员验证与签名必须一致","以合格的签名行为计量","这是活动后报告赖以建立的数字"]],
    ["fund", "Fund", "The hardest step in any wallet funnel is the first funded balance. The three seated hours are the rare window where someone will actually finish it.", ["A staffed onboarding point runs through the 18:00–21:00 workshop","Support is physically present for the step that usually drops off","Measured as first-time funded wallets and median first balance","A funded wallet is the honest boundary between install and user"], "Fondear", "El primer saldo es el paso más difícil de cualquier funnel de wallets. Las tres horas sentadas son la ventana rara en la que alguien sí lo termina.", ["Punto de onboarding con staff durante el workshop de 18:00 a 21:00","Hay soporte presente en el paso donde se cae la gente","Se mide como wallets fondeadas por primera vez","Una wallet fondeada separa la instalación del uso real"], "注资", "首次入金是所有钱包漏斗中最难的一步。三小时的落座时段是少有的、真的会有人完成它的窗口。", ["18:00–21:00 工作坊期间设有人员值守的引导点","在最容易流失的环节提供现场支持","以首次注资钱包数与首次余额中位数计量","已注资钱包是安装量与真实用户的分界"]],
    ["collect", "Collect", "The room generates one-of-one work all evening. The wallet is where a guest actually keeps the piece they were standing in front of.", ["Work generated on the LED wall is collected into the guest's wallet","Self-custody means the piece survives the venue and the event app","Measured as artefacts collected and still held afterwards","Turns a night out into an object with a date on it"], "Coleccionar", "La sala genera obra única toda la noche. La wallet es donde el invitado se queda con la pieza frente a la que estuvo parado.", ["La obra del muro LED se colecciona en la wallet del invitado","La autocustodia hace que la pieza sobreviva a la sede y a la app","Se mide como piezas coleccionadas y aún conservadas","Convierte una salida en un objeto con fecha"], "收藏", "整晚这个空间都在生成独一无二的作品。钱包是参与者真正留下那件作品的地方。", ["LED 墙上生成的作品被收藏进参与者的钱包","自持意味着作品不依赖场地或活动应用而存续","以已收藏及事后仍持有的作品计量","把一次外出变成一件带日期的物件"]],
    ["redeem", "Redeem", "A completed action authorises a drink at the venue bar. The guest learns that the wallet is what paid for it.", ["Redemption at the bar is authorised from the wallet","Staff-guided, so a first-time user is never stuck holding up a queue","Measured as redemptions completed against actions verified","People remember who paid for their drink"], "Canjear", "Una acción completada autoriza una bebida en la barra. El invitado aprende que la wallet fue lo que la pagó.", ["El canje en la barra se autoriza desde la wallet","Guiado por staff: nadie se traba frente a la fila","Se mide como canjes completados contra acciones verificadas","La gente recuerda quién pagó su bebida"], "兑换", "完成的行为可在吧台兑换一杯饮品，参与者由此明白是钱包付的账。", ["吧台兑换由钱包授权","有工作人员引导，新用户不会卡在队伍前","以完成的兑换数对照已验证行为计量","人们会记得是谁请了这杯酒"]],
    ["keep", "Keep", "When the closing DJ finishes, the wallet is the one channel that still resolves. Everything AXIS reports back is anchored to it.", ["Post-event reachability without a mailing list or a scraped export","Reward redemption can continue after the venue closes","Measured as addresses still active in the weeks that follow","The asset the partner keeps once the production is over"], "Conservar", "Cuando termina el DJ de cierre, la wallet es el único canal que sigue resolviendo. Todo el reporte se ancla a ella.", ["Alcance posterior sin lista de correo ni exportación","El canje puede continuar después de que cierra la sede","Se mide como direcciones activas en las semanas siguientes","Es el activo que la marca conserva al terminar la producción"], "留存", "压轴 DJ 结束后，钱包是唯一仍然可达的渠道，全部回报都锚定于此。", ["无需邮件列表即可持续触达","场地打烊后兑换仍可继续","以其后数周仍活跃的地址计量","制作结束后品牌真正保留的资产"]],
  ];
  mechanics.forEach(function (item, index) {
    add("mechanic-" + item[0], "08 / " + String(index + 1).padStart(2, "0"), item[1], item[2], item[3], {
      es: { title: item[4], summary: item[5], details: item[6] },
      zh: { title: item[7], summary: item[8], details: item[9] },
    });
  });

  var rewardFlow = [
    ["onboard", "Wallet connected at entry", "The guest is admitted and the wallet session opens in the same movement, with a host present.", ["At the door, before the room absorbs them","No form, no email, no password","Baseline cohort for every number that follows","Measured as connections completed at entry"], "Wallet conectada en la entrada", "El invitado entra y la sesión de la wallet se abre en el mismo movimiento, con un anfitrión presente.", ["En la puerta, antes de que la sala se lo trague","Sin formulario, sin correo, sin contraseña","Cohorte base para todas las cifras siguientes","Se mide como conexiones completadas en la entrada"], "入口完成钱包连接", "参与者入场的同时开启钱包会话，且有工作人员在场。", ["在门口完成，趁人还没被场内吸走","无需表单、邮箱或密码","后续所有数据的基准群体","以入口完成的连接数计量"]],
    ["act", "First signed action", "During the seated workshop the guest completes the partner's defined action and signs for it.", ["18:00–21:00, seated, 200 attendees, staffed support","The window where a first-time user will actually finish","Signed from the guest's own key","Measured as qualified signed actions"], "Primera acción firmada", "Durante el workshop sentado el invitado completa la acción definida por el partner y la firma.", ["18:00–21:00, sentados, 200 asistentes, con soporte","La ventana donde un usuario nuevo sí termina","Firmada con la llave del propio invitado","Se mide como acciones firmadas calificadas"], "首次签名行动", "在落座工作坊期间，参与者完成合作方设定的行为并为其签名。", ["18:00–21:00，落座，200 人，有支持人员","新用户真正会完成动作的时间窗","由参与者自己的密钥签名","以合格的签名行为计量"]],
    ["validate", "Staff and signature agree", "AXIS staff validate against the signed record before any value is released.", ["Two independent confirmations, not an honour system","Nothing unlocks if the two disagree","Protects the partner from inflated completion numbers","Measured as validated completions"], "Staff y firma coinciden", "El staff de AXIS valida contra el registro firmado antes de liberar cualquier valor.", ["Dos confirmaciones independientes, no un sistema de confianza","Si no coinciden, no se desbloquea nada","Protege al partner de cifras infladas","Se mide como completaciones validadas"], "人工与签名一致", "AXIS 工作人员对照签名记录进行验证，之后才释放任何价值。", ["两次独立确认，而非凭信任","两者不一致则不予解锁","避免合作方拿到被夸大的完成数据","以通过验证的完成数计量"]],
    ["redeem", "Drink unlocked from the wallet", "The validated action opens a drink at the venue bar, authorised from the wallet itself.", ["Real hospitality at a real bar, not a voucher posted later","Staff-guided so nobody is stuck at the counter","The moment the product becomes memorable","Measured as redemptions against actions verified"], "Bebida desbloqueada desde la wallet", "La acción validada abre una bebida en la barra, autorizada desde la propia wallet.", ["Hospitalidad real en una barra real, no un cupón posterior","Guiado por staff para que nadie se trabe","El momento en que el producto se vuelve memorable","Se mide como canjes contra acciones verificadas"], "用钱包解锁一杯酒", "通过验证的行为可在场地吧台兑换饮品，由钱包直接授权。", ["真实吧台的真实款待，不是事后发放的券","有人员引导，不会卡在吧台","产品变得令人记住的时刻","以兑换数对照已验证行为计量"]],
    ["screen", "Collected work on the wall", "Work the guests generated runs on the main LED wall, and what they collected is held in the wallet.", ["The room's own output, generated with Claude","Collection happens while the piece is on the wall","Product presence earned by function, not by logo placement","Measured as artefacts collected during the night"], "Obra coleccionada en el muro", "La obra que generaron los invitados corre en el muro LED, y lo que coleccionan queda en la wallet.", ["El output de la propia sala, generado con Claude","La colección ocurre mientras la pieza está en el muro","Presencia de producto ganada por función, no por logo","Se mide como piezas coleccionadas durante la noche"], "收藏的作品出现在墙上", "参与者生成的作品在主 LED 墙上运行，他们收藏的部分留在钱包里。", ["由这个空间自己产生、与 Claude 共同创作","作品还在墙上时即可完成收藏","靠功能而非标志赢得的产品存在感","以当晚收藏的作品数计量"]],
    ["report", "Addresses, actions, redemptions", "After the night, AXIS delivers the operational record separated from the media production.", ["Observed actions reported apart from calculated outcomes","Connections, funded wallets, signed actions, redemptions","Addresses still active in the weeks that follow","No fabricated conversion promises"], "Direcciones, acciones, canjes", "Después de la noche, AXIS entrega el registro operativo separado de la producción de medios.", ["Acciones observadas separadas de resultados calculados","Conexiones, wallets fondeadas, acciones firmadas, canjes","Direcciones activas en las semanas siguientes","Sin promesas de conversión fabricadas"], "地址、行为、兑换", "活动结束后，AXIS 交付与影像制作分开呈现的运营记录。", ["观察到的行为与计算结果分开列示","连接数、注资钱包、签名行为、兑换数","其后数周仍活跃的地址","不做虚构的转化承诺"]],
  ];
  rewardFlow.forEach(function (item, index) {
    add("step-" + item[0], "09 / " + String(index + 1).padStart(2, "0"), item[1], item[2], item[3], {
      es: { title: item[4], summary: item[5], details: item[6] },
      zh: { title: item[7], summary: item[8], details: item[9] },
    });
  });
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
