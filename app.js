// --- VARIABLES GLOBALES ---
let player;
let isPlayerReady = false;
let currentPodcast = null;
let subtitleInterval;

// --- BASE DE DATOS DE PODCASTS (sin cambios) ---
const podcasts = [
    { id: 1, title: '¿Qué hay dentro de un Agujero Negro?', artist: 'Dot CSV', genre: 'ciencia', videoId: 'sWso_g5yS2E', subtitles: [ [2.5, 6.8, "Los agujeros negros son los objetos más misteriosos y fascinantes del universo."], [7, 11, "Su gravedad es tan fuerte que ni siquiera la luz puede escapar."], [11.5, 15, "Pero, ¿qué pasaría si pudieras viajar dentro de uno?"], [15.5, 19, "En su frontera, el horizonte de sucesos, el tiempo se deforma."] ] },
    { id: 2, title: 'Cómo aprendí a programar', artist: 'midudev', genre: 'desarrollo', videoId: 'g2LpL8Jj0_Y', subtitles: [ [5, 8.5, "Mucha gente me pregunta cómo pueden aprender a programar."], [9, 13, "Y la verdad es que no hay una única respuesta correcta para todos."], [13.5, 18, "Pero sí que hay algunas cosas que a mí personalmente me sirvieron muchísimo."], [18.5, 21, "La primera, sin duda, es la constancia."] ] },
    { id: 3, title: 'La Historia de la Amistad | Toy Story', artist: 'El Temach', genre: 'analisis', videoId: 'JkAXz6v_4-I', subtitles: [ [6, 9, "Bienvenidos a una edición más del Temach Vlog."], [10, 16, "Es donde analizamos películas, series, canciones y conceptos."], [25, 30, "Hoy vamos a hablar de Toy Story, la historia sobre la amistad."], [31, 34, "La amistad que se desarrolla de dos vatos que se odiaban."], [38, 43, "Esta película es gangsta, mi compa. El vato lo aventó por la ventana."], [43, 49, "Pero después descubrieron que podían ser compas y que juntos podían lograr más."] ] }
];

// --- ELEMENTOS DEL DOM ---
const podcastTitle = document.getElementById('podcast-title');
const podcastArtist = document.getElementById('podcast-artist');
const subtitlesEl = document.getElementById('subtitles');
const podcastListEl = document.getElementById('podcast-list');
const genreFiltersEl = document.getElementById('genre-filters');

// --- INICIALIZACIÓN ---
document.addEventListener('DOMContentLoaded', () => {
    displayPodcasts('all');
    setupEventListeners();
});

// --- FUNCIONES DE LA API DE YOUTUBE ---
function onYouTubeIframeAPIReady() {
    // CAMBIO: Ahora nos "enganchamos" al iframe que ya existe en el HTML
    player = new YT.Player('youtube-player-iframe', {
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
        }
    });
}

function onPlayerReady(event) {
    isPlayerReady = true;
    console.log("Reproductor de YouTube listo y enlazado al iframe.");
}

function onPlayerStateChange(event) {
    if (event.data == YT.PlayerState.PLAYING) {
        subtitleInterval = setInterval(updateUI, 250);
    } else {
        clearInterval(subtitleInterval);
    }
}

// --- LÓGICA DE LA APLICACIÓN ---
function loadAndPlayPodcast(podcast) {
    if (!isPlayerReady) {
        alert("El reproductor de YouTube todavía está cargando. Por favor, espera un momento.");
        return;
    }
    currentPodcast = podcast;
    podcastTitle.textContent = podcast.title;
    podcastArtist.textContent = podcast.artist;
    
    // CAMBIO: Ahora usamos loadVideoById. Esto cargará y reproducirá el video.
    player.loadVideoById({videoId: podcast.videoId});
    
    subtitlesEl.textContent = 'Cargando subtítulos...';
}

function displayPodcasts(filter = 'all') {
    podcastListEl.innerHTML = '';
    const filteredPodcasts = podcasts.filter(p => filter === 'all' || p.genre === filter);
    
    filteredPodcasts.forEach(podcast => {
        const listItem = document.createElement('li');
        listItem.className = 'podcast-item';
        listItem.innerHTML = `<div class="podcast-item-info"><h4>${podcast.title}</h4><p>${podcast.artist}</p></div><span class="play-icon">▶️</span>`;
        listItem.addEventListener('click', () => loadAndPlayPodcast(podcast));
        podcastListEl.appendChild(listItem);
    });
}

function updateUI() {
    if (!currentPodcast || typeof player.getCurrentTime !== 'function') return;

    const currentTime = player.getCurrentTime();
    
    const activeSubtitle = currentPodcast.subtitles.find(sub => currentTime >= sub[0] && currentTime <= sub[1]);
    if (activeSubtitle) {
        if (subtitlesEl.textContent !== activeSubtitle[2]) {
            subtitlesEl.textContent = activeSubtitle[2];
            subtitlesEl.classList.add('active');
        }
    } else {
        if (subtitlesEl.classList.contains('active')) {
             subtitlesEl.classList.remove('active');
        }
    }
}

function setupEventListeners() {
    genreFiltersEl.addEventListener('click', (e) => {
        if (e.target.tagName === 'BUTTON') {
            document.querySelector('.filter-btn.active').classList.remove('active');
            e.target.classList.add('active');
            displayPodcasts(e.target.dataset.genre);
        }
    });
}