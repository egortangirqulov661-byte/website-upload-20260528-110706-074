(function () {
  function loadNative(video, source) {
    video.src = source;
    return video.play();
  }

  function setStatus(text) {
    var status = document.querySelector('[data-player-status]');
    if (status) {
      status.textContent = text;
    }
  }

  function setupPlayer() {
    var video = document.getElementById('moviePlayer');
    var button = document.querySelector('[data-play-button]');
    var box = document.querySelector('[data-player-box]');

    if (!video || !button) {
      return;
    }

    var source = button.dataset.source;
    var hlsInstance = null;

    function play() {
      if (!source) {
        setStatus('当前影片暂未绑定播放线路。');
        return;
      }

      setStatus('正在初始化高清播放线路…');
      if (box) {
        box.classList.add('is-playing');
      }

      if (window.Hls && window.Hls.isSupported()) {
        if (hlsInstance) {
          hlsInstance.destroy();
        }

        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });

        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
          setStatus('播放线路已就绪。');
          video.play().catch(function () {
            setStatus('浏览器阻止了自动播放，请再次点击播放按钮。');
          });
        });
        hlsInstance.on(window.Hls.Events.ERROR, function (_, data) {
          if (data && data.fatal) {
            setStatus('播放线路连接异常，请刷新页面或切换网络后重试。');
          }
        });
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        loadNative(video, source).then(function () {
          setStatus('播放线路已就绪。');
        }).catch(function () {
          setStatus('浏览器阻止了自动播放，请再次点击播放按钮。');
        });
        return;
      }

      setStatus('当前浏览器需要加载播放支持库后播放。');
    }

    button.addEventListener('click', play);
    video.addEventListener('play', function () {
      if (box) {
        box.classList.add('is-playing');
      }
    });
    video.addEventListener('pause', function () {
      if (video.currentTime === 0 || video.ended) {
        if (box) {
          box.classList.remove('is-playing');
        }
      }
    });
  }

  document.addEventListener('DOMContentLoaded', setupPlayer);
})();
