// Language selection and local page navigation.
const supportedLanguages = Object.keys(translations);
const config = window.manifestStudio || {};
const dialog = document.querySelector('#booking-dialog');
let bookingTrigger;
function setLanguage(language) {
  const lang = supportedLanguages.includes(language) ? language : 'de';
  const copy = translations[lang];
  document.querySelector('.language-toggle').textContent =
    lang === 'uk' ? 'UA' : lang.toUpperCase();
  document.documentElement.lang = lang;
  document.querySelectorAll('[data-t]').forEach((node) => {
    node.textContent = copy[node.dataset.t];
  });
  document.querySelectorAll('[data-label]').forEach((node) => {
    node.setAttribute('aria-label', copy[node.dataset.label]);
  });
  document.querySelectorAll('[data-lang]').forEach((button) => {
    button.setAttribute('aria-pressed', String(button.dataset.lang === lang));
  });
  const prices = document.body.dataset.page === 'prices';
  document.title = copy[prices ? 'pricesPageTitle' : 'title'];
  document.querySelector('meta[name="description"]').content =
    copy[prices ? 'pricesMeta' : 'meta'];
  document.querySelectorAll('a[href]').forEach((link) => {
    const url = new URL(link.getAttribute('href'), location.href);
    if (url.origin === location.origin && /\/(index|prices)\.html$/.test(url.pathname)) {
      url.searchParams.set('lang', lang);
      link.href = url.pathname + url.search + url.hash;
    }
  });
  document.querySelectorAll('[data-work]').forEach((image) => {
    image.alt = workAlts[lang][Number(image.dataset.work)];
  });
  const portrait = document.querySelector('#owner-photo img');
  if (portrait) portrait.alt = copy.ownerAlt;
  document.querySelectorAll('[data-review]').forEach((image) => {
    const review = config.reviews[Number(image.dataset.review)];
    image.alt =
      review.alt?.[lang] || `${copy.reviewAlt} ${Number(image.dataset.review) + 1}`;
  });
  const map = document.querySelector('#google-map iframe');
  if (map) map.title = copy.mapTitle;
  const url = new URL(location.href);
  url.searchParams.set('lang', lang);
  history.replaceState(null, '', url);
}
// Public images and embedded profiles are configured in studio-config.js.
const owner = document.querySelector('#owner-photo');
if (owner && config.owner?.image) {
  const image = document.createElement('img');
  image.src = config.owner.image;
  image.loading = 'lazy';
  owner.append(image);
}
const reviews = document.querySelector('#review-grid');
if (reviews) {
  (config.reviews || []).forEach((review, index) => {
    const link = document.createElement('a');
    link.href = review.image;
    link.target = '_blank';
    link.rel = 'noopener';
    const image = document.createElement('img');
    image.src = review.image;
    image.dataset.review = index;
    image.loading = 'lazy';
    link.append(image);
    reviews.append(link);
  });
}
const address = document.querySelector('#studio-address');
if (address) address.textContent = config.address;
const mapContainer = document.querySelector('#google-map');
if (mapContainer && config.address) {
  const frame = document.createElement('iframe');
  frame.src = `https://maps.google.com/maps?q=${encodeURIComponent(config.address)}&output=embed`;
  frame.loading = 'lazy';
  frame.referrerPolicy = 'no-referrer-when-downgrade';
  mapContainer.append(frame);
}
const instagram = document.querySelector('#instagram-content');
if (instagram && config.instagram) {
  const frame = document.createElement('iframe');
  frame.src = `https://www.instagram.com/${encodeURIComponent(config.instagram)}/embed/`;
  frame.title = 'Instagram — Manifest Studio';
  frame.loading = 'lazy';
  instagram.append(frame);
}
document.querySelectorAll('[data-lang]').forEach((button) => {
  button.addEventListener('click', () => setLanguage(button.dataset.lang));
});
document.querySelector('#year').textContent = new Date().getFullYear();
setLanguage(new URLSearchParams(location.search).get('lang'));
// Accessible booking options: native dialog supports Escape and focus trapping.
document.querySelectorAll('[data-book]').forEach((button) => {
  button.addEventListener('click', () => {
    bookingTrigger = button;
    dialog.showModal();
  });
});
document.querySelector('[data-close]').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', (event) => {
  const bounds = dialog.getBoundingClientRect();
  if (
    event.target === dialog &&
    (event.clientX < bounds.left ||
      event.clientX > bounds.right ||
      event.clientY < bounds.top ||
      event.clientY > bounds.bottom)
  )
    dialog.close();
});
dialog.addEventListener('close', () => bookingTrigger?.focus());
// Compact navigation on small screens.
const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#main-nav');
function setMenuState(open) {
  navigation.classList.toggle('is-open', open);
  document.querySelector('.header').classList.toggle('menu-open', open);
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton
    .querySelector('use')
    .setAttribute('href', open ? 'icons.svg#close' : 'icons.svg#menu');
}
function closeMenu() {
  setMenuState(false);
}
menuButton.addEventListener('click', () => {
  setMenuState(!navigation.classList.contains('is-open'));
});
navigation
  .querySelectorAll('a')
  .forEach((link) => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') closeMenu();
});
document.addEventListener('click', (event) => {
  if (!navigation.classList.contains('is-open')) return;
  if (event.target.closest('#main-nav, .menu-toggle')) return;
  closeMenu();
});

// Keep anchor destinations below the sticky header at every screen size.
const header = document.querySelector('.header');
new ResizeObserver(() => {
  document.documentElement.style.setProperty(
    '--header-height',
    `${header.offsetHeight + 20}px`,
  );
}).observe(header);

document.querySelector('.nav-book').addEventListener('click', closeMenu);

// Custom language popup shares the frosted navigation appearance.
const languageToggle = document.querySelector('.language-toggle');
const languageOptions = document.querySelector('.language-options');
function closeLanguages() {
  languageOptions.hidden = true;
  languageToggle.setAttribute('aria-expanded', 'false');
}
languageToggle.addEventListener('click', () => {
  const opening = languageOptions.hidden;
  closeMenu();
  languageOptions.hidden = !opening;
  languageToggle.setAttribute('aria-expanded', String(opening));
});
languageOptions.querySelectorAll('button').forEach((button) => {
  button.addEventListener('click', () => {
    closeLanguages();
    languageToggle.focus();
  });
});
menuButton.addEventListener('click', closeLanguages);
document.addEventListener('click', (event) => {
  if (!event.target.closest('.language-picker')) closeLanguages();
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && !languageOptions.hidden) {
    closeLanguages();
    languageToggle.focus();
  }
});

// Gallery viewer: arrows, Escape and close all preserve the original scroll position.
const galleryDialog = document.querySelector('.gallery-dialog');
if (galleryDialog) {
  const photos = [...document.querySelectorAll('.gallery-open img')];
  let photoIndex = 0;
  let photoTrigger;
  function showPhoto() {
    const full = galleryDialog.querySelector('.gallery-full');
    full.src = photos[photoIndex].src;
    full.alt = photos[photoIndex].alt;
    galleryDialog.querySelector('.gallery-count').textContent =
      `${photoIndex + 1} / ${photos.length}`;
  }
  function movePhoto(step) {
    photoIndex = (photoIndex + step + photos.length) % photos.length;
    showPhoto();
  }
  document.querySelectorAll('.gallery-open').forEach((button, index) => {
    button.addEventListener('click', () => {
      photoIndex = index;
      photoTrigger = button;
      showPhoto();
      galleryDialog.showModal();
    });
  });
  galleryDialog
    .querySelector('[data-gallery-prev]')
    .addEventListener('click', () => movePhoto(-1));
  galleryDialog
    .querySelector('[data-gallery-next]')
    .addEventListener('click', () => movePhoto(1));
  galleryDialog
    .querySelector('[data-gallery-close]')
    .addEventListener('click', () => galleryDialog.close());
  galleryDialog.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      movePhoto(-1);
    }
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      movePhoto(1);
    }
  });
  galleryDialog.addEventListener('close', () =>
    photoTrigger?.focus({ preventScroll: true }),
  );
}

// Scroll hero: the photo stays pinned and the texts appear one by one.
// The header is transparent over the photo and turns frosted once the photo has scrolled away.
const hero = document.querySelector('.hero');
const siteHeader = document.querySelector('.header');
const heroReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
if (hero && siteHeader) {
  const sticky = hero.querySelector('.hero-sticky');
  const photoFrame = hero.querySelector('.hero-photo');
  const photo = photoFrame.querySelector('img');
  const items = [...hero.querySelectorAll('[data-reveal]')];
  const overlayHeader = siteHeader.classList.contains('header-overlay');
  // The header gets its background as soon as the first text starts to appear.
  const textStart = Math.min(...items.map((item) => Number(item.dataset.reveal))) - 0.01;
  let waiting = false;

  function updateHero() {
    waiting = false;
    const headerHeight = siteHeader.offsetHeight;
    document.documentElement.style.setProperty('--header-h', `${headerHeight}px`);
    const distance = hero.offsetHeight - sticky.offsetHeight;
    const rawProgress =
      distance > 0
        ? Math.min(1, Math.max(0, -hero.getBoundingClientRect().top / distance))
        : 0;
    // Mobile has a shorter visual story: start reveals earlier and finish before the photo leaves.
    const isMobileHero = window.matchMedia('(max-width: 760px)').matches;
    const progress = isMobileHero ? Math.min(1, rawProgress * 2.35) : rawProgress;
    if (overlayHeader) {
      const photoGone = photoFrame.getBoundingClientRect().bottom <= headerHeight;
      const textsVisible = heroReducedMotion.matches
        ? window.scrollY > 8
        : progress >= textStart;
      const mobileSolid = isMobileHero ? rawProgress > 0.13 : textsVisible;
      siteHeader.classList.toggle('is-solid', photoGone || mobileSolid);
    }
    if (heroReducedMotion.matches) return;
    photo.style.transform = isMobileHero
      ? `scale(${1.025 - progress * 0.012})`
      : `translateY(${(0.5 - progress) * 16}px) scale(${1.06 - progress * 0.03})`;
    hero.classList.toggle('is-started', progress > 0.08);
    items.forEach((item) => {
      item.classList.toggle('is-visible', progress >= Number(item.dataset.reveal));
    });
  }

  function requestHeroUpdate() {
    if (!waiting) {
      waiting = true;
      requestAnimationFrame(updateHero);
    }
  }

  window.addEventListener('scroll', requestHeroUpdate, { passive: true });
  window.addEventListener('resize', requestHeroUpdate);
  updateHero();
}

// Back to top button, page progress and the decorative effects in the sections.
const motionReduced = window.matchMedia('(prefers-reduced-motion: reduce)');
const scrollTools = document.querySelector('.scroll-tools');
const toTopButton = document.querySelector('.to-top');
const progressFill = document.querySelector('.scroll-progress-fill');
const fxGroups = [...document.querySelectorAll('.fx-layer[data-parallax]')].map(
  (layer) => ({
    layer,
    items: [...layer.querySelectorAll('.fx')].map((element) => ({
      element,
      speed: Number(element.dataset.speed || 0),
    })),
  }),
);

function updateScrollTools() {
  if (!scrollTools) return;
  const max = document.documentElement.scrollHeight - window.innerHeight;
  progressFill.style.transform = `scaleY(${max > 0 ? Math.min(1, window.scrollY / max) : 0})`;
  scrollTools.classList.toggle('is-visible', window.scrollY > 120);
}
const phoneLayout = window.matchMedia('(max-width: 1100px)');
function driftEffects() {
  if (motionReduced.matches || phoneLayout.matches) return;
  fxGroups.forEach(({ layer, items }) => {
    const box = layer.getBoundingClientRect();
    if (box.bottom < -300 || box.top > window.innerHeight + 300) return;
    const offset = box.top + box.height / 2 - window.innerHeight / 2;
    items.forEach(({ element, speed }) => {
      element.style.setProperty('--py', `${offset * speed}px`);
    });
  });
}
let scrollFrame = 0;
function onPageScroll() {
  if (scrollFrame) return;
  scrollFrame = requestAnimationFrame(() => {
    scrollFrame = 0;
    updateScrollTools();
    driftEffects();
  });
}
toTopButton?.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: motionReduced.matches ? 'auto' : 'smooth' });
});
window.addEventListener('scroll', onPageScroll, { passive: true });
window.addEventListener('resize', onPageScroll);
onPageScroll();

// Effects fade in when they scroll into view.
const fxElements = fxGroups.flatMap(({ items }) => items.map(({ element }) => element));
if ('IntersectionObserver' in window && !motionReduced.matches) {
  const fxObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        fxObserver.unobserve(entry.target);
      });
    },
    { rootMargin: '0px 0px -8% 0px' },
  );
  // The footer sits at the very end of the page, so it needs no bottom margin.
  const footerObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        footerObserver.unobserve(entry.target);
      });
    },
    { rootMargin: '0px' },
  );
  fxElements.forEach((element) =>
    (element.closest('.footer-fx') ? footerObserver : fxObserver).observe(element),
  );
} else {
  fxElements.forEach((element) => element.classList.add('is-in'));
}

// Cards slide in row by row: everything in the same visual row appears together.
if ('IntersectionObserver' in window && !motionReduced.matches) {
  document.querySelectorAll('[data-rows]').forEach((group) => {
    const cards = [...group.children];
    cards.forEach((card) => card.classList.add('row-item'));
    let rowObserver;
    function buildRows() {
      rowObserver?.disconnect();
      const pending = cards
        .filter(
          (card) =>
            card.classList.contains('row-item') && !card.classList.contains('is-in'),
        )
        .sort((a, b) => a.offsetTop - b.offsetTop);
      const rows = [];
      pending.forEach((card) => {
        const row = rows[rows.length - 1];
        if (row && Math.abs(card.offsetTop - row[0].offsetTop) < 8) row.push(card);
        else rows.push([card]);
      });
      rowObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            const row = rows.find((items) => items[0] === entry.target);
            rowObserver.unobserve(entry.target);
            row?.forEach((card, index) => {
              card.style.transitionDelay = `${index * 80}ms`;
              card.classList.add('is-in');
              setTimeout(
                () => {
                  card.classList.remove('row-item', 'is-in');
                  card.style.transitionDelay = '';
                },
                1500 + index * 80,
              );
            });
          });
        },
        { rootMargin: '0px 0px -12% 0px' },
      );
      rows.forEach((row) => rowObserver.observe(row[0]));
    }
    buildRows();
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(buildRows, 150);
    });
  });
}
