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
    ["issue", "Issue", "Cards are issued or provisioned on the spot: during the 18:00 workshop for the seated 200, then at the door from 22:00 for everyone arriving for the party.", ["Provisioned into the phone the guest is already holding, with support present","First-time users are walked through it rather than left with a QR code","Finished before the guest reaches the bar, not after they are queuing","Measured as cards provisioned and cards used at least once the same night"], "Emitir", "Las tarjetas se emiten o provisionan en el momento: durante el taller de las 18:00 para los 200 sentados y en la puerta desde las 22:00 para quienes llegan a la fiesta.", ["Se provisiona en el teléfono que el invitado ya trae en la mano, con soporte al lado","A quien es primerizo se le acompaña, no se le deja con un código QR","Queda listo antes de llegar a la barra, no mientras hace fila","Se mide como tarjetas provisionadas y tarjetas usadas al menos una vez esa noche"], "发卡", "卡片在现场即时发放或开通：18:00 的工作坊为 200 位座席来宾办理，22:00 起在门口为到场派对的来宾办理。", ["直接开通在来宾手里已经拿着的手机上，全程有人协助","第一次使用的人有人带着做，而不是丢给一个二维码","在走到吧台之前就已办好，而不是排队时才开始","以已开通的卡数与当晚至少使用过一次的卡数计量"]],
    ["tap", "Tap", "The product's core action is the room's core action. A guest taps at Bar Oriente's bar and is handed a drink, with no app-store detour and no code to read out.", ["The transaction happens at the bar counter, in front of a bartender","It has to work at the speed of the card the guest already carries","A decline is visible immediately and staff are standing right there","Measured as taps completed and time from tap to drink served"], "Tap", "La acción central del producto es la acción central de la sala. El invitado acerca el teléfono o la tarjeta en la barra de Bar Oriente y recibe su trago, sin descargar nada ni dictar un código.", ["La transacción ocurre en la barra, frente a un bartender","Tiene que funcionar a la velocidad de la tarjeta que ya trae en la cartera","Un rechazo se ve al instante y hay personal parado ahí mismo","Se mide como taps completados y tiempo entre el tap y el trago servido"], "刷卡", "产品的核心动作，就是这个空间的核心动作。来宾在 Bar Oriente 吧台轻触一下就拿到酒，不用下载应用，也不用报出兑换码。", ["交易发生在吧台前，由调酒师当面完成","速度必须与来宾钱包里那张卡一样快","拒付会立刻显现，而工作人员就站在旁边","以完成的支付笔数与从支付到出酒的时间计量"]],
    ["repeat", "Repeat", "Nobody buys one drink between 22:00 and close. Repeat spend is what separates a payments partner from every other product on the floor: the same guest uses it again and again without being asked.", ["Onboarding is paid for once and the action repeats for the rest of the night","After the first transaction, repeat use needs no staff at all","The rail is exercised under real load, at bar pace, not in a demo","Measured as transactions per guest across the night"], "Repetir", "Nadie compra un solo trago entre las 22:00 y el cierre. El gasto repetido es lo que separa a un socio de pagos de cualquier otro producto en el piso: el mismo invitado lo usa una y otra vez sin que se lo pidan.", ["El onboarding se paga una vez y la acción se repite el resto de la noche","Después de la primera transacción, repetir ya no necesita personal","El rail se prueba con carga real, a ritmo de barra, no en un demo","Se mide como transacciones por invitado a lo largo de la noche"], "复用", "从 22:00 到散场，没有人只喝一杯。重复消费正是支付类合作方与场内其他产品的分界：同一位来宾会主动一次又一次地使用它。", ["引导成本只付一次，动作却在整晚不断重复","第一笔交易之后，后续使用完全不需要工作人员","通道在真实负载与吧台节奏下被验证，而不是在演示里","以每位来宾当晚的交易笔数计量"]],
    ["tab", "Tab", "A guest tab is opened at check-in and closed before the guest leaves, so nothing is left hanging on a card behind the bar at four in the morning.", ["Opened with the entry scan at the door, workshop guests carried through","The running total is visible to the guest all night, not a surprise at the end","Closed at a staffed point on the way out, with the guest looking at it","Measured as tabs opened, tabs closed, and tabs closed before departure"], "Cuenta", "La cuenta del invitado se abre en el check-in y se cierra antes de que se vaya, para que nada quede colgado en una tarjeta detrás de la barra a las cuatro de la mañana.", ["Se abre con el escaneo de entrada, y los del taller la traen desde antes","El total corriente es visible toda la noche, sin sorpresas al final","Se cierra en un punto con personal, de salida y con el invitado viéndola","Se mide como cuentas abiertas, cerradas y cerradas antes de la salida"], "账单", "来宾的账单在入场时开启，并在离场前结清，不会有任何一张卡被留在吧台后面到凌晨四点。", ["随入场扫码开启，工作坊来宾的账单一路延续下来","累计金额整晚对来宾可见，不会在最后才是惊吓","在离场路径上的值守点位结清，来宾当面确认","以开启、结清，以及离场前结清的账单数计量"]],
    ["allocation", "Allocation", "AXIS funds a drink allocation for the night and buys soft drinks from the bar for the workshop. All of it is disbursed and settled over the partner's rail, so the hospitality budget itself becomes volume on the product.", ["A funded drink and a purchased drink move through the same product","Guests see the partner cover the drink at the moment it is served","Workshop soft drinks and party drinks settle through one rail, one record","Measured as allocation value settled and drinks issued against it"], "Asignación", "AXIS financia una asignación de tragos para la noche y compra los refrescos del taller en la barra. Todo se dispersa y se liquida por el rail del socio, así que el presupuesto de hospitalidad se vuelve volumen del producto.", ["Un trago financiado y uno comprado pasan por el mismo producto","El invitado ve al socio cubrir el trago en el momento en que se lo sirven","Refrescos del taller y tragos de la fiesta, un solo rail y un solo registro","Se mide como valor de asignación liquidado y tragos entregados contra ella"], "额度", "AXIS 出资当晚的酒水额度，并从吧台采购工作坊的软饮。全部通过合作方的通道发放与结算，接待预算本身就变成了产品的交易量。", ["被资助的酒与自购的酒走的是同一个产品","来宾在酒被端上来的那一刻，看到合作方替他们付了钱","工作坊软饮与派对酒水，同一条通道、同一份记录","以已结算的额度金额与凭额度发出的酒水杯数计量"]],
    ["split", "Split", "A round bought for a table is split instantly between the people standing at it, and anything charged wrong is reimbursed before that guest leaves the venue.", ["Buying a round for the table is the natural behaviour of a bar at 01:00","The split lands on people's phones while they are still holding the drinks","Reimbursement is resolved in the room, not through a five-day dispute","Measured as splits completed and reimbursements resolved on site"], "Dividir", "Una ronda para la mesa se divide al instante entre quienes están parados ahí, y cualquier cobro mal hecho se reembolsa antes de que ese invitado salga del venue.", ["Invitar la ronda es el comportamiento natural de una barra a la 01:00","La división llega a sus teléfonos mientras todavía traen el trago en la mano","El reembolso se resuelve en la sala, no en una disputa de cinco días","Se mide como divisiones completadas y reembolsos resueltos en sitio"], "拆单", "为一桌买的一轮酒，可以立刻在站在那里的人之间拆分；任何算错的账，都在那位来宾离场之前退回。", ["凌晨一点请一整轮，是酒吧里最自然的行为","拆单在大家还端着酒的时候就落到各自手机上","退款在现场解决，而不是走五天的争议流程","以完成的拆单数与现场解决的退款数计量"]],
    ["merchant", "Merchant", "The venue is a genuine merchant, not a simulation. Bar Oriente sells the drinks, accepts the rail, and gets settled for exactly what it sold.", ["A working Mexico City bar with real inventory on the other side of the rail","Merchant-side acceptance tested across a full night of trading, not a pilot hour","Settlement to the venue reconciled against the venue's own totals","Measured as merchant volume settled and settlement time to the venue"], "Comercio", "El venue es un comercio real, no una simulación. Bar Oriente vende los tragos, acepta el rail y recibe la liquidación por exactamente lo que vendió.", ["Un bar en operación en la Ciudad de México, con inventario real del otro lado","Aceptación del lado del comercio probada una noche completa, no una hora piloto","La liquidación al venue se concilia contra los totales del propio venue","Se mide como volumen de comercio liquidado y tiempo de liquidación al venue"], "商户", "场地是真实商户，不是模拟环境。Bar Oriente 卖出这些酒，接受这条通道，并按实际售出的金额收到结算。", ["墨西哥城一家正在营业的酒吧，通道另一端是真实库存","商户侧受理经历了一整晚交易的检验，而不是一小时试点","对场地的结算与场地自己的账目逐笔核对","以已结算的商户交易额与到账时间计量"]],
  ];
  mechanics.forEach(function (item, index) {
    add("mechanic-" + item[0], "08 / " + String(index + 1).padStart(2, "0"), item[1], item[2], item[3], {
      es: { title: item[4], summary: item[5], details: item[6] },
      zh: { title: item[7], summary: item[8], details: item[9] },
    });
  });

  var rewardFlow = [
    ["provision", "Card provisioned at check-in", "Provisioning is attached to entry: the seated 200 are set up during the workshop, and the 250 arriving at 22:00 are set up as they come through the door.", ["Staffed points at both entries, so nobody onboards alone in a queue","The workshop block gives three unhurried hours for the first cohort","The guest is ready to pay before they have reached the bar","Measured as provisions completed against guests admitted"], "Tarjeta provisionada en el check-in", "La provisión va pegada a la entrada: los 200 sentados quedan listos durante el taller y los 250 que llegan a las 22:00 quedan listos al cruzar la puerta.", ["Puntos con personal en ambas entradas, nadie se onboardea solo en la fila","El bloque del taller da tres horas sin prisa para la primera cohorte","El invitado ya puede pagar antes de llegar a la barra","Se mide como provisiones completadas frente a invitados admitidos"], "入场时完成开卡", "开通与入场绑定：200 位座席来宾在工作坊期间办好，22:00 到场的 250 人在进门时办好。", ["两个入口都有值守点位，没有人要在队伍里独自摸索","工作坊时段为第一批人留出三个小时的从容时间","来宾在走到吧台之前就已经具备支付能力","以完成开通的人数与实际入场人数对照计量"]],
    ["tap", "First drink paid with a tap", "The first real transaction is a drink at the venue bar. It is the action inside the partner's product and it happens in front of a bartender.", ["A live payment for a real drink, not a test charge or a demo screen","Whatever the rail is, it is proven at the bar and not on a slide","Declines are handled by staff on the spot rather than lost","Measured as first successful transactions, separated from provisions"], "El primer trago se paga con un tap", "La primera transacción real es un trago en la barra del venue. Es la acción dentro del producto del socio y ocurre frente a un bartender.", ["Un pago real por un trago real, no un cargo de prueba ni una pantalla demo","Sea cual sea el rail, se demuestra en la barra y no en una lámina","Los rechazos los atiende el personal al momento en vez de perderse","Se mide como primeras transacciones exitosas, aparte de las provisiones"], "第一杯酒用一次刷卡完成", "第一笔真实交易是场地吧台的一杯酒。它是发生在合作方产品内部的行动，并且当着调酒师的面完成。", ["为一杯真实的酒完成的真实支付，不是测试扣款或演示界面","无论底层是什么通道，它都在吧台被验证，而不是在幻灯片上","被拒的交易由现场人员当场处理，而不是就此流失","以首笔成功交易数计量，与开通数分开呈现"]],
    ["validate", "Transaction verified at the bar", "Staff validation and the transaction record have to agree before the funded drink is released. A hand stamp is not evidence; a settled payment is.", ["The bar's own record and the partner's record are checked against each other","Guest state advances only on a verified transaction, never on a promoter's word","Attendance and qualified transactions stay separate numbers throughout","Measured as verified transactions, reported apart from headcount"], "Transacción verificada en la barra", "La validación del personal y el registro de la transacción tienen que coincidir antes de liberar el trago financiado. Un sello en la mano no es evidencia; un pago liquidado sí.", ["El registro del venue y el del socio se contrastan entre sí","El estado del invitado avanza solo con una transacción verificada","Asistencia y transacciones calificadas se reportan por separado","Se mide como transacciones verificadas, aparte del conteo de personas"], "在吧台验证这笔交易", "人工验证与交易记录必须一致，被资助的那杯酒才会发出。手背上的印章不是证据，一笔已结算的支付才是。", ["场地自己的记录与合作方的记录互相核对","来宾状态只随已验证的交易推进，不凭任何人的口头认可","到场人数与合格交易始终作为两个数字分别呈现","以已验证交易数计量，与到场人数分开报告"]],
    ["redeem", "Funded drink settles on the rail", "The drink AXIS funds is served and settled over the partner's rail, so the guest experiences the partner paying for the thing in their hand.", ["People remember who paid for their drink and what they did to get it","The allocation is bought from the venue bar, so the venue is paid for it","The same rail carries the funded drink and the one the guest buys next","Measured as redemptions completed against verified transactions"], "El trago financiado se liquida", "El trago que financia AXIS se sirve y se liquida por el rail del socio, así que el invitado vive al socio pagando lo que trae en la mano.", ["La gente recuerda quién le pagó el trago y qué hizo para conseguirlo","La asignación se compra en la barra del venue, así que el venue cobra por ella","El mismo rail lleva el trago financiado y el que el invitado compra después","Se mide como redenciones completadas frente a transacciones verificadas"], "资助的酒水在通道内结算", "由 AXIS 出资的酒被端上来，并通过合作方的通道完成结算，来宾亲身体验到是合作方替他们付了手里这杯。", ["人们会记得是谁请的这杯酒，以及自己做了什么换来的","额度是从场地吧台采购的，因此场地实际收到了这笔钱","同一条通道既承载资助的酒，也承载来宾接着自己买的酒","以完成的兑换数与已验证交易对照计量"]],
    ["screen", "The night's total on the wall", "Between the live coding set and the closing DJ, the night's running transaction count goes up on the main LED wall in the Future Renaissance visual language.", ["The partner's moment on the wall is a live number, not a static logo","It runs inside the same visual system the guests are feeding with Claude","Capture and social publication happen around that moment, with consent","Measured as screen moments delivered and social actions produced"], "El total de la noche en el muro", "Entre el set de live coding y el closing DJ, el conteo corriente de transacciones sube al muro LED principal, dentro del lenguaje visual de Future Renaissance.", ["El momento del socio en el muro es una cifra viva, no un logo estático","Corre dentro del mismo sistema visual que los invitados alimentan con Claude","La captura y la publicación social ocurren alrededor de ese momento, con consentimiento","Se mide como momentos de pantalla entregados y acciones sociales producidas"], "当晚总数出现在 LED 墙上", "在 live coding 与闭场 DJ 之间，当晚累计的交易笔数出现在主 LED 墙上，并遵循 Future Renaissance 的视觉语言。", ["合作方在墙上的时刻是一个实时数字，而不是一个静止标志","它运行在来宾正用 Claude 共同喂养的同一套视觉系统里","拍摄与社交发布围绕这个时刻进行，均经同意","以交付的屏幕时刻数与产生的社交动作计量"]],
    ["report", "Reconciled with the venue", "The post-event report puts the partner's numbers next to the venue's, so the volume claimed is volume a real merchant agrees was received.", ["Cards provisioned, first transactions, repeat transactions per guest","Tabs opened and closed, splits completed, reimbursements resolved","Allocation value settled and merchant settlement to Bar Oriente","Delivered as numbers and media, not as an impressions estimate"], "Conciliado con el venue", "El reporte posterior pone las cifras del socio junto a las del venue, para que el volumen que se declara sea volumen que un comercio real reconoce haber recibido.", ["Tarjetas provisionadas, primeras transacciones y transacciones repetidas por invitado","Cuentas abiertas y cerradas, divisiones completadas, reembolsos resueltos","Valor de asignación liquidado y liquidación de comercio a Bar Oriente","Se entrega como números y material, no como estimación de impresiones"], "与场地账目逐笔对账", "会后报告把合作方的数字与场地的数字并排放置，让所宣称的交易量，是一个真实商户确认收到过的交易量。", ["已开通的卡、首笔交易、每位来宾的重复交易","开启与结清的账单、完成的拆单、已解决的退款","已结算的额度金额，以及对 Bar Oriente 的商户结算","以数字与素材交付，而不是曝光量估算"]],
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
