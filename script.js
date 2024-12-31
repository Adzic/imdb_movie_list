async function fetchAllLists(profileUrl) {
    try {
        console.log("Fetching lists from IMDb user profile...");
        const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(profileUrl)}`);
        const data = await response.json();
        const parser = new DOMParser();
        const doc = parser.parseFromString(data.contents, 'text/html');

        const listLinks = doc.querySelectorAll("a[href*='/list/']");
        const listUrls = Array.from(listLinks).map(link => `https://www.imdb.com${link.getAttribute('href')}`);
        const uniqueUrls = [...new Set(listUrls)]; // Remove duplicates
        console.log("Found lists:", uniqueUrls);
        return uniqueUrls;
    } catch (error) {
        console.error('Error fetching lists:', error);
        return [];
    }
}

async function fetchMoviesFromList(listUrl) {
    try {
        console.log(`Fetching movies from list: ${listUrl}`);
        const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(listUrl)}`);
        const data = await response.json();
        const parser = new DOMParser();
        const doc = parser.parseFromString(data.contents, 'text/html');

        const movies = [];
        const movieElements = doc.querySelectorAll('.lister-item');

        movieElements.forEach((element) => {
            const titleElement = element.querySelector('.lister-item-header a');
            const genreElement = element.querySelector('.genre');
            const yearElement = element.querySelector('.lister-item-year');

            const title = titleElement ? titleElement.textContent.trim() : 'Unknown';
            const genre = genreElement ? genreElement.textContent.trim() : 'Unknown';
            const year = yearElement ? yearElement.textContent.match(/\d{4}/) : 'Unknown';

            movies.push({ title, genre, year });
        });

        console.log(`Movies in list (${listUrl}):`, movies);
        return movies;
    } catch (error) {
        console.error('Error fetching movies:', error);
        return [];
    }
}

document.getElementById('fetchLists').addEventListener('click', async () => {
    const profileUrl = 'https://www.imdb.com/user/ur14323971/lists/';
    const listUrls = await fetchAllLists(profileUrl);

    const allMovies = [];
    for (const url of listUrls) {
        const movies = await fetchMoviesFromList(url);
        allMovies.push(...movies);
    }

    console.log("All Movies:", allMovies);
    displayMovies(allMovies);
    generateCharts(allMovies);
});

function displayMovies(movies) {
    const movieContainer = document.getElementById('movieContainer');
    movieContainer.innerHTML = '';

    movies.forEach((movie) => {
        const movieDiv = document.createElement('div');
        movieDiv.className = 'movie';
        movieDiv.innerHTML = `
            <h2>${movie.title}</h2>
            <p>Genre: ${movie.genre}</p>
            <p>Year: ${movie.year}</p>
        `;
        movieContainer.appendChild(movieDiv);
    });
}

function generateCharts(movies) {
    const genreCounts = {};
    const yearCounts = {};

    movies.forEach(({ genre, year }) => {
        const genres = genre.split(', ');
        genres.forEach(g => {
            genreCounts[g] = (genreCounts[g] || 0) + 1;
        });

        if (year !== 'Unknown') {
            yearCounts[year] = (yearCounts[year] || 0) + 1;
        }
    });

    const genreCtx = document.getElementById('genreChart').getContext('2d');
    new Chart(genreCtx, {
        type: 'pie',
        data: {
            labels: Object.keys(genreCounts),
            datasets: [{
                data: Object.values(genreCounts),
                backgroundColor: [
                    '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'
                ]
            }]
        }
    });

    const yearCtx = document.getElementById('yearChart').getContext('2d');
    new Chart(yearCtx, {
        type: 'bar',
        data: {
            labels: Object.keys(yearCounts),
            datasets: [{
                label: 'Movies by Year',
                data: Object.values(yearCounts),
                backgroundColor: '#36A2EB'
            }]
        }
    });
}
