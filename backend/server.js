const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

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

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
