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
    ["connect", "Connect", "There is no desk, no document scan and no wait for approval. A guest connects a wallet and is immediately able to do everything the night asks of them.", ["No email, no password and no identity check before the first action","Works for the guest who arrives at 22:00 with three minutes of patience","Measured as unique addresses connected, deduplicated, not app opens","The whole argument of the product, demonstrated in the first ten seconds"], "Conectar", "No hay módulo, ni escaneo de documento, ni espera de aprobación. El invitado conecta una wallet y de inmediato puede hacer todo lo que la noche le pide.", ["Sin correo, sin contraseña y sin verificación de identidad antes de la primera acción","Funciona para quien llega a las 22:00 con tres minutos de paciencia","Se mide como direcciones únicas conectadas, deduplicadas, no aperturas de app","Todo el argumento del producto, demostrado en los primeros diez segundos"], "连接", "没有引导台，没有证件扫描，也不用等待审核。来宾连接钱包，立刻就能完成这一夜要求的一切。", ["无需邮箱、密码或身份核查即可开始第一个动作","对 22:00 才到场、只有三分钟耐心的人同样成立","以去重后的唯一连接地址数计量，而非应用打开次数","产品的全部主张，在最初十秒内被演示完毕"]],
    ["deposit", "Deposit", "A guest funds the address they control, at Bar Oriente, and the balance is theirs at every moment of the process. Nothing sits in the partner's custody waiting on a withdrawal request.", ["Transfer or on-ramp completed at the venue, not deferred to next week","The balance never leaves the guest's own keys at any point","Measured as addresses funded on the night and total value deposited","The funded address is what makes every later mechanic possible"], "Depositar", "El invitado fondea la dirección que él mismo controla, en Bar Oriente, y el saldo es suyo en todo momento del proceso. Nada queda en custodia del socio esperando una solicitud de retiro.", ["Transferencia u on-ramp completado en el venue, no aplazado a la semana siguiente","El saldo nunca sale de las llaves del propio invitado","Se mide como direcciones fondeadas esa noche y valor total depositado","La dirección fondeada es lo que hace posible cada mecánica posterior"], "入金", "来宾在 Bar Oriente 为自己掌控的地址注资，余额在整个过程的任何一刻都属于他本人。没有任何资金留在合作方托管中，等待一份提现申请。", ["在场地内完成转账或法币入金，不推迟到下一周","余额始终不离开来宾自己的私钥","以当晚完成注资的地址数与入金总额计量","已注资的地址，是后续每一个机制得以成立的前提"]],
    ["swap", "Two Swaps", "The mission is not to try the app. It is two swaps, both completed inside the venue, because the second one is what proves the guest can do it without help.", ["The first swap is staff-guided; the second is done by the guest alone","Both transactions settle onchain before any reward is released","Measured as addresses reaching two swaps, and the drop-off between them","The second swap is the action that releases the drink at the bar"], "Dos swaps", "La misión no es probar la app. Son dos swaps, ambos completados dentro del venue, porque el segundo es el que prueba que el invitado puede hacerlo sin ayuda.", ["El primer swap lo acompaña el equipo; el segundo lo hace el invitado solo","Las dos transacciones se liquidan onchain antes de liberar cualquier recompensa","Se mide como direcciones que llegan a dos swaps y la caída entre uno y otro","El segundo swap es la acción que libera la bebida en la barra"], "两次兑换", "任务不是试用一下这个应用，而是在场地内完成两次兑换，因为第二次才能证明来宾可以独立完成。", ["第一次兑换由工作人员陪同，第二次由来宾独立完成","两笔交易都在链上结算之后，才会释放任何奖励","以完成两次兑换的地址数，以及两次之间的流失率计量","第二次兑换就是在吧台释放酒水的那个动作"]],
    ["liquidity", "Liquidity", "The most committed guests go past swapping and put liquidity into a pool for the duration of the event, which is the difference between a user and a participant.", ["Position opened at the venue and held through the after party","Guests watch fees accrue on a position they can close at any moment","Measured as positions opened, liquidity added, and positions still open at close","The action that separates the curious from the committed"], "Liquidez", "Los invitados más comprometidos pasan del swap a poner liquidez en un pool durante el evento, que es justo la diferencia entre un usuario y un participante.", ["Posición abierta en el venue y sostenida durante el after","El invitado ve acumularse comisiones en una posición que puede cerrar cuando quiera","Se mide como posiciones abiertas, liquidez aportada y posiciones aún abiertas al cierre","Es la acción que separa a los curiosos de los comprometidos"], "流动性", "最投入的来宾会越过兑换，把流动性投入池中并持有整场活动，这正是用户与参与者之间的区别。", ["在场地内开仓，并持有至 after party 结束","来宾看着手续费在一个随时可以关闭的仓位上累积","以开仓数、投入的流动性与散场时仍未关闭的仓位数计量","这是把好奇者与投入者区分开的动作"]],
    ["limit", "Limit Order", "A limit order is the one onchain action that keeps working after the guest puts the phone away. It is placed at the bar and can fill during the closing set.", ["Order placed onchain from the venue, not on a centralised order book","Fills while the guest is on the dancefloor, with no counterparty trusted","Measured as orders placed and orders filled before the night ends","Bridging to a second chain is the alternate variant of this step"], "Orden límite", "Una orden límite es la única acción onchain que sigue trabajando cuando el invitado guarda el teléfono. Se coloca en la barra y puede ejecutarse durante el set de cierre.", ["Orden colocada onchain desde el venue, no en un libro de órdenes centralizado","Se ejecuta mientras el invitado está en la pista, sin confiar en una contraparte","Se mide como órdenes colocadas y órdenes ejecutadas antes de que termine la noche","El puente entre cadenas es la variante alterna de este paso"], "限价单", "限价单是唯一一个在来宾收起手机之后仍在工作的链上动作。它在吧台旁挂出，可能在闭场 DJ 的时段成交。", ["订单从现场挂到链上，而不是挂在中心化订单簿","来宾在舞池里的时候成交，无需信任任何对手方","以挂出的订单数与当晚成交的订单数计量","跨链桥接是这一步的替代变体"]],
    ["claim", "Claim", "At the end of the night the reward is taken by the guest's own transaction, into the guest's own wallet. There is no internal balance to be credited later.", ["The guest signs the claim; the partner does not push a balance anywhere","Whatever is claimed sits in self-custody from that second onward","Measured as claims executed against claims made available","Nothing is stranded in an account the guest has to log back into"], "Reclamar", "Al final de la noche la recompensa se toma con la transacción del propio invitado, hacia su propia wallet. No hay un saldo interno que acreditar después.", ["El invitado firma el claim; el socio no empuja un saldo a ninguna cuenta","Lo reclamado queda en autocustodia desde ese segundo","Se mide como claims ejecutados contra claims disponibles","Nada queda varado en una cuenta a la que haya que volver a entrar"], "领取", "夜晚结束时，奖励由来宾自己的交易取走，进入他自己的钱包。没有一个需要事后入账的内部余额。", ["由来宾签名领取，合作方不向任何账户推送余额","领取到的东西从那一秒起就处于自我保管之下","以已执行的领取数与可领取总数的对比计量","不会有任何东西滞留在一个需要重新登录的账户里"]],
    ["prove", "Prove", "Because every mechanic here settles onchain, the post-event report is not a claim about what happened. It is a list of transactions the partner can verify without trusting AXIS.", ["Each counted action resolves to a transaction hash on a public explorer","The partner's own analytics can reproduce the numbers independently","Measured as verifiable transactions, addresses and volume from the night","A report nobody has to take on faith is the honest version of event reporting"], "Comprobar", "Como cada mecánica de aquí se liquida onchain, el reporte posterior no es una afirmación sobre lo que pasó. Es una lista de transacciones que el socio puede verificar sin confiar en AXIS.", ["Cada acción contada resuelve a un hash de transacción en un explorador público","La analítica del propio socio puede reproducir las cifras por su cuenta","Se mide como transacciones, direcciones y volumen verificables de esa noche","Un reporte que nadie tiene que creer a ciegas es la versión honesta del reporte"], "可证", "因为这里的每一个机制都在链上结算，事后报告不是关于发生了什么的说法，而是一份合作方无需信任 AXIS 就能自行核验的交易清单。", ["每一个被计入的动作，都对应公共区块浏览器上的一个交易哈希","合作方自己的分析工具可以独立复现这些数字","以当晚可核验的交易数、地址数与交易量计量","一份不需要别人凭信任接受的报告，才是活动报告的诚实版本"]],
  ];
  mechanics.forEach(function (item, index) {
    add("mechanic-" + item[0], "08 / " + String(index + 1).padStart(2, "0"), item[1], item[2], item[3], {
      es: { title: item[4], summary: item[5], details: item[6] },
      zh: { title: item[7], summary: item[8], details: item[9] },
    });
  });

  var rewardFlow = [
    ["connect", "Wallet connected in the workshop", "From 18:00 to 21:00 the seated Claude workshop for the music industry fills 200 chairs. A wallet connection takes seconds, so it sits inside the session instead of interrupting it.", ["18:00-21:00 · 200 seated attendees from the music industry","No signup desk is required, so nothing has to queue at the door","Measured as unique addresses connected before the 22:00 doors","The venue screen carries the session; connecting is a QR, not a form"], "Wallet conectada en el taller", "De 18:00 a 21:00 el taller de Claude para la industria musical llena 200 sillas. Conectar una wallet toma segundos, así que cabe dentro de la sesión en lugar de interrumpirla.", ["18:00-21:00 · 200 asistentes sentados de la industria musical","No hace falta módulo de registro, así que nada se forma en la puerta","Se mide como direcciones únicas conectadas antes de las 22:00","La pantalla del venue lleva la sesión; conectar es un QR, no un formulario"], "在工作坊中连接钱包", "18:00 至 21:00，面向音乐行业的 Claude 工作坊坐满 200 张椅子。连接钱包只需几秒，因此它嵌在课程之内，而不会打断课程。", ["18:00-21:00 · 200 位来自音乐行业的就座来宾","无需注册台，门口也就不会排队","以 22:00 开门前完成连接的唯一地址数计量","场地屏幕承载课程；连接只是一个二维码，不是一张表单"]],
    ["act", "Two swaps completed on site", "At 22:00 the doors open to 250 further guests. The mission is two swaps, both settled onchain inside the venue.", ["22:00 doors · 250 further guests on top of the workshop audience","First swap guided by staff, second completed by the guest alone","Measured as addresses reaching two settled swaps on event grounds","Deposit, liquidity and limit orders sit above this as optional depth"], "Dos swaps completados en sitio", "A las 22:00 abren las puertas para 250 invitados más. La misión son dos swaps, ambos liquidados onchain dentro del venue.", ["22:00 · llegan 250 invitados además del público del taller","El primer swap lo acompaña el equipo; el segundo lo hace el invitado solo","Se mide como direcciones que llegan a dos swaps liquidados en el evento","Depósito, liquidez y órdenes límite quedan encima como profundidad opcional"], "在场内完成两次兑换", "22:00 开门，另有 250 位来宾到场。任务是两次兑换，都在场地内于链上结算完成。", ["22:00 开门 · 在工作坊人群之外再来 250 位来宾","第一次由工作人员陪同，第二次由来宾独立完成","以在活动现场完成两笔链上结算兑换的地址数计量","入金、流动性与限价单作为可选的进阶层级叠加其上"]],
    ["validate", "Onchain state read by staff", "Staff validate against the chain, not against a screenshot. A transaction that has not settled releases nothing.", ["Validation reads the settled transaction, never a screenshot of one","AXIS staff work the floor through the live coding set and the closing DJ","Measured as validated transactions against attempted ones","No honour system, and no manual list for the bar to interpret"], "Estado onchain leído por el staff", "El equipo valida contra la cadena, no contra una captura de pantalla. Una transacción que no se liquidó no libera nada.", ["La validación lee la transacción liquidada, nunca una captura de ella","El staff de AXIS recorre el piso durante el live coding y el DJ de cierre","Se mide como transacciones validadas contra intentos","Sin sistema de honor y sin listas manuales que la barra tenga que interpretar"], "工作人员读取链上状态", "核验依据的是链，而不是一张截图。没有完成结算的交易，不会释放任何东西。", ["核验读取的是已结算的交易，绝不是它的截图","AXIS 工作人员在 live coding 与闭场 DJ 期间在场内巡场","以已核验交易数与尝试交易数的对比计量","没有自觉制，吧台也不需要去解读任何手工名单"]],
    ["redeem", "Drink released against the tx", "The bar releases the drink against a transaction that already exists onchain. People remember who paid for their drink and what they did to earn it.", ["Redemption unlocks only once the second swap has settled","The bar pours against a released credit, never against a claim","Measured as redemptions executed and reconciled with the bar's count","The benefit stays scarce so it reads as targeted, not as a handout"], "Bebida liberada contra la transacción", "La barra libera la bebida contra una transacción que ya existe onchain. La gente recuerda quién pagó su bebida y qué hizo para ganársela.", ["El canje se desbloquea solo cuando el segundo swap se liquida","La barra sirve contra un crédito liberado, nunca contra una afirmación","Se mide como canjes ejecutados y conciliados con el conteo de la barra","El beneficio se mantiene escaso para que se lea dirigido y no regalado"], "凭交易释放酒水", "吧台凭一笔已经存在于链上的交易释放酒水。人们记得是谁请了这杯酒，也记得自己做了什么才换到它。", ["只有第二次兑换完成结算之后，兑换权益才解锁","吧台只对已释放的额度出品，绝不对一句声称出品","以已执行并与吧台账目核对一致的兑换数计量","权益保持稀缺，读起来才是专门给的，而不是随手发的"]],
    ["screen", "Transaction hash drives the wall", "The main LED wall already runs visuals guests change in real time through Claude. A settled transaction hash can seed what it draws, the same principle the room already understands from a Verse generative work reading a hash when it is collected.", ["The hash of a guest's own swap seeds the visual on the main LED wall","Same principle as a Verse work drawing itself from the hash it is collected with","Runs between the live coding set and the closing DJ","Measured as screen minutes and hashes rendered to the room"], "El hash dibuja el muro LED", "El muro LED principal ya corre visuales que los invitados cambian en tiempo real con Claude. El hash de una transacción liquidada puede ser la semilla de lo que dibuja: el mismo principio que la sala ya entiende de una obra de Verse que lee un hash al ser coleccionada.", ["El hash del swap del propio invitado siembra el visual del muro LED principal","Mismo principio que una obra de Verse dibujándose desde el hash con el que se colecciona","Corre entre el set de live coding y el DJ de cierre","Se mide como minutos en pantalla y hashes renderizados frente a la sala"], "哈希驱动 LED 墙", "主 LED 墙本就运行着来宾通过 Claude 实时改变的视觉。一笔已结算交易的哈希，可以成为它绘制画面的种子：这正是这个房间已经从 Verse 作品那里理解到的原理，作品在被收藏时读取哈希，并据此绘制自身。", ["来宾自己那笔兑换的哈希，成为主 LED 墙上视觉的种子","与 Verse 作品凭收藏时的哈希绘制自身，是同一个原理","在 live coding 与闭场 DJ 之间运行","以上屏时长与向全场渲染的哈希数量计量"]],
    ["report", "Report delivered as tx hashes", "The report is a list of transactions rather than a set of claims. The partner can verify every number on a public explorer without taking AXIS at its word.", ["Connections, deposits, swaps, positions, orders and claims, each with a hash","Redemptions reconciled against the bar's own count","Media capture delivered with the numbers, not separately","Every figure is independently checkable, which is the entire point"], "Reporte entregado en hashes", "El reporte es una lista de transacciones y no un conjunto de afirmaciones. El socio puede verificar cada cifra en un explorador público sin creerle a AXIS.", ["Conexiones, depósitos, swaps, posiciones, órdenes y claims, cada uno con su hash","Canjes conciliados contra el propio conteo de la barra","El material de captura se entrega junto con las cifras, no por separado","Cada cifra se puede comprobar de forma independiente, que es justo el punto"], "以交易哈希交付报告", "报告是一份交易清单，而不是一组说法。合作方可以在公共浏览器上核验每一个数字，无需相信 AXIS 的一面之词。", ["连接、入金、兑换、仓位、订单与领取，每一项都附带哈希","兑换数与吧台自己的账目逐条核对","拍摄素材与数据一并交付，而不是分开给出","每个数字都可以被独立核验，这正是重点"]],
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
