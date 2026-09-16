/* Српска школа „Иво Андрић“ Брисел — site.js
   Vanilla, no dependencies. Progressive enhancement only:
   every page is fully readable and navigable with JS disabled. */
(function () {
  'use strict';

  /* ---------------------------------------------------------- mobile nav */
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('primary-nav');

  if (toggle && nav) {
    var setOpen = function (open) {
      toggle.setAttribute('aria-expanded', String(open));
      nav.classList.toggle('is-open', open);
    };

    toggle.addEventListener('click', function () {
      setOpen(toggle.getAttribute('aria-expanded') !== 'true');
    });

    // Close when a link is chosen, on Escape, or when the viewport grows
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) { setOpen(false); }
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
        setOpen(false);
        toggle.focus();
      }
    });

    var wide = window.matchMedia('(min-width: 961px)');
    var onWide = function (mq) { if (mq.matches) { setOpen(false); } };
    if (wide.addEventListener) { wide.addEventListener('change', onWide); }
    else if (wide.addListener) { wide.addListener(onWide); }
  }

  /* ------------------------------------------------- header shadow on scroll */
  var header = document.querySelector('.site-header');
  if (header) {
    var onScroll = function () {
      header.classList.toggle('is-scrolled', window.scrollY > 8);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ----------------------------------------------------------- lightbox */
  // Archived news sits in [hidden] wrappers — its images must not join the sequence.
  var triggers = Array.prototype.slice
    .call(document.querySelectorAll('[data-lightbox]'))
    .filter(function (el) { return !el.closest('[hidden]'); });

  if (triggers.length) {
    var box = document.createElement('div');
    box.className = 'lightbox';
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-modal', 'true');
    box.setAttribute('aria-label', 'Увећана слика');
    box.innerHTML =
      '<button type="button" class="lightbox__btn lightbox__close" aria-label="Затвори">&times;</button>' +
      '<button type="button" class="lightbox__btn lightbox__prev" aria-label="Претходна слика">&#8249;</button>' +
      '<img class="lightbox__img" alt="">' +
      '<button type="button" class="lightbox__btn lightbox__next" aria-label="Следећа слика">&#8250;</button>' +
      '<p class="lightbox__caption"></p>';
    document.body.appendChild(box);

    var img = box.querySelector('.lightbox__img');
    var caption = box.querySelector('.lightbox__caption');
    var btnPrev = box.querySelector('.lightbox__prev');
    var btnNext = box.querySelector('.lightbox__next');
    var index = 0;
    var lastFocused = null;

    // Single-image galleries do not need arrows.
    if (triggers.length < 2) {
      btnPrev.hidden = true;
      btnNext.hidden = true;
    }

    var show = function (i) {
      index = (i + triggers.length) % triggers.length;
      var source = triggers[index];
      var full = source.getAttribute('data-lightbox') || '';
      var thumb = source.querySelector('img');
      img.src = full || (thumb ? thumb.currentSrc || thumb.src : '');
      img.alt = thumb ? thumb.alt : '';
      caption.textContent = source.getAttribute('data-caption') || (thumb ? thumb.alt : '');
    };

    var open = function (i) {
      lastFocused = document.activeElement;
      show(i);
      box.classList.add('is-open');
      document.body.style.overflow = 'hidden';
      box.querySelector('.lightbox__close').focus();
    };

    var close = function () {
      box.classList.remove('is-open');
      document.body.style.overflow = '';
      img.src = '';
      if (lastFocused && lastFocused.focus) { lastFocused.focus(); }
    };

    triggers.forEach(function (el, i) {
      el.addEventListener('click', function (e) {
        e.preventDefault();
        open(i);
      });
    });

    box.querySelector('.lightbox__close').addEventListener('click', close);
    btnPrev.addEventListener('click', function () { show(index - 1); });
    btnNext.addEventListener('click', function () { show(index + 1); });
    box.addEventListener('click', function (e) { if (e.target === box) { close(); } });

    document.addEventListener('keydown', function (e) {
      if (!box.classList.contains('is-open')) { return; }
      if (e.key === 'Escape') { close(); }
      if (e.key === 'ArrowLeft' && triggers.length > 1) { show(index - 1); }
      if (e.key === 'ArrowRight' && triggers.length > 1) { show(index + 1); }
    });

    // Swipe between images on touch devices
    var touchX = null;
    box.addEventListener('touchstart', function (e) { touchX = e.changedTouches[0].clientX; }, { passive: true });
    box.addEventListener('touchend', function (e) {
      if (touchX === null || triggers.length < 2) { return; }
      var dx = e.changedTouches[0].clientX - touchX;
      if (Math.abs(dx) > 50) { show(index + (dx < 0 ? 1 : -1)); }
      touchX = null;
    }, { passive: true });
  }

  /* ------------------------------------------------------ reveal on scroll */
  var revealables = document.querySelectorAll('.reveal');
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!revealables.length) { return; }

  if (reduced || !('IntersectionObserver' in window)) {
    Array.prototype.forEach.call(revealables, function (el) { el.classList.add('is-visible'); });
    return;
  }

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });

  Array.prototype.forEach.call(revealables, function (el) { observer.observe(el); });

  // Failsafe: nothing may stay invisible because an observer never fired.
  window.addEventListener('load', function () {
    setTimeout(function () {
      Array.prototype.forEach.call(revealables, function (el) {
        if (el.getBoundingClientRect().top < window.innerHeight) {
          el.classList.add('is-visible');
        }
      });
    }, 400);
  });
})();
