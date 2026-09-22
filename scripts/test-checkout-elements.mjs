import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const checkoutSource = fs.readFileSync(new URL("../checkout.js", import.meta.url), "utf8");

function runCheckout(search) {
  const elements = new Map();
  const title = { textContent: "" };
  const summary = { textContent: "" };
  const terms = { textContent: "" };
  const loading = { hidden: false };
  const embed = { hidden: true };
  const fallbackLink = { href: "" };
  const fallback = {
    hidden: true,
    querySelector(selector) {
      return selector === "[data-checkout-redirect]" ? fallbackLink : null;
    },
  };
  const frame = {
    attributes: {},
    setAttribute(name, value) {
      this.attributes[name] = value;
    },
  };

  elements.set("[data-checkout-title]", title);
  elements.set("[data-checkout-summary]", summary);
  elements.set("[data-checkout-terms]", terms);
  elements.set("[data-checkout-loading]", loading);
  elements.set("[data-checkout-fallback]", fallback);
  elements.set(".checkout-frame", frame);

  let checkoutOptions;
  let mountedTarget;
  const scriptListeners = {};
  const session = new Map();

  const window = {
    location: { search },
    ASAS_CONFIG: {
      checkout: {
        appOrigin: "https://app.asas-mind.com",
        activateReturnUrl: "https://app.asas-mind.com/activate",
        plans: {
          monthly: { offer: "30d", planId: "plan_monthly" },
          "3months": { offer: "90d", planId: "plan_3months" },
        },
      },
    },
    setTimeout() {
      return 1;
    },
    clearTimeout() {},
    WhopElements(options) {
      assert.equal(options.locale, "de");
      return {
        checkout: {
          create(options) {
            checkoutOptions = options;
            return {
              create(name, callbacks) {
                assert.equal(name, "checkout");
                return {
                  mount(target) {
                    mountedTarget = target;
                    callbacks.onReady();
                  },
                };
              },
            };
          },
        },
      };
    },
  };

  const document = {
    querySelector(selector) {
      if (selector === "script[data-whop-elements]") return null;
      return elements.get(selector) || null;
    },
    getElementById(id) {
      return id === "whop-elements-checkout" ? embed : null;
    },
    createElement(tag) {
      assert.equal(tag, "script");
      return {
        dataset: {},
        addEventListener(name, callback) {
          scriptListeners[name] = callback;
        },
      };
    },
    head: {
      appendChild(script) {
        assert.equal(script.src, "https://cdn.whop.com/elements/amber/elements.js");
        assert.equal(script.dataset.whopElements, "");
        scriptListeners.load();
      },
    },
  };

  const context = {
    window,
    document,
    URL,
    URLSearchParams,
    sessionStorage: {
      getItem(key) {
        return session.get(key) || null;
      },
      setItem(key, value) {
        session.set(key, value);
      },
    },
    console,
  };

  vm.runInNewContext(checkoutSource, context);

  return {
    checkoutOptions,
    mountedTarget,
    title,
    summary,
    loading,
    embed,
    fallback,
    frame,
  };
}

const monthly = runCheckout("?plan=monthly&a=partner-42");
assert.equal(monthly.checkoutOptions.plan, "plan_monthly");
assert.equal(monthly.checkoutOptions.affiliateCode, "partner-42");
assert.equal(monthly.checkoutOptions.returnUrl, "https://app.asas-mind.com/activate");
assert.equal(monthly.mountedTarget, monthly.embed);
assert.equal(monthly.embed.hidden, false);
assert.equal(monthly.loading.hidden, true);
assert.equal(monthly.fallback.hidden, true);
assert.equal(monthly.frame.attributes["aria-busy"], "false");

const threeMonths = runCheckout("?plan=3months");
assert.equal(threeMonths.checkoutOptions.plan, "plan_3months");
assert.equal(threeMonths.checkoutOptions.affiliateCode, undefined);
assert.match(threeMonths.title.textContent, /Drei/);
assert.match(threeMonths.summary.textContent, /99/);

assert.doesNotMatch(checkoutSource, /checkout\/loader\.js|window\.wco|whopCheckoutOnComplete/);

console.log("Whop Elements checkout tests passed.");
