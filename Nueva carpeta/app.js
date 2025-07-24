// --- VARIABLES GLOBALES ---
let player; // Variable para el reproductor de YouTube
let currentPodcast = null;
let subtitleInterval; // Intervalo para actualizar subtítulos y barra de progreso

// --- BASE DE DATOS DE PODCASTS ---
// Ahora usamos 'videoId' en lugar de 'src'.
// Los subtítulos los he extraído manualmente de videos de YouTube para este ejemplo.
const podcasts = [
    {
        id: 1,
        title: '¿Qué hay dentro de un Agujero Negro?',
        artist: 'Dot CSV',
        genre: 'ciencia',
        videoId: 'sWso_g5yS2E', // ID del video de YouTube
        subtitles: [
            [2.5, 6.8, "Los agujeros negros son los objetos más misteriosos y fascinantes del universo."],
            [7, 11, "Su gravedad es tan fuerte que ni siquiera la luz puede escapar."],
            [11.5, 15, "Pero, ¿qué pasaría si pudieras viajar dentro de uno?"],
            [15.5, 19, "En su frontera, el horizonte de sucesos, el tiempo se deforma."]
        ]
    },
    {
        id: 2,
        title: 'Cómo aprendí a programar',
        artist: 'midudev',
        genre: 'desarrollo',
        videoId: 'g2LpL8Jj0_Y',
        subtitles: [
            [5, 8.5, "Mucha gente me pregunta cómo pueden aprender a programar."],
            [9, 13, "Y la verdad es que no hay una única respuesta correcta para todos."],
            [13.5, 18, "Pero sí que hay algunas cosas que a mí personalmente me sirvieron muchísimo."],
            [18.5, 21, "La primera, sin duda, es la constancia."]
        ]
    },
    {
        id: 3,
        title: 'Lo-fi para Estudiar',
        artist: 'Lofi Girl',
        genre: 'musica',
        videoId: 'jfKfPfyJRdk', // Un video largo para probar
        subtitles: [
            [10, 15, "(Música relajante...)"],
            [30, 35, "(Sonidos de lluvia suave...)"],
            [60, 65, "(Melodía de piano tranquila...)"]
        ]
    }
];


// --- INICIALIZACIÓN DE LA API DE YOUTUBE ---
// Esta función es llamada automáticamente por la API de YouTube cuando está lista.
function onYouTubeIframeAPIReady() {
    player = new YT.Player('youtube-player', {
        height: '0',
        width: '0',
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
        }
    });
}

// --- ELEMENTOS DEL DOM ---
const podcastTitle = document.getElementById('podcast-title');
const podcastArtist = document.getElementById('podcast-artist');
const subtitlesEl = document.getElementById('subtitles');
const podcastListEl = document.getElementById('podcast-list');
const genreFiltersEl = document.getElementById('genre-filters');
const playPauseBtn = document.getElementById('play-pause-btn');
const progressBar = document.getElementById('progress-bar');
const progressBarContainer = document.querySelector('.progress-bar-container');


// --- FUNCIONES DEL REPRODUCTOR ---

/** La API llama a esta función cuando el reproductor está listo. */
function onPlayerReady(event) {
    // El reproductor está listo. Mostramos los podcasts.
    displayPodcasts('all');
    setupEventListeners();
}

/** La API llama a esta función cuando el estado del reproductor cambia (play, pausa, etc.) */
function onPlayerStateChange(event) {
    // Si el video está reproduciéndose
    if (event.data == YT.PlayerState.PLAYING) {
        playPauseBtn.textContent = '⏸️'; // Cambia el icono a pausa
        // Inicia el intervalo para actualizar la UI (subtítulos y barra)
        subtitleInterval = setInterval(updateUI, 250); // Cada 250ms
    } else {
        playPauseBtn.textContent = '▶️'; // Cambia el icono a play
        // Detiene el intervalo si el video está en pausa, terminado, etc.
        clearInterval(subtitleInterval);
    }
}

/** Carga y reproduce un podcast seleccionado. */
function loadPodcast(podcast) {
    currentPodcast = podcast;
    podcastTitle.textContent = podcast.title;
    podcastArtist.textContent = podcast.artist;
    player.loadVideoById(podcast.videoId);
    subtitlesEl.textContent = '...';
    progressBar.style.width = '0%';
}

/** Función principal que se ejecuta repetidamente para actualizar la UI */
function updateUI() {
    if (!currentPodcast || player.getPlayerState() !== YT.PlayerState.PLAYING) return;
    
    const currentTime = player.getCurrentTime();
    const duration = player.getDuration();

    // Actualizar barra de progreso
    const progressPercent = (currentTime / duration) * 100;
    progressBar.style.width = `${progressPercent}%`;

    // Actualizar subtítulos
    updateSubtitles(currentTime);
}

/** Actualiza el subtítulo en pantalla */
function updateSubtitles(currentTime) {
    const subtitles = currentPodcast.subtitles;
    const activeSubtitle = subtitles.find(sub => currentTime >= sub[0] && currentTime <= sub[1]);

    if (activeSubtitle) {
        if (subtitlesEl.textContent !== activeSubtitle[2]) {
            subtitlesEl.textContent = activeSubtitle[2];
            subtitlesEl.classList.add('active');
        }
    } else {
        subtitlesEl.classList.remove('active');
    }
}


/** Muestra la lista de podcasts en la UI */
function displayPodcasts(filter = 'all') {
    podcastListEl.innerHTML = '';
    const filteredPodcasts = podcasts.filter(p => filter === 'all' || p.genre === filter);
    
    filteredPodcasts.forEach(podcast => {
        const listItem = document.createElement('li');
        listItem.className = 'podcast-item';
        listItem.innerHTML = `<div class="podcast-item-info"><h4>${podcast.title}</h4><p>${podcast.artist}</p></div><span>▶️</span>`;
        listItem.addEventListener('click', () => loadPodcast(podcast));
        podcastListEl.appendChild(listItem);
    });
}

/** Configura todos los event listeners de la página */
function setupEventListeners() {
    // Filtros de género
    genreFiltersEl.addEventListener('click', (e) => {
        if (e.target.tagName === 'BUTTON') {
            document.querySelector('.filter-btn.active').classList.remove('active');
            e.target.classList.add('active');
            displayPodcasts(e.target.dataset.genre);
        }
    });

    // Botón de Play/Pausa
    playPauseBtn.addEventListener('click', () => {
        if (player.getPlayerState() === YT.PlayerState.PLAYING) {
            player.pauseVideo();
        } else {
            player.playVideo();
        }
    });
    
    // Barra de progreso para buscar (seek)
    progressBarContainer.addEventListener('click', (e) => {
        if (!currentPodcast) return;
        const containerWidth = progressBarContainer.offsetWidth;
        const clickX = e.offsetX;
        const duration = player.getDuration();
        const seekTime = (clickX / containerWidth) * duration;
        player.seekTo(seekTime, true);
    });
}