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

// Use the existing 'movie_list' collection
const Movie = mongoose.connection.collection('movie_details');

// Route to fetch movie details by ID
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

// Fetch movies from TMDb API and insert into MongoDB
const fetchAndInsertMovies = async () => {
  try {
    // Fetch the movies that were released today from TMDb
    const today = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
    const tmdbResponse = await axios.get(`https://api.themoviedb.org/3/discover/movie`, {
      params: {
        api_key: '9d45d63b1b0d8f428fdff75018aa813f',
        primary_release_date: today,
      }
    });

    const movies = tmdbResponse.data.results;

    const bulkOps = [];

    // Prepare bulk operations to insert each movie into MongoDB
    for (const movie of movies) {
      bulkOps.push({
        updateOne: {
          filter: { id: movie.id }, // Ensure the movie is not duplicated
          update: {
            $setOnInsert: {
              title: movie.title,
              release_date: movie.release_date,
              genres: movie.genre_ids, // This will store the genre IDs
              overview: movie.overview,
              image: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
              id: movie.id,
            }
          },
          upsert: true
        }
      });
    }

    // Execute the bulk insert
    if (bulkOps.length > 0) {
      await Movie.bulkWrite(bulkOps);
      console.log('Movies inserted into MongoDB successfully');
    }
  } catch (error) {
    console.error('Error fetching or inserting movies:', error.message);
  }
};

// Schedule the job to run at 8 AM every day
cron.schedule('0 8 * * *', async () => {
  console.log('Running scheduled job to fetch and insert movies...');
  await fetchAndInsertMovies();
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
