(function () {
  function qs(selector, parent) {
    return (parent || document).querySelector(selector);
  }

  function qsa(selector, parent) {
    return Array.prototype.slice.call((parent || document).querySelectorAll(selector));
  }

  function setupMobileMenu() {
    var button = qs('[data-mobile-menu-button]');
    var menu = qs('[data-mobile-menu]');
    if (!button || !menu) {
      return;
    }

    button.addEventListener('click', function () {
      menu.classList.toggle('is-open');
    });
  }

  function setupHeroSlider() {
    var slider = qs('[data-hero-slider]');
    if (!slider) {
      return;
    }

    var slides = qsa('.hero-slide', slider);
    var dots = qsa('[data-hero-dot]', slider);
    var prev = qs('[data-hero-prev]', slider);
    var next = qs('[data-hero-next]', slider);
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
        start();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        start();
      });
    }

    slider.addEventListener('mouseenter', stop);
    slider.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function setupImageFallbacks() {
    qsa('img[data-fallback-image]').forEach(function (image) {
      image.addEventListener('error', function () {
        image.classList.add('is-hidden');
        image.alt = image.alt + '（图片待放入根目录）';
      }, { once: true });
    });
  }

  function cardMatches(card, keyword, region, type) {
    var text = [
      card.dataset.title || '',
      card.dataset.genre || '',
      card.dataset.region || '',
      card.dataset.type || '',
      card.dataset.year || ''
    ].join(' ').toLowerCase();

    if (keyword && text.indexOf(keyword) === -1) {
      return false;
    }

    if (region && card.dataset.region !== region) {
      return false;
    }

    if (type && card.dataset.type !== type) {
      return false;
    }

    return true;
  }

  function setupFilters() {
    qsa('[data-filter-scope]').forEach(function (toolbar) {
      var root = toolbar.parentElement;
      var input = qs('[data-filter-input]', toolbar);
      var regionSelect = qs('[data-filter-select="region"]', toolbar);
      var typeSelect = qs('[data-filter-select="type"]', toolbar);
      var reset = qs('[data-filter-reset]', toolbar);
      var count = qs('[data-filter-count]', toolbar);
      var cards = qsa('.movie-card', root);

      function apply() {
        var keyword = input ? input.value.trim().toLowerCase() : '';
        var region = regionSelect ? regionSelect.value : '';
        var type = typeSelect ? typeSelect.value : '';
        var visible = 0;

        cards.forEach(function (card) {
          var matched = cardMatches(card, keyword, region, type);
          card.style.display = matched ? '' : 'none';
          if (matched) {
            visible += 1;
          }
        });

        if (count) {
          count.textContent = '显示 ' + visible + ' / ' + cards.length + ' 部';
        }
      }

      [input, regionSelect, typeSelect].forEach(function (control) {
        if (control) {
          control.addEventListener('input', apply);
          control.addEventListener('change', apply);
        }
      });

      if (reset) {
        reset.addEventListener('click', function () {
          if (input) {
            input.value = '';
          }
          if (regionSelect) {
            regionSelect.value = '';
          }
          if (typeSelect) {
            typeSelect.value = '';
          }
          apply();
        });
      }

      apply();
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMobileMenu();
    setupHeroSlider();
    setupImageFallbacks();
    setupFilters();
  });
})();
