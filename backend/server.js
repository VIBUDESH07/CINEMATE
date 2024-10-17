const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect('mongodb+srv://vibudesh:040705@cluster0.bojv6ut.mongodb.net/Movie', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log('MongoDB connected to Movie database'))
    .catch((err) => console.error('MongoDB connection error:', err));

// Route to fetch all movies from movie_list collection
app.get('/api/movies/mongodb', async (req, res) => {
    try {
        // Access movie_list collection directly
        const movieListCollection = mongoose.connection.db.collection('movie_details');
        const movies = await movieListCollection.find({}).toArray(); // Fetch all movies
        res.json(movies);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
