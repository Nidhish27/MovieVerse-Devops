// ============================
// MovieVerse
// Replace with your TMDb API Key
// ============================

const API_KEY = "2c480a9005fbd33f2d640c79f2819def";

const BASE = "https://api.themoviedb.org/3";
const IMG = "https://image.tmdb.org/t/p/w500";
const HERO = "https://image.tmdb.org/t/p/original";

// ============================
// Fetch Movies
// ============================

async function fetchMovies(endpoint) {
    try {
        const response = await fetch(
            `${BASE}${endpoint}?api_key=${API_KEY}`
        );

        const data = await response.json();

        return data.results || [];

    } catch (error) {

        console.error(error);

        return [];

    }
}

// ============================
// Movie Card
// ============================

function createCard(movie) {

    const favorites = JSON.parse(localStorage.getItem("favorites")) || [];
    const isFavorite = favorites.includes(movie.id);

    return `

    <div class="card">

        <img
            src="${IMG}${movie.poster_path}"
            alt="${movie.title}"
        >

        <div class="info">

            <h3>${movie.title}</h3>

            <p>⭐ ${movie.vote_average.toFixed(1)}</p>

            <p>${movie.release_date || "N/A"}</p>

            <button onclick="watchTrailer('${movie.title}')">
                ▶ Watch Trailer
            </button>

            <button
                class="${isFavorite ? 'favorite-active' : ''}"
                onclick="toggleFavorite(${movie.id}, this)">
                ❤️ Favorite
            </button>

            <button
                onclick="openReview(${movie.id}, '${movie.title.replace(/'/g, "\\'")}')">
                ⭐ Review
            </button>

        </div>

    </div>

    `;

}

// ============================
// Hero Banner
// ============================

async function loadHero() {

    const movies = await fetchMovies("/trending/movie/week");

    if (!movies.length) return;

    const movie = movies[0];

    document.getElementById("hero").style.backgroundImage =
        `url(${HERO}${movie.backdrop_path})`;

    document.getElementById("heroTitle").textContent =
        movie.title;

    document.getElementById("heroOverview").textContent =
        movie.overview;

    document.getElementById("heroRating").textContent =
        `⭐ ${movie.vote_average.toFixed(1)}`;

    document.getElementById("heroDate").textContent =
        movie.release_date;

}

// ============================
// Load Movie Section
// ============================

async function loadSection(id, endpoint) {

    const container = document.getElementById(id);

    const movies = await fetchMovies(endpoint);

    container.innerHTML = "";

    movies.slice(0, 12).forEach(movie => {

        container.innerHTML += createCard(movie);

    });

}

// ============================
// Search
// ============================

async function searchMovies() {

    const query =
        document.getElementById("search").value.trim();

    if (!query) {

        document.getElementById("results").innerHTML = "";

        return;

    }

    const response = await fetch(

        `${BASE}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}`

    );

    const data = await response.json();

    const results =
        document.getElementById("results");

    results.innerHTML = "";

    data.results.forEach(movie => {

        results.innerHTML += createCard(movie);

    });

}

// ============================
// Trailer
// ============================

function watchTrailer(title) {

    window.open(

        `https://www.youtube.com/results?search_query=${encodeURIComponent(title + " official trailer")}`,

        "_blank"

    );

}

// ============================
// Events
// ============================

document
    .getElementById("searchBtn")
    .addEventListener("click", searchMovies);

document
    .getElementById("search")
    .addEventListener("keypress", function (e) {

        if (e.key === "Enter") {

            searchMovies();

        }

    });

// ============================
// Start Website
// ============================

loadHero();

loadSection(
    "trending",
    "/trending/movie/week"
);

loadSection(
    "toprated",
    "/movie/top_rated"
);

loadSection(
    "upcoming",
    "/movie/upcoming"
);

// =====================================
// FAVORITES
// =====================================

function toggleFavorite(movieId, button) {

    let favorites =
        JSON.parse(localStorage.getItem("favorites")) || [];

    if (favorites.includes(movieId)) {

        favorites = favorites.filter(id => id !== movieId);

        button.classList.remove("favorite-active");

    } else {

        favorites.push(movieId);

        button.classList.add("favorite-active");

    }

    localStorage.setItem(
        "favorites",
        JSON.stringify(favorites)
    );

}

// =====================================
// REVIEW SYSTEM
// =====================================

let selectedMovie = null;
let selectedRating = 5;

const reviewModal =
    document.getElementById("reviewModal");

const reviewTitle =
    document.getElementById("reviewMovieTitle");

const reviewText =
    document.getElementById("reviewText");

const allReviews =
    document.getElementById("allReviews");

document
    .getElementById("closeReview")
    .onclick = () => {

        reviewModal.style.display = "none";

};

window.onclick = function(e){

    if(e.target===reviewModal){

        reviewModal.style.display="none";

    }

}

// Star Selection

document.querySelectorAll(".star").forEach(star => {

    star.onclick = function () {

        selectedRating = Number(this.dataset.value);

        document.querySelectorAll(".star").forEach((s,index)=>{

            s.style.opacity =
                index < selectedRating ? "1" : ".35";

        });

    };

});

// Open Review

function openReview(movieId, movieTitle){

    selectedMovie = movieId;

    reviewTitle.textContent = movieTitle;

    reviewModal.style.display = "flex";

    reviewText.value = "";

    loadReviews();

}

// Save Review

document
.getElementById("saveReview")
.onclick=function(){

    const text = reviewText.value.trim();

    if(text===""){

        alert("Please write a review.");

        return;

    }

    let reviews =
        JSON.parse(localStorage.getItem("reviews")) || {};

    if(!reviews[selectedMovie]){

        reviews[selectedMovie]=[];

    }

    reviews[selectedMovie].push({

        stars:selectedRating,

        text:text,

        date:new Date().toLocaleDateString()

    });

    localStorage.setItem(

        "reviews",

        JSON.stringify(reviews)

    );

    reviewText.value="";

    loadReviews();

}

// Load Reviews

function loadReviews(){

    let reviews =
        JSON.parse(localStorage.getItem("reviews")) || {};

    const movieReviews =
        reviews[selectedMovie] || [];

    allReviews.innerHTML="";

    if(movieReviews.length===0){

        allReviews.innerHTML=
        "<p>No reviews yet.</p>";

        return;

    }

    movieReviews.forEach(review=>{

        allReviews.innerHTML += `

        <div class="review">

            <h3>${"⭐".repeat(review.stars)}</h3>

            <p>${review.text}</p>

            <small>${review.date}</small>

        </div>

        `;

    });

}