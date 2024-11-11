const express = require('express');
const cors = require('cors');
const axios = require('axios'); // Import axios

const apiKey = '22c192c5';
const apiUrl = `http://www.omdbapi.com/?apikey=${apiKey}`;

const app = express();
app.use(express.json());
app.use(cors());

// Function to search for a movie using the OMDb API
async function searchMovie(query) {
    try {
        const response = await axios.get(`${apiUrl}&t=${encodeURIComponent(query)}`);
        const data = response.data;
        
        if (data.Response === "True") {
            return data;
        } else {
            return { error: 'No movie found with that title.' };
        }
    } catch (error) {
        console.error('Error fetching the movie:', error);
        return { error: 'Error fetching the movie.' };
    }
}

// Endpoint to search for a movie
app.post('/api/search', async (req, res) => {
    const { movie } = req.body;

    if (!movie) {
        console.log('Error: No movie name provided.');
        return res.status(400).json({ error: 'Please provide a movie name.' });
    }

    const movieDetails = await searchMovie(movie);
    
    console.log('Movie Details:', movieDetails); // Log the movie details in the console
    
    res.json(movieDetails); // Send the movie details as the response
});

// Start the server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
