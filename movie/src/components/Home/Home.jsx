import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './styles/HomePage.css';

const HomePage = () => {
  const [movies, setMovies] = useState([]);

  // Fetch movies from backend API
  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/movies/mongodb');
        setMovies(response.data);
      } catch (error) {
        console.error('Error fetching movies:', error);
      }
    };
    fetchMovies();
  }, []);

  return (
    <div className="homepage">
      <header>
        <h1>Movie Recommendations</h1>
      </header>

      <section className="movies-list">
        {movies.length ? (
          movies.map((movie) => (
            <div key={movie.id} className="movie-card">
              <img src={movie.image || 'default-poster.png'} alt={movie.title} />
              <h2>{movie.title}</h2>
              <p>{movie.year}</p>
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
