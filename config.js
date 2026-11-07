window.ASAS_CONFIG = {
  whatsappEnabled: true,
  whatsappNumber: "4915905463277",
  PUBLIC_SITE_CLOSED: false,
  checkout: {
    /** Marketing checkout redirects into the app buy flow (Stripe or Whop via provider flag). */
    appOrigin: "https://app.asas-mind.com",
    activateReturnUrl: "https://app.asas-mind.com/activate",
    /** Prefer server-side /buy/checkout; Whop Elements planIds kept as legacy fallback only. */
    preferAppCheckout: true,
    plans: {
      monthly: {
        offer: "30d",
        planId: "plan_gzm8iWJls9WaP",
        label: "19 € / Monat",
        title: "Ein Zyklus nach dem anderen",
      },
      "3months": {
        offer: "90d",
        planId: "plan_rUfHrCs5gfIbl",
        label: "49 € alle 3 Monate",
        title: "Drei aufeinanderfolgende Zyklen",
      },
      "12months": {
        offer: "365d",
        label: "179 € pro Jahr",
        title: "Ein Jahr aufeinanderfolgende Zyklen",
      },
    },
  },
};
