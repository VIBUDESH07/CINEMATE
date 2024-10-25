import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import './styles/MovieDetails.css'; // Import the CSS file for styling
import Navbar from './Navbar';

// Include the StarRating component
const StarRating = ({ rating }) => {
  const totalStars = 5; // Total number of stars
  const filledStars = Math.round(rating); // Calculate filled stars based on rating

  return (
    <div className="star-rating">
      {[...Array(totalStars)].map((_, index) => (
        <span key={index} className={index < filledStars ? "filled-star" : "empty-star"}>
          ★
        </span>
      ))}
    </div>
  );
};

const MovieDetails = () => {
  const { id } = useParams(); // Get movie ID from URL
  const [movie, setMovie] = useState(null);

  // Fetch movie details by ID
  useEffect(() => {
    const fetchMovieDetails = async () => {
      try {
        const response = await axios.get(`http://localhost:5001/api/movies/${id}`);
        setMovie(response.data);
      } catch (error) {
        console.error('Error fetching movie details:', error);
      }
    };

    fetchMovieDetails();
  }, [id]);

  if (!movie) return <p>Loading...</p>;

  return (
    <div className='bod'>
      <div className="navbar-brand">
        <Navbar />
      </div>
      <div className="movie-details-page">
        <div className="movie-content">
          {/* Movie Poster */}
          <img
            src={movie.image || 'default-poster.png'}
            alt={movie.title}
            className="movie-details-poster"
          />

          {/* Movie Details */}
          <div className="movie-details-info">
            <h1 style={{ color: 'red' }}>{movie.title}</h1>
            <p className="year"><strong>Year:</strong> {movie.year}</p>
            <p className="release-date"><strong>Release Date:</strong> {movie.releaseDate}</p>
            <p className="genres"><strong>Genres:</strong> {movie.genres ? movie.genres.join(', ') : 'None'}</p>
            <p className="hero"><strong>Hero:</strong> {movie.hero || 'None'}</p>
            <p className="heroine"><strong>Heroine:</strong> {movie.heroine || 'None'}</p>
            <p className="description"><strong>Description:</strong> {movie.description || 'No description available'}</p>
            <p className="cast"><strong>Cast:</strong> {movie.cast ? movie.cast.join(', ') : 'None'}</p>
            <p className="rating">
              <strong>IMDB Rating:</strong> {movie.tmdbRating || 'N/A'}
              <StarRating rating={movie.tmdbRating || 0} />
            </p>
            <p className="duration"><strong>Duration:</strong> {movie.duration || 'N/A'}</p>
            <p className="where-to-watch"><strong>Where to Watch:</strong> {movie.whereToWatch || 'N/A'}</p>
          </div>
        </div>

        {/* Trailer Section */}
        <div className="trailer-section">
          <h2>Trailer</h2>
          {movie.trailer && (
            <iframe
              className="trailer-iframe" // Apply class for styling
              src={movie.trailer.replace('watch?v=', 'embed/')} // Change URL to embed format
              title="Trailer"
              frameBorder="0"
              allowFullScreen
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default MovieDetails;
