(() => {
  const reset = () => document.querySelectorAll('.dw-offer__cta[data-starting]').forEach(link => {
    link.textContent = link.dataset.originalLabel;
    link.removeAttribute('aria-busy');
    delete link.dataset.starting;
  });
  window.addEventListener('pageshow', reset);
  document.addEventListener('click', event => {
    const link = event.target.closest?.('a.dw-offer__cta');
    if (!link || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    if (link.dataset.starting) { event.preventDefault(); return; }
    link.dataset.originalLabel = link.textContent;
    link.dataset.starting = 'true';
    link.setAttribute('aria-busy', 'true');
    link.textContent = 'Zahlungsseite wird geöffnet …';
    // Retain normal browser navigation, including modifier-click behavior.
  }, true);
})();
