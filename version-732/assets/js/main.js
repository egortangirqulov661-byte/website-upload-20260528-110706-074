(function () {
    function ready(fn) {
        if (document.readyState !== 'loading') {
            fn();
        } else {
            document.addEventListener('DOMContentLoaded', fn);
        }
    }

    function formatTime(value) {
        if (!Number.isFinite(value) || value < 0) {
            return '0:00';
        }
        var minutes = Math.floor(value / 60);
        var seconds = Math.floor(value % 60).toString().padStart(2, '0');
        return minutes + ':' + seconds;
    }

    ready(function () {
        var menuToggle = document.querySelector('[data-menu-toggle]');
        var mobileMenu = document.querySelector('[data-mobile-menu]');
        if (menuToggle && mobileMenu) {
            menuToggle.addEventListener('click', function () {
                mobileMenu.classList.toggle('is-open');
            });
        }

        var hero = document.querySelector('[data-hero]');
        if (hero) {
            var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
            var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
            var prev = hero.querySelector('[data-hero-prev]');
            var next = hero.querySelector('[data-hero-next]');
            var current = 0;
            var timer = null;

            function show(index) {
                if (!slides.length) {
                    return;
                }
                current = (index + slides.length) % slides.length;
                slides.forEach(function (slide, i) {
                    slide.classList.toggle('is-active', i === current);
                });
                dots.forEach(function (dot, i) {
                    dot.classList.toggle('is-active', i === current);
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
                    timer = null;
                }
            }

            dots.forEach(function (dot) {
                dot.addEventListener('click', function () {
                    show(Number(dot.getAttribute('data-hero-dot')) || 0);
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
            hero.addEventListener('mouseenter', stop);
            hero.addEventListener('mouseleave', start);
            show(0);
            start();
        }

        var params = new URLSearchParams(window.location.search);
        var query = params.get('q');
        var keywordInput = document.querySelector('[data-filter-keyword]');
        if (keywordInput && query) {
            keywordInput.value = query;
        }

        var filterScope = document.querySelector('[data-filter-scope]');
        if (filterScope && keywordInput) {
            var regionSelect = document.querySelector('[data-filter-region]');
            var typeSelect = document.querySelector('[data-filter-type]');
            var categorySelect = document.querySelector('[data-filter-category]');
            var yearSelect = document.querySelector('[data-filter-year]');
            var items = Array.prototype.slice.call(filterScope.querySelectorAll('.js-filter-item'));

            function applyFilter() {
                var keyword = (keywordInput.value || '').trim().toLowerCase();
                var region = regionSelect ? regionSelect.value : '';
                var type = typeSelect ? typeSelect.value : '';
                var category = categorySelect ? categorySelect.value : '';
                var year = yearSelect ? yearSelect.value : '';

                items.forEach(function (item) {
                    var haystack = [
                        item.getAttribute('data-title'),
                        item.getAttribute('data-region'),
                        item.getAttribute('data-type'),
                        item.getAttribute('data-year'),
                        item.getAttribute('data-category'),
                        item.getAttribute('data-tags'),
                        item.textContent
                    ].join(' ').toLowerCase();
                    var matched = true;
                    if (keyword && haystack.indexOf(keyword) === -1) {
                        matched = false;
                    }
                    if (region && item.getAttribute('data-region') !== region) {
                        matched = false;
                    }
                    if (type && item.getAttribute('data-type') !== type) {
                        matched = false;
                    }
                    if (category && item.getAttribute('data-category') !== category) {
                        matched = false;
                    }
                    if (year && item.getAttribute('data-year') !== year) {
                        matched = false;
                    }
                    item.classList.toggle('is-hidden', !matched);
                });
            }

            [keywordInput, regionSelect, typeSelect, categorySelect, yearSelect].forEach(function (control) {
                if (control) {
                    control.addEventListener('input', applyFilter);
                    control.addEventListener('change', applyFilter);
                }
            });
            applyFilter();
        }

        var video = document.querySelector('video[data-player]');
        if (video) {
            var shell = video.closest('.player-shell');
            var stream = video.getAttribute('data-stream');
            var progress = document.querySelector('[data-player-progress]');
            var timeLabel = document.querySelector('[data-player-time]');
            var toggles = Array.prototype.slice.call(document.querySelectorAll('[data-player-toggle]'));
            var muteButton = document.querySelector('[data-player-mute]');
            var fullscreenButton = document.querySelector('[data-player-fullscreen]');
            var hls = null;

            if (stream) {
                if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hls.loadSource(stream);
                    hls.attachMedia(video);
                } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = stream;
                } else {
                    video.src = stream;
                }
            }

            function updateState() {
                if (shell) {
                    shell.classList.toggle('is-playing', !video.paused);
                }
                toggles.forEach(function (button) {
                    button.textContent = video.paused ? '▶' : 'Ⅱ';
                });
                if (muteButton) {
                    muteButton.textContent = video.muted ? '×' : '♪';
                }
            }

            function updateProgress() {
                if (progress && video.duration) {
                    progress.value = String((video.currentTime / video.duration) * 100);
                }
                if (timeLabel) {
                    timeLabel.textContent = formatTime(video.currentTime) + ' / ' + formatTime(video.duration);
                }
            }

            function togglePlay() {
                if (video.paused) {
                    video.play().catch(function () {});
                } else {
                    video.pause();
                }
            }

            toggles.forEach(function (button) {
                button.addEventListener('click', togglePlay);
            });
            video.addEventListener('click', togglePlay);
            video.addEventListener('play', updateState);
            video.addEventListener('pause', updateState);
            video.addEventListener('timeupdate', updateProgress);
            video.addEventListener('loadedmetadata', updateProgress);

            if (progress) {
                progress.addEventListener('input', function () {
                    if (video.duration) {
                        video.currentTime = (Number(progress.value) / 100) * video.duration;
                    }
                });
            }

            if (muteButton) {
                muteButton.addEventListener('click', function () {
                    video.muted = !video.muted;
                    updateState();
                });
            }

            if (fullscreenButton && shell) {
                fullscreenButton.addEventListener('click', function () {
                    if (document.fullscreenElement) {
                        document.exitFullscreen();
                    } else if (shell.requestFullscreen) {
                        shell.requestFullscreen();
                    }
                });
            }

            window.addEventListener('beforeunload', function () {
                if (hls) {
                    hls.destroy();
                }
            });
            updateState();
            updateProgress();
        }
    });
})();
