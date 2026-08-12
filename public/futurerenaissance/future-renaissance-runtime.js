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
    return "/futurerenaissance/brand-assets/axis_future_renaissance_brand_assets/badges/roles/" + role.toLowerCase() + ".svg";
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

  function addOrbitLoops(slide) {
    if (reducedMotion.matches) return;
    slide.querySelectorAll("[data-orbit-loop], .orbital-svg").forEach(function (element, index) {
      activeLoops.push(gsap.to(element, {
        rotation: index % 2 ? -2.5 : 2.5,
        x: index % 2 ? -5 : 5,
        duration: 7 + index * .8,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
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
    if (!reducedMotion.matches) tl.fromTo(slide.querySelectorAll(".function-word"), { opacity: 0, scale: .65 }, { opacity: 1, scale: 1, duration: .45, stagger: .055, ease: "power3.out" }, .5);
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

  var scenes = {
    cover: animateCover,
    "orbit-system": animateOrbitSystem,
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
  allSlides.forEach(function (slide) { slide.classList.remove("is-active"); });
  if (slides[0]) slides[0].classList.add("is-active");
  updateChrome();
  fit();
  enterSlide(slides[0]);

  window.addEventListener("resize", fit);
  reducedMotion.addEventListener("change", function () { enterSlide(slides[currentIndex]); });
  prevButton.addEventListener("click", previous);
  nextButton.addEventListener("click", next);
  document.addEventListener("keydown", function (event) {
    if (["ArrowRight", "PageDown", " "].indexOf(event.key) !== -1) { event.preventDefault(); next(); }
    if (["ArrowLeft", "PageUp"].indexOf(event.key) !== -1) { event.preventDefault(); previous(); }
    if (event.key === "Home") go(0);
    if (event.key === "End") go(slides.length - 1);
  });
  viewport.addEventListener("wheel", function (event) {
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
