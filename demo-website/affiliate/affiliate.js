(function initAffiliateForm() {
  var form = document.querySelector("[data-affiliate-form]");
  if (!form) return;

  var statusEl = form.querySelector("[data-affiliate-status]");
  var submitBtn = form.querySelector(".affiliate-submit");

  form.addEventListener("submit", function onSubmit(event) {
    event.preventDefault();

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    var data = new FormData(form);
    var name = String(data.get("name") || "").trim();
    var email = String(data.get("email") || "").trim();
    var platform = String(data.get("platform") || "").trim();
    var links = String(data.get("links") || "").trim();
    var idea = String(data.get("idea") || "").trim();

    var subject = "Affiliate-Anfrage für ASAS – " + name;
    var body = [
      "Neue Affiliate-Anfrage",
      "",
      "Name:",
      name,
      "",
      "E-Mail:",
      email,
      "",
      "Plattform:",
      platform,
      "",
      "Profile / Kanäle:",
      links,
      "",
      "Idee für ASAS:",
      idea,
    ].join("\n");

    if (submitBtn) submitBtn.disabled = true;

    window.location.href =
      "mailto:de.support.asas@gmail.com" +
      "?subject=" +
      encodeURIComponent(subject) +
      "&body=" +
      encodeURIComponent(body);

    window.setTimeout(function reenable() {
      if (submitBtn) submitBtn.disabled = false;
    }, 1200);

    if (statusEl) {
      statusEl.textContent =
        "Dein E-Mail-Programm wurde geöffnet. Sende die vorbereitete Nachricht dort ab, um deine Anfrage abzuschließen.";
    }
  });
})();
