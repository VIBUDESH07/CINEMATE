const axios = require('axios');
const mongoose = require('mongoose');

// MongoDB connection URI
const mongoURI = 'mongodb+srv://vibudesh:040705@cluster0.bojv6ut.mongodb.net/Movie'; // Replace with your MongoDB URI

// TMDb API Key
const TMDB_API_KEY = '9d45d63b1b0d8f428fdff75018aa813f'; // Replace with your TMDb API key

// Mongoose Schema definition for movies
const movieSchema = new mongoose.Schema({
  title: { type: String, required: true },
  year: { type: String, required: true },
  releaseDate: { type: Date, required: true },
  image: { type: String, required: true },
  id: { type: Number, required: true },
  genres: { type: [String], required: true },
  hero: { type: String },
  heroine: { type: String },
  description: { type: String },
  trailer: { type: String },
  reviews: { type: [String] },
  cast: { type: [String] },
  imdbRating: { type: Number },
  tmdbRating: { type: Number },
  translatedTitle: { type: String },
  duration: { type: String },
  whereToWatch: { type: String },
  screenshots: { type: [String] },
});

// Function to fetch movie details using TMDb API
async function fetchMovieDetails(movieId) {
  try {
    const response = await axios.get(`https://api.themoviedb.org/3/movie/${movieId}`, {
      params: {
        api_key: TMDB_API_KEY,
        language: 'en-US', // Adjust language if needed
        append_to_response: 'credits', // Append cast information
      },
    });

    const movieData = response.data;
    const overview = movieData.overview || 'Description not available.';

    // Extracting cast members
    const castMembers = movieData.credits.cast || [];
    const hero = castMembers.length > 0 ? castMembers[0].name : 'Unknown Hero'; // First cast member as hero
    const heroine = castMembers.length > 1 ? castMembers[1].name : 'Unknown Heroine'; // Second cast member as heroine
    const cast = castMembers.map(member => member.name); // All cast members

    return { overview, hero, heroine, cast };
  } catch (error) {
    console.error(`Error fetching movie details for ID "${movieId}":`, error.message);
    return { overview: 'Error fetching description', hero: null, heroine: null, cast: [] };
  }
}

// Function to search for a movie by title and fetch its description
async function fetchMovieDescriptionByTitle(movieTitle) {
  try {
    const searchResponse = await axios.get('https://api.themoviedb.org/3/search/movie', {
      params: {
        api_key: TMDB_API_KEY,
        query: movieTitle,
        language: 'en-US',
      },
    });

    const results = searchResponse.data.results;
    if (results.length > 0) {
      const movieId = results[0].id; // Get the first result's ID
      return await fetchMovieDetails(movieId); // Fetch the details for that movie ID
    } else {
      return { overview: 'Description not available.', hero: 'Unknown Hero', heroine: 'Unknown Heroine', cast: [] };
    }
  } catch (error) {
    console.error(`Error searching for movie "${movieTitle}":`, error.message);
    return { overview: 'Error fetching description', hero: null, heroine: null, cast: [] };
  }
}

// Function to update the description and cast for all movies in the specified collection
async function updateMovieDescriptions(Model) {
  try {
    // Fetch all movies from the database
    const movies = await Model.find();
    console.log(`Found ${movies.length} movies to update.`);

    // Iterate over each movie to fetch and update the description, hero, heroine, and cast
    for (const movie of movies) {
      const { overview, hero, heroine, cast } = await fetchMovieDescriptionByTitle(movie.title); // Fetch details using the movie title
      movie.description = overview; // Update the description field
      movie.hero = hero; // Update hero field
      movie.heroine = heroine; // Update heroine field
      movie.cast = cast; // Update cast field

      await movie.save(); // Save the updated movie
      console.log(`Updated details for movie: ${movie.title}`);
    }

    console.log('All descriptions and cast updated successfully for this language.');
  } catch (error) {
    console.error('Error updating descriptions:', error.message);
  }
}

// Main function to update descriptions and cast for all movies in each collection
async function updateDescriptionsForAllLanguages() {
  try {
    await mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to MongoDB');

    // Define the models for your collections
    const MovieTamil = mongoose.model('movie_tamils', movieSchema);
    const MovieHindi = mongoose.model('movie_hindis', movieSchema);
    const MovieTelugu = mongoose.model('movie_telugus', movieSchema);
    const MovieMalayalam = mongoose.model('movie_malayalams', movieSchema);
    const MovieKannada = mongoose.model('movie_kannadas', movieSchema);

    // Update descriptions for Tamil movies
    console.log('Updating descriptions for Tamil movies...');
    await updateMovieDescriptions(MovieTamil);

    // Update descriptions for Hindi movies
    console.log('Updating descriptions for Hindi movies...');
    await updateMovieDescriptions(MovieHindi);

    // Update descriptions for Telugu movies
    console.log('Updating descriptions for Telugu movies...');
    await updateMovieDescriptions(MovieTelugu);

    // Update descriptions for Malayalam movies
    console.log('Updating descriptions for Malayalam movies...');
    await updateMovieDescriptions(MovieMalayalam);

    // Update descriptions for Kannada movies
    console.log('Updating descriptions for Kannada movies...');
    await updateMovieDescriptions(MovieKannada);

    console.log('All descriptions and cast updated successfully for all languages.');
  } catch (error) {
    console.error('Error in updating descriptions:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Call the main function to start the description and cast update process
updateDescriptionsForAllLanguages();
