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
function closeMenu() {
  navigation.classList.remove('is-open');
  menuButton.setAttribute('aria-expanded', 'false');
}
menuButton.addEventListener('click', () => {
  const open = navigation.classList.toggle('is-open');
  menuButton.setAttribute('aria-expanded', String(open));
});
navigation
  .querySelectorAll('a')
  .forEach((link) => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') closeMenu();
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

// Scroll story: words appear one by one while the photo stays pinned.
const story = document.querySelector('.story');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
if (story && !reduceMotion.matches) {
  const sticky = story.querySelector('.story-sticky');
  const photo = story.querySelector('.story-photo img');
  const words = [...story.querySelectorAll('.story-word')];
  let waiting = false;

  function updateStory() {
    waiting = false;
    const distance = story.offsetHeight - sticky.offsetHeight;
    const progress = Math.min(
      1,
      Math.max(0, -story.getBoundingClientRect().top / distance),
    );
    photo.style.transform = `scale(${1 + progress * 0.08})`;
    words.forEach((word, index) => {
      const start = 0.1 + index * 0.25;
      const visible = Math.min(1, Math.max(0, (progress - start) / 0.2));
      word.style.opacity = visible;
      word.style.transform = `translateY(${(1 - visible) * 28}px)`;
    });
  }

  function requestUpdate() {
    if (!waiting) {
      waiting = true;
      requestAnimationFrame(updateStory);
    }
  }

  window.addEventListener('scroll', requestUpdate, { passive: true });
  window.addEventListener('resize', requestUpdate);
  updateStory();
}
