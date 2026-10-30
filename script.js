
(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const progress = document.querySelector('.reading-progress');
  const nav = document.querySelector('.nav');
  const menu = document.querySelector('.menu');

  // Efecto del cursor
  const glow = document.createElement('div');
  glow.className = 'cursor-glow';
  glow.setAttribute('aria-hidden', 'true');
  document.body.appendChild(glow);

  // Menú móvil
  if (nav && menu) {
    menu.addEventListener('click', () => {
      const open = nav.classList.toggle('open');

      menu.setAttribute('aria-expanded', String(open));
      menu.textContent = open ? '✕' : '☰';
    });

    nav.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        nav.classList.remove('open');
        menu.setAttribute('aria-expanded', 'false');
        menu.textContent = '☰';
      });
    });
  }

  // Marcar enlace activo
  const current = location.pathname.split('/').pop() || 'index.html';

  document.querySelectorAll('.nav a').forEach(a => {
    if (a.getAttribute('href') === current) {
      a.classList.add('active');
    }
  });

  // Animaciones al aparecer
  if ('IntersectionObserver' in window && !reduced) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          io.unobserve(e.target);
        }
      });
    }, {
      threshold: 0.12,
      rootMargin: '0px 0px -30px 0px'
    });

    document.querySelectorAll('.reveal').forEach(el => {
      io.observe(el);
    });
  } else {
    document.querySelectorAll('.reveal').forEach(el => {
      el.classList.add('visible');
    });
  }

  // Barra de progreso
  const update = () => {
    if (progress) {
      const max = document.documentElement.scrollHeight - innerHeight;

      progress.style.width =
        (max > 0 ? scrollY / max * 100 : 0) + '%';
    }
  };

  addEventListener('scroll', update, { passive: true });
  update();

  // Partículas del cursor
  if (!reduced && matchMedia('(pointer:fine)').matches) {
    let last = 0;

    addEventListener('pointermove', e => {
      glow.style.left = e.clientX + 'px';
      glow.style.top = e.clientY + 'px';

      if (performance.now() - last > 95) {
        const dot = document.createElement('i');

        dot.className = 'cursor-trail';
        dot.style.left = e.clientX + 'px';
        dot.style.top = e.clientY + 'px';

        document.body.appendChild(dot);

        setTimeout(() => dot.remove(), 700);
        last = performance.now();
      }
    }, { passive: true });
  } else {
    glow.style.display = 'none';
  }

  // Modo Dreamcore
  const toggle = document.querySelector('.dream-toggle');

  if (toggle) {
    toggle.addEventListener('click', () => {
      const on = toggle.getAttribute('aria-pressed') !== 'true';

      toggle.setAttribute('aria-pressed', String(on));
      document.body.classList.toggle('dream-off', !on);
    });
  }

  // Imágenes que no cargan
  document.querySelectorAll('img').forEach(img => {
    img.addEventListener('error', () => {
      img.classList.add('image-unavailable');
    }, { once: true });
  });

})();


/* =========================================
   NOCTURNA — BOTÓN MUSICAL FLOTANTE
   Una canción diferente por cada página.
   Reproductor de YouTube oculto.
========================================= */

(() => {

  // CANCIONES DE CADA PÁGINA
  const songs = {
    "index.html": "d_HlPboLRL8",
    "criminologia.html": "V1Pl8CzNzCw",
    "criminalistica.html": "HUHC9tYz8ik",
    "casos-criminologia.html": "GCdwKhTtNNw",
    "casos-criminalistica.html": "EgBJmlPo8Xw",
    "carrera-criminologia.html": "so8V5dAli-Q",
    "carrera-criminalistica.html": "aGCdLKXNF3w",
    "ventas.html": "jVG_Q5pyMaM"
  };

  // Detectar automáticamente la página actual
  const currentPage =
    location.pathname.split('/').pop() || "index.html";

  // Seleccionar la canción correspondiente
  const videoId = songs[currentPage] || songs["index.html"];

  if (document.getElementById("nocturnaMusic")) return;

  const musicBox = document.createElement("div");

  musicBox.className = "nocturna-music";
  musicBox.id = "nocturnaMusic";

  musicBox.innerHTML = `
    <div class="nocturna-player-wrap" aria-hidden="true">
      <div id="nocturnaPlayerHost"></div>
    </div>

    <button
      class="music-button"
      id="musicToggle"
      type="button"
      aria-label="Reproducir música"
      aria-pressed="false">

      <span class="music-icon" id="musicIcon" aria-hidden="true">
        ♫
      </span>

      <span class="music-label" id="musicLabel">
        REPRODUCIR MÚSICA
      </span>
    </button>
  `;

  document.body.appendChild(musicBox);

  const musicButton = musicBox.querySelector("#musicToggle");
  const musicIcon = musicBox.querySelector("#musicIcon");
  const musicLabel = musicBox.querySelector("#musicLabel");

  let player = null;
  let apiReady = false;
  let isPlaying = false;

  // Actualizar el botón
  function setMusicState(playing) {
    isPlaying = playing;

    musicBox.classList.toggle("is-playing", playing);

    musicButton.setAttribute(
      "aria-pressed",
      String(playing)
    );

    musicButton.setAttribute(
      "aria-label",
      playing ? "Pausar música" : "Reproducir música"
    );

    musicIcon.textContent = playing ? "Ⅱ" : "♫";

    musicLabel.textContent = playing
      ? "PAUSAR MÚSICA"
      : "REPRODUCIR MÚSICA";
  }

  // Crear reproductor oculto
  function createPlayer() {
    if (!window.YT || !window.YT.Player || player) return;

    player = new YT.Player("nocturnaPlayerHost", {
      width: "200",
      height: "200",
      videoId: videoId,

      playerVars: {
        autoplay: 0,
        controls: 0,
        loop: 1,
        playlist: videoId,
        playsinline: 1,
        rel: 0
      },

      events: {
        onReady: () => {
          apiReady = true;
        },

        onStateChange: event => {
          if (event.data === YT.PlayerState.PLAYING) {
            setMusicState(true);
          }

          if (
            event.data === YT.PlayerState.PAUSED ||
            event.data === YT.PlayerState.ENDED
          ) {
            setMusicState(false);
          }
        },

        onError: () => {
          musicLabel.textContent = "MÚSICA NO DISPONIBLE";
        }
      }
    });
  }

  // Botón reproducir / pausar
  musicButton.addEventListener("click", () => {
    if (!apiReady || !player) {
      musicLabel.textContent = "CARGANDO...";
      return;
    }

    if (isPlaying) {
      player.pauseVideo();
    } else {
      player.playVideo();
    }
  });

  // Cargar API de YouTube
  if (window.YT && window.YT.Player) {
    createPlayer();
  } else {
    const previousCallback = window.onYouTubeIframeAPIReady;

    window.onYouTubeIframeAPIReady = () => {
      if (typeof previousCallback === "function") {
        previousCallback();
      }

      createPlayer();
    };

    if (!document.querySelector(
      'script[src="https://www.youtube.com/iframe_api"]'
    )) {
      const apiScript = document.createElement("script");

      apiScript.src =
        "https://www.youtube.com/iframe_api";

      document.head.appendChild(apiScript);
    }
  }

})();
