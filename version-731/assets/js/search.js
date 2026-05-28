(function () {
  function qs(selector, parent) {
    return (parent || document).querySelector(selector);
  }

  function createCard(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return '<span class="chip">' + escapeHtml(tag) + '</span>';
    }).join('');

    return [
      '<article class="movie-card">',
      '  <a class="poster-link" href="movie/' + movie.id + '.html" aria-label="观看 ' + escapeHtml(movie.title) + '">',
      '    <span class="poster-glow"></span>',
      '    <img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + ' 海报" loading="lazy" data-fallback-image>',
      '  </a>',
      '  <div class="movie-card-body">',
      '    <div class="movie-meta-row">',
      '      <span>' + escapeHtml(movie.year) + '</span>',
      '      <span>' + escapeHtml(movie.region) + '</span>',
      '      <span>' + escapeHtml(movie.type) + '</span>',
      '    </div>',
      '    <h3><a href="movie/' + movie.id + '.html">' + escapeHtml(movie.title) + '</a></h3>',
      '    <p>' + escapeHtml(movie.oneLine) + '</p>',
      '    <div class="chip-row">' + tags + '</div>',
      '  </div>',
      '</article>'
    ].join('
');
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function setupSearch() {
    var form = qs('[data-search-form]');
    var input = qs('[data-search-input]');
    var type = qs('[data-search-type]');
    var submit = qs('[data-search-submit]');
    var results = qs('[data-search-results]');
    var note = qs('[data-search-note]');

    if (!form || !results || !window.MOVIE_DATA) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var queryFromUrl = params.get('q') || '';
    if (input && queryFromUrl) {
      input.value = queryFromUrl;
    }

    function runSearch(event) {
      if (event) {
        event.preventDefault();
      }

      var keyword = normalize(input ? input.value : '');
      var selectedType = type ? type.value : '';
      var movies = window.MOVIE_DATA.filter(function (movie) {
        var text = normalize([
          movie.title,
          movie.region,
          movie.type,
          movie.genre,
          (movie.tags || []).join(' '),
          movie.oneLine
        ].join(' '));

        if (keyword && text.indexOf(keyword) === -1) {
          return false;
        }

        if (selectedType && movie.type !== selectedType) {
          return false;
        }

        return true;
      }).slice(0, 120);

      if (note) {
        note.textContent = keyword || selectedType
          ? '找到 ' + movies.length + ' 条结果，最多展示前 120 条。'
          : '输入关键词或选择类型后可快速检索片库。';
      }

      if (!movies.length) {
        results.innerHTML = '<div class="empty-state">没有找到匹配影片，请尝试更换关键词。</div>';
        return;
      }

      results.innerHTML = '<div class="movie-grid">' + movies.map(createCard).join('
') + '</div>';
    }

    form.addEventListener('submit', runSearch);
    if (submit) {
      submit.addEventListener('click', runSearch);
    }
    if (input) {
      input.addEventListener('input', runSearch);
    }
    if (type) {
      type.addEventListener('change', runSearch);
    }

    runSearch();
  }

  document.addEventListener('DOMContentLoaded', setupSearch);
})();
