// updateAllMovieDurations.js

const axios = require('axios');
const mongoose = require('mongoose');

// MongoDB connection URI
const mongoURI = 'mongodb+srv://vibudesh:040705@cluster0.bojv6ut.mongodb.net/Movie'; // Replace with your MongoDB URI

// TMDB API key
const TMDB_API_KEY = '9d45d63b1b0d8f428fdff75018aa813f'; // Replace with your TMDB API key

// Define your movie schema (only if you haven't done this already in your main app)
const movieSchema = new mongoose.Schema({
  title: { type: String, required: true },
  year: { type: String, required: true },
  image: { type: String, required: true },
  id: { type: Number, required: true, unique: true },
  tmdbRating: { type: Number, required: true },
  duration: { type: Number }, // Duration in minutes
  // Add other fields if necessary
});

const Movie = mongoose.model('movie_details', movieSchema);

// Function to fetch movie details and handle retries
async function fetchMovieDurationByTitle(title, retries = 3) {
  try {
    const response = await axios.get(`https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(title)}&language=ta`);
    
    if (response.data.results.length === 0) {
      console.log(`No results found for title: "${title}"`);
      return null; // No movie found with the given title
    }

    // Assuming you want the first result
    const movieData = response.data.results[0];
    return movieData.runtime; // Return the duration (runtime)
  } catch (error) {
    if (retries > 0) {
      console.log(`Error fetching duration for title "${title}". Retrying... (${retries} retries left)`);
      return fetchMovieDurationByTitle(title, retries - 1); // Retry
    } else {
      console.error(`Failed to fetch duration for title "${title}" after multiple attempts:`, error.message);
      return null; // Return null if all retries fail
    }
  }
}

// Main function to update all movie durations
async function updateAllMovieDurations() {
  try {
    // Connect to MongoDB
    await mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to MongoDB');

    // Fetch all movies from the database
    const movies = await Movie.find({});
    console.log(`Found ${movies.length} movies in the database.`);

    for (const movie of movies) {
      const duration = await fetchMovieDurationByTitle(movie.title);

      // If duration is not found, log and continue to the next movie
      if (duration === "Duration not found after retries") {
        console.log(`Duration not found for movie titled "${movie.title}". No updates made.`);
        continue; // Skip to the next movie
      }

      // Update the movie's duration in MongoDB
      const updatedMovie = await Movie.updateOne(
        { title: movie.title }, // Find the movie by title
        { duration }, // Update only duration
        { new: true }
      );

      if (updatedMovie.nModified > 0) {
        console.log(`Updated movie duration for "${movie.title}": ${duration} minutes`);
      } else {
        console.log(`No movie found with title "${movie.title}"`);
      }
    }
  } catch (error) {
    console.error('Error updating movie durations:', error.message);
  } finally {
    // Close the MongoDB connection
    await mongoose.disconnect();
  }
}

// Call the function to update all movie durations
updateAllMovieDurations();
