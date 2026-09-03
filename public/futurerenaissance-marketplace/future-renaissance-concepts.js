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
    ["livemint", "Live Mint", "The live-coding set writes music as code in front of the room. States of that set are minted on the marketplace while it is still running, so the first collectors are people who watched it happen.", ["Minting opens during the live-coding set, not the morning after","The artist signs the piece from the stage position, in the room","Measured as pieces minted in-set and first-time collectors among them","A collector can point at the minute on stage that produced their piece"], "Minteo en Vivo", "El set de live coding escribe música como código frente a la sala. Estados de ese set se mintean en el marketplace mientras todavía suena, así que los primeros coleccionistas son quienes lo vieron pasar.", ["El minteo abre durante el set, no a la mañana siguiente","El artista firma la pieza desde el escenario, en la sala","Se mide como piezas minteadas en set y cuántos son coleccionistas nuevos","Cada quien puede señalar el minuto exacto que produjo su pieza"], "现场铸造", "Live Coding 环节在全场面前用代码写音乐。该演出的状态会在演出进行中直接在平台上铸造，因此最早的收藏者就是亲眼看着它发生的人。", ["铸造在演出进行时开启，而不是第二天早上","艺术家在舞台位置、在现场为作品签名","以演出中铸造的作品数、以及其中首次收藏者数量衡量","每位收藏者都能指出舞台上是哪一分钟生成了自己那件作品"]],
    ["hashdraw", "Hash Draw", "A Verse generative work is not a fixed file. It reads a hash when it is collected and draws itself from that seed, so the guest's own collect is the act that creates their output.", ["Verse Works is on the line-up, so the format is theirs, not a mock-up","No two guests receive the same output from the same drop","The drawn result appears on the LED wall seconds after the collect","Measured as unique outputs drawn and the collector behind each one"], "Dibujo por Hash", "Una obra generativa de Verse no es un archivo fijo. Lee un hash cuando se colecciona y se dibuja a partir de esa semilla, así que el propio acto de coleccionar es lo que crea el resultado.", ["Verse Works está en el line-up: el formato es suyo, no una simulación","No hay dos invitados con el mismo resultado del mismo drop","El resultado aparece en el muro LED segundos después de coleccionar","Se mide como resultados únicos dibujados y quién coleccionó cada uno"], "哈希生成", "Verse 的生成艺术作品不是一个固定文件。它在被收藏的那一刻读取一个哈希，并据此把自己画出来，所以收藏这个动作本身就是创作。", ["Verse Works 就在演出阵容中，这套机制是他们的，不是模拟","同一次发售中，没有两位来宾会得到相同的结果","生成结果在收藏后几秒内出现在 LED 主屏上","以生成的唯一作品数、以及每件背后的收藏者衡量"]],
    ["gallery", "Gallery Scene", "Between sets the main LED wall runs the marketplace's own gallery view, showing what the room is collecting in real time. It is the product's actual interface at venue scale, not a logo card.", ["The wall scene carries live listings and the collector count as it moves","Slotted between the warm-up DJ and the live-coding set","Guests scan from the wall straight into the listing they just saw","Measured as wall minutes and scans that convert into a collect"], "Escena Galería", "Entre sets, el muro LED principal corre la vista de galería del propio marketplace, mostrando en tiempo real lo que la sala está coleccionando. Es la interfaz real del producto a escala de venue, no una placa con logo.", ["La escena muestra listados en vivo y el contador de coleccionistas","Se programa entre el DJ de calentamiento y el set de live coding","El invitado escanea desde el muro y cae directo en el listado","Se mide como minutos en muro y escaneos que terminan en colección"], "画廊场景", "两场演出之间，LED 主屏运行平台自己的画廊视图，实时展示全场正在收藏什么。那是产品的真实界面被放大到场馆尺度，而不是一张 logo 卡。", ["屏幕场景呈现实时在售作品与不断跳动的收藏人数","排在暖场 DJ 与 Live Coding 之间的时段","来宾可以直接从屏幕扫码进入刚看到的那件作品","以上屏时长、以及由扫码转化的收藏数衡量"]],
    ["guestedition", "Guest Edition", "Guests change the LED wall through Claude with their own photos, videos and prompts. The output they made is listed on the marketplace with the guest credited as its creator.", ["The visual a guest prompted becomes a listing that guest owns","For most of them it is the first thing they have ever listed anywhere","The Public is on the line-up as an artist, and this is what that means","Measured as editions listed and the share from first-time creators"], "Edición del Público", "Los invitados modifican el muro LED con Claude usando sus propias fotos, videos y prompts. Lo que generaron se lista en el marketplace con el invitado acreditado como autor.", ["El visual que un invitado promptea se vuelve un listado suyo","Para la mayoría es lo primero que listan en su vida","The Public está en el line-up como artista, y esto es lo que significa","Se mide como ediciones listadas y qué parte viene de autores nuevos"], "观众版次", "来宾用自己的照片、视频和提示词，通过 Claude 改变 LED 主屏。他们生成的画面会在平台上架，并把该来宾标注为作者。", ["来宾提示词生成的画面，成为归他自己所有的一件在售作品","对大多数人来说，这是他们人生中第一次上架作品","The Public 作为艺术家列在阵容中，指的正是这件事","以上架版次数量、以及其中首次创作者的占比衡量"]],
    ["bardrop", "Bar Drop", "One drop opens on the clock when the after-party doors open and 250 further guests arrive. Collecting inside that window is the action that releases the drink at the bar.", ["The window is announced from the wall and by staff working the door","Collect inside the window, redeem at the bar, no separate voucher","Measured as collects inside the window against arrivals in those minutes","Gives the second wave of the night a reason to open the app on arrival"], "Drop de Barra", "Un drop abre en punto cuando se abren las puertas del after y llegan 250 invitados más. Coleccionar dentro de esa ventana es la acción que libera el trago en la barra.", ["La ventana se anuncia desde el muro y por el staff en la puerta","Coleccionas dentro de la ventana y canjeas en barra, sin vale aparte","Se mide como colecciones dentro de la ventana contra llegadas del momento","Le da a la segunda oleada una razón para abrir la app al entrar"], "整点发售", "当 22:00 后半场开门、另有 250 位来宾进场时，一场限时发售准时开启。在该窗口内完成收藏，就是换取吧台饮品的那个动作。", ["发售窗口由主屏和门口工作人员同时告知","窗口内收藏，吧台直接兑换，不需要另发券","以窗口内的收藏数、对照同一时段的进场人数衡量","让当晚第二波人群一进门就有理由打开这个应用"]],
    ["royalty", "Royalty Ticker", "When a piece sells in the room, the split going to the artist is displayed. Pixelord ships sound and 3D together onchain, and the room gets to see what that practice actually pays.", ["Each sale shows the artist share on the wall as it settles","Aimed at the exact audience sitting in the workshop: artists and labels","Producers and managers see the payout rail instead of a pitch about it","Measured as value routed to artists across the night"], "Regalías en Vivo", "Cuando una pieza se vende en la sala, se muestra el reparto que va al artista. Pixelord publica sonido y 3D juntos onchain, y la sala ve lo que esa práctica realmente paga.", ["Cada venta muestra en el muro la parte del artista al liquidarse","Dirigido justo al público sentado en el taller: artistas y sellos","Productores y managers ven el riel de pago, no un discurso sobre él","Se mide como valor liquidado a artistas durante la noche"], "版税可见", "当一件作品在现场售出时，分给艺术家的那部分会被展示出来。Pixelord 一贯把声音与 3D 一起上链发布，而现场可以看见这种做法究竟能带来多少收入。", ["每笔成交结算时，都在主屏显示艺术家分成","正对工作坊里坐着的那批人：艺术家与厂牌","制作人和经纪人看到的是真实的分账通道，而不是关于它的说辞","以当晚结算给艺术家的金额衡量"]],
    ["nightshelf", "Night Shelf", "Everything a guest collected across the night resolves into one set held at their own address. Months later it is still the record that they were in the room on October 28.", ["Workshop piece, guest edition and drop collect resolve to one shelf","Held in the guest's own custody, not as a platform balance","Measured as guests still holding at least one piece thirty days later","The marketplace keeps a reachable collector, not an attendance list"], "Colección de la Noche", "Todo lo que un invitado coleccionó durante la noche se resuelve en un solo conjunto bajo su propia dirección. Meses después sigue siendo la prueba de que estuvo ahí el 28 de octubre.", ["Pieza del taller, edición del público y drop quedan en un mismo conjunto","Bajo custodia del propio invitado, no como saldo de plataforma","Se mide como invitados que conservan al menos una pieza a 30 días","El marketplace se queda con un coleccionista alcanzable, no con una lista"], "当晚收藏", "来宾整晚收藏的一切，最终汇成他自己地址下的一组作品。数月之后，它依然是此人 10 月 28 日在场的凭证。", ["工作坊作品、观众版次与限时发售收藏，归入同一组","由来宾自己保管，而不是留在平台账户余额里","以 30 天后仍持有至少一件作品的来宾数量衡量","平台留下的是可触达的收藏者，而不是一份到场名单"]],
  ];
  mechanics.forEach(function (item, index) {
    add("mechanic-" + item[0], "08 / " + String(index + 1).padStart(2, "0"), item[1], item[2], item[3], {
      es: { title: item[4], summary: item[5], details: item[6] },
      zh: { title: item[7], summary: item[8], details: item[9] },
    });
  });

  var rewardFlow = [
    ["onboard", "Seat scan opens the market", "Doors at 18:00, 200 chairs, one scan per seat. The marketplace account is created while a host is standing in the row, not alone on a phone at home.", ["Every one of the 200 seats is scanned on the way in","Account and first listing view happen with staff in the aisle","Measured as accounts opened at the seat, not as app installs","A failure at this step is visible immediately and fixed on the spot"], "El escaneo del asiento abre el marketplace", "Puertas a las 18:00, 200 sillas, un escaneo por asiento. La cuenta del marketplace se crea con un anfitrión parado en la fila, no a solas con el celular en casa.", ["Los 200 asientos se escanean al entrar","La cuenta y la primera vista de listados ocurren con staff en el pasillo","Se mide como cuentas abiertas en el asiento, no como instalaciones","Un fallo aquí se ve al momento y se resuelve ahí mismo"], "扫码入座即开通账户", "18:00 开门，200 把椅子，每个座位扫一次码。平台账户是在主持人就站在这一排时开通的，而不是回家一个人对着手机完成。", ["200 个座位在入场时全部完成扫码","开户与第一次浏览在售作品，都有工作人员在过道协助","以在座位上开通的账户数衡量，而不是应用安装量","这一步出问题当场就能看见，也当场解决"]],
    ["act", "First collect from the seat", "The Claude workshop is hands-on, so the first collect is part of the session itself. Every attendee leaves the 18:00 to 21:00 block having used the product once.", ["The session runs on the venue screen, so the step is done together","Producers, artists, labels, managers and studios all complete it","Measured as first collects completed inside the workshop block","Nobody is asked to go and try the product later at home"], "Primera colección desde el asiento", "El taller de Claude es práctico, así que la primera colección es parte de la sesión. Cada asistente sale del bloque de 18:00 a 21:00 habiendo usado el producto una vez.", ["La sesión corre en la pantalla del venue y el paso se hace en conjunto","Productores, artistas, sellos, managers y estudios lo completan","Se mide como primeras colecciones completadas dentro del taller","A nadie se le pide probar el producto después, en su casa"], "在座位上完成首次收藏", "Claude 工作坊是动手环节，因此首次收藏就是课程的一部分。每位参与者离开 18:00 至 21:00 这一段时，都已经完整用过一次产品。", ["课程内容同步在场馆主屏上，这一步全场一起做","制作人、艺术家、厂牌、经纪人和录音棚都会完成","以工作坊时段内完成的首次收藏数量衡量","不需要任何人事后回家再自己试一次"]],
    ["validate", "Staff validates at 22:00", "At 22:00 the after-party doors open to 250 further guests. Staff check the collect on the guest's own screen before anything is released.", ["Staff validation and the onchain record have to agree","Workshop guests who stayed are recognised without repeating the flow","Measured as validated actions, kept separate from headcount","This is the number the report is built on, not attendance"], "El staff valida a las 22:00", "A las 22:00 abren las puertas del after para 250 invitados más. El staff revisa la colección en la pantalla del propio invitado antes de liberar nada.", ["La validación del staff y el registro onchain tienen que coincidir","Quien se quedó del taller es reconocido sin repetir el flujo","Se mide como acciones validadas, aparte del conteo de asistentes","Sobre este número se construye el reporte, no sobre la asistencia"], "22:00 由工作人员核验", "22:00 后半场开门，另有 250 位来宾进场。工作人员在来宾自己的屏幕上核对收藏记录，之后才会放行任何奖励。", ["人工核验与链上记录必须一致","从工作坊留下来的来宾无需重走一遍流程","以核验通过的行动数衡量，与到场人数分开统计","报告建立在这个数字上，而不是到场人数"]],
    ["redeem", "A verified collect pours a drink", "The validated collect is redeemed at the bar for a drink. People remember who paid for the drink and what they did to earn it.", ["Redemption happens at the bar, in person, in a single movement","One verified action, one drink, logged against the action that earned it","Measured as redemptions and the collects they resolve to","The reward is not the end of the flow, it sits in the middle of it"], "Una colección verificada paga el trago", "La colección validada se canjea en la barra por un trago. La gente recuerda quién pagó el trago y qué hizo para ganárselo.", ["El canje ocurre en la barra, en persona, en un solo movimiento","Una acción verificada, un trago, registrado contra la acción que lo generó","Se mide como canjes y las colecciones a las que corresponden","La recompensa no es el final del flujo, está a la mitad"], "核验通过即可换一杯", "核验通过的收藏，可在吧台兑换一杯饮品。人们记得住是谁请的这杯酒，以及自己做了什么才换到它。", ["兑换在吧台当面完成，一个动作走完","一次核验行动换一杯，并与产生它的那个动作绑定记录","以兑换次数、以及其对应的收藏记录衡量","奖励不是流程的终点，而是流程的中段"]],
    ["screen", "The piece goes on the wall", "The collected work is shown on the main LED wall with the listing visible, and that is the moment guests photograph and post it themselves.", ["A collector-facing moment on the largest surface in the venue","Social publication happens because the guest wants the picture","The AXIS media team captures the same moment for the partner","Measured as wall appearances and posts captured against them"], "La pieza sube al muro", "La obra coleccionada se muestra en el muro LED principal con el listado visible, y ese es el momento que los invitados fotografían y publican por su cuenta.", ["Un momento para el coleccionista en la superficie más grande del venue","La publicación en redes ocurre porque el invitado quiere la foto","El equipo de media de AXIS captura ese mismo momento para el socio","Se mide como apariciones en muro y publicaciones registradas"], "作品登上主屏", "被收藏的作品会连同其在售信息一起出现在 LED 主屏上，而那正是来宾自己举起手机拍照并发布的时刻。", ["在场馆最大的一块屏上，给收藏者一个属于他的时刻","社交发布之所以发生，是因为来宾自己想要那张照片","AXIS 媒体团队同步为合作方记录同一个瞬间","以上屏次数、以及与之对应的社交发布量衡量"]],
    ["report", "The night resolves to a ledger", "AXIS closes the night with one record: who collected, what they collected, what they redeemed, and what they are still holding weeks later.", ["Accounts opened, collects, validations, redemptions and listings","Split between workshop attendees and after-party arrivals","Measured as retained collectors rather than impressions","Delivered as the partner's own record, not as a recap deck"], "La noche se resuelve en un registro", "AXIS cierra la noche con un solo registro: quién coleccionó, qué coleccionó, qué canjeó y qué sigue conservando semanas después.", ["Cuentas abiertas, colecciones, validaciones, canjes y listados","Separado entre asistentes del taller y llegadas del after","Se mide como coleccionistas retenidos, no como impresiones","Se entrega como registro propio del socio, no como presentación de cierre"], "整晚收敛成一份账目", "AXIS 以一份记录收尾：谁收藏了、收藏了什么、兑换了什么，以及数周之后还持有什么。", ["开户数、收藏数、核验数、兑换数与上架数","按工作坊参与者与后半场进场者分开呈现","以留存的收藏者衡量，而不是曝光量","作为合作方自己的记录交付，而不是一份总结演示"]],
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
