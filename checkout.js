(function initCheckout() {
  var WHOP_ELEMENTS_SRC = "https://cdn.whop.com/elements/amber/elements.js";

  var config = window.ASAS_CONFIG || {};
  var checkoutConfig = config.checkout || {};
  var plans = checkoutConfig.plans || {};
  var params = new URLSearchParams(window.location.search);
  var planKey = params.get("plan") === "3months" ? "3months" : "monthly";
  var plan = plans[planKey] || plans.monthly;
  var affiliate = params.get("a") || sessionStorage.getItem("asas-affiliate") || "";

  if (params.get("a")) {
    sessionStorage.setItem("asas-affiliate", params.get("a"));
  }

  var copy = {
    monthly: {
      title: "Ein Zyklus nach dem anderen",
      summary: "39 € / Monat",
      terms:
        "Direkter Start für 39 € pro Monat. Die vollständigen Vertragsbedingungen werden dir vor der Zahlung im Checkout angezeigt.",
    },
    "3months": {
      title: "Drei aufeinanderfolgende Zyklen",
      summary: "99 € für die ersten 90 Tage",
      terms:
        "Die ersten 90 Tage kosten insgesamt 99 €. Danach verlängert sich der Zugang für 39 € pro Monat. Die vollständigen Vertragsbedingungen werden dir vor der Zahlung im Checkout angezeigt.",
    },
  };

  var planCopy = copy[planKey] || copy.monthly;
  var title = document.querySelector("[data-checkout-title]");
  var summary = document.querySelector("[data-checkout-summary]");
  var terms = document.querySelector("[data-checkout-terms]");
  var embedHost = document.getElementById("whop-elements-checkout");
  var loading = document.querySelector("[data-checkout-loading]");
  var fallback = document.querySelector("[data-checkout-fallback]");
  var checkoutFrame = document.querySelector(".checkout-frame");
  var fallbackTimeoutId;

  if (title) title.textContent = planCopy.title;
  if (summary) summary.textContent = planCopy.summary;
  if (terms) terms.textContent = planCopy.terms;

  function buildAppCheckoutUrl() {
    var appOrigin = checkoutConfig.appOrigin || "https://app.asas-mind.com";
    var url = new URL("/buy/checkout", appOrigin);
    url.searchParams.set("offer", plan.offer || "30d");
    if (affiliate) url.searchParams.set("a", affiliate);
    return url.toString();
  }

  function finishLoading() {
    window.clearTimeout(fallbackTimeoutId);
    if (checkoutFrame) checkoutFrame.setAttribute("aria-busy", "false");
  }

  function showFallback() {
    finishLoading();
    if (loading) loading.hidden = true;
    if (embedHost) embedHost.hidden = true;
    if (fallback) {
      fallback.hidden = false;
      var link = fallback.querySelector("[data-checkout-redirect]");
      if (link) link.href = buildAppCheckoutUrl();
    }
  }

  function showEmbed() {
    finishLoading();
    if (loading) loading.hidden = true;
    if (embedHost) embedHost.hidden = false;
    if (fallback) fallback.hidden = true;
  }

  function mountCheckout() {
    if (!window.WhopElements || !plan || !plan.planId || !embedHost) {
      showFallback();
      return;
    }

    try {
      var whop = window.WhopElements({ locale: "de" });
      var options = {
        plan: plan.planId,
        returnUrl:
          checkoutConfig.activateReturnUrl || "https://app.asas-mind.com/activate",
      };

      if (affiliate) options.affiliateCode = affiliate;

      var checkout = whop.checkout.create(options);
      var checkoutElement = checkout.create("checkout", {
        onLoaderStart: function onLoaderStart() {
          if (loading) loading.hidden = false;
        },
        onReady: showEmbed,
        onError: function onCheckoutError(error) {
          console.error("Whop Elements checkout failed", error);
          showFallback();
        },
      });

      embedHost.hidden = false;
      checkoutElement.mount(embedHost);
    } catch (error) {
      console.error("Whop Elements checkout could not be initialized", error);
      showFallback();
    }
  }

  function loadWhopElements() {
    var existingScript = document.querySelector("script[data-whop-elements]");

    if (existingScript) {
      if (window.WhopElements) mountCheckout();
      else existingScript.addEventListener("load", mountCheckout, { once: true });
      existingScript.addEventListener("error", showFallback, { once: true });
      return;
    }

    var script = document.createElement("script");
    script.src = WHOP_ELEMENTS_SRC;
    script.async = true;
    script.dataset.whopElements = "";
    script.addEventListener("load", mountCheckout, { once: true });
    script.addEventListener("error", showFallback, { once: true });
    document.head.appendChild(script);
  }

  if (!plan || !plan.planId || !embedHost) {
    showFallback();
    return;
  }

  fallbackTimeoutId = window.setTimeout(showFallback, 12000);
  loadWhopElements();
})();
