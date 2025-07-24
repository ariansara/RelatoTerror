// --- VARIABLES GLOBALES ---
let player; // Variable para el reproductor de YouTube
let isPlayerReady = false; // Una bandera para saber si el reproductor está listo
let currentPodcast = null;
let subtitleInterval;

// --- BASE DE DATOS DE PODCASTS ---
const podcasts = [
    {
        id: 1,
        title: '¿Qué hay dentro de un Agujero Negro?',
        artist: 'Dot CSV',
        genre: 'ciencia',
        videoId: 'sWso_g5yS2E',
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
        title: 'La Historia de la Amistad | Toy Story',
        artist: 'El Temach',
        genre: 'analisis',
        videoId: 'watch?v=jsljGbjjLR4',
        subtitles: [
            [6, 9, "Bienvenidos a una edición más del Temach Vlog."],
            [10, 16, "Ya sabe que el Temach Vlog es donde analizamos películas, series, canciones y conceptos."],
            [25, 30, "Hoy vamos a hablar de Toy Story, la historia sobre la amistad."],
            [31, 34, "La amistad que se desarrolla de dos vatos que se odiaban."],
            [38, 43, "Esta película es gangsta, mi compa. El vato lo aventó por la ventana."],
            [43, 49, "Pero después descubrieron que podían ser compas y que juntos podían lograr más."]
        ]
    }
];

// --- ELEMENTOS DEL DOM ---
const podcastTitle = document.getElementById('podcast-title');
const podcastArtist = document.getElementById('podcast-artist');
const subtitlesEl = document.getElementById('subtitles');
const podcastListEl = document.getElementById('podcast-list');
const genreFiltersEl = document.getElementById('genre-filters');
const playPauseBtn = document.getElementById('play-pause-btn');
const progressBar = document.getElementById('progress-bar');
const progressBarContainer = document.querySelector('.progress-bar-container');

// --- INICIALIZACIÓN DE LA PÁGINA ---
// Este evento se dispara cuando la estructura HTML de la página está completamente cargada.
document.addEventListener('DOMContentLoaded', () => {
    console.log("La página ha cargado. Mostrando podcasts...");
    displayPodcasts('all');
    setupEventListeners();
});

// --- FUNCIONES DE LA API DE YOUTUBE ---
// La API de YouTube llamará a esta función automáticamente cuando su script esté listo.
function onYouTubeIframeAPIReady() {
    console.log("API de YouTube lista. Creando reproductor...");
    player = new YT.Player('youtube-player', {
        height: '0',
        width: '0',
        playerVars: {
            'origin': window.location.origin // Usamos el origen actual de la ventana
        },
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
        }
    });
}

// Esta función se llama cuando el reproductor de YouTube está listo y puede recibir comandos.
function onPlayerReady(event) {
    console.log("¡Reproductor de YouTube listo!");
    isPlayerReady = true; // Actualizamos nuestra bandera
}

// Se llama cuando el estado del reproductor cambia (play, pausa, etc.)
function onPlayerStateChange(event) {
    if (event.data == YT.PlayerState.PLAYING) {
        playPauseBtn.textContent = '⏸️';
        subtitleInterval = setInterval(updateUI, 250);
    } else {
        playPauseBtn.textContent = '▶️';
        clearInterval(subtitleInterval);
    }
}

// --- FUNCIONES DE LA LÓGICA DE LA APLICACIÓN ---

// Carga un podcast en el reproductor
function loadPodcast(podcast) {
    if (!isPlayerReady) {
        console.error("El reproductor de YouTube aún no está listo.");
        alert("El reproductor de YouTube todavía está cargando, por favor espera un momento.");
        return;
    }
    currentPodcast = podcast;
    podcastTitle.textContent = podcast.title;
    podcastArtist.textContent = podcast.artist;
    player.cueVideoById(podcast.videoId); // Prepara el video
    subtitlesEl.textContent = '...';
    progressBar.style.width = '0%';
    playPauseBtn.textContent = '▶️';
}

// Muestra la lista de podcasts en la página
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

// Actualiza la barra de progreso y los subtítulos
function updateUI() {
    if (!currentPodcast || !isPlayerReady || typeof player.getCurrentTime !== 'function' || player.getPlayerState() !== YT.PlayerState.PLAYING) return;
    
    const currentTime = player.getCurrentTime();
    const duration = player.getDuration();

    if (duration > 0) {
        progressBar.style.width = `${(currentTime / duration) * 100}%`;
    }

    // Actualizar subtítulos
    const activeSubtitle = currentPodcast.subtitles.find(sub => currentTime >= sub[0] && currentTime <= sub[1]);
    if (activeSubtitle) {
        if (subtitlesEl.textContent !== activeSubtitle[2]) {
            subtitlesEl.textContent = activeSubtitle[2];
            subtitlesEl.classList.add('active');
        }
    } else {
        subtitlesEl.classList.remove('active');
    }
}

// Configura todos los event listeners de los botones y la barra
function setupEventListeners() {
    genreFiltersEl.addEventListener('click', (e) => {
        if (e.target.tagName === 'BUTTON') {
            document.querySelector('.filter-btn.active').classList.remove('active');
            e.target.classList.add('active');
            displayPodcasts(e.target.dataset.genre);
        }
    });

    playPauseBtn.addEventListener('click', () => {
        if (!currentPodcast || !isPlayerReady) return;
        const playerState = player.getPlayerState();
        if (playerState === YT.PlayerState.PLAYING) {
            player.pauseVideo();
        } else {
            player.playVideo();
        }
    });
    
    progressBarContainer.addEventListener('click', (e) => {
        if (!currentPodcast || !isPlayerReady) return;
        const duration = player.getDuration();
        if (duration > 0) {
            const containerWidth = progressBarContainer.offsetWidth;
            const clickX = e.offsetX;
            const seekTime = (clickX / containerWidth) * duration;
            player.seekTo(seekTime, true);
        }
    });
}