const express = require('express');
const cors = require('cors');
const axios = require('axios'); // Import axios

const apiKey = '22c192c5';
const apiUrl = `http://www.omdbapi.com/?apikey=${apiKey}`;

const app = express();
app.use(express.json());
app.use(cors());

// Function to search for movies by title
async function searchMovies(query) {
    try {
        const response = await axios.get(`${apiUrl}&s=${encodeURIComponent(query)}`);
        const data = response.data;

        if (data.Response === "True") {
            return data.Search; // Return an array of movie results
        } else {
            return { error: 'No movies found with that title.' };
        }
    } catch (error) {
        console.error('Error fetching the movies:', error);
        return { error: 'Error fetching the movies.' };
    }
}

// Function to get a movie's details by ID
async function getMovieById(id) {
    try {
        const response = await axios.get(`${apiUrl}&i=${encodeURIComponent(id)}`);
        const data = response.data;

        if (data.Response === "True") {
            return data; // Return detailed movie information
        } else {
            return { error: 'No movie found with that ID.' };
        }
    } catch (error) {
        console.error('Error fetching movie details:', error);
        return { error: 'Error fetching movie details.' };
    }
}

// Endpoint to search for movies by title
app.post('/api/search', async (req, res) => {
    const { movie } = req.body;

    if (!movie) {
        console.log('Error: No movie name provided.');
        return res.status(400).json({ error: 'Please provide a movie name.' });
    }

    const movies = await searchMovies(movie);

    console.log('Movies Found:', movies); // Log the movies found in the console
    
    res.json(movies); // Send the movies as the response
});

// Endpoint to get a movie's details by ID
app.get('/api/movie/:id', async (req, res) => {
    const { id } = req.params;

    if (!id) {
        console.log('Error: No movie ID provided.');
        return res.status(400).json({ error: 'Please provide a movie ID.' });
    }

    const movieDetails = await getMovieById(id);

    console.log('Movie Details:', movieDetails); // Log the movie details in the console
    
    res.json(movieDetails); // Send the movie details as the response
});

// Start the server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
