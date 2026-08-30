(function initSite() {
  const toggle = document.querySelector('.menu-toggle');
  const mobileNav = document.querySelector('.mobile-nav');

  if (toggle && mobileNav) {
    function closeMenu() {
      mobileNav.hidden = true;
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Menü öffnen');
    }

    toggle.addEventListener('click', function onToggle() {
      const open = toggle.getAttribute('aria-expanded') === 'true';
      mobileNav.hidden = open;
      toggle.setAttribute('aria-expanded', String(!open));
      toggle.setAttribute('aria-label', open ? 'Menü öffnen' : 'Menü schließen');
    });

    mobileNav.querySelectorAll('a').forEach(function bindMobileLink(link) {
      link.addEventListener('click', closeMenu);
    });

    window.addEventListener('resize', function onResize() {
      if (window.innerWidth > 800) closeMenu();
    });
  }

  const year = document.querySelector('[data-year]');
  if (year) year.textContent = String(new Date().getFullYear());

  initHeroSlides();
})();

function initHeroSlides() {
  const root = document.querySelector('[data-hero-slides-root]');
  if (!root) return;

  const slides = Array.from(root.querySelectorAll('.hero-slide'));
  const dotsWrap = root.querySelector('[data-hero-dots]');
  const dots = dotsWrap ? Array.from(dotsWrap.querySelectorAll('[data-slide-to]')) : [];
  const floatTop = document.querySelector('[data-hero-float="top"]');
  const floatBottom = document.querySelector('[data-hero-float="bottom"]');

  if (!slides.length) return;

  let index = 0;
  let timer = 0;

  function setFloatContent(node, label, value) {
    if (!node) return;
    const labelEl = node.querySelector('span');
    const valueEl = node.querySelector('strong');
    if (!labelEl || !valueEl) return;
    labelEl.textContent = label;
    valueEl.textContent = value;
  }

  function goTo(nextIndex) {
    index = (nextIndex + slides.length) % slides.length;

    slides.forEach(function updateSlide(slide, slideIndex) {
      const active = slideIndex === index;
      slide.classList.toggle('is-active', active);
      slide.classList.remove('is-prev', 'is-next');
      slide.setAttribute('aria-hidden', String(!active));
    });

    dots.forEach(function updateDot(dot) {
      const dotIndex = Number(dot.getAttribute('data-slide-to'));
      const active = dotIndex === index;
      dot.classList.toggle('is-active', active);
      dot.setAttribute('aria-selected', String(active));
    });

    const slide = slides[index];
    setFloatContent(floatTop, slide.dataset.floatTopLabel || '', slide.dataset.floatTopValue || '');
    setFloatContent(floatBottom, slide.dataset.floatBottomLabel || '', slide.dataset.floatBottomValue || '');
  }

  function schedule() {
    window.clearInterval(timer);
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!reduced) {
      timer = window.setInterval(function advance() {
        goTo(index + 1);
      }, 4500);
    }
  }

  if (dotsWrap) {
    dotsWrap.addEventListener('click', function onDotsClick(event) {
      const button = event.target.closest('[data-slide-to]');
      if (!button || !dotsWrap.contains(button)) return;
      event.preventDefault();
      goTo(Number(button.getAttribute('data-slide-to')));
      schedule();
    });
  }

  goTo(0);
  schedule();
}
