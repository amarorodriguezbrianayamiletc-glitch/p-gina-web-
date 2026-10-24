(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const progress = document.querySelector('.reading-progress');
  const nav = document.querySelector('.nav');
  const menu = document.querySelector('.menu');

  // Brillo del cursor
  const glow = document.createElement('div');
  glow.className = 'cursor-glow';
  glow.setAttribute('aria-hidden', 'true');
  document.body.appendChild(glow);

  // Menú adaptable
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

  // Identificar página actual
  const current = location.pathname.split('/').pop() || 'index.html';

  document.querySelectorAll('.nav a').forEach(a => {
    if (a.getAttribute('href') === current) {
      a.classList.add('active');
    }
  });

  // Animaciones al aparecer elementos
  if ('IntersectionObserver' in window && !reduced) {
    const io = new IntersectionObserver(
      entries => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            e.target.classList.add('visible');
            io.unobserve(e.target);
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: '0px 0px -30px 0px'
      }
    );

    document.querySelectorAll('.reveal').forEach(el => {
      io.observe(el);
    });
  } else {
    document.querySelectorAll('.reveal').forEach(el => {
      el.classList.add('visible');
    });
  }

  // Barra de progreso de lectura
  const update = () => {
    if (progress) {
      const max = document.documentElement.scrollHeight - innerHeight;
      progress.style.width =
        (max > 0 ? scrollY / max * 100 : 0) + '%';
    }
  };

  addEventListener('scroll', update, { passive: true });
  update();

  // Estela del cursor
  if (!reduced && matchMedia('(pointer:fine)').matches) {
    let last = 0;

    addEventListener(
      'pointermove',
      e => {
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
      },
      { passive: true }
    );
  } else {
    glow.style.display = 'none';
  }

  // Activar o desactivar el efecto Dream
  const toggle = document.querySelector('.dream-toggle');

  if (toggle) {
    toggle.addEventListener('click', () => {
      const on = toggle.getAttribute('aria-pressed') !== 'true';

      toggle.setAttribute('aria-pressed', String(on));
      document.body.classList.toggle('dream-off', !on);
    });
  }

  // Detectar imágenes que no cargan
  document.querySelectorAll('img').forEach(img => {
    img.addEventListener(
      'error',
      () => {
        img.classList.add('image-unavailable');
      },
      { once: true }
    );
  });
})();

/* ==========================================
   NOCTURNA — REPRODUCTOR MUSICAL POR PÁGINA
   ========================================== */

(() => {
  // Canción asignada a cada página
  const songs = {
    'index.html': {
      id: 'd_HlPboLRL8',
      title: 'Dreamcore'
    },

    'criminologia.html': {
      id: 'V1Pl8CzNzCw',
      title: 'Lovely — Billie Eilish & Khalid'
    },

    'criminalistica.html': {
      id: 'HUHC9tYz8ik',
      title: 'bury a friend — Billie Eilish'
    },

    'casos-criminologia.html': {
      id: 'GCdwKhTtNNw',
      title: 'Sweater Weather — The Neighbourhood'
    },

    'casos-criminalistica.html': {
      id: 'EgBJmlPo8Xw',
      title: 'everything i wanted — Billie Eilish'
    },

    'carrera-criminologia.html': {
      id: 'k4V3Mo61fJM',
      title: 'Control — Halsey'
    },

    'carrera-criminalistica.html': {
      id: 'aGCdLKXNF3w',
      title: 'Everybody Wants to Rule the World — Tears for Fears'
    }
  };

  // Detectar en qué página estamos
  const page = location.pathname.split('/').pop() || 'index.html';
  const selected = songs[page] || songs['index.html'];

  let player = null;
  let ready = false;
  let playing = false;

  // Crear el reproductor
  const widget = document.createElement('div');
  widget.className = 'nocturna-music';

  widget.innerHTML = `
    <div class="nocturna-music__player" aria-hidden="true">
      <div id="nocturna-youtube-player"></div>
    </div>

    <button
      class="nocturna-music__button"
      type="button"
      aria-label="Reproducir música"
      aria-pressed="false"
    >
      <span class="nocturna-music__icon" aria-hidden="true">♫</span>
      <span class="nocturna-music__text">REPRODUCIR MÚSICA</span>
    </button>

    <span class="nocturna-music__caption"></span>
  `;

  document.body.appendChild(widget);

  const button = widget.querySelector('button');
  const buttonText = widget.querySelector('.nocturna-music__text');
  const caption = widget.querySelector('.nocturna-music__caption');

  caption.textContent = selected.title;

  // Actualizar el botón según el estado
  function updateButton(isPlaying) {
    playing = isPlaying;

    button.setAttribute('aria-pressed', String(isPlaying));

    button.setAttribute(
      'aria-label',
      isPlaying ? 'Pausar música' : 'Reproducir música'
    );

    buttonText.textContent = isPlaying
      ? 'PAUSAR MÚSICA'
      : 'REPRODUCIR MÚSICA';

    widget.classList.toggle('is-playing', isPlaying);
  }

  // Reproducir o pausar al pulsar el botón
  button.addEventListener('click', () => {
    if (!ready || !player) {
      caption.textContent = 'CARGANDO MÚSICA…';
      return;
    }

    if (playing) {
      player.pauseVideo();
    } else {
      player.unMute();
      player.playVideo();
    }
  });

  // Crear el reproductor de YouTube
  function createPlayer() {
    if (!window.YT || !window.YT.Player) {
      return;
    }

    player = new YT.Player('nocturna-youtube-player', {
      width: '200',
      height: '200',

      videoId: selected.id,

      playerVars: {
        autoplay: 0,
        controls: 0,
        loop: 1,
        playlist: selected.id,
        playsinline: 1,
        rel: 0
      },

      events: {
        onReady(event) {
          ready = true;

          event.target.setVolume(45);
          caption.textContent = selected.title;
        },

        onStateChange(event) {
          if (event.data === YT.PlayerState.PLAYING) {
            updateButton(true);
            caption.textContent = selected.title;
          } else if (
            event.data === YT.PlayerState.PAUSED ||
            event.data === YT.PlayerState.ENDED
          ) {
            updateButton(false);
          }
        },

        onError() {
          caption.textContent = 'No se pudo cargar esta canción';
        }
      }
    });
  }

  // Cargar la API de YouTube
  if (window.YT && window.YT.Player) {
    createPlayer();
  } else {
    const previousCallback = window.onYouTubeIframeAPIReady;

    window.onYouTubeIframeAPIReady = () => {
      if (typeof previousCallback === 'function') {
        previousCallback();
      }

      createPlayer();
    };

    if (
      !document.querySelector(
        'script[src="https://www.youtube.com/iframe_api"]'
      )
    ) {
      const api = document.createElement('script');

      api.src = 'https://www.youtube.com/iframe_api';
      api.async = true;

      document.head.appendChild(api);
    }
  }
})();
