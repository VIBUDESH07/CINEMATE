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
  useUnifiedTopology: true
})
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.log('MongoDB connection error:', err));

// Use the existing 'movie_details' collection
const Movie = mongoose.connection.collection('movie');
app.get('/api/movies/mongodb/:id', async (req, res) => {
  const { id } = req.params;

  try {
    // Find the movie by ID in the MongoDB collection
    const movie = await Movie.find({ id: parseInt(id) }).toArray(); // Ensure ID is an integer

    if (movie.length === 0) {
      return res.status(404).json({ message: 'Movie not found' });
    }

    res.json(movie[0]); // Return the first matching movie
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Route to fetch movies with search functionality
app.get('/api/movies/mongodb', async (req, res) => {
  const { search } = req.query;
  let query = {};

  // If search term is provided, filter by title, hero, heroine, or genre
  if (search) {
    const regex = new RegExp(search, 'i'); // case-insensitive regex
    query = {
      $or: [
        { title: regex },
        { hero: regex },
        { heroine: regex },
        { genres: regex }
      ]
    };
  }

  try {
    const movies = await Movie.find(query).toArray();
    res.json(movies);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Fetch detailed Tamil movies from TMDb API and insert into MongoDB
const fetchMovieDetails = async (movieId) => {
  try {
    const movieDetailResponse = await axios.get(`https://api.themoviedb.org/3/movie/${movieId}`, {
      params: {
        api_key: '9d45d63b1b0d8f428fdff75018aa813f',
        append_to_response: 'credits,videos,external_ids'
      }
    });

    const movieData = movieDetailResponse.data;

    // Extracting trailer URL
    const trailer = movieData.videos.results.find(video => video.type === 'Trailer' && video.site === 'YouTube')?.key;
    const trailerUrl = trailer ? `https://www.youtube.com/watch?v=${trailer}` : null;

    // Extracting cast information
    const cast = movieData.credits.cast.slice(0, 10).map(actor => actor.name); // Limit to top 10 actors

    return {
      title: movieData.title,
      releaseDate: movieData.release_date,
      genres: movieData.genres.map(genre => genre.name),
      description: movieData.overview,
      image: `https://image.tmdb.org/t/p/w500${movieData.poster_path}`,
      hero: cast.length > 0 ? cast[0] : "Unknown",
      heroine: cast.length > 1 ? cast[1] : "Unknown",
      cast: cast,
      trailer: trailerUrl,
      imdbRating: movieData.external_ids.imdb_id ? await fetchIMDBRating(movieData.external_ids.imdb_id) : null,
      tmdbRating: movieData.vote_average,
      id: movieData.id,
      duration: `${movieData.runtime} mins`,
    };
  } catch (error) {
    console.error('Error fetching movie details:', error.message);
    return null;
  }
};

// Fetch IMDb rating from OMDb API (if needed)
const fetchIMDBRating = async (imdbId) => {
  try {
    const omdbResponse = await axios.get(`https://www.omdbapi.com/`, {
      params: {
        apikey: ' 22c192c5', // Replace with your OMDb API key
        i: imdbId
      }
    });
    return omdbResponse.data.imdbRating || null;
  } catch (error) {
    console.error('Error fetching IMDb rating:', error.message);
    return null;
  }
};

// Fetch Tamil movies from TMDb API and insert into MongoDB
const fetchAndInsertMovies = async () => {
  try {
    // Fetch the movies that were released today from TMDb (Tamil movies only)
    const today = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
    const tmdbResponse = await axios.get(`https://api.themoviedb.org/3/discover/movie`, {
      params: {
        api_key: '9d45d63b1b0d8f428fdff75018aa813f',
        primary_release_date: today,
        with_original_language: 'ta', // Fetch only Tamil movies
        region: 'IN' // Set region to India
      }
    });

    const movies = tmdbResponse.data.results;

    const bulkOps = [];

    // Fetch detailed movie info for each movie and prepare bulk operations to insert into MongoDB
    for (const movie of movies) {
      const detailedMovie = await fetchMovieDetails(movie.id);

      if (detailedMovie) {
        bulkOps.push({
          updateOne: {
            filter: { id: movie.id }, // Ensure the movie is not duplicated
            update: {
              $setOnInsert: detailedMovie
            },
            upsert: true
          }
        });
      }
    }

    // Execute the bulk insert
    if (bulkOps.length > 0) {
      await Movie.bulkWrite(bulkOps);
      console.log('Tamil movies with details inserted into MongoDB successfully');
    }
  } catch (error) {
    console.error('Error fetching or inserting movies:', error.message);
  }
};

// Schedule the job to run at 8 AM every day
cron.schedule('0 8 * * *', async () => {
  console.log('Running scheduled job to fetch and insert Tamil movies with details...');
  await fetchAndInsertMovies();
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
