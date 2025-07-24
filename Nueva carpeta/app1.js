document.addEventListener('DOMContentLoaded', () => {

    // --- BASE DE DATOS DE PODCASTS ---
    // En una aplicación real, esto vendría de un servidor.
    // El formato de los subtítulos es: [tiempo_inicio_en_segundos, tiempo_fin, "texto"]
    const podcasts = [
        {
            id: 1,
            title: 'Toy Story - Analizando películas - El TemachVlog CAP55',
            artist: 'Temach',
            genre: 'tecnologia',
            src: 'audio/podcast1.mp3',
            subtitles: [
                [1, 5, "Hola y bienvenidos a Tech Talks."],
                [5, 9, "Hoy vamos a hablar sobre el futuro de la inteligencia artificial."],
                [9, 13, "Un tema que está en boca de todos."],
                [14, 18, "Los avances recientes son simplemente asombrosos."]
            ]
        },
        {
            id: 2,
            title: 'La Ciudad Perdida',
            artist: 'Aventuras Sonoras',
            genre: 'historias',
            src: 'audio/podcast2.mp3',
            subtitles: [
                [2, 6, "En el corazón de la jungla, se ocultaba una leyenda."],
                [7, 11, "La leyenda de la ciudad perdida de Z."],
                [12, 16, "Muchos exploradores la buscaron, pero pocos regresaron."]
            ]
        },
        {
            id: 3,
            title: 'Chistes y Anécdotas',
            artist: 'Risas Garantizadas',
            genre: 'comedia',
            src: 'audio/podcast3.mp3',
            subtitles: [
                [1, 4, "¿Saben por qué los pájaros no usan Facebook?"],
                [5, 8, "¡Porque ya tienen Twitter!"],
                [9, 13, "Ahora en serio, les contaré una anécdota del otro día..."]
            ]
        }
    ];

    // --- ELEMENTOS DEL DOM ---
    const audioPlayer = document.getElementById('audio-player');
    const podcastTitle = document.getElementById('podcast-title');
    const podcastArtist = document.getElementById('podcast-artist');
    const subtitlesEl = document.getElementById('subtitles');
    const podcastList = document.getElementById('podcast-list');
    const genreFilters = document.getElementById('genre-filters');

    let currentPodcast = null;
    let currentSubtitleIndex = -1;

    // --- FUNCIONES ---

    /**
     * Carga y reproduce un podcast seleccionado.
     * @param {object} podcast - El objeto del podcast a reproducir.
     */
    function loadPodcast(podcast) {
        currentPodcast = podcast;
        podcastTitle.textContent = podcast.title;
        podcastArtist.textContent = podcast.artist;
        audioPlayer.src = podcast.src;
        audioPlayer.play();
        subtitlesEl.textContent = '...'; // Reinicia subtítulos
    }

    /**
     * Muestra la lista de podcasts en la UI, opcionalmente filtrada por género.
     * @param {string} filter - El género por el cual filtrar ('all' para todos).
     */
    function displayPodcasts(filter = 'all') {
        podcastList.innerHTML = ''; // Limpia la lista actual
        const filteredPodcasts = podcasts.filter(p => filter === 'all' || p.genre === filter);

        if (filteredPodcasts.length === 0) {
            podcastList.innerHTML = '<p>No hay episodios en esta categoría.</p>';
            return;
        }

        filteredPodcasts.forEach(podcast => {
            const listItem = document.createElement('li');
            listItem.className = 'podcast-item';
            listItem.innerHTML = `
                <div class="podcast-item-info">
                    <h4>${podcast.title}</h4>
                    <p>${podcast.artist}</p>
                </div>
                <span>▶️</span>
            `;
            // Añade evento para reproducir al hacer clic
            listItem.addEventListener('click', () => loadPodcast(podcast));
            podcastList.appendChild(listItem);
        });
    }

    /**
     * Actualiza el subtítulo que se muestra en pantalla basado en el tiempo actual del audio.
     */
    function updateSubtitles() {
        if (!currentPodcast) return;

        const currentTime = audioPlayer.currentTime;
        const subtitles = currentPodcast.subtitles;

        // Busca el subtítulo correcto para el tiempo actual
        const activeSubtitle = subtitles.find(sub => currentTime >= sub[0] && currentTime <= sub[1]);

        if (activeSubtitle) {
            // Muestra el nuevo subtítulo si es diferente al anterior
            if (subtitles.indexOf(activeSubtitle) !== currentSubtitleIndex) {
                subtitlesEl.textContent = activeSubtitle[2];
                subtitlesEl.classList.add('active');
                currentSubtitleIndex = subtitles.indexOf(activeSubtitle);
            }
        } else {
            // Si no hay subtítulo, limpia el texto y la clase activa
            if (currentSubtitleIndex !== -1) {
                subtitlesEl.classList.remove('active');
                // Opcional: mantener el último subtítulo visible un momento más
                // O limpiar inmediatamente: subtitlesEl.textContent = '...';
                currentSubtitleIndex = -1;
            }
        }
    }


    // --- EVENT LISTENERS ---

    // Listener para el cambio de tiempo en el reproductor de audio
    audioPlayer.addEventListener('timeupdate', updateSubtitles);

    // Listener para los botones de filtro de género
    genreFilters.addEventListener('click', (e) => {
        if (e.target.tagName === 'BUTTON') {
            // Actualiza el botón activo
            document.querySelector('.filter-btn.active').classList.remove('active');
            e.target.classList.add('active');
            
            // Muestra los podcasts filtrados
            displayPodcasts(e.target.dataset.genre);
        }
    });


    // --- INICIALIZACIÓN ---
    // Muestra todos los podcasts al cargar la página por primera vez
    displayPodcasts();
});