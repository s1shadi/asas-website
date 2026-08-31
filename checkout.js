(function initCheckout() {
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
  var embedHost = document.getElementById("whop-embedded-checkout");
  var loading = document.querySelector("[data-checkout-loading]");
  var fallback = document.querySelector("[data-checkout-fallback]");
  var checkoutFrame = document.querySelector(".checkout-frame");

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

  function showFallback() {
    if (loading) loading.hidden = true;
    if (embedHost) embedHost.hidden = true;
    if (fallback) {
      fallback.hidden = false;
      var link = fallback.querySelector("[data-checkout-redirect]");
      if (link) link.href = buildAppCheckoutUrl();
    }
    if (checkoutFrame) checkoutFrame.setAttribute("aria-busy", "false");
  }

  function showEmbed() {
    if (loading) loading.hidden = true;
    if (embedHost) embedHost.hidden = false;
    if (fallback) fallback.hidden = true;
    if (checkoutFrame) checkoutFrame.setAttribute("aria-busy", "false");
  }

  function loadWhopCheckout() {
    if (document.querySelector('script[src*="checkout/loader.js"]')) return;

    var script = document.createElement("script");
    script.src = "https://js.whop.com/static/checkout/loader.js";
    script.async = true;
    script.defer = true;
    script.onerror = function onScriptError() {
      window.clearTimeout(fallbackTimeoutId);
      window.clearTimeout(observerDisconnectTimeoutId);
      if (observer) observer.disconnect();
      showFallback();
    };
    document.body.appendChild(script);
  }

  if (!plan || !plan.planId || !embedHost) {
    showFallback();
    return;
  }

  embedHost.dataset.whopCheckoutPlanId = plan.planId;
  embedHost.dataset.whopCheckoutTheme = "light";
  embedHost.dataset.whopCheckoutThemeAccentColor = "blue";
  embedHost.dataset.whopCheckoutReturnUrl =
    checkoutConfig.activateReturnUrl || "https://app.asas-mind.com/activate/session";
  embedHost.dataset.whopCheckoutStyleContainerPaddingX = "0";
  embedHost.dataset.whopCheckoutStyleContainerPaddingY = "0";

  if (affiliate) {
    embedHost.dataset.whopCheckoutAffiliateCode = affiliate;
  }

  window.asasWhopCheckoutComplete = function asasWhopCheckoutComplete(_planId, receiptId) {
    if (window.__asasWhopCheckoutDone) return;
    var id = receiptId && String(receiptId).trim();
    if (!id || !id.startsWith("pay_")) return;
    window.__asasWhopCheckoutDone = true;
    var base =
      checkoutConfig.activateReturnUrl || "https://app.asas-mind.com/activate/session";
    var url = new URL(base);
    url.searchParams.set("payment_id", id);
    window.location.assign(url.toString());
  };
  embedHost.dataset.whopCheckoutOnComplete = "asasWhopCheckoutComplete";

  var observer;
  var fallbackTimeoutId;
  var observerDisconnectTimeoutId;

  function onEmbedDetected() {
    window.clearTimeout(fallbackTimeoutId);
    window.clearTimeout(observerDisconnectTimeoutId);
    if (observer) observer.disconnect();
    showEmbed();
  }

  fallbackTimeoutId = window.setTimeout(function onFallbackTimeout() {
    showFallback();
  }, 8000);

  observerDisconnectTimeoutId = window.setTimeout(function onObserverTimeout() {
    if (observer) observer.disconnect();
  }, 30000);

  observer = new MutationObserver(function onMutation() {
    if (embedHost.childElementCount > 0 || embedHost.querySelector("iframe")) {
      onEmbedDetected();
    }
  });

  observer.observe(embedHost, { childList: true, subtree: true });

  loadWhopCheckout();
})();
