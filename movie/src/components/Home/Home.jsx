import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Import useNavigate for navigation
import Navbar from './Navbar'; // Import the Navbar component
import './styles/HomePage.css'; // Custom styling for the homepage

const HomePage = () => {
  const [movies, setMovies] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate(); // Initialize useNavigate

  // Fetch movies from backend API
  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/movies/mongodb', {
          params: { search: searchTerm }
        });
        setMovies(response.data);
      } catch (error) {
        console.error('Error fetching movies:', error);
      }
    };
    fetchMovies();
  }, [searchTerm]);

  // Function to handle movie card click
  const handleMovieClick = (id) => {
    navigate(`/movie/${id}`); // Navigate to MovieDetails page with the movie id
  };

  return (
    <div className="homepage">
      <Navbar searchTerm={searchTerm} setSearchTerm={setSearchTerm} /> {/* Navbar with search */}
      <section className="movies-list">
        {movies.length ? (
          movies.map((movie) => (
            <div 
              key={movie.id} 
              className="movie-card" 
              onClick={() => handleMovieClick(movie.id)} // Add click handler
            >
              <img src={movie.image || 'default-poster.png'} alt={movie.title} className="movie-poster"/>
              <div className="movie-details">
                <h2>{movie.title}</h2>
                <p><strong>Year:</strong> {movie.year}</p>
                <p><strong>Genres:</strong> {movie.genres ? movie.genres.join(', ') : 'None'}</p>
                <p><strong>Hero:</strong> {movie.hero || 'None'}</p>
                <p><strong>Heroine:</strong> {movie.heroine || 'None'}</p>
              </div>
            </div>
          ))
        ) : (
          <p>No movies found.</p>
        )}
      </section>
    </div>
  );
};

export default HomePage;
