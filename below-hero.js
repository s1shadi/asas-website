var experienceSlides = [
  {
    published: true,
    eyebrow: "Eine Erfahrung aus der Beta",
    headlineLines: [
      "Vorher unregelmäßig.",
      "Heute zwei Stunden täglich."
    ],
    body:
      "Ubeydullah arbeitete bereits an seiner Selbstständigkeit – aber ohne festen Rhythmus. Im ASAS-Zyklus wurden daraus täglich genau zwei Stunden. Nicht mehr, nicht weniger.",
    quote:
      "Jetzt arbeite ich jeden Tag zwei Stunden an meiner Selbstständigkeit – nicht mehr und nicht weniger.",
    name: "Ubeydullah",
    role: "Beta-Tester"
  },
  {
    published: true,
    eyebrow: "Eine Erfahrung mit ASAS",
    headlineLines: [
      "Vorher direkt am Handy.",
      "Heute gehört der Morgen mir."
    ],
    body:
      "Jasmina wollte ihren Morgen nicht länger direkt am Handy beginnen. Mit ASAS entwickelte sie bereits nach wenigen Tagen eine Morgenroutine ohne Social Media und startet ihren Tag heute bewusster.",
    quote:
      "Der Morgen gehört jetzt mir – ich starte den Tag ohne Social Media.",
    name: "Jasmina",
    role: "ASAS-Nutzerin"
  },
  {
    published: true,
    eyebrow: "Eine Erfahrung mit ASAS",
    headlineLines: [
      "Vorher manchmal vergessen.",
      "Heute den ganzen Tag präsent."
    ],
    body:
      "Kaan trainiert viel Kampfsport, trotzdem geriet seine Ernährung im Alltag manchmal in Vergessenheit. Schon in der ersten Woche mit ASAS merkte er, wie der tägliche Check sein Ernährungsziel über den ganzen Tag präsent hält.",
    quote:
      "Seit ich weiß, dass ich abends ehrlich angeben muss, ob ich meine Ernährung eingehalten habe, habe ich mein Ziel schon tagsüber viel stärker im Kopf.",
    name: "Kaan",
    role: "ASAS-Nutzer"
  }
];

(function initBelowHero() {
  captureAffiliate();
  initProductReveals();
  initShareStudio();
  initExperienceCarousel();
})();

function captureAffiliate() {
  var affiliate = new URLSearchParams(window.location.search).get("a");
  if (affiliate) sessionStorage.setItem("asas-affiliate", affiliate);
}

function getAffiliate() {
  return new URLSearchParams(window.location.search).get("a") || sessionStorage.getItem("asas-affiliate") || "";
}

function checkoutHref(plan) {
  var url = new URL("/checkout/", window.location.origin);
  url.searchParams.set("plan", plan);
  var stored = getAffiliate();
  if (stored) url.searchParams.set("a", stored);
  return url.pathname + url.search;
}

function initProductReveals() {
  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var statements = Array.from(document.querySelectorAll(".product-statements li"));

  if (!statements.length) return;

  function revealAll() {
    statements.forEach(function reveal(item, index) {
      window.setTimeout(function markVisible() {
        item.classList.add("is-visible");
      }, index * 80);
    });
  }

  if (reducedMotion) {
    revealAll();
    return;
  }

  var root = document.querySelector(".product-experience");
  if (!root) return;

  var observer = new IntersectionObserver(
    function onIntersect(entries) {
      entries.forEach(function entry(entry) {
        if (entry.isIntersecting) {
          revealAll();
          observer.unobserve(entry.target);
        }
      });
    },
    { root: null, threshold: 0.15, rootMargin: "0px 0px -5% 0px" },
  );

  observer.observe(root);
}

function initShareStudio() {
  var root = document.querySelector("[data-share-studio]");
  if (!root) return;

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    root.classList.add("is-static");
  }
}

function formatSlideNumber(value) {
  return value < 10 ? "0" + value : String(value);
}

function initExperienceCarousel() {
  var root = document.querySelector("[data-experience-carousel]");
  if (!root) return;

  var published = experienceSlides.filter(function slide(item) {
    return item.published;
  });

  if (!published.length) {
    root.hidden = true;
    return;
  }

  var track = root.querySelector("[data-experience-track]");
  var viewport = root.querySelector("[data-experience-viewport]");
  var controls = root.querySelector("[data-experience-controls]");
  var prevBtn = root.querySelector("[data-experience-prev]");
  var nextBtn = root.querySelector("[data-experience-next]");
  var currentEl = root.querySelector("[data-experience-current]");
  var totalEl = root.querySelector("[data-experience-total]");
  var statusEl = root.querySelector("[data-experience-status]");
  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var activeIndex = 0;
  var total = published.length;

  if (!track || !viewport) return;

  published.forEach(function buildSlide(slide, index) {
    var article = document.createElement("article");
    article.className = "experience-slide";
    article.setAttribute("role", "group");
    article.setAttribute("aria-roledescription", "Erfahrung");
    article.setAttribute("aria-label", "Erfahrung " + (index + 1) + " von " + total);

    var story = document.createElement("div");
    story.className = "experience-slide__story";

    var eyebrow = document.createElement("p");
    eyebrow.className = "section-eyebrow";
    eyebrow.textContent = slide.eyebrow;

    var headline = document.createElement("h3");
    slide.headlineLines.forEach(function line(text, lineIndex) {
      if (lineIndex > 0) headline.appendChild(document.createElement("br"));
      headline.appendChild(document.createTextNode(text));
    });

    var body = document.createElement("p");
    body.className = "experience-slide__body";
    body.textContent = slide.body;

    story.appendChild(eyebrow);
    story.appendChild(headline);
    story.appendChild(body);

    var figure = document.createElement("figure");
    figure.className = "experience-slide__quote";

    var blockquote = document.createElement("blockquote");
    blockquote.textContent = "„" + slide.quote + "“";

    var figcaption = document.createElement("figcaption");
    var cite = document.createElement("cite");
    cite.textContent = slide.name;
    var role = document.createElement("span");
    role.textContent = slide.role;
    figcaption.appendChild(cite);
    figcaption.appendChild(role);

    figure.appendChild(blockquote);
    figure.appendChild(figcaption);

    article.appendChild(story);
    article.appendChild(figure);
    track.appendChild(article);
  });

  var slides = Array.from(track.querySelectorAll(".experience-slide"));

  if (totalEl) totalEl.textContent = formatSlideNumber(total);

  if (controls) {
    controls.hidden = total <= 1;
  }

  function setSlideState(index) {
    activeIndex = index;

    slides.forEach(function updateSlide(slide, slideIndex) {
      var isActive = slideIndex === index;
      slide.setAttribute("aria-hidden", isActive ? "false" : "true");
      if ("inert" in slide) {
        slide.inert = !isActive;
      }
    });

    if (currentEl) currentEl.textContent = formatSlideNumber(index + 1);

    if (statusEl) {
      statusEl.textContent = "Erfahrung " + (index + 1) + " von " + total;
    }

    if (prevBtn) prevBtn.disabled = index <= 0;
    if (nextBtn) nextBtn.disabled = index >= total - 1;
  }

  function scrollToIndex(index, behavior) {
    var clamped = Math.max(0, Math.min(index, total - 1));
    viewport.scrollTo({
      left: clamped * viewport.clientWidth,
      behavior: behavior || (reducedMotion ? "auto" : "smooth"),
    });
    setSlideState(clamped);
  }

  function syncFromScroll() {
    var width = viewport.clientWidth;
    if (!width) return;
    var nextIndex = Math.round(viewport.scrollLeft / width);
    nextIndex = Math.max(0, Math.min(nextIndex, total - 1));
    if (nextIndex !== activeIndex) {
      setSlideState(nextIndex);
    }
  }

  if (prevBtn) {
    prevBtn.addEventListener("click", function onPrev() {
      scrollToIndex(activeIndex - 1);
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", function onNext() {
      scrollToIndex(activeIndex + 1);
    });
  }

  viewport.addEventListener("scroll", syncFromScroll, { passive: true });

  root.addEventListener("keydown", function onKeydown(event) {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      scrollToIndex(activeIndex - 1);
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();
      scrollToIndex(activeIndex + 1);
    }
  });

  window.addEventListener("resize", function onResize() {
    scrollToIndex(activeIndex, "auto");
  });

  setSlideState(0);
}

document.addEventListener("DOMContentLoaded", function bindCheckoutLinks() {
  document.querySelectorAll("[data-checkout-plan]").forEach(function bindPlan(link) {
    var plan = link.getAttribute("data-checkout-plan");
    if (!plan) return;
    link.setAttribute("href", checkoutHref(plan));
  });
});
