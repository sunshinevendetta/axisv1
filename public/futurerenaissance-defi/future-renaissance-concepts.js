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
    ["deposit", "Deposit", "The first deposit is made at a staffed onboarding point inside the workshop, with a host beside the guest for the step that normally happens alone at one in the morning.", ["Opened during the 18:00 to 21:00 workshop, from a seat rather than a crowded bar","Staff present for wallet connection, network, approval and confirmation","A failed or stuck transaction is diagnosed in the room instead of abandoned","Measured as first-time deposits completed on site and median first deposit size"], "Depositar", "El primer depósito se hace en un punto de onboarding con personal dentro del taller, con un anfitrión al lado en el paso que normalmente ocurre solo a la una de la mañana.", ["Se abre durante el taller de 18:00 a 21:00, sentado y sin prisa","Personal presente para conectar wallet, red, aprobación y confirmación","Una transacción fallida se resuelve en la sala en vez de abandonarse","Se mide como primeros depósitos completados en sitio y monto mediano"], "存入", "首次存入在工作坊内由工作人员值守的引导点完成，通常凌晨独自面对的那一步，这里有人站在旁边。", ["在 18:00 至 21:00 的工作坊期间完成，坐着操作而非挤在吧台","钱包连接、网络、授权与确认全程有人协助","交易失败当场排查，而不是就此放弃","以现场完成的首次存入数与存入金额中位数计量"]],
    ["terms", "Terms", "Three seated hours are the rare window where somebody will actually read what they are depositing into. Staff walk the risk and terms page before any confirmation is taken.", ["Lock-up, fees, smart-contract risk and withdrawal conditions said out loud","The explainer runs on the venue screen during the workshop block","No confirmation is accepted from a guest who has not been through it","Measured as terms walkthroughs completed against deposits opened"], "Términos", "Tres horas sentado son la ventana rara en la que alguien de verdad lee en qué está depositando. El personal recorre la hoja de riesgos y términos antes de cualquier confirmación.", ["Bloqueo, comisiones, riesgo de contrato y condiciones de retiro dichos en voz alta","El explicador corre en la pantalla del venue durante el taller","No se acepta confirmación de quien no pasó por ahí","Se mide como recorridos de términos completados frente a depósitos abiertos"], "条款", "三小时的座席时间，是极少数有人会真正读清自己存入了什么的窗口。任何确认之前，工作人员会逐条讲解风险与条款页。", ["锁定期、费用、合约风险与提取条件都会当众讲明","讲解内容在工作坊时段于场地屏幕上同步呈现","未完成讲解的来宾不会被接受确认","以完成条款讲解的人数与已开仓位数对照计量"]],
    ["accrue", "Accrue", "The position stays open from the workshop through the live coding set to the closing DJ, so the guest spends the night with the thing they read about actually doing something.", ["Opened before 21:00 and visible on the guest's own phone all night","Guests check it between the warm-up DJ and the live coding set","No projected figure and no rate is shown, quoted or promised at any point","Measured as positions still open when the doors reopen at 22:00"], "Acumular", "La posición queda abierta desde el taller, pasa por el set de live coding y llega al closing DJ, así que el invitado pasa la noche con eso que leyó haciendo algo real.", ["Abierta antes de las 21:00 y visible en su propio teléfono toda la noche","Los invitados la revisan entre el DJ de apertura y el live coding","No se muestra ni se promete ninguna cifra ni tasa proyectada","Se mide como posiciones aún abiertas cuando se abren las puertas a las 22:00"], "累积", "仓位从工作坊一直保持到 live coding 与闭场 DJ，来宾整晚都能看到自己读过的东西真的在运行。", ["21:00 前开仓，整晚可在自己手机上查看","来宾会在暖场 DJ 与 live coding 之间反复查看","全程不展示、不引用、不承诺任何收益率或预估数字","以 22:00 再次开门时仍然持仓的数量计量"]],
    ["settle", "Settle", "At the closing DJ the room settles together. Each position is closed at a staffed point and the guest sees exactly what it came to, with nothing estimated beforehand.", ["One announced settlement moment rather than a slow trickle of exits","Whatever the position settles at is what the guest is shown","Staff resolve failed, stuck or partially filled settlements on the spot","Measured as positions settled against positions opened"], "Liquidar", "En el closing DJ la sala liquida junta. Cada posición se cierra en un punto con personal y el invitado ve exactamente en cuánto quedó, sin estimaciones previas.", ["Un momento de liquidación anunciado, no salidas a cuentagotas","Lo que dé la posición es lo que se le muestra al invitado","El personal resuelve liquidaciones fallidas o atoradas al momento","Se mide como posiciones liquidadas frente a posiciones abiertas"], "结算", "闭场 DJ 时段全场一起结算。每个仓位都在有人值守的点位平仓，来宾看到的是真实结果，事先不做任何估算。", ["一个公开宣布的结算时刻，而非零散离场","仓位结算成多少，就向来宾展示多少","失败、卡住或部分成交的结算由现场人员处理","以已结算仓位与已开仓位对照计量"]],
    ["bartab", "Bar Tab", "The literal mechanic: a settled position is what releases the guest's drink at the bar. AXIS funds the allocation, so the drink is covered whatever the position returns.", ["The bar reads a settled position, not a wristband or a paper stamp","AXIS funds the drink allocation and buys the drinks from the venue bar","The guest leaves with a drink whether the settlement is large or small","Measured as drinks redeemed against a settled position"], "Cuenta de barra", "La mecánica literal: una posición liquidada es lo que libera el trago del invitado en la barra. AXIS financia la asignación, así que el trago está cubierto sin importar el resultado.", ["La barra lee una posición liquidada, no una pulsera ni un sello","AXIS financia la asignación de tragos y los compra en la barra del venue","El invitado sale con su trago sea grande o chica la liquidación","Se mide como tragos redimidos contra una posición liquidada"], "吧台账单", "字面意义上的机制：已结算的仓位才是解锁那杯酒的凭据。额度由 AXIS 出资，因此无论结果如何，这杯酒都有着落。", ["吧台读取的是已结算的仓位，不是手环或纸质印章","AXIS 出资酒水额度，并从场地吧台采购","无论结算金额大小，来宾都能拿到酒","以凭已结算仓位兑换的酒水杯数计量"]],
    ["claim", "Claim", "Points, incentives or reward tokens the protocol issues are claimed in the room at close, not left sitting in an interface the guest will never open again.", ["Claiming is a staffed step at the closing point, not a follow-up email","Approvals, gas and stuck claims are handled by staff who are present","The guest watches the reward land in their own wallet before they go","Measured as rewards claimed the same night versus rewards left unclaimed"], "Reclamar", "Puntos, incentivos o tokens de recompensa que emita el protocolo se reclaman en la sala al cierre, no quedan en una interfaz que el invitado no volverá a abrir.", ["Reclamar es un paso con personal en el punto de cierre, no un correo posterior","Aprobaciones, gas y reclamos atorados los resuelve quien está ahí","El invitado ve la recompensa llegar a su propia wallet antes de irse","Se mide como recompensas reclamadas esa noche frente a las no reclamadas"], "领取", "协议发放的积分、激励或奖励代币在闭场时于现场领取，不会留在一个来宾再也不会打开的界面里。", ["领取是闭场点位上有人协助的一步，不是事后的一封邮件","授权、Gas 与卡住的领取由在场人员当场解决","来宾亲眼看到奖励进入自己的钱包后才离场","以当晚已领取与未领取的奖励数量计量"]],
    ["withdraw", "Withdraw", "Withdrawal is completed before the guest leaves Bar Oriente. A position opened and closed the same night is a complete, honest funnel rather than an abandoned one.", ["Deposit, hold, settle and withdraw all inside a single night","Principal back in the guest's own custody before they walk out","A guest who chooses to keep the position open does so knowingly and on record","Measured as withdrawals completed and positions left open at close"], "Retirar", "El retiro se completa antes de que el invitado salga de Bar Oriente. Una posición abierta y cerrada la misma noche es un embudo completo y honesto, no uno abandonado.", ["Depositar, mantener, liquidar y retirar dentro de una sola noche","El principal vuelve a su custodia antes de que salga por la puerta","Quien decide dejar la posición abierta lo hace a conciencia y queda registrado","Se mide como retiros completados y posiciones abiertas al cierre"], "提取", "提取在来宾离开 Bar Oriente 之前完成。同一晚开仓又平仓，是一个完整而诚实的漏斗，而不是一个被遗弃的仓位。", ["存入、持有、结算、提取，全部发生在同一个晚上","本金在来宾走出场地之前回到他们自己手中","选择继续持仓的人是在知情前提下决定，并留下记录","以完成的提取数与闭场时仍未平的仓位数计量"]],
  ];
  mechanics.forEach(function (item, index) {
    add("mechanic-" + item[0], "08 / " + String(index + 1).padStart(2, "0"), item[1], item[2], item[3], {
      es: { title: item[4], summary: item[5], details: item[6] },
      zh: { title: item[7], summary: item[8], details: item[9] },
    });
  });

  var rewardFlow = [
    ["onboard", "Deposit opened at the seats", "Between 18:00 and 21:00 the deposit point works the seated room row by row while the workshop runs on the venue screen.", ["200 seated attendees from the music industry, a chair for every one of them","Staff-guided: wallet, network and first approval handled in person","The quietest, most attentive onboarding window of the night","Measured as guests onboarded against seats filled"], "Depósito abierto en los asientos", "Entre las 18:00 y las 21:00 el punto de depósito recorre la sala sentada fila por fila mientras el taller corre en la pantalla del venue.", ["200 asistentes sentados de la industria musical, una silla para cada uno","Flujo guiado: wallet, red y primera aprobación resueltas en persona","La ventana de onboarding más tranquila y atenta de la noche","Se mide como invitados onboardeados frente a asientos ocupados"], "在座位上完成开仓", "18:00 至 21:00，存入点位沿着座席一排排推进，工作坊同时在场地屏幕上进行。", ["200 位来自音乐行业的座席来宾，每人一把椅子","全程有人引导：钱包、网络与首次授权都在现场完成","这是当晚最安静、注意力最集中的引导窗口","以完成引导的来宾数与实际座席数对照计量"]],
    ["act", "Terms read, then deposit made", "The action happens inside the partner's own product. The guest goes through the risk page with staff, then deposits from their own wallet.", ["A real transaction in the live product, not a mock screen or a demo wallet","The terms walkthrough comes first and is what unlocks the deposit step","Support is standing there for the failure modes that kill remote funnels","Measured as deposits confirmed on chain, not app installs"], "Términos leídos y depósito hecho", "La acción ocurre dentro del producto del socio. El invitado recorre la hoja de riesgos con el personal y deposita desde su propia wallet.", ["Una transacción real en el producto vivo, no una pantalla de demo","El recorrido de términos va primero y es lo que habilita el depósito","Hay soporte para los errores que matan cualquier funnel remoto","Se mide como depósitos confirmados en cadena, no como instalaciones"], "读完条款后完成存入", "行动发生在合作方自己的产品里。来宾在工作人员陪同下读完风险页，再从自己的钱包完成存入。", ["在真实产品中的真实交易，不是演示界面或测试钱包","条款讲解在前，完成后才解锁存入这一步","远程漏斗中最容易失败的环节，这里都有人在旁边","以链上确认的存入笔数计量，而非应用安装量"]],
    ["validate", "Position verified on chain", "Staff validation and onchain confirmation have to agree before anything unlocks. A promoter's word is not evidence; a confirmed position is.", ["Guest state updates only when the human check and the chain check match","Attendance and qualified action stay separate numbers throughout","An unverified guest can be helped again rather than quietly dropped","Measured as verified positions, reported apart from headcount"], "Posición verificada en cadena", "La validación del personal y la confirmación en cadena tienen que coincidir antes de desbloquear nada. La palabra de un promotor no es evidencia; una posición confirmada sí.", ["El estado del invitado avanza solo si ambas verificaciones coinciden","Asistencia y acción calificada se reportan siempre por separado","A quien no verifica se le vuelve a ayudar en vez de perderlo","Se mide como posiciones verificadas, aparte del conteo de personas"], "链上确认仓位", "人工验证与链上确认必须一致，才会解锁后续。主办方的口头认可不是证据，一个已确认的仓位才是。", ["两项验证一致时，来宾状态才会推进","到场人数与合格行为始终作为两个数字分别呈现","未通过验证的来宾会再次获得协助，而不是被悄悄放弃","以已验证仓位数计量，与到场人数分开报告"]],
    ["redeem", "Settled position opens the tab", "The guest goes to the bar, the bar reads a settled position, and the drink is served out of the allocation AXIS funds.", ["Redemption happens at the venue bar, in front of a bartender","People remember who paid for their drink and what they did to get it","The drink is covered by the AXIS allocation regardless of settlement size","Measured as redemptions completed against verified positions"], "La posición liquidada abre la cuenta", "El invitado va a la barra, la barra lee una posición liquidada y el trago sale de la asignación que financia AXIS.", ["La redención ocurre en la barra del venue, frente a un bartender","La gente recuerda quién le pagó el trago y qué hizo para conseguirlo","El trago está cubierto por AXIS sin importar el monto liquidado","Se mide como redenciones completadas frente a posiciones verificadas"], "已结算的仓位开启账单", "来宾走到吧台，吧台读取已结算的仓位，酒从 AXIS 出资的额度中发出。", ["兑换发生在场地吧台，由调酒师当面完成","人们会记得是谁请的这杯酒，以及自己做了什么换来的","无论结算金额多少，这杯酒都由 AXIS 额度覆盖","以完成的兑换数与已验证仓位对照计量"]],
    ["close", "Claim, withdraw, and out", "At the closing DJ the room settles, claims and withdraws together, and the running count of completed cycles goes up on the main LED wall.", ["Settlement, claim and withdrawal handled at one staffed point","The completed-cycle count appears on the main LED wall between sets","Capture and social publication happen at the moment guests close, with consent","Measured as complete deposit-to-withdrawal cycles"], "Reclamar, retirar y salir", "En el closing DJ la sala liquida, reclama y retira junta, y el conteo de ciclos completos sube al muro LED principal.", ["Liquidación, reclamo y retiro en un mismo punto con personal","El conteo de ciclos completos aparece en el muro LED entre sets","Captura y publicación social en el momento del cierre, con consentimiento","Se mide como ciclos completos de depósito a retiro"], "领取、提取、离场", "闭场 DJ 时段，全场一起结算、领取并提取，完成闭环的数量实时显示在主 LED 墙上。", ["结算、领取与提取集中在同一个有人值守的点位","完成闭环的计数在换场间隙出现在主 LED 墙上","在来宾平仓的那一刻完成拍摄与社交发布，均经同意","以完整的存入到提取闭环数量计量"]],
    ["report", "Every position in the report", "The post-event report closes the loop with counts the partner can check against their own backend rather than a photo of a crowd.", ["Deposits opened, terms walked, positions verified and positions settled","Rewards claimed, withdrawals completed and any position left open","Drinks redeemed against settled positions, plus capture and social output","Delivered as numbers and media, not as an impressions estimate"], "Cada posición en el reporte", "El reporte posterior cierra el circuito con cifras que el socio puede contrastar contra su propio backend, no con una foto de la multitud.", ["Depósitos abiertos, términos recorridos, posiciones verificadas y liquidadas","Recompensas reclamadas, retiros completados y posiciones que quedaron abiertas","Tragos redimidos contra posiciones liquidadas, más captura y contenido social","Se entrega como números y material, no como estimación de impresiones"], "每一个仓位都进入报告", "会后报告用合作方可以拿回自己后台核对的数字收尾，而不是一张人群照片。", ["已开仓位、已讲解条款、已验证与已结算的仓位","已领取奖励、已完成提取，以及仍然留仓的数量","凭已结算仓位兑换的酒水，以及拍摄与社交产出","以数字与素材交付，而不是曝光量估算"]],
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
