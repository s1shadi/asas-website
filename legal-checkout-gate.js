(function () {
  var config = window.ASAS_CONFIG || {};
  if (!config.PUBLIC_SITE_CLOSED) return;

  var style = document.createElement('style');
  style.textContent = [
    '.is-checkout-disabled {',
    '  pointer-events: none !important;',
    '  cursor: default !important;',
    '  opacity: 0.72;',
    '}',
    '.is-checkout-disabled:hover {',
    '  transform: none !important;',
    '  filter: none !important;',
    '}',
  ].join('\n');
  document.head.appendChild(style);

  function disableCheckoutLink(el) {
    if (!el || el.dataset.checkoutDisabled === 'true') return;
    el.dataset.checkoutDisabled = 'true';
    el.setAttribute('aria-disabled', 'true');
    el.setAttribute('tabindex', '-1');
    el.removeAttribute('href');
    el.classList.add('is-checkout-disabled');
    el.addEventListener('click', function (event) {
      event.preventDefault();
      event.stopImmediatePropagation();
    });
  }

  document
    .querySelectorAll('.site-glass-header__cta, .site-glass-header__menu-cta, a[href*="yearlyCard"]')
    .forEach(disableCheckoutLink);
})();
