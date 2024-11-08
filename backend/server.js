const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const axios = require('axios');
const cron = require('node-cron');
const nodemailer = require('nodemailer');
const app = express();
app.use(cors());
app.use(express.json()); // Middleware to parse JSON bodies
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'vibudeshrb.22cse@kongu.edu', // Your email
    pass: 'andx xznk qhsn aagi'         // Your app-specific password
  }
});
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
app.post('/api/feedback', async (req, res) => {
  const { email, feedback} = req.body;

  try {
    // Define the email options
    const mailOptions = {
      from: 'vibudeshrb.22cse@kongu.edu',
      to: 'vibudesh0407@gmail.com',  // Destination email
      subject: 'New Feedback Submission',
      text: `Feedback from: ${email}\n\nproblem:${feedback}`
    };

    // Send the email
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'Feedback sent successfully!' });
  } catch (error) {
    console.error('Error sending feedback:', error);
    res.status(500).json({ message: 'Failed to send feedback' });
  }
});

app.patch('/api/user/genres/:email', async (req, res) => {
  const { email } = req.params;
  const { selectedGenres } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.selectedGenres = selectedGenres;
    await user.save();

    res.json({ message: 'Genres updated successfully', user });
  } catch (error) {
    res.status(500).json({ message: 'Error updating genres' });
  }
});

// API to update selected languages
app.patch('/api/user/languages/:email', async (req, res) => {
  const { email } = req.params;
  const { selectedLanguages } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.selectedLanguages = selectedLanguages;
    await user.save();

    res.json({ message: 'Languages updated successfully', user });
  } catch (error) {
    res.status(500).json({ message: 'Error updating languages' });
  }
});

// API to update selected artists
app.patch('/api/user/artists/:email', async (req, res) => {
  const { email } = req.params;
  const { selectedArtists } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.selectedArtists = selectedArtists;
    await user.save();

    res.json({ message: 'Artists updated successfully', user });
  } catch (error) {
    res.status(500).json({ message: 'Error updating artists' });
  }
});
app.get('/api/analyze', async (req, res) => {
  const { prompt } = req.query; // Get the prompt from the query parameters

  try {
    // Send a POST request to the Python API with the prompt in the body
    const response = await axios.post('https://movie-recommendation-web-1.onrender.com/analyze', {
      prompt: prompt
    });

    console.log(response.data);
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
  // Debug log

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
app.get('/api/:email', async (req, res) => {
  const email = req.params.email;
  console.log(email)
  try {
    // Fetch user based on the email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Extract user's selected genres, languages, and artists
    const userDetails = {
      email:email,
      selectedGenres: user.selectedGenres || [],
      selectedLanguages: user.selectedLanguages || [],
      selectedArtists: user.selectedArtists || []
    };
    console.log(userDetails)
    // Return the user's details
    res.json(userDetails);

  } catch (error) {
    console.error('Error fetching user details:', error);
    res.status(500).json({ message: 'Error fetching user details' });
  }
});

app.post('/api', async (req, res) => {
  const { genre = [], heroes = [], heroines = [], language } = req.body || {};

  console.log('Received request with:', 'Genre:', genre, 'Heroes:', heroes, 'Heroines:', heroines, 'Language:', language);

  try {
    // Step 1: Map languages to MongoDB collection names
    const collectionsMap = {
      tamil: 'movie_tamils',
      telugu: 'movie_telugus',
      hindi: 'movie_hindis',
      malayalam: 'movie_malayalams',
      kannada: 'movie_kannadas'
    };

    // Step 2: Determine which collections to search
    let collectionsToSearch = [];
    if (language && collectionsMap[language.toLowerCase()]) {
      collectionsToSearch.push(collectionsMap[language.toLowerCase()]);
    } else {
      collectionsToSearch = Object.values(collectionsMap);
    }

    console.log('Collections to search:', collectionsToSearch); // Log collections being searched

    // Step 3: Build the query based on request parameters
    const query = {};
    
    if (Array.isArray(genre) && genre.length > 0) {
      // Make genre query case-insensitive using $regex
      query.genres = { $in: genre.map(g => new RegExp(g, 'i')) };
    }
    if (Array.isArray(heroes) && heroes.length > 0) {
      // Make hero query case-insensitive using $regex
      query.hero = { $in: heroes.map(h => new RegExp(h, 'i')) };
    }
    if (Array.isArray(heroines) && heroines.length > 0) {
      // Make heroine query case-insensitive using $regex
      query.heroine = { $in: heroines.map(h => new RegExp(h, 'i')) };
    }

    // Step 4: Fetch movies from each selected collection
    const fetchPromises = collectionsToSearch.map(async (collectionName) => {
    
      const movieCollection = mongoose.connection.collection(collectionName);

      // Check if `movieCollection` is correctly accessed
      if (!movieCollection) {
        console.error(`Collection not found: ${collectionName}`);
        return [];
      }

      // Fetch matching movies
      try {
        console.log(`Fetching movies from collection: ${collectionName} with query:`, query);
        return await movieCollection.find(query).toArray();
      } catch (err) {
        console.error(`Error fetching movies from ${collectionName}:`, err);
        return [];
      }
    });

    // Step 5: Execute all promises and flatten the results
    const results = await Promise.all(fetchPromises);
    const movies = results.flat();

    // Log fetched movies

    // Step 6: If no movies found, return 404
    if (movies.length === 0) {
      console.log('No movies found matching the criteria.');
      return res.status(404).json({ message: 'No movies found matching the criteria.' });
    }
    console.log('fetched')
    
    return res.json({ movies });

  } catch (error) {
    console.error('Error fetching movies:', error);
    return res.status(500).send('Server error while fetching movies.');
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
