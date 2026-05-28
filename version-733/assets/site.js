(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
        } else {
            document.addEventListener("DOMContentLoaded", fn);
        }
    }

    function initMenu() {
        var toggle = document.querySelector("[data-menu-toggle]");
        var panel = document.querySelector("[data-mobile-panel]");
        if (!toggle || !panel) return;
        toggle.addEventListener("click", function () {
            panel.classList.toggle("open");
        });
    }

    function initHero() {
        var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
        if (slides.length < 2) return;
        var index = 0;
        var timer;
        function show(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("active", i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("active", i === index);
            });
        }
        function start() {
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }
        dots.forEach(function (dot, i) {
            dot.addEventListener("click", function () {
                window.clearInterval(timer);
                show(i);
                start();
            });
        });
        show(0);
        start();
    }

    function initFilters() {
        var form = document.querySelector("[data-filter-form]");
        var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));
        if (!form || !cards.length) return;
        var input = form.querySelector("[name='q']");
        var region = form.querySelector("[name='region']");
        var year = form.querySelector("[name='year']");
        var empty = document.querySelector("[data-empty-state]");
        var params = new URLSearchParams(window.location.search);
        if (input && params.get("q")) input.value = params.get("q");
        function apply() {
            var q = input ? input.value.trim().toLowerCase() : "";
            var r = region ? region.value : "";
            var y = year ? year.value : "";
            var shown = 0;
            cards.forEach(function (card) {
                var hay = [card.dataset.title, card.dataset.region, card.dataset.year, card.dataset.tags].join(" ").toLowerCase();
                var ok = true;
                if (q && hay.indexOf(q) === -1) ok = false;
                if (r && card.dataset.region !== r) ok = false;
                if (y && card.dataset.year !== y) ok = false;
                card.classList.toggle("is-hidden", !ok);
                if (ok) shown += 1;
            });
            if (empty) empty.style.display = shown ? "none" : "block";
        }
        form.addEventListener("submit", function (event) {
            event.preventDefault();
            apply();
        });
        [input, region, year].forEach(function (el) {
            if (el) el.addEventListener("input", apply);
            if (el) el.addEventListener("change", apply);
        });
        apply();
    }

    function attachPlayer(src) {
        var video = document.querySelector("[data-video]");
        var layer = document.querySelector("[data-play-layer]");
        if (!video || !src) return;
        var loaded = false;
        function load() {
            if (loaded) return;
            loaded = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = src;
            } else if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({ enableWorker: true });
                hls.loadSource(src);
                hls.attachMedia(video);
            } else {
                video.src = src;
            }
        }
        function play() {
            load();
            if (layer) layer.classList.add("hidden");
            var result = video.play();
            if (result && typeof result.catch === "function") {
                result.catch(function () {});
            }
        }
        if (layer) layer.addEventListener("click", play);
        video.addEventListener("click", function () {
            if (video.paused) play();
        });
    }

    window.VideoSite = {
        player: attachPlayer
    };

    ready(function () {
        initMenu();
        initHero();
        initFilters();
    });
})();
