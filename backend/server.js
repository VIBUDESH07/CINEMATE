const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const axios = require('axios');
const cron = require('node-cron');

const app = express();
app.use(cors());
app.use(express.json()); // Middleware to parse JSON bodies

// MongoDB connection
mongoose.connect('mongodb+srv://vibudesh:040705@cluster0.bojv6ut.mongodb.net/Movie', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.log('MongoDB connection error:', err));

// Define the Movie model without a specific collection for general queries
const Movie = mongoose.model('Movie', new mongoose.Schema({}), 'movie');

// User Schema and Model
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  selectedLanguages: { type: [String], required: true },
  selectedArtists: { type: [String], default: [] },
  selectedGenres: { type: [String], default: [] }
});

const User = mongoose.model('User', userSchema);

// API Endpoint to save user data
app.post('/api/users', async (req, res) => {
  const { email, password, selectedArtists, selectedLanguages, selectedGenres } = req.body;
  console.log(email, password, selectedLanguages, selectedArtists, selectedGenres);
  
  try {
    const newUser = new User({ 
      email, 
      password, 
      selectedLanguages, 
      selectedArtists, 
      selectedGenres 
    });
    await newUser.save();
    res.status(201).send('User saved successfully');
  } catch (error) {
    if (error.code === 11000) { // Duplicate key error
      return res.status(409).send('Email already exists');
    }
    res.status(500).send('Error saving user data');
  }
});
app.get('/api/analyze', async (req, res) => {
  const { prompt } = req.query; // Get the prompt from the query parameters

  try {
    // Send a request to the Python API
    const response = await axios.get(`http://127.0.0.1:5000/analyze?prompt=${encodeURIComponent(prompt)}`);
    
    console.log(response.data)
    res.json(response.data);
  } catch (error) {
    console.error('Error calling Python API:', error.message);
    res.status(500).send('Error processing the prompt');
  }
});


// API Endpoint to get movies by user email
app.get('/api/users/:email', async (req, res) => {
  const email = req.params.email;

  try {
    // Fetch user based on the email
    const user = await User.findOne({ email });
    console.log('Fetched user:', user); // Debug log

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // User's selected genres, languages, and artists
    const selectedGenres = user.selectedGenres || [];
    const selectedLanguages = user.selectedLanguages || [];
    const selectedArtists = user.selectedArtists || [];
    
    console.log('Selected genres:', selectedGenres); // Debug log
    console.log('Selected languages:', selectedLanguages); // Debug log
    console.log('Selected artists:', selectedArtists); // Debug log

    // Map selected languages to their corresponding collections
    const collections = {
      Tamil: 'movie_tamils',
      Telugu: 'movie_telugus',
      Kannada: 'movie_kannadas',
      Malayalam: 'movie_malayalams',
      Hindi: 'movie_hindis'
    };

    // Filter collections to query based on the user's selected languages
    const collectionsToQuery = selectedLanguages.map(language => collections[language]).filter(Boolean);
    console.log('Collections to query:', collectionsToQuery); // Debug log

    // If no matching languages are selected, return an error
    if (collectionsToQuery.length === 0) {
      return res.status(400).json({ message: 'No movies with the specified language.' });
    }

    let allMovies = [];

    // Step 1: Query each collection based on the selected languages
    for (const collectionName of collectionsToQuery) {
      const movieCollection = mongoose.connection.collection(collectionName); // Access the collection directly
      
      // Query the movie collection for matching genres
      const filteredMovies = await movieCollection.find({
        genres: { $in: selectedGenres } // Check if genres match
      }).toArray();

       allMovies = allMovies.concat(filteredMovies);
         }

    // Step 4: If no movies match the genre, return movies matching only the language
    if (allMovies.length === 0) {
        for (const collectionName of collectionsToQuery) {
        const movieCollection = mongoose.connection.collection(collectionName); // Access the collection directly
        
        // Find all movies in the collection (language matched, ignoring genre)
        const fallbackMovies = await movieCollection.find().toArray();
          allMovies = allMovies.concat(fallbackMovies);
      }
    }

    // Step 5: If no movies were found, return a message
    if (allMovies.length === 0) {
      return res.status(400).json({ message: 'No movies found.' });
    }

    // Return the user details along with the filtered movies
    res.json({
      user,
      movies: allMovies
    });

  } catch (error) {
    console.error('Error fetching user or movies:', error); // Debug log
    res.status(500).json({ message: 'Error fetching user or movies' });
  }
});
app.get('/api/movies/mongodb', async (req, res) => {
  const { genre, heroes, heroines, language } = req.query; // Get the query parameters from the request
  console.log('Genre:', genre, 'Heroes:', heroes, 'Heroines:', heroines, 'Language:', language);
  try {
    // Define an object mapping languages to collection names
    const collectionsMap = {
      tamil: 'movie_tamils',
      telugu: 'movie_telugus',
      hindi: 'movie_hindis',
      malayalam: 'movie_malayalams',
      kannada: 'movie_kannadas'
    };

    let collectionsToSearch = []; // Initialize an array for collections to search

    // Check if a language is provided
    if (language && collectionsMap[language.toLowerCase()]) {
      // If a valid language is provided, search only that collection
      collectionsToSearch.push(collectionsMap[language.toLowerCase()]);
    } else {
      // Otherwise, search all collections
      collectionsToSearch = Object.values(collectionsMap);
    }

    // Initialize an array to hold promises for fetching movies
    const fetchPromises = collectionsToSearch.map(async (collectionName) => {
      const movieCollection = mongoose.connection.collection(collectionName);
      const query = {}; // Initialize the query object for this collection

      // Add genre to query if provided
      if (genre) {
        query.genres = { $in: [genre] }; // Match movies by genre
      }

      // Add heroes to query if provided and not empty
      if (heroes && heroes.length > 0) {
        const heroArray = Array.isArray(heroes) ? heroes : [heroes]; // Ensure it's an array
        query.hero = { $in: heroArray }; // Match movies by hero
      }

      // Add heroines to query if provided and not empty
      if (heroines && heroines.length > 0) {
        const heroineArray = Array.isArray(heroines) ? heroines : [heroines]; // Ensure it's an array
        query.heroine = { $in: heroineArray }; // Match movies by heroine
      }

      // Fetch movies from the current collection
      return await movieCollection.find(query).toArray();
    });

    // Execute all fetch promises and flatten the results
    const results = await Promise.all(fetchPromises);
    const movies = results.flat(); // Flatten the array of results

    // Check if any movies were found
    if (movies.length === 0) {
      return res.status(404).json({ message: 'No movies found matching the criteria.' });
    }

    // Return the found movies
    res.json({ movies });
  } catch (error) {
    console.error('Error fetching movies:', error); // Debug log
    res.status(500).send('Server error while fetching movies.');
  }
});


  app.get('/api/movies/:id', async (req, res) => {
    const id = req.params.id; // Use params to get the ID from the URL
    console.log('Movie ID:', id); // Log the movie ID for debugging
  
    try {
      // Store collection names in an array
      const collectionNames = [
        'movie_tamils',
        'movie_telugus',
        'movie_hindis',
        'movie_malayalams',
        'movie_kannadas'
      ];
  
      let movieFound = null;
  
      // Iterate through the collection names to find the movie
      for (const collectionName of collectionNames) {
        const collection = mongoose.connection.collection(collectionName);
        console.log('Checking collection:', collectionName); // Log the collection being checked
  
        // Find the movie in the current collection
        const movie = await collection.findOne({ id: parseInt(id) }); // Ensure ID is treated as a number
        console.log('Found movie:', movie); // Log the movie found in the current collection
  
        if (movie) {
          movieFound = movie; // If found, store the movie
          break; // Exit the loop if the movie is found
        }
      }
  
      // If the movie was not found in any collection, return a 404 error
      if (!movieFound) {
        return res.status(404).json({ message: 'Movie not found' });
      }
  
      // Return the found movie
      res.json(movieFound);
    } catch (error) {
      console.error('Error fetching movie by ID:', error); // Debug log
      res.status(500).send('Server error');
    }
  });
  

// Fetch detailed movie information from TMDb API and insert into MongoDB
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
        apikey: '22c192c5', // Replace with your OMDb API key
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

    for (const movie of movies) {
      const detailedMovie = await fetchMovieDetails(movie.id);

      if (detailedMovie) {
        bulkOps.push({
          updateOne: {
            filter: { id: movie.id },
            update: {
              $setOnInsert: detailedMovie
            },
            upsert: true
          }
        });
      }
    }

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
  console.log('Running scheduled movie fetch and insert job...');
  await fetchAndInsertMovies();
});

// Start the server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
