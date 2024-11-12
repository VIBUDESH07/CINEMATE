import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import './styles/User.css';

const StarRating = ({ rating }) => {
  const totalStars = 5;
  const filledStars = Math.round(rating / 2);

  return (
    <div className="user-star-rating">
      {[...Array(totalStars)].map((_, index) => (
        <span key={index} className={index < filledStars ? "user-filled-star" : "user-empty-star"}>
          ★
        </span>
      ))}
    </div>
  );
};

const UserMovie = () => {
  const { mail } = useParams();
  const [movies, setMovies] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null);

  useEffect(() => {
    const fetchMovieList = async () => {
      try {
        const response = await axios.post('http://localhost:4000/api/search', { movie: mail });
        setMovies(response.data);
      } catch (error) {
        console.error('Error fetching movies:', error);
      }
    };

    fetchMovieList();
  }, [mail]);

  const fetchMovieDetails = async (id) => {
    try {
        console.log(id)
      const response = await axios.get(`http://localhost:4000/api/movie/${id}`);
      setSelectedMovie(response.data);
    } catch (error) {
      console.error('Error fetching movie details:', error);
    }
  };

  if (!movies.length) return <p>Loading...</p>;

  const renderMovieDetails = (movie) => (
    <div className="use-movie-details-page">
      <button onClick={() => setSelectedMovie(null)}>Back to Results</button>
      <div className="use-movie-content">
        <img
          src={movie.Poster || 'default-poster.png'}
          alt={movie.Title}
          className="use-movie-details-poster"
        />
        <div className="use-movie-details-info">
          <h1 style={{ color: 'red' }}>{movie.Title}</h1>
          <p className="use-year"><strong>Year:</strong> {movie.Year}</p>
          <p className="use-release-date"><strong>Release Date:</strong> {movie.Released}</p>
          <p className="use-genres"><strong>Genres:</strong> {movie.Genre}</p>
          <p><strong>Director:</strong> {movie.Director}</p>
          <p><strong>Writer:</strong> {movie.Writer}</p>
          <p><strong>Cast:</strong> {movie.Actors}</p>
          <p><strong>Plot:</strong> {movie.Plot}</p>
          <p><strong>Language:</strong> {movie.Language}</p>
          <p><strong>Country:</strong> {movie.Country}</p>
          <p><strong>Awards:</strong> {movie.Awards}</p>
          <p><strong>IMDb Rating:</strong> {movie.imdbRating}
            <StarRating rating={movie.imdbRating || 0} />
          </p>
          <p><strong>Runtime:</strong> {movie.Runtime}</p>
        </div>
      </div>

      {movie.Trailer && (
        <div className="use-trailer-section">
          <h2>Trailer</h2>
          <iframe
            className="use-trailer-iframe"
            src={movie.Trailer.replace('watch?v=', 'embed/')}
            title="Trailer"
            frameBorder="0"
            allowFullScreen
          />
        </div>
      )}
    </div>
  );

  const renderMovieCards = () => (
    <div className="use-movie-cards">
      {movies.map((movie, index) => (
        <div
          key={index} // Use index as the unique key
          className="use-movie-card"
          onClick={() => fetchMovieDetails(movie.imdbID)} // Pass movie.imdbID as the ID
        >
          <img src={movie.Poster || 'default-poster.png'} alt={movie.Title} />
          <h3>{movie.Title}</h3>
          <p>{movie.Year}</p>
        </div>
      ))}
    </div>
  );
  
  return (
    <div className="use-bod">
      {selectedMovie ? renderMovieDetails(selectedMovie) : renderMovieCards()}
    </div>
  );
};

export default UserMovie;
