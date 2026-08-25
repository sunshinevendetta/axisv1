(function () {
  "use strict";

  var stage = document.getElementById("stage");
  var viewport = document.getElementById("viewport");
  var prevButton = document.getElementById("nav-prev");
  var nextButton = document.getElementById("nav-next");
  var dots = document.getElementById("dots");
  var counterCurrent = document.getElementById("cur");
  var counterTotal = document.getElementById("total");
  var progress = document.getElementById("progress");
  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  var orientation = document.documentElement.dataset.orientation || "horizontal";
  var allSlides = Array.prototype.slice.call(document.querySelectorAll(".fr-slide"));
  var currentIndex = 0;
  var activeTimeline = null;
  var activeLoops = [];
  var transitioning = false;
  var touchStartX = 0;
  var touchStartY = 0;
  var wheelLocked = false;
  var artistModal = document.getElementById("artist-modal");
  var artistModalPanel = artistModal && artistModal.querySelector(".artist-modal-panel");
  var artistModalTimeline = null;
  var activeArtistTrigger = null;
  var activeArtistId = null;
  var conceptModal = document.getElementById("concept-modal");
  var conceptModalPanel = conceptModal && conceptModal.querySelector(".concept-modal-panel");
  var conceptModalTimeline = null;
  var activeConceptTrigger = null;
  var activeConceptId = null;

  function modalIsOpen() {
    return Boolean(
      (artistModal && artistModal.classList.contains("is-open")) ||
      (conceptModal && conceptModal.classList.contains("is-open"))
    );
  }

  // Artist copy is written per language in the data file rather than through
  // data-i18n, because a profile is a paragraph, not a label.
  function currentLanguage() {
    var get = window.__futureRenaissanceGetLanguage;
    return (typeof get === "function" && get()) || "en";
  }

  function localizedArtist(artist) {
    var overrides = artist[currentLanguage()];
    if (!overrides) return artist;
    var merged = {};
    Object.keys(artist).forEach(function (key) { merged[key] = artist[key]; });
    Object.keys(overrides).forEach(function (key) { merged[key] = overrides[key]; });
    return merged;
  }

  function renderArtistMonogram(el, artist) {
    var media = artist.monogramMedia;
    if (media && media.type === "svg") {
      el.innerHTML = media.markup;
    } else if (media && media.type === "image") {
      el.innerHTML = '<img src="' + media.src + '" alt="' + (media.alt || artist.name) + '">';
    } else {
      el.textContent = artist.monogram || artist.name.slice(0, 2).toUpperCase();
    }
  }

  function populateArtistModal(source) {
    var artist = localizedArtist(source);
    document.getElementById("artist-modal-kind").textContent = artist.kind;
    document.getElementById("artist-modal-name").textContent = artist.name;
    renderArtistMonogram(document.getElementById("artist-modal-monogram"), artist);
    document.getElementById("artist-modal-tag").textContent = artist.tag || artist.kind;
    document.getElementById("artist-modal-discipline").textContent = artist.discipline;
    document.getElementById("artist-modal-bio").textContent = artist.bio;
    var facts = document.getElementById("artist-modal-facts");
    facts.innerHTML = "";
    (artist.facts || []).forEach(function (fact) {
      var term = document.createElement("dt");
      term.textContent = fact[0];
      var value = document.createElement("dd");
      value.textContent = fact[1];
      facts.appendChild(term);
      facts.appendChild(value);
    });
    var link = document.getElementById("artist-modal-link");
    document.getElementById("artist-modal-link-label").textContent = artist.linkLabel + (artist.handle ? " · " + artist.handle : "");
    link.href = artist.href || "#";
    link.hidden = !artist.href;
  }

  // The line up cells carry the same per-language copy as the profiles.
  function refreshArtistLanguage() {
    document.querySelectorAll("[data-artist-id]").forEach(function (cell) {
      var source = window.FUTURE_RENAISSANCE_ARTISTS && window.FUTURE_RENAISSANCE_ARTISTS[cell.dataset.artistId];
      if (!source) return;
      var artist = localizedArtist(source);
      var tag = cell.querySelector(".lineup-cell-tag");
      var role = cell.querySelector("small");
      if (tag) tag.textContent = artist.tag;
      if (role) role.textContent = artist.role;
    });
    if (activeArtistId && window.FUTURE_RENAISSANCE_ARTISTS[activeArtistId]) {
      populateArtistModal(window.FUTURE_RENAISSANCE_ARTISTS[activeArtistId]);
    }
  }

  function openArtistModal(id, trigger) {
    var artist = window.FUTURE_RENAISSANCE_ARTISTS && window.FUTURE_RENAISSANCE_ARTISTS[id];
    if (!artistModal || !artistModalPanel || !artist) return;
    populateArtistModal(artist);
    activeArtistTrigger = trigger;
    activeArtistId = id;
    artistModal.setAttribute("aria-hidden", "false");
    artistModal.classList.add("is-open");
    document.body.classList.add("artist-modal-open");
    artistModal.querySelector(".artist-modal-close").focus();
    if (artistModalTimeline) artistModalTimeline.kill();
    if (reducedMotion.matches) {
      gsap.set([artistModal, artistModalPanel], { clearProps: "all" });
      return;
    }
    artistModalTimeline = gsap.timeline();
    artistModalTimeline
      .fromTo(artistModal, { opacity: 0 }, { opacity: 1, duration: .28, ease: "power2.out" }, 0)
      .fromTo(artistModalPanel, { opacity: 0, y: 32, scale: .975, filter: "blur(12px)" }, { opacity: 1, y: 0, scale: 1, filter: "blur(0px)", duration: .62, ease: "power3.out" }, .04)
      .fromTo(artistModal.querySelector(".artist-modal-monogram"), { opacity: 0, scale: .72, rotation: -3 }, { opacity: 1, scale: 1, rotation: 0, duration: .7, ease: "power3.out" }, .16)
      .fromTo(artistModal.querySelectorAll(".artist-modal-copy > *"), { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: .42, stagger: .055, ease: "power2.out" }, .2);
  }

  function closeArtistModal() {
    if (!artistModal || !artistModalPanel || !artistModal.classList.contains("is-open")) return;
    if (artistModalTimeline) artistModalTimeline.kill();
    function finish() {
      artistModal.classList.remove("is-open");
      artistModal.setAttribute("aria-hidden", "true");
      document.body.classList.remove("artist-modal-open");
      var animatedModalElements = [artistModal, artistModalPanel, artistModal.querySelector(".artist-modal-monogram")]
        .concat(Array.prototype.slice.call(artistModal.querySelectorAll(".artist-modal-copy > *")));
      gsap.set(animatedModalElements, { clearProps: "all" });
      if (activeArtistTrigger) activeArtistTrigger.focus();
      activeArtistTrigger = null;
      activeArtistId = null;
    }
    if (reducedMotion.matches) {
      finish();
      return;
    }
    artistModalTimeline = gsap.timeline({ onComplete: finish });
    artistModalTimeline
      .to(artistModalPanel, { opacity: 0, y: 22, scale: .985, duration: .24, ease: "power2.in" }, 0)
      .to(artistModal, { opacity: 0, duration: .24, ease: "power2.in" }, .06);
  }

  function trapModalFocus(modal, event) {
    var focusable = Array.prototype.slice.call(modal.querySelectorAll('button, a[href], [tabindex]:not([tabindex="-1"])'));
    if (!focusable.length) return;
    var first = focusable[0];
    var last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  // Concept detail copy is written per language in the concepts data file
  // rather than through data-i18n, because it is paragraph-length sales copy.
  function localizedConcept(id) {
    var concept = window.FUTURE_RENAISSANCE_CONCEPTS && window.FUTURE_RENAISSANCE_CONCEPTS[id];
    if (!concept) return null;
    var table = window.FUTURE_RENAISSANCE_CONCEPT_I18N && window.FUTURE_RENAISSANCE_CONCEPT_I18N[currentLanguage()];
    var overrides = table && table[id];
    if (!overrides) return concept;
    var merged = {};
    Object.keys(concept).forEach(function (key) { merged[key] = concept[key]; });
    Object.keys(overrides).forEach(function (key) { merged[key] = overrides[key]; });
    return merged;
  }

  function refreshConceptLanguage() {
    if (!activeConceptId) return;
    var concept = localizedConcept(activeConceptId);
    if (concept) populateConceptModal(concept, activeConceptId);
  }

  function conceptGlyph(id) {
    var name = (window.FUTURE_RENAISSANCE_CONCEPT_ICONS && window.FUTURE_RENAISSANCE_CONCEPT_ICONS[id]) || "spark";
    return typeof window.__futureRenaissanceGlyph === "function" ? window.__futureRenaissanceGlyph(name) : "";
  }

  function populateConceptModal(concept, id) {
    document.getElementById("concept-modal-code").textContent = concept.code;
    document.getElementById("concept-modal-title").textContent = concept.title;
    document.getElementById("concept-modal-summary").textContent = concept.summary;
    document.getElementById("concept-modal-index").innerHTML = conceptGlyph(id);
    var list = document.getElementById("concept-modal-details");
    list.innerHTML = "";
    concept.details.forEach(function (detail, index) {
      var item = document.createElement("li");
      item.dataset.index = String(index + 1).padStart(2, "0");
      item.textContent = detail;
      list.appendChild(item);
    });
  }

  function openConceptModal(id, trigger) {
    var concept = localizedConcept(id);
    if (!conceptModal || !conceptModalPanel || !concept) return;
    populateConceptModal(concept, id);
    activeConceptTrigger = trigger;
    activeConceptId = id;
    conceptModal.setAttribute("aria-hidden", "false");
    conceptModal.classList.add("is-open");
    document.body.classList.add("concept-modal-open");
    conceptModal.querySelector(".concept-modal-close").focus();
    if (conceptModalTimeline) conceptModalTimeline.kill();
    if (reducedMotion.matches) {
      gsap.set([conceptModal, conceptModalPanel], { clearProps: "all" });
      return;
    }
    conceptModalTimeline = gsap.timeline();
    conceptModalTimeline
      .fromTo(conceptModal, { autoAlpha: 0 }, { autoAlpha: 1, duration: .26, ease: "power2.out" }, 0)
      .fromTo(conceptModalPanel, { autoAlpha: 0, y: 34, scale: .97, filter: "blur(14px)" }, { autoAlpha: 1, y: 0, scale: 1, filter: "blur(0px)", duration: .62, ease: "power3.out" }, .03)
      .fromTo(conceptModal.querySelector(".concept-modal-orbit"), { autoAlpha: 0, scale: .78, rotation: -3 }, { autoAlpha: 1, scale: 1, rotation: 0, duration: .68, ease: "power3.out" }, .14)
      .fromTo(conceptModal.querySelectorAll(".concept-modal-copy > *"), { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: .4, stagger: .05, ease: "power2.out" }, .2);
  }

  function closeConceptModal() {
    if (!conceptModal || !conceptModalPanel || !conceptModal.classList.contains("is-open")) return;
    if (conceptModalTimeline) conceptModalTimeline.kill();
    function finish() {
      conceptModal.classList.remove("is-open");
      conceptModal.setAttribute("aria-hidden", "true");
      document.body.classList.remove("concept-modal-open");
      var animated = [conceptModal, conceptModalPanel, conceptModal.querySelector(".concept-modal-orbit")]
        .concat(Array.prototype.slice.call(conceptModal.querySelectorAll(".concept-modal-copy > *")));
      gsap.set(animated, { clearProps: "all" });
      if (activeConceptTrigger) activeConceptTrigger.focus();
      activeConceptTrigger = null;
    }
    if (reducedMotion.matches) {
      finish();
      return;
    }
    conceptModalTimeline = gsap.timeline({ onComplete: finish });
    conceptModalTimeline
      .to(conceptModalPanel, { autoAlpha: 0, y: 24, scale: .985, duration: .23, ease: "power2.in" }, 0)
      .to(conceptModal, { autoAlpha: 0, duration: .23, ease: "power2.in" }, .05);
  }

  function parentUrl() {
    try {
      if (window.parent && window.parent !== window) return new URL(window.parent.location.href);
    } catch {}
    return new URL(window.location.href);
  }

  function selectSlides() {
    var view = parentUrl().searchParams.get("view") || "extended";
    var ids = null;
    if (view === "short") ids = ["cover", "audience", "brand-function", "presenting", "close"];
    if (view === "sheet") ids = ["close"];
    if (view === "intro") ids = ["cover", "idea", "event", "audience", "program", "roles"];
    allSlides.forEach(function (slide) {
      var visible = !ids || ids.indexOf(slide.dataset.slideId) !== -1;
      slide.classList.toggle("is-view-hidden", !visible);
      slide.setAttribute("aria-hidden", visible ? "false" : "true");
    });
    document.body.classList.toggle("is-sheet-view", view === "sheet");
    return allSlides.filter(function (slide) { return !slide.classList.contains("is-view-hidden"); });
  }

  var slides = selectSlides();

  function fit() {
    var stageWidth = orientation === "vertical" ? 1080 : 1920;
    var stageHeight = orientation === "vertical" ? 2280 : 1080;
    var scale = Math.min(window.innerWidth / stageWidth, window.innerHeight / stageHeight);
    stage.style.transform = "translate(-50%, -50%) scale(" + scale + ")";
  }

  function roleAsset(role) {
    return "/futurerenaissance-bar-oriente/brand-assets/axis_future_renaissance_brand_assets/badges/roles/" + role.toLowerCase() + ".svg";
  }

  function buildLeaderboard() {
    var visible = document.getElementById("leaderboard-rows");
    var semantic = document.querySelector("#leaderboard-semantic tbody");
    if (!visible || !semantic || !window.SYNTHETIC_DEMO) return;
    visible.innerHTML = "";
    semantic.innerHTML = "";
    window.SYNTHETIC_DEMO.leaderboard.forEach(function (entry) {
      var dotsMarkup = Array.from({ length: entry.total }, function (_, index) {
        return '<i class="' + (index < entry.completed ? "is-complete" : "") + '"></i>';
      }).join("");
      var row = document.createElement("div");
      row.className = "leaderboard-row" + (entry.rank < 4 ? " is-podium" : "");
      row.dataset.rank = String(entry.rank);
      row.innerHTML =
        '<span class="rank-cell"><i>' + (entry.rank === 1 ? "✦" : String(entry.rank).padStart(2, "0")) + '</i></span>' +
        '<strong>' + entry.id + '</strong>' +
        '<span class="leader-role"><img src="' + roleAsset(entry.role) + '" alt=""><i>' + entry.role + '</i></span>' +
        '<span class="mission-dots" aria-label="' + entry.completed + ' of ' + entry.total + ' missions">' + dotsMarkup + '</span>' +
        '<span class="brand-state ' + (entry.brandAction ? "is-verified" : "") + '">' + (entry.brandAction ? "VERIFIED" : "PENDING") + '</span>' +
        '<span class="score-cell" data-score="' + entry.score + '">0</span>' +
        '<span class="reward-state ' + (entry.reward === "UNLOCKED" ? "is-unlocked" : "") + '">' + entry.reward + '</span>';
      visible.appendChild(row);

      var tr = document.createElement("tr");
      [entry.rank, entry.id, entry.role, entry.completed + "/" + entry.total, entry.brandAction ? "Verified" : "Pending", entry.score, entry.reward].forEach(function (value) {
        var td = document.createElement("td");
        td.textContent = String(value);
        tr.appendChild(td);
      });
      semantic.appendChild(tr);
    });
  }

  function stopScene() {
    if (activeTimeline) {
      activeTimeline.kill();
      activeTimeline = null;
    }
    activeLoops.forEach(function (loop) {
      var targets = loop.targets();
      loop.kill();
      gsap.set(targets, { clearProps: "transform" });
    });
    activeLoops = [];
  }

  function revealBase(slide) {
    var reveal = slide.querySelectorAll("[data-reveal]");
    var crystal = slide.querySelectorAll("[data-crystallize]");
    if (reducedMotion.matches) {
      gsap.set(reveal, { clearProps: "all", opacity: 1 });
      gsap.set(crystal, { clearProps: "all", opacity: 1 });
      return gsap.timeline();
    }
    gsap.set(reveal, { opacity: 0, y: 28 });
    gsap.set(crystal, { opacity: 0, scale: .985, filter: "blur(12px)" });
    var tl = gsap.timeline();
    tl.to(crystal, { opacity: 1, scale: 1, filter: "blur(0px)", duration: 1.7, ease: "power3.out" }, 0)
      .to(reveal, { opacity: 1, y: 0, duration: .75, stagger: .07, ease: "power3.out" }, .2);
    return tl;
  }

  // Never yoyo back through rest: a one-directional drift always reads as
  // alive, where a wobble that returns to zero every few seconds reads as
  // "stopped" the moment the eye stops tracking it.
  function addOrbitLoops(slide) {
    if (reducedMotion.matches) return;
    slide.querySelectorAll("[data-orbit-loop], .orbital-svg").forEach(function (element, index) {
      activeLoops.push(gsap.to(element, {
        rotation: index % 2 ? "-=360" : "+=360",
        duration: 110 + index * 22,
        repeat: -1,
        ease: "none",
        transformOrigin: "50% 50%",
      }));
    });
  }

  function animateCover(slide) {
    var tl = revealBase(slide);
    if (!reducedMotion.matches) {
      var lines = slide.querySelectorAll(".orbit-line");
      gsap.set(lines, { strokeDashoffset: 130, opacity: 0 });
      tl.to(lines, { strokeDashoffset: 0, opacity: 1, duration: 2.4, stagger: .12, ease: "power2.out" }, .15)
        .fromTo(slide.querySelector(".cover-star"), { opacity: 0, scale: 0 }, { opacity: 1, scale: 1, duration: .65, ease: "power3.out" }, 1.25);
    }
    addOrbitLoops(slide);
    return tl;
  }

  function animateOrbitSystem(slide) {
    var tl = revealBase(slide);
    if (!reducedMotion.matches) {
      tl.fromTo(slide.querySelectorAll(".orbit-line"), { strokeDashoffset: 180, opacity: 0 }, { strokeDashoffset: 0, opacity: 1, duration: 1.8, stagger: .08 }, .15);
    }
    addOrbitLoops(slide);
    return tl;
  }

  /* --- ASCII decode plate: the artwork arrives encrypted and resolves downward --- */
  var ASCII_RAMP = " .:-=+*x#%@";
  var ASCII_CIPHER = "0123456789ABCDEF/\|<>*+=-:.";

  function asciiFont(cellHeight) {
    return Math.round(cellHeight * .82) + 'px "Bingo", sans-serif';
  }

  function asciiGrid(w, h, cellHint) {
    var cols = Math.max(28, Math.round(w / (cellHint || (w >= 900 ? 12 : 11))) || 28);
    var cellW = w / cols;
    var rows = Math.max(18, Math.round(h / (cellW * 1.42)) || 18);
    return { cols: cols, rows: rows, cellW: cellW, cellH: h / rows };
  }

  function renderAsciiPlate(w, h, grid, luminanceAt) {
    var plate = document.createElement("canvas");
    plate.width = w;
    plate.height = h;
    var pctx = plate.getContext("2d");
    pctx.fillStyle = "rgba(4,27,51,.94)";
    pctx.fillRect(0, 0, w, h);
    pctx.textAlign = "center";
    pctx.textBaseline = "middle";
    pctx.font = asciiFont(grid.cellH);
    for (var r = 0; r < grid.rows; r++) {
      for (var c = 0; c < grid.cols; c++) {
        var lum = luminanceAt(c, r);
        var glyph = ASCII_RAMP.charAt(Math.min(ASCII_RAMP.length - 1, Math.floor(lum * ASCII_RAMP.length)));
        if (glyph === " ") continue;
        pctx.fillStyle = lum > .62
          ? "rgba(212,170,103," + (.5 + lum * .5).toFixed(3) + ")"
          : "rgba(241,226,200," + (.26 + lum * .62).toFixed(3) + ")";
        pctx.fillText(glyph, (c + .5) * grid.cellW, (r + .5) * grid.cellH);
      }
    }
    return plate;
  }

  function cacheAscii(host, plate, grid, w, h, key) {
    var model = { plate: plate, cols: grid.cols, rows: grid.rows, cellW: grid.cellW, cellH: grid.cellH, w: w, h: h, key: key };
    host.__ascii = model;
    return model;
  }

  function buildAsciiModel(host, img, w, h, cellHint) {
    if (!w || !h || !img || !img.naturalWidth) return null;
    var key = img.currentSrc;
    var cached = host.__ascii;
    if (cached && cached.w === w && cached.h === h && cached.key === key) return cached;

    var grid = asciiGrid(w, h, cellHint);
    var sampler = document.createElement("canvas");
    sampler.width = grid.cols;
    sampler.height = grid.rows;
    var sctx = sampler.getContext("2d");
    sctx.fillStyle = "#041B33";
    sctx.fillRect(0, 0, grid.cols, grid.rows);
    var fit = Math.max(grid.cols / img.naturalWidth, grid.rows / img.naturalHeight);
    var fw = img.naturalWidth * fit, fh = img.naturalHeight * fit;
    sctx.drawImage(img, (grid.cols - fw) / 2, (grid.rows - fh) / 2, fw, fh);
    var px;
    try { px = sctx.getImageData(0, 0, grid.cols, grid.rows).data; } catch (error) { return null; }

    return cacheAscii(host, renderAsciiPlate(w, h, grid, function (c, r) {
      var i = (r * grid.cols + c) * 4;
      return (px[i] * .299 + px[i + 1] * .587 + px[i + 2] * .114) / 255;
    }), grid, w, h, key);
  }

  /* Synthetic field for when the artwork has not decoded yet. The curtain must
     always play its full sweep, never blink out because an image was slow. */
  function buildAsciiField(host, w, h, cellHint) {
    var cached = host.__ascii;
    if (cached && cached.w === w && cached.h === h && cached.key === "field") return cached;
    var grid = asciiGrid(w, h, cellHint);
    return cacheAscii(host, renderAsciiPlate(w, h, grid, function (c, r) {
      var nx = c / grid.cols - .5, ny = r / grid.rows - .5;
      var glow = Math.max(0, 1 - Math.sqrt(nx * nx + ny * ny) * 1.7);
      var weave = (Math.sin(c * .7 + r * .21) + Math.cos(r * .53 - c * .12)) * .18;
      return Math.max(0, Math.min(1, glow * .8 + weave + Math.random() * .22));
    }), grid, w, h, "field");
  }

  function paintDecode(ctx, model, progress) {
    if (!model || !isFinite(model.cellH) || !model.w || !model.h) return;
    var bandHeight = model.cellH * 3.2;
    var frontier = progress * (model.h + bandHeight) - bandHeight + bandHeight;
    ctx.clearRect(0, 0, model.w, model.h);
    if (frontier < model.h) {
      ctx.drawImage(model.plate, 0, frontier, model.w, model.h - frontier, 0, frontier, model.w, model.h - frontier);
    }
    if (frontier <= 0 || frontier > model.h + bandHeight) return;

    ctx.save();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = asciiFont(model.cellH);
    var first = Math.max(0, Math.floor((frontier - bandHeight) / model.cellH));
    var last = Math.min(model.rows - 1, Math.ceil(frontier / model.cellH));
    for (var r = first; r <= last; r++) {
      for (var c = 0; c < model.cols; c++) {
        if (Math.random() > .78) continue;
        ctx.fillStyle = "rgba(212,170,103," + (.3 + Math.random() * .55).toFixed(3) + ")";
        ctx.fillText(ASCII_CIPHER.charAt((Math.random() * ASCII_CIPHER.length) | 0), (c + .5) * model.cellW, (r + .5) * model.cellH);
      }
    }
    ctx.restore();

    var glow = ctx.createLinearGradient(0, frontier - model.cellH * 4, 0, frontier);
    glow.addColorStop(0, "rgba(212,170,103,0)");
    glow.addColorStop(1, "rgba(212,170,103,.42)");
    ctx.fillStyle = glow;
    ctx.fillRect(0, frontier - model.cellH * 4, model.w, model.cellH * 4);
    ctx.fillStyle = "rgba(241,226,200,.82)";
    ctx.fillRect(0, frontier - 1, model.w, 1.6);
  }

  function animateIdeaFrost(slide) {
    var tl = animateOrbitSystem(slide);
    var visual = slide.querySelector(".idea-visual");
    var plateEl = slide.querySelector(".idea-plate");
    var img = slide.querySelector(".idea-plate > img");
    var canvas = slide.querySelector(".idea-decode");
    var frost = slide.querySelector(".idea-frost");
    var quote = slide.querySelector(".idea-engraved");
    var line = quote && quote.querySelector("p");
    if (reducedMotion.matches) {
      gsap.set([visual, img, quote, line], { clearProps: "all" });
      gsap.set([frost, canvas], { opacity: 0 });
      return tl;
    }

    gsap.set(visual, { autoAlpha: 0 });
    gsap.set(img, { filter: "blur(15px) saturate(.3) brightness(1.14) contrast(.88)", scale: 1.05 });
    gsap.set(frost, { opacity: 1, clipPath: "inset(0% 0% 0% 0%)" });
    gsap.set(quote, { autoAlpha: 0 });
    gsap.set(line, { letterSpacing: ".3em", filter: "blur(8px)" });
    tl.to(visual, { autoAlpha: 1, duration: .55, ease: "power2.out" }, 0)
      .to(img, { filter: "blur(0px) saturate(1) brightness(1) contrast(1)", scale: 1, duration: 2.2, ease: "power2.inOut" }, .15)
      .to(frost, { clipPath: "inset(0% 0% 100% 0%)", duration: 2, ease: "power2.inOut" }, .2)
      .to(frost, { opacity: 0, duration: .4, ease: "power1.out" }, 1.9)
      .to(quote, { autoAlpha: 1, duration: .5, ease: "power2.out" }, 1.35)
      .to(line, { letterSpacing: ".004em", filter: "blur(0px)", duration: 1.25, ease: "power3.out" }, 1.35);

    var model = buildAsciiModel(plateEl, img, plateEl.clientWidth, plateEl.clientHeight);
    if (model && canvas) {
      canvas.width = model.w;
      canvas.height = model.h;
      gsap.set(canvas, { opacity: 1 });
      var ctx = canvas.getContext("2d");
      var scan = { progress: 0 };
      paintDecode(ctx, model, 0);
      tl.to(scan, {
        progress: 1,
        duration: 2.15,
        ease: "power2.inOut",
        onUpdate: function () { paintDecode(ctx, model, scan.progress); },
        onComplete: function () { ctx.clearRect(0, 0, model.w, model.h); },
      }, .15);
    } else if (canvas) {
      gsap.set(canvas, { opacity: 0 });
      if (img && !img.complete) img.addEventListener("load", function () { buildAsciiModel(plateEl, img, plateEl.clientWidth, plateEl.clientHeight); }, { once: true });
    }
    return tl;
  }

  function animateEventMap(slide) {
    var tl = animateOrbitSystem(slide);
    if (!reducedMotion.matches) tl.fromTo(slide.querySelectorAll(".event-node"), { opacity: 0, scale: .7 }, { opacity: 1, scale: 1, duration: .5, stagger: .07, ease: "power2.out" }, .5);
    return tl;
  }

  function animateBadges(slide) {
    var tl = revealBase(slide);
    var badges = slide.querySelectorAll(".role-badge");
    if (!reducedMotion.matches) {
      gsap.set(badges, { opacity: 0, scale: .62, filter: "blur(9px)" });
      tl.to(badges, { opacity: 1, scale: 1, filter: "blur(0px)", duration: .7, stagger: .08, ease: "power3.out" }, .28);
    }
    addOrbitLoops(slide);
    return tl;
  }

  function animateProgram(slide) {
    var tl = revealBase(slide);
    if (!reducedMotion.matches) {
      tl.fromTo(slide.querySelectorAll(".program-node"), { opacity: 0, x: 20, scale: .9 }, { opacity: 1, x: 0, scale: 1, duration: .55, stagger: .08, ease: "power3.out" }, .35);
    }
    addOrbitLoops(slide);
    return tl;
  }

  function animateMissionPath(slide) {
    var tl = revealBase(slide);
    var badges = Array.prototype.slice.call(slide.querySelectorAll(".mission-badge"));
    badges.forEach(function (badge) { badge.classList.remove("is-complete"); });
    if (reducedMotion.matches) {
      badges.forEach(function (badge) { badge.classList.add("is-complete"); });
      return tl;
    }
    gsap.set(badges, { opacity: 0, y: 22, scale: .82 });
    tl.to(badges, { opacity: 1, y: 0, scale: 1, duration: .42, stagger: .09, ease: "power2.out" }, .3);
    badges.forEach(function (badge, index) {
      tl.call(function () { badge.classList.add("is-complete"); }, null, .55 + index * .11);
    });
    tl.fromTo(badges[badges.length - 1], { x: -2 }, { x: 0, duration: .12, keyframes: [{ x: 2 }, { x: -2 }, { x: 0 }] }, 1.43);
    addOrbitLoops(slide);
    return tl;
  }

  function animateProductFunction(slide) {
    var tl = animateOrbitSystem(slide);
    if (!reducedMotion.matches) tl.fromTo(slide.querySelectorAll(".function-planet"), { opacity: 0, scale: .65 }, { opacity: 1, scale: 1, duration: .45, stagger: .075, ease: "power3.out" }, .5);
    return tl;
  }

  function animateLeaderboard(slide) {
    var tl = revealBase(slide);
    var rows = slide.querySelectorAll(".leaderboard-row");
    var star = slide.querySelector(".leader-star");
    if (reducedMotion.matches) {
      rows.forEach(function (row) { row.querySelector("[data-score]").textContent = row.querySelector("[data-score]").dataset.score; });
      gsap.set(star, { opacity: 1 });
      return tl;
    }
    gsap.set(rows, { opacity: 0, y: 18 });
    gsap.set(star, { opacity: 0, scale: 0 });
    tl.to(rows, { opacity: 1, y: 0, duration: .42, stagger: .075, ease: "power2.out" }, .45);
    rows.forEach(function (row, index) {
      var score = row.querySelector("[data-score]");
      var end = Number(score.dataset.score);
      var state = { value: 0 };
      tl.to(state, { value: end, duration: .8, ease: "power2.out", onUpdate: function () { score.textContent = String(Math.round(state.value)); } }, .55 + index * .075);
    });
    tl.fromTo(slide.querySelectorAll(".is-podium .rank-cell"), { opacity: 0, scale: 1.5 }, { opacity: 1, scale: 1, duration: .45, stagger: .1 }, 1.15)
      .fromTo(star, { opacity: 0, scale: 0 }, { opacity: 1, scale: 1, duration: .5, ease: "power3.out" }, 1.45);
    return tl;
  }

  function animateMeasurement(slide) {
    var tl = revealBase(slide);
    var counter = slide.querySelector("[data-count]");
    if (reducedMotion.matches) return tl;
    tl.fromTo(slide.querySelectorAll(".proof-ring"), { strokeDashoffset: 280, opacity: 0 }, { strokeDashoffset: 0, opacity: 1, duration: 1.6, stagger: .16 }, .25)
      .fromTo(slide.querySelectorAll(".proof-node"), { opacity: 0, scale: .75 }, { opacity: 1, scale: 1, duration: .5, stagger: .1 }, .5);
    if (counter) {
      var target = Number(counter.dataset.count);
      var state = { value: 0 };
      tl.to(state, { value: target, duration: 1.2, ease: "power2.out", onUpdate: function () { counter.textContent = String(Math.round(state.value)); } }, .45);
    }
    return tl;
  }

  function animatePartnerSystem(slide) {
    var tl = animateOrbitSystem(slide);
    if (!reducedMotion.matches) tl.fromTo(slide.querySelectorAll(".activation-node"), { opacity: 0, scale: .72 }, { opacity: 1, scale: 1, duration: .5, stagger: .09 }, .5);
    return tl;
  }

  function animatePresentingProduct(slide) {
    var tl = animateOrbitSystem(slide);
    if (!reducedMotion.matches) tl.fromTo(slide.querySelector(".product-vessel"), { opacity: 0, scale: .72, filter: "blur(18px)", rotation: -2 }, { opacity: 1, scale: 1, filter: "blur(0px)", rotation: 0, duration: 1.6, ease: "power3.out" }, .2);
    return tl;
  }

  function animateSignatureProduct(slide) {
    var tl = animateOrbitSystem(slide);
    if (!reducedMotion.matches) {
      tl.fromTo(slide.querySelector(".signature-vessel"), { opacity: 0, scale: .75, filter: "blur(16px)" }, { opacity: 1, scale: 1, filter: "blur(0px)", duration: 1.5, ease: "power3.out" }, .2)
        .fromTo(slide.querySelectorAll(".signature-expression"), { opacity: 0, scale: .7 }, { opacity: 1, scale: 1, duration: .5, stagger: .09 }, .55);
    }
    return tl;
  }

  function animateContinuation(slide) {
    var tl = animateOrbitSystem(slide);
    if (!reducedMotion.matches) tl.fromTo(slide.querySelectorAll(".time-state"), { opacity: 0, scale: .72 }, { opacity: 1, scale: 1, duration: .55, stagger: .14 }, .42);
    return tl;
  }

  function animateClosing(slide) {
    var tl = revealBase(slide);
    if (!reducedMotion.matches) tl.fromTo(slide.querySelector(".close-star"), { opacity: 0, scale: 0 }, { opacity: 1, scale: 1, duration: .6 }, 1);
    return tl;
  }

  function animateStructured(slide) {
    var tl = revealBase(slide);
    if (reducedMotion.matches) return tl;
    var targets = slide.querySelectorAll(".format-group, .format-item, .system-cycle-node, .phase-card, .component-row, .component-call, .reward-step, .deliverable-item, .budget-cell, .budget-explain, .offer-item");
    tl.fromTo(targets, { autoAlpha: 0, y: 18, scale: .975 }, { autoAlpha: 1, y: 0, scale: 1, duration: .38, stagger: .025, ease: "power2.out" }, .2);
    addOrbitLoops(slide);
    return tl;
  }

  var scenes = {
    cover: animateCover,
    "orbit-system": animateOrbitSystem,
    "idea-frost": animateIdeaFrost,
    "event-map": animateEventMap,
    badges: animateBadges,
    program: animateProgram,
    "mission-path": animateMissionPath,
    "product-function": animateProductFunction,
    leaderboard: animateLeaderboard,
    measurement: animateMeasurement,
    "partner-system": animatePartnerSystem,
    "presenting-product": animatePresentingProduct,
    "signature-product": animateSignatureProduct,
    continuation: animateContinuation,
    closing: animateClosing,
    structured: animateStructured,
  };

  function enterSlide(slide) {
    stopScene();
    var scene = scenes[slide.dataset.scene] || revealBase;
    activeTimeline = scene(slide);
  }

  function updateChrome() {
    var total = slides.length;
    counterCurrent.textContent = String(currentIndex + 1).padStart(2, "0");
    counterTotal.textContent = String(total).padStart(2, "0");
    progress.style.width = ((currentIndex + 1) / total * 100) + "%";
    prevButton.disabled = currentIndex === 0;
    nextButton.disabled = currentIndex === total - 1;
    dots.querySelectorAll("button").forEach(function (button, index) { button.classList.toggle("is-active", index === currentIndex); });
  }

  function go(nextIndex) {
    if (transitioning || nextIndex < 0 || nextIndex >= slides.length || nextIndex === currentIndex) return;
    transitioning = true;
    stopScene();
    var from = slides[currentIndex];
    var to = slides[nextIndex];
    currentIndex = nextIndex;
    updateChrome();
    from.classList.remove("is-active");
    to.classList.add("is-active");
    gsap.set([from, to], { clearProps: "opacity,transform" });
    transitioning = false;
    enterSlide(to);
  }

  function previous() { go(currentIndex - 1); }
  function next() { go(currentIndex + 1); }

  function buildDots() {
    dots.innerHTML = "";
    slides.forEach(function (slide, index) {
      var button = document.createElement("button");
      button.type = "button";
      button.setAttribute("aria-label", "Go to slide " + (index + 1) + ": " + slide.dataset.label);
      button.addEventListener("click", function () { go(index); });
      dots.appendChild(button);
    });
  }

  buildLeaderboard();
  buildDots();
  document.querySelectorAll("[data-artist-id]").forEach(function (button) {
    button.addEventListener("click", function () { openArtistModal(button.dataset.artistId, button); });
  });
  refreshArtistLanguage();
  window.addEventListener("axis:languagechange", refreshArtistLanguage);
  window.addEventListener("axis:languagechange", refreshConceptLanguage);
  document.querySelectorAll("[data-concept-id]").forEach(function (button) {
    button.addEventListener("click", function () { openConceptModal(button.dataset.conceptId, button); });
  });
  if (artistModal) {
    artistModal.querySelectorAll("[data-artist-modal-close]").forEach(function (button) {
      button.addEventListener("click", closeArtistModal);
    });
    artistModal.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        closeArtistModal();
      } else if (event.key === "Tab") {
        event.stopPropagation();
        trapModalFocus(artistModal, event);
      }
    });
  }
  if (conceptModal) {
    conceptModal.querySelectorAll("[data-concept-modal-close]").forEach(function (button) {
      button.addEventListener("click", closeConceptModal);
    });
    conceptModal.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        closeConceptModal();
      } else if (event.key === "Tab") {
        event.stopPropagation();
        trapModalFocus(conceptModal, event);
      }
    });
  }
  allSlides.forEach(function (slide) { slide.classList.remove("is-active"); });
  if (slides[0]) slides[0].classList.add("is-active");
  /* --- Opening curtain: the deck arrives encrypted and decodes once the
     visitor has chosen a language in the host page. --- */
  var curtain = null, curtainCtx = null, curtainModel = null, curtainSpent = false;

  function curtainSource() {
    return document.querySelector(".fr-cover .cover-poster img");
  }

  function buildCurtain() {
    if (curtainSpent) return;
    if (!window.innerWidth || !window.innerHeight) return;
    if (!curtain) {
      curtain = document.createElement("canvas");
      curtain.id = "fr-curtain";
      curtain.setAttribute("aria-hidden", "true");
      document.body.appendChild(curtain);
      curtainCtx = curtain.getContext("2d");
    }
    var w = window.innerWidth, h = window.innerHeight;
    curtain.width = w;
    curtain.height = h;
    var source = curtainSource();
    var hint = w >= 900 ? 13 : 10;
    curtainModel = (source && buildAsciiModel(curtain, source, w, h, hint)) || buildAsciiField(curtain, w, h, hint);
    paintDecode(curtainCtx, curtainModel, 0);
  }

  function dropCurtain() {
    if (curtain) curtain.remove();
    curtain = null;
    curtainCtx = null;
    curtainModel = null;
  }

  function revealCurtain() {
    if (curtainSpent) return;
    curtainSpent = true;
    if (!curtain || !curtainModel || reducedMotion.matches) {
      dropCurtain();
      enterSlide(slides[currentIndex]);
      return;
    }
    var scan = { progress: 0 };
    var ctx = curtainCtx, model = curtainModel;
    gsap.to(scan, {
      progress: 1,
      duration: 2.6,
      ease: "power2.inOut",
      onUpdate: function () { paintDecode(ctx, model, scan.progress); },
      onComplete: dropCurtain,
    });
    // The deck itself thaws as the frontier passes, the way the idea plate does.
    gsap.set(stage, { filter: "blur(16px) saturate(.3) brightness(1.12) contrast(.88)" });
    gsap.to(stage, {
      filter: "blur(0px) saturate(1) brightness(1) contrast(1)",
      duration: 2.4,
      ease: "power2.inOut",
      onComplete: function () { stage.style.filter = ""; },
    });
    gsap.delayedCall(.15, function () { enterSlide(slides[currentIndex]); });
  }

  updateChrome();
  fit();

  var embedded = !!(window.parent && window.parent !== window);
  if (embedded) {
    var source = curtainSource();
    if (source && !(source.complete && source.naturalWidth)) {
      source.addEventListener("load", buildCurtain, { once: true });
      source.addEventListener("error", buildCurtain, { once: true });
    }
    buildCurtain();
    /* Only strand-proofing: a host that never speaks up gets the reveal anyway.
       A host that claims the gate cancels it, so the sweep waits for the visitor
       however long they take to choose. */
    var failsafe = window.setTimeout(revealCurtain, 9000);
    window.addEventListener("message", function (event) {
      if (event.origin !== window.location.origin) return;
      var type = (event.data || {}).type;
      if (type === "axis:gate") window.clearTimeout(failsafe);
      else if (type === "axis:reveal") revealCurtain();
    });
  } else {
    curtainSpent = true;
    enterSlide(slides[0]);
  }

  window.addEventListener("resize", function () { fit(); if (!curtainSpent) buildCurtain(); });
  reducedMotion.addEventListener("change", function () { enterSlide(slides[currentIndex]); });
  prevButton.addEventListener("click", previous);
  nextButton.addEventListener("click", next);
  document.addEventListener("keydown", function (event) {
    if (modalIsOpen()) {
      if (event.key === "Escape") {
        event.preventDefault();
        if (conceptModal && conceptModal.classList.contains("is-open")) closeConceptModal();
        else closeArtistModal();
      } else if (event.key === "Tab") {
        if (conceptModal && conceptModal.classList.contains("is-open")) trapModalFocus(conceptModal, event);
        else trapModalFocus(artistModal, event);
      } else if (["ArrowRight", "ArrowLeft", "PageDown", "PageUp", " ", "Home", "End"].indexOf(event.key) !== -1) {
        event.preventDefault();
      }
      return;
    }
    if (["ArrowRight", "PageDown", " "].indexOf(event.key) !== -1) { event.preventDefault(); next(); }
    if (["ArrowLeft", "PageUp"].indexOf(event.key) !== -1) { event.preventDefault(); previous(); }
    if (event.key === "Home") go(0);
    if (event.key === "End") go(slides.length - 1);
  });
  viewport.addEventListener("wheel", function (event) {
    if (modalIsOpen()) return;
    if (wheelLocked || Math.abs(event.deltaY) < 18) return;
    wheelLocked = true;
    event.deltaY > 0 ? next() : previous();
    window.setTimeout(function () { wheelLocked = false; }, 650);
  }, { passive: true });
  viewport.addEventListener("touchstart", function (event) {
    touchStartX = event.touches[0].clientX;
    touchStartY = event.touches[0].clientY;
  }, { passive: true });
  viewport.addEventListener("touchend", function (event) {
    if (modalIsOpen()) return;
    var dx = event.changedTouches[0].clientX - touchStartX;
    var dy = event.changedTouches[0].clientY - touchStartY;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 44) return;
    if (Math.abs(dx) > Math.abs(dy)) dx < 0 ? next() : previous();
    else dy < 0 ? next() : previous();
  }, { passive: true });

  window.__futureRenaissanceDeck = {
    getCurrentIndex: function () { return currentIndex; },
    getSlideCount: function () { return slides.length; },
    go: go,
    next: next,
    previous: previous,
    replay: function () { enterSlide(slides[currentIndex]); },
  };
})();
