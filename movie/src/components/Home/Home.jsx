import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from './Navbar'; // Import the Navbar component
import './styles/HomePage.css'; // Custom styling for the homepage

const HomePage = () => {
  const [movies, setMovies] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

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

  return (
    <div className="homepage">
      <Navbar searchTerm={searchTerm} setSearchTerm={setSearchTerm} /> {/* Navbar with search */}
      <section className="movies-list">
        {movies.length ? (
          movies.map((movie) => (
            <div key={movie.id} className="movie-card">
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
