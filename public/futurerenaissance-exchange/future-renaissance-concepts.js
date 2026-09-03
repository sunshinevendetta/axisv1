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
    ["verify", "Verify", "Account creation and identity verification happen at a staffed desk inside the venue, with a host who can fix a failed document scan while the guest is still standing there.", ["The onboarding desk runs from the 18:00 workshop doors through the night","Staff resolve failed document scans on the spot instead of losing the guest","Measured as verifications completed and approval rate, not app installs","A completed verification is what releases the first drink at the bar"], "Verificar", "La creación de cuenta y la verificación de identidad ocurren en un módulo con personal dentro del venue, con alguien que puede resolver un escaneo fallido mientras el invitado sigue ahí parado.", ["El módulo de onboarding opera desde las 18:00 y durante toda la noche","El personal resuelve escaneos fallidos en el momento, sin perder al invitado","Se mide como verificaciones completadas y tasa de aprobación, no instalaciones","Una verificación completada es lo que libera la primera bebida en la barra"], "验证", "开户与身份验证在场地内的人工引导台完成，证件扫描失败时，工作人员就在旁边当场解决。", ["引导台从 18:00 工作坊开门起运作，贯穿整夜","证件扫描失败当场处理，而不是就此丢失这位来宾","以完成验证数与通过率计量，而非应用安装量","完成验证，才会在吧台释放第一杯酒"]],
    ["deposit", "Deposit", "The step that leaks hardest in a remote funnel happens here in a lit room with support present: a first deposit by card or local transfer, completed on site.", ["Deposit completed during the event, not deferred to a follow-up email","Support is physically present at the step where remote funnels lose people","Measured as first-time funded accounts and median first deposit","A funded account is the honest line between a download and a user"], "Depositar", "El paso donde más se cae un funnel remoto ocurre aquí, en una sala iluminada y con soporte al lado: un primer depósito con tarjeta o transferencia, completado en sitio.", ["Depósito completado durante el evento, no aplazado a un correo de seguimiento","Hay soporte presente justo donde los funnels remotos pierden a la gente","Se mide como cuentas fondeadas por primera vez y monto mediano del depósito","Una cuenta fondeada es la línea honesta entre una descarga y un usuario"], "入金", "远程漏斗中流失最严重的一步，在这里于明亮的房间、有人协助的情况下完成：用银行卡或本地转账完成首次入金。", ["入金在活动现场完成，而不是推迟到后续邮件","在远程漏斗最容易流失的环节安排现场支持","以首次入金账户数与首次入金中位金额计量","已入金账户才是下载量与真实用户之间的诚实分界"]],
    ["trade", "First Trade", "A guest who has only ever read about the product places one real order, a convert or a first spot trade, with someone beside them who can explain the screen once.", ["One convert or spot order, completed inside the venue","Staff walk the guest through the order screen once, then step back","Measured as first orders placed and first-order completion rate","The action most likely to be repeated at home the following week"], "Primera operación", "Un invitado que solo había leído del producto coloca una orden real, un convert o su primera operación spot, con alguien al lado que le explica la pantalla una sola vez.", ["Un convert o una orden spot, completada dentro del venue","El personal acompaña la primera pantalla de orden y luego se hace a un lado","Se mide como primeras órdenes colocadas y tasa de finalización","Es la acción con más probabilidad de repetirse en casa la semana siguiente"], "首次交易", "此前只在文章里读到过这个产品的来宾，在有人把界面讲解一次之后，真正下了一笔单：一次兑换，或第一笔现货交易。", ["在场地内完成一次兑换或一笔现货订单","工作人员讲解一次下单界面，随后退开","以首次下单数与首单完成率计量","这是最有可能在下一周于家中被重复的行为"]],
    ["outcomes", "Outcomes", "The prediction-markets surface is the part of an exchange that genuinely works in a bar: guests take a position on something resolving that week and check it before they leave.", ["Guests open a position on the in-app outcomes surface from the venue","Positions are small, social and readable on a phone in a dark room","Measured as positions opened and guests who return to check them","This is the second verified action that releases the second drink"], "Outcomes", "La superficie de mercados de predicción es la parte del exchange que de verdad funciona en un bar: los invitados toman una posición sobre algo que se resuelve esa semana y la revisan antes de irse.", ["Los invitados abren una posición en la superficie de outcomes desde el venue","Posiciones pequeñas, sociales y legibles en un teléfono en un cuarto oscuro","Se mide como posiciones abiertas e invitados que regresan a revisarlas","Es la segunda acción verificada que libera la segunda bebida"], "预测市场", "预测市场是交易所里唯一在酒吧场景中真正成立的部分：来宾对本周就会揭晓的事件建立一个仓位，离场之前还会再看一眼。", ["来宾在场地内于应用的预测市场界面开仓","仓位小、有社交性，在昏暗环境的手机上也读得清","以开仓数与回来查看结果的来宾数计量","这是释放第二杯酒的第二个已验证行为"]],
    ["invite", "Invite", "Referral works at Bar Oriente because the person being invited is standing two metres away and can finish the flow before the drink is poured.", ["A guest sends a referral to someone physically in the venue","The invited guest can verify at the same desk within minutes","Measured as referrals sent and referrals completed the same night","Both sides of the referral are validated by staff, not self-reported"], "Invitar", "El referido funciona en Bar Oriente porque la persona invitada está a dos metros y puede terminar el flujo antes de que sirvan la bebida.", ["El invitado manda un referido a alguien que está físicamente en el venue","El referido puede verificarse en el mismo módulo en cuestión de minutos","Se mide como referidos enviados y referidos completados esa misma noche","Los dos lados del referido los valida el personal, no se autodeclaran"], "邀请", "邀请机制在 Bar Oriente 之所以成立，是因为被邀请的人就站在两米之外，可以在酒倒好之前把流程走完。", ["来宾把邀请发给此刻就在场地内的人","被邀请者可以在同一个引导台几分钟内完成验证","以发出的邀请数与当晚完成的邀请数计量","邀请双方都由工作人员核验，而非自行申报"]],
    ["withdraw", "Withdraw", "A guest moves funds out to their own wallet on the night. It is the fastest way to answer the custody question, because it is answered in front of the person asking it.", ["A withdrawal to the guest's own address, completed at the venue","The custody question is settled by demonstration, not by a disclaimer","Measured as withdrawals completed and time to settlement","The one action a competitor cannot demonstrate from a printed banner"], "Retirar", "Un invitado saca fondos a su propia wallet esa misma noche. Es la forma más rápida de responder la pregunta de custodia, porque se responde frente a quien la está haciendo.", ["Un retiro a la dirección del propio invitado, completado en el venue","La custodia se resuelve con una demostración, no con un aviso legal","Se mide como retiros completados y tiempo hasta la liquidación","Es la única acción que un competidor no puede demostrar desde una lona"], "提现", "来宾当晚就把资金提到自己的钱包。这是回答托管疑问最快的方式，因为答案当着提问者的面给出。", ["在场地内完成一笔提现到来宾自己的地址","托管问题用一次演示解决，而不是一段免责声明","以完成的提现笔数与到账时间计量","这是竞争对手无法用一块广告布证明的动作"]],
    ["retain", "Retain", "Unlike a giveaway, a verified account persists. It is a real, reachable, funded relationship the partner still holds weeks after Bar Oriente empties.", ["The account survives the night without asking the guest to register again","Post-event contact runs through the product, not a scraped guest list","Measured as accounts still funded and still trading 30 days later","The asset the partner keeps once the production is over"], "Retener", "A diferencia de una dinámica de regalos, una cuenta verificada permanece: es una relación real, alcanzable y fondeada que el socio conserva semanas después de que Bar Oriente se vacía.", ["La cuenta sobrevive a la noche sin pedirle al invitado que se registre otra vez","El contacto posterior corre por el producto, no por una lista de invitados","Se mide como cuentas aún fondeadas y operando 30 días después","Es el activo que el socio conserva cuando termina la producción"], "留存", "与送赠品不同，已验证账户会留下来：这是一段真实、可触达、已入金的关系，在 Bar Oriente 散场数周之后依然属于合作方。", ["账户跨过当晚继续存在，无需来宾重新注册","后续联系通过产品本身进行，而不是一份导出的宾客名单","以 30 天后仍有资金、仍在交易的账户数计量","制作结束后合作方真正保留下来的资产"]],
  ];
  mechanics.forEach(function (item, index) {
    add("mechanic-" + item[0], "08 / " + String(index + 1).padStart(2, "0"), item[1], item[2], item[3], {
      es: { title: item[4], summary: item[5], details: item[6] },
      zh: { title: item[7], summary: item[8], details: item[9] },
    });
  });

  var rewardFlow = [
    ["onboard", "Verify at the onboarding desk", "From 18:00 to 21:00 the seated Claude workshop for the music industry holds 200 people, a chair for every attendee. It is the calmest verification window of the night, because nobody is standing in a queue.", ["18:00-21:00 · Claude workshop for the music industry, 200 seats","Everyone is seated, so onboarding is accompanied rather than queued","Measured as verifications completed before the 22:00 doors","With staff present a failed scan gets fixed instead of abandoned"], "Verificación en el módulo de onboarding", "De 18:00 a 21:00 el taller de Claude para la industria musical ocupa la sala sentada, con 200 lugares y una silla para cada quien. Es la ventana más tranquila de la noche para verificar, porque nadie está formado.", ["18:00-21:00 · taller de Claude para la industria musical, 200 lugares","Todos sentados: el onboarding es acompañado, no una fila","Se mide como verificaciones completadas antes de las 22:00","Con personal presente, un escaneo fallido se arregla en vez de abandonarse"], "在引导台完成验证", "18:00 至 21:00，面向音乐行业的 Claude 工作坊占据整个坐席空间，200 个座位，人人有椅子。这是全场最从容的验证时段，因为没有人在排队。", ["18:00-21:00 · 面向音乐行业的 Claude 工作坊，200 个座位","全员就座，引导是陪同式的，而不是排队","以 22:00 开门前完成的验证数计量","有人在场，扫描失败会被修好，而不是被放弃"]],
    ["act", "First order placed in the app", "At 22:00 the doors open to 250 further guests on top of the workshop room that stays. The mission is one completable thing, not a form.", ["22:00 doors · 250 further guests on top of the workshop audience","One action, finishable in under two minutes on a phone","Measured as qualified actions, kept separate from attendance","The exact action is chosen with the partner before the night"], "Primera orden dentro de la app", "A las 22:00 abren las puertas para 250 invitados más, encima de la sala del taller que se queda. La misión es una sola cosa que se puede terminar, no un formulario.", ["22:00 · llegan 250 invitados además del público del taller","Una sola acción, terminable en menos de dos minutos desde el teléfono","Se mide como acciones calificadas, separadas de la simple asistencia","La acción exacta se define con el socio antes de la noche"], "在应用内完成首笔下单", "22:00 开门，在留下来的工作坊人群之外，另有 250 位来宾到场。任务是一件能够被完成的具体事，而不是一张表单。", ["22:00 开门 · 在工作坊人群之外再来 250 位来宾","一个动作，在手机上两分钟内即可完成","以合格行为数计量，与单纯到场区分开","具体动作在活动前与合作方共同确定"]],
    ["validate", "Staff validation on the floor", "Before anything is released, a staff member reads the completed state on the guest's own screen. Nothing in this flow runs on the honour system.", ["A staff member reads the completed state on the guest's own screen","AXIS staff validate; the bar only pours against a released credit","Measured as validated actions against actions claimed","This is the number the post-event report is built on"], "Validación de staff en piso", "Antes de liberar nada, alguien del equipo lee el estado completado en la pantalla del propio invitado. Nada de este flujo corre por honor.", ["Un miembro del equipo lee el estado completado en la pantalla del invitado","El staff de AXIS valida; la barra solo sirve contra un crédito liberado","Se mide como acciones validadas contra acciones declaradas","Es la cifra sobre la que se construye el reporte posterior"], "工作人员现场核验", "在释放任何权益之前，工作人员会在来宾自己的屏幕上读取完成状态。这套流程里没有任何一步靠自觉。", ["工作人员在来宾自己的屏幕上读取完成状态","由 AXIS 工作人员核验；吧台只对已释放的额度出品","以已核验行为数与声称完成数的对比计量","这是活动后报告赖以建立的数字"]],
    ["redeem", "Drink released at the bar", "The drink is released against a verified action rather than a wristband. People remember who paid for their drink and what they did to earn it.", ["Redemption unlocks only after validation, never before","Verification releases the first drink; a second action releases the second","Measured as redemptions executed and reconciled with the bar's count","The benefit stays scarce so it reads as targeted, not as a handout"], "Canje de bebida en la barra", "La bebida se libera contra una acción verificada y no contra una pulsera. La gente recuerda quién pagó su bebida y qué hizo para ganársela.", ["El canje se desbloquea solo después de la validación, nunca antes","La verificación libera la primera bebida; una segunda acción libera la segunda","Se mide como canjes ejecutados y conciliados con el conteo de la barra","El beneficio se mantiene escaso para que se lea dirigido y no regalado"], "在吧台兑换酒水", "酒水凭一次已验证的行为释放，而不是凭一条手环。人们记得是谁请了这杯酒，也记得自己做了什么才换到它。", ["只有通过核验之后才会释放兑换，绝不提前","完成验证释放第一杯，第二个已验证行为释放第二杯","以已执行并与吧台账目核对一致的兑换数计量","权益保持稀缺，读起来才是专门给的，而不是随手发的"]],
    ["screen", "Partner state on the LED wall", "The main LED wall already carries visuals guests change in real time through Claude. Between the live coding set and the closing DJ, it carries the live state of the activity.", ["The main LED wall is the one surface the whole room looks at together","Partner state runs between the live coding set and the closing DJ","Measured as screen minutes and the moments captured on camera","Seen by the full room, including the 250 who arrive at 22:00"], "Estado del socio en el muro LED", "El muro LED principal ya corre visuales que los invitados cambian en tiempo real con Claude. Entre el set de live coding y el DJ de cierre, lleva el estado en vivo de la actividad.", ["El muro LED principal es la superficie que toda la sala mira a la vez","El estado del socio corre entre el live coding y el DJ de cierre","Se mide como minutos en pantalla y momentos capturados en cámara","Lo ve la sala completa, incluidos los 250 que llegan a las 22:00"], "合作方状态出现在 LED 墙上", "主 LED 墙本就运行着来宾通过 Claude 实时改变的视觉。在 live coding 与闭场 DJ 之间，它承载这场活动的实时状态。", ["主 LED 墙是全场同时注视的唯一界面","合作方状态在 live coding 与闭场 DJ 之间运行","以上屏时长与被镜头记录的瞬间计量","全场都看得到，包括 22:00 到场的那 250 人"]],
    ["report", "Report delivered after the night", "One night, one document. Verifications, deposits, first orders, positions, referrals, withdrawals and redemptions, reconciled rather than estimated.", ["Verifications, deposits, first orders, positions, referrals, withdrawals","Redemptions reconciled against the bar's own count","Media capture delivered with the numbers, not separately","Nothing is estimated after the fact"], "Reporte entregado después de la noche", "Una noche, un documento. Verificaciones, depósitos, primeras órdenes, posiciones, referidos, retiros y canjes, conciliados y no estimados.", ["Verificaciones, depósitos, primeras órdenes, posiciones, referidos y retiros","Canjes conciliados contra el propio conteo de la barra","El material de captura se entrega junto con las cifras, no por separado","Nada se estima después del hecho"], "活动结束后交付报告", "一个夜晚，一份文件。验证、入金、首笔下单、仓位、邀请、提现与兑换，全部经过核对，而不是估算。", ["验证、入金、首笔下单、仓位、邀请与提现","兑换数与吧台自己的账目逐条核对","拍摄素材与数据一并交付，而不是分开给出","没有任何数字是事后估算出来的"]],
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
