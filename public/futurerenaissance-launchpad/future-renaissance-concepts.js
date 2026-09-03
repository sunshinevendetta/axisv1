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
    ["livelaunch", "Live Launch", "A creator from the line-up launches through the platform during the after party, at an announced minute, with the room present. The launch is the event itself, not a link posted the next day.", ["One launch, one window, announced from the stage and from the wall","The first participants are people physically inside Bar Oriente","Measured as participants inside the window and what filled in it","The platform is demonstrated by being used, not by being described"], "Lanzamiento en Vivo", "Un creador del line-up lanza a través de la plataforma durante el after, a una hora anunciada y con la sala presente. El lanzamiento es el evento, no un link publicado al día siguiente.", ["Un lanzamiento, una ventana, anunciada desde el escenario y el muro","Los primeros participantes son gente físicamente dentro de Bar Oriente","Se mide como participantes dentro de la ventana y cuánto se llenó","La plataforma se demuestra usándola, no describiéndola"], "现场发行", "阵容中的一位创作者在后半场通过该平台完成发行，时间提前公布，全场在座。发行本身就是这场活动，而不是第二天贴出来的一个链接。", ["一次发行、一个窗口，由舞台和主屏同时公布","最早的参与者是人就在 Bar Oriente 现场的那批人","以窗口内的参与人数、以及窗口内的完成情况衡量","平台靠被真正使用来证明自己，而不是靠介绍"]],
    ["creatordesk", "Creator Desk", "The 18:00 workshop is hands-on with a chair for every attendee. The exercise is building a launch draft with Claude on the platform, so the room learns the product by shipping something inside it.", ["All 200 seats work through the same flow at the same time","The session runs on the venue screen so nobody is lost mid-step","Support is in the aisle for the step that normally loses people","Measured as drafts created and how many are still live after the night"], "Mesa de Creador", "El taller de las 18:00 es práctico y hay una silla para cada asistente. El ejercicio es construir un lanzamiento con Claude en la plataforma, así que la sala aprende el producto publicando algo dentro de él.", ["Los 200 asientos recorren el mismo flujo al mismo tiempo","La sesión corre en la pantalla del venue, nadie se pierde a media ruta","Hay soporte en el pasillo justo en el paso donde la gente se cae","Se mide como borradores creados y cuántos siguen vivos tras la noche"], "创作者工位", "18:00 的工作坊是动手环节，每位参与者都有一把椅子。练习内容就是用 Claude 在平台上做出一个发行草案，全场通过在产品里真正做出东西来学会这个产品。", ["200 个座位在同一时间走完同一套流程","课程同步在场馆主屏上，没有人会卡在中间某一步","在最容易劝退的那一步，过道里有人现场协助","以创建的草案数量、以及当晚之后仍然存续的数量衡量"]],
    ["allocation", "Earned Allocation", "The size of a guest's allocation comes from validated actions completed during the night. Inside this room money is not the qualifier, participation is.", ["Each validated mission raises the guest's allocation tier","Staff validation gates it, so a tier reflects something that happened","The launch opens with participants who did something to be there","Measured as allocation earned per guest and the actions behind it"], "Asignación Ganada", "El tamaño de la asignación sale de acciones validadas durante la noche. Dentro de esta sala el filtro no es el dinero, es la participación.", ["Cada misión validada sube el nivel de asignación del invitado","El staff valida, así que el nivel refleja algo que de verdad pasó","El lanzamiento abre con participantes que hicieron algo para estar ahí","Se mide como asignación ganada por invitado y las acciones detrás"], "额度靠参与", "来宾能拿到多少额度，取决于当晚完成并通过核验的行动。在这个房间里，门槛不是钱，而是参与。", ["每通过一次任务核验，来宾的额度层级就上升一档","由工作人员把关，所以层级对应的是真实发生过的事","发行开盘时，参与者都是为此做过事情的人","以每位来宾获得的额度、以及其背后的行动衡量"]],
    ["curve", "The Curve", "Launch progress is a scene on the main LED wall. Four hundred and fifty people watching the same number move is something a launch page on a phone can never reproduce.", ["Fill, participant count and time remaining rendered at venue scale","Up to 450 people in the room as the window closes","Room pressure is real and visible, not manufactured in a group chat","Measured as participation rate against people actually present"], "La Curva", "El avance del lanzamiento es una escena en el muro LED principal. Cuatrocientas cincuenta personas viendo moverse el mismo número es algo que una página de lanzamiento en el celular no puede reproducir.", ["Avance, número de participantes y tiempo restante a escala de venue","Hasta 450 personas en la sala cuando la ventana se cierra","La presión de sala es real y visible, no fabricada en un chat","Se mide como tasa de participación contra gente presente"], "进度曲线", "发行进度是 LED 主屏上的一个画面。四百五十人一起盯着同一个数字往上走，这是手机上的发行页面永远做不到的。", ["完成度、参与人数与剩余时间，以场馆尺度呈现","窗口关闭时，现场最多有 450 人","现场的紧迫感是真实可见的，而不是群聊里造出来的","以参与率对照实际在场人数衡量"]],
    ["artefact", "Coded Artefact", "The live-coding set writes music in code in front of the room, which gives the launch an artefact made where everyone could watch it happen. Pixelord already releases sound and 3D together onchain, and Verse Works, also on the line-up, ships work that is drawn from a hash when it is collected rather than handed over as a fixed file.", ["The launched work exists because the set produced it that night","Provenance is the room itself, not a claim inside a document","No pre-recorded asset dropped in from a folder before the doors","Measured as artefacts launched and participants attached to each"], "Obra en Código", "El set de live coding escribe música en código frente a la sala, lo que le da al lanzamiento una obra hecha donde todos pudieron verla. Pixelord ya publica sonido y 3D juntos onchain, y Verse Works, también en el line-up, publica obra que se dibuja a partir de un hash al coleccionarse en vez de entregarse como archivo fijo.", ["La obra lanzada existe porque el set la produjo esa misma noche","La procedencia es la sala, no una afirmación en un documento","Nada pregrabado que se saca de una carpeta antes de abrir puertas","Se mide como obras lanzadas y participantes ligados a cada una"], "代码作品", "Live Coding 环节在全场面前用代码写音乐，这让这次发行拥有一件所有人都亲眼看着诞生的作品。Pixelord 本来就把声音与 3D 一起上链发布；同在阵容中的 Verse Works，其作品也不是固定文件，而是在被收藏时依据哈希把自己画出来。", ["被发行的作品之所以存在，是因为当晚的演出把它做了出来","来源就是这个现场，而不是文档里的一句声明","没有开门前从文件夹里拖出来的预录素材","以发行的作品数、以及每件作品对应的参与者衡量"]],
    ["roomgate", "Room Gate", "The opening window is restricted to guests validated by staff at Bar Oriente. It widens later, but the founding holders are the people who were actually there.", ["Presence is validated by staff, not by a self-reported address","Workshop attendees who stayed past 22:00 are recognised automatically","Gives the launch a founding cohort that can be described honestly","Measured as in-room participants against the later public window"], "Puerta de Sala", "La ventana de apertura queda restringida a invitados validados por el staff en Bar Oriente. Después se abre más, pero los primeros holders son quienes estuvieron ahí.", ["La presencia la valida el staff, no una dirección declarada por el usuario","Quien se quedó del taller después de las 22:00 se reconoce automáticamente","Le da al lanzamiento una cohorte fundadora que se puede describir con honestidad","Se mide como participantes en sala frente a la ventana pública posterior"], "在场优先", "开盘窗口仅对在 Bar Oriente 由工作人员核验通过的来宾开放。之后会逐步放开，但最初的持有者是真正到过现场的人。", ["在场由工作人员核验，而不是用户自己填一个地址","22:00 之后仍留在现场的工作坊参与者自动获得识别","让这次发行拥有一批可以如实描述的初始持有人","以现场参与人数、对照之后的公开窗口衡量"]],
    ["cohort", "Holder Cohort", "After the night the launchpad receives its holder list as a described cohort, producers, labels, managers and studios, instead of an anonymous export of addresses.", ["Holders segmented by the role they gave at the workshop desk","Retention checked at thirty days, not on the morning after","The asset the partner keeps once the production is finished","Measured as holders retained and allocation still held"], "Cohorte de Holders", "Después de la noche la plataforma recibe su lista de holders como una cohorte descrita, productores, sellos, managers y estudios, en vez de un export anónimo de direcciones.", ["Holders segmentados por el rol que declararon en la mesa del taller","La retención se revisa a los 30 días, no a la mañana siguiente","Es el activo que el socio conserva cuando la producción termina","Se mide como holders retenidos y asignación todavía en su poder"], "持有者画像", "当晚之后，平台拿到的持有者名单是一份有描述的人群：制作人、厂牌、经纪人和录音棚，而不是一份匿名地址导出文件。", ["持有者按其在工作坊登记的行业身份分层","留存在第 30 天核对，而不是第二天早上","这是制作结束之后，合作方真正留下的资产","以留存的持有者数量、以及仍未卖出的额度衡量"]],
  ];
  mechanics.forEach(function (item, index) {
    add("mechanic-" + item[0], "08 / " + String(index + 1).padStart(2, "0"), item[1], item[2], item[3], {
      es: { title: item[4], summary: item[5], details: item[6] },
      zh: { title: item[7], summary: item[8], details: item[9] },
    });
  });

  var rewardFlow = [
    ["onboard", "Seat scan opens an allocation", "Doors at 18:00, 200 chairs, one scan per seat. The scan that seats the guest is the scan that opens their allocation on the launchpad.", ["All 200 seats onboarded in the same block, with staff in the aisle","Role captured at the seat: producer, artist, label, manager, studio","Measured as allocations opened at the seat, not as app installs","Nobody is asked to go and sign up alone later"], "El escaneo del asiento abre la asignación", "Puertas a las 18:00, 200 sillas, un escaneo por asiento. El escaneo que sienta al invitado es el que abre su asignación en la plataforma.", ["Los 200 asientos se dan de alta en el mismo bloque, con staff en el pasillo","El rol se captura en el asiento: productor, artista, sello, manager, estudio","Se mide como asignaciones abiertas en el asiento, no como instalaciones","A nadie se le pide registrarse solo, más tarde"], "扫码入座即开通额度", "18:00 开门，200 把椅子，每个座位扫一次码。让来宾入座的那次扫码，同时也在平台上为他开通了额度。", ["200 个座位在同一时段完成开通，过道里有工作人员","身份在座位上登记：制作人、艺术家、厂牌、经纪人、录音棚","以在座位上开通的额度数衡量，而不是应用安装量","不需要任何人事后独自去注册"]],
    ["act", "Launch page built in the seat", "The hands-on exercise is building a launch on the platform with Claude. Every attendee finishes the 18:00 to 21:00 block having used the product for its actual purpose.", ["The step is done together, mirrored on the venue screen","Artists build for themselves, labels and managers build for a roster","Measured as launch drafts completed inside the workshop block","Product education happens before the room starts drinking"], "Página de lanzamiento desde el asiento", "El ejercicio práctico es construir un lanzamiento en la plataforma con Claude. Cada asistente termina el bloque de 18:00 a 21:00 habiendo usado el producto para lo que sirve.", ["El paso se hace en conjunto, replicado en la pantalla del venue","Los artistas construyen para sí mismos, sellos y managers para su roster","Se mide como borradores de lanzamiento completados dentro del taller","La educación de producto ocurre antes de que la sala empiece a beber"], "在座位上做出发行页", "动手环节就是用 Claude 在平台上做出一个发行。每位参与者结束 18:00 至 21:00 这一段时，都已经把产品用在了它真正的用途上。", ["这一步全场一起做，并同步在场馆主屏上","艺术家为自己做，厂牌和经纪人为旗下艺人做","以工作坊时段内完成的发行草案数量衡量","产品教育发生在全场开始喝酒之前"]],
    ["validate", "Presence verified at 22:00", "At 22:00 the doors open to 250 further guests. Staff verify each guest before allocation is confirmed, so the founding cohort is people who were in the building.", ["Staff validation and the platform record have to agree","Workshop guests who stayed carry their earned tier straight through","Measured as verified participants, kept separate from headcount","This is the number the launch report is built on"], "Presencia verificada a las 22:00", "A las 22:00 las puertas abren para 250 invitados más. El staff verifica a cada invitado antes de confirmar la asignación, así que la cohorte fundadora es gente que estuvo en el lugar.", ["La validación del staff y el registro de la plataforma tienen que coincidir","Quien se quedó del taller conserva directo el nivel que ganó","Se mide como participantes verificados, aparte del conteo de asistentes","Sobre este número se construye el reporte del lanzamiento"], "22:00 核验是否在场", "22:00 开门，另有 250 位来宾进场。工作人员逐一核验后才确认额度，因此初始人群都是真正到过现场的人。", ["人工核验与平台记录必须一致","从工作坊留下来的来宾，直接带着已获得的层级继续","以核验通过的参与者衡量，与到场人数分开统计","发行报告建立在这个数字之上"]],
    ["launch", "The curve opens on the wall", "The launch window opens around the live-coding set and the fill runs on the main LED wall, so joining is something the whole room watches happen.", ["The window is announced from the stage and rendered at venue scale","Participants watch their own entry land on the curve","The launch has an audience, which is the reason to do it here","Measured as participants and fill inside the announced window"], "La curva abre en el muro", "La ventana de lanzamiento abre alrededor del set de live coding y el llenado corre en el muro LED principal, así que entrar es algo que toda la sala ve suceder.", ["La ventana se anuncia desde el escenario y se renderiza a escala de venue","Cada participante ve su propia entrada aterrizar en la curva","El lanzamiento tiene público, que es justamente la razón de hacerlo aquí","Se mide como participantes y llenado dentro de la ventana anunciada"], "曲线在主屏上开盘", "发行窗口在 Live Coding 前后开启，完成进度实时跑在 LED 主屏上，于是「参与」变成了全场一起看着发生的事。", ["窗口由舞台公布，并以场馆尺度呈现在屏幕上","参与者能看到自己那一笔落在曲线上","这次发行是有观众的，而这正是把它放在这里做的理由","以公布窗口内的参与人数与完成度衡量"]],
    ["redeem", "Participation pours the drink", "A verified participation is redeemed at the bar for a drink. The reward sits in the middle of the flow rather than at the end of it.", ["One verified action, one drink, logged against the action","Redemption is in person at the bar, in a single movement","People remember who paid for the drink and what earned it","Measured as redemptions and the participations they resolve to"], "La participación paga el trago", "Una participación verificada se canjea en la barra por un trago. La recompensa está a la mitad del flujo, no al final.", ["Una acción verificada, un trago, registrado contra la acción","El canje es en persona en la barra, en un solo movimiento","La gente recuerda quién pagó el trago y qué hizo para ganárselo","Se mide como canjes y las participaciones a las que corresponden"], "参与即可换一杯", "核验通过的参与，可在吧台兑换一杯饮品。奖励位于流程的中段，而不是终点。", ["一次核验行动换一杯，并与该行动绑定记录","兑换在吧台当面完成，一个动作走完","人们记得住是谁请的这杯酒，以及自己做了什么才换到它","以兑换次数、以及其对应的参与记录衡量"]],
    ["report", "Holder cohort, named by role", "AXIS closes with one record: allocations opened, drafts built, participants verified, how the launch filled, and who is still holding weeks later.", ["Split between workshop attendees and after-party arrivals","Holders described by industry role, not only by address","Measured as retention at thirty days rather than impressions","Delivered as the partner's own record, not as a recap deck"], "Cohorte de holders, con nombre y rol", "AXIS cierra con un solo registro: asignaciones abiertas, borradores construidos, participantes verificados, cómo se llenó el lanzamiento y quién sigue holdeando semanas después.", ["Separado entre asistentes del taller y llegadas del after","Los holders se describen por rol en la industria, no solo por dirección","Se mide como retención a 30 días, no como impresiones","Se entrega como registro propio del socio, no como presentación de cierre"], "带身份的持有者名单", "AXIS 以一份记录收尾：开通了多少额度、做出多少草案、核验通过多少人、发行如何完成，以及数周之后还有谁在持有。", ["按工作坊参与者与后半场进场者分开呈现","持有者以行业身份描述，而不只是一串地址","以 30 天留存衡量，而不是曝光量","作为合作方自己的记录交付，而不是一份总结演示"]],
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
