(() => {
 const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
 const progress = document.querySelector('.reading-progress');
 const nav = document.querySelector('.nav'), menu = document.querySelector('.menu');

 const glow = document.createElement('div');
 glow.className = 'cursor-glow';
 glow.setAttribute('aria-hidden', 'true');
 document.body.appendChild(glow);

 // MENÚ DE NAVEGACIÓN
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

 // MARCAR LA PÁGINA ACTUAL
 const current = location.pathname.split('/').pop() || 'index.html';

 document.querySelectorAll('.nav a').forEach(a => {
   if (a.getAttribute('href') === current) {
     a.classList.add('active');
   }
 });

 // ANIMACIONES AL DESPLAZARSE
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

   document.querySelectorAll('.reveal').forEach(el => io.observe(el));
 } else {
   document.querySelectorAll('.reveal').forEach(el => {
     el.classList.add('visible');
   });
 }

 // BARRA DE PROGRESO
 const update = () => {
   if (progress) {
     const max = document.documentElement.scrollHeight - innerHeight;
     progress.style.width = (max > 0 ? scrollY / max * 100 : 0) + '%';
   }
 };

 addEventListener('scroll', update, { passive: true });
 update();

 // EFECTO DEL CURSOR
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

 // INTERRUPTOR DREAMCORE
 const toggle = document.querySelector('.dream-toggle');

 if (toggle) {
   toggle.addEventListener('click', () => {
     const on = toggle.getAttribute('aria-pressed') !== 'true';

     toggle.setAttribute('aria-pressed', String(on));
     document.body.classList.toggle('dream-off', !on);
   });
 }

 // DETECTAR IMÁGENES QUE NO CARGAN
 document.querySelectorAll('img').forEach(img => {
   img.addEventListener('error', () => {
     img.classList.add('image-unavailable');
   }, { once: true });
 }
 );
})();


/* =========================================
   NOCTURNA — REPRODUCTOR MUSICAL DE YOUTUBE
   Canción: NfMegACVJQw
========================================= */

(() => {
  const videoId = 'NfMegACVJQw';

  // Evitar duplicar el reproductor.
  if (document.getElementById('nocturnaMusic')) return;

  // CREAR EL BOTÓN FLOTANTE
  const musicBox = document.createElement('div');
  musicBox.className = 'nocturna-music';
  musicBox.id = 'nocturnaMusic';

  musicBox.innerHTML = `
    <div
      class="nocturna-player-host"
      id="nocturnaPlayerHost"
      aria-hidden="true">
    </div>

    <button
      class="music-button"
      id="musicToggle"
      type="button"
      aria-label="Reproducir música"
      aria-pressed="false">

      <span
        class="music-icon"
        id="musicIcon"
        aria-hidden="true">♫</span>

      <span class="music-label" id="musicLabel">
        ACTIVAR AMBIENTE
      </span>
    </button>

    <span class="music-caption" id="musicCaption">
      NOCTURNA · SOUNDTRACK
    </span>
  `;

  document.body.appendChild(musicBox);

  const musicButton = musicBox.querySelector('#musicToggle');
  const musicIcon = musicBox.querySelector('#musicIcon');
  const musicLabel = musicBox.querySelector('#musicLabel');
  const musicCaption = musicBox.querySelector('#musicCaption');

  let player = null;
  let apiReady = false;
  let isPlaying = false;

  // ACTUALIZAR EL ESTADO DEL BOTÓN
  function setMusicState(playing) {
    isPlaying = playing;

    musicBox.classList.toggle('is-playing', playing);

    musicButton.setAttribute('aria-pressed', String(playing));

    musicButton.setAttribute(
      'aria-label',
      playing ? 'Pausar música' : 'Reproducir música'
    );

    musicIcon.textContent = playing ? 'Ⅱ' : '♫';

    musicLabel.textContent = playing
      ? 'PAUSAR AMBIENTE'
      : 'ACTIVAR AMBIENTE';

    musicCaption.textContent = playing
      ? 'NOCTURNA · REPRODUCIENDO'
      : 'NOCTURNA · SOUNDTRACK';
  }

  // CREAR EL REPRODUCTOR DE YOUTUBE
  function createPlayer() {
    if (!window.YT || !window.YT.Player) return;

    player = new YT.Player('nocturnaPlayerHost', {
      width: '200',
      height: '200',
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
        onReady: function () {
          apiReady = true;
          musicLabel.textContent = 'ACTIVAR AMBIENTE';
        },

        onStateChange: function (event) {
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

        onError: function () {
          musicLabel.textContent = 'VIDEO NO DISPONIBLE';
          musicCaption.textContent = 'REVISA EL VIDEO DE YOUTUBE';
        }
      }
    });
  }

  // BOTÓN PARA ACTIVAR O PAUSAR LA MÚSICA
  musicButton.addEventListener('click', function () {
    if (!apiReady || !player) {
      musicLabel.textContent = 'CARGANDO MÚSICA...';
      return;
    }

    if (isPlaying) {
      player.pauseVideo();
    } else {
      player.playVideo();
    }
  });

  // CARGAR LA API OFICIAL DE YOUTUBE
  if (window.YT && window.YT.Player) {
    createPlayer();
  } else {
    const previousCallback = window.onYouTubeIframeAPIReady;

    window.onYouTubeIframeAPIReady = function () {
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
      const apiScript = document.createElement('script');

      apiScript.src = 'https://www.youtube.com/iframe_api';

      document.head.appendChild(apiScript);
    }
  }
})();
