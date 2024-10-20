const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const axios = require('axios');
const cron = require('node-cron');

const app = express();
app.use(cors());

// MongoDB connection
mongoose.connect('mongodb+srv://vibudesh:040705@cluster0.bojv6ut.mongodb.net/Movie', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.log('MongoDB connection error:', err));

// Use the existing 'movie_details' collection
const Movie = mongoose.connection.collection('movie_details');

// Function to fetch details of newly released movies from TMDb
async function fetchAndStoreMovies() {
  try {
    // Fetch movies released today
    const today = new Date().toISOString().split('T')[0]; // Format date as 'YYYY-MM-DD'
    const tmdbResponse = await axios.get(`https://api.themoviedb.org/3/discover/movie`, {
      params: {
        api_key: '9d45d63b1b0d8f428fdff75018aa813f',
        primary_release_date: today, // Fetch today's releases
        language: 'ta' // Fetch Tamil movies
      }
    });

    const movies = tmdbResponse.data.results;

    for (const movie of movies) {
      const movieId = movie.id;
      // Fetch additional movie details
      const detailsResponse = await axios.get(`https://api.themoviedb.org/3/movie/${movieId}`, {
        params: { api_key: '9d45d63b1b0d8f428fdff75018aa813f', append_to_response: 'videos,credits' }
      });

      const movieDetails = detailsResponse.data;

      // Prepare movie data for MongoDB
      const movieData = {
        title: movieDetails.title,
        year: new Date(movieDetails.release_date).getFullYear(),
        releaseDate: movieDetails.release_date,
        image: `https://image.tmdb.org/t/p/w500${movieDetails.poster_path}`,
        id: movieDetails.id,
        genres: movieDetails.genres.map((genre) => genre.name),
        hero: movieDetails.credits.cast.find((person) => person.known_for_department === 'Acting')?.name || 'Unknown',
        heroine: movieDetails.credits.cast.find((person) => person.gender === 1)?.name || 'Unknown',
        description: movieDetails.overview,
        trailer: movieDetails.videos.results.find((video) => video.type === 'Trailer')?.key ? 
          `https://www.youtube.com/watch?v=${movieDetails.videos.results.find((video) => video.type === 'Trailer').key}` : null,
        imdbRating: null, // To be fetched separately if needed
        tmdbRating: movieDetails.vote_average,
        cast: movieDetails.credits.cast.slice(0, 10).map((actor) => actor.name), // Top 10 cast members
        duration: movieDetails.runtime ? `${movieDetails.runtime} min` : 'Duration not found',
        translatedTitle: movieDetails.original_title,
        screenshots: [] // Can be added if needed
      };

      // Upsert (insert or update) movie in MongoDB
      await Movie.updateOne(
        { id: movieDetails.id }, // Use TMDb movie ID for matching
        { $set: movieData },
        { upsert: true }
      );

      console.log(`Stored movie: ${movieDetails.title}`);
    }
  } catch (error) {
    console.error('Error fetching or storing movies:', error.message);
  }
}

// Schedule the task to run daily at 8 AM
cron.schedule('0 8 * * *', fetchAndStoreMovies, {
  scheduled: true,
  timezone: 'Asia/Kolkata' // Set the appropriate timezone
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

