/// --- VARIABLES GLOBALES ---
let player;
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
        videoId: 'JkAXz6v_4-I',
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


// --- INICIALIZACIÓN DE LA API DE YOUTUBE ---
function onYouTubeIframeAPIReady() {
    player = new YT.Player('youtube-player', {
        height: '0',
        width: '0',
        playerVars: {
            // Asegúrate de que esta URL sea EXACTAMENTE la de tu página de GitHub
            'origin': 'https://ariansara.github.io'
        },
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
function onPlayerReady(event) {
    displayPodcasts('all');
    setupEventListeners();
}

function onPlayerStateChange(event) {
    if (event.data == YT.PlayerState.PLAYING) {
        playPauseBtn.textContent = '⏸️';
        subtitleInterval = setInterval(updateUI, 250);
    } else {
        playPauseBtn.textContent = '▶️';
        clearInterval(subtitleInterval);
    }
}

function loadPodcast(podcast) {
    currentPodcast = podcast;
    podcastTitle.textContent = podcast.title;
    podcastArtist.textContent = podcast.artist;
    player.cueVideoById(podcast.videoId);
    subtitlesEl.textContent = '...';
    progressBar.style.width = '0%';
    playPauseBtn.textContent = '▶️';
}

function updateUI() {
    if (!currentPodcast || !player.getCurrentTime || player.getPlayerState() !== YT.PlayerState.PLAYING) return;
    const currentTime = player.getCurrentTime();
    const duration = player.getDuration();
    if (duration > 0) {
        const progressPercent = (currentTime / duration) * 100;
        progressBar.style.width = `${progressPercent}%`;
    }
    updateSubtitles(currentTime);
}

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

function setupEventListeners() {
    genreFiltersEl.addEventListener('click', (e) => {
        if (e.target.tagName === 'BUTTON') {
            document.querySelector('.filter-btn.active').classList.remove('active');
            e.target.classList.add('active');
            displayPodcasts(e.target.dataset.genre);
        }
    });

    playPauseBtn.addEventListener('click', () => {
        if (!currentPodcast) return;
        const playerState = player.getPlayerState();
        if (playerState === YT.PlayerState.PLAYING) {
            player.pauseVideo();
        } else {
            player.playVideo();
        }
    });
    
    progressBarContainer.addEventListener('click', (e) => {
        if (!currentPodcast) return;
        const containerWidth = progressBarContainer.offsetWidth;
        const clickX = e.offsetX;
        const duration = player.getDuration();
        if (duration > 0) {
            const seekTime = (clickX / containerWidth) * duration;
            player.seekTo(seekTime, true);
        }
    });
}