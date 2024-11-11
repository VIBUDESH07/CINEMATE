import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import './styles/MovieDetails.css'; // Import the CSS file for styling

const StarRating = ({ rating }) => {
  const totalStars = 5;
  const filledStars = Math.round(rating / 2); // Convert out of 10 to 5-star scale

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

const UserMovie = () => {
  const { mail } = useParams();
  const [movie, setMovie] = useState(null);

  useEffect(() => {
    const fetchMovieDetails = async () => {
      try {
        const response = await axios.post('http://localhost:4000/api/search', { movie: mail });
        setMovie(response.data);
      } catch (error) {
        console.error('Error fetching movie details:', error);
      }
    };

    fetchMovieDetails();
  }, [mail]);

  if (!movie) return <p>Loading...</p>;

  return (
    <div className='bod'>
      <div className="movie-details-page">
        <div className="movie-content">
          <img
            src={movie.Poster || 'default-poster.png'}
            alt={movie.Title}
            className="movie-details-poster"
          />

          <div className="movie-details-info">
            <h1 style={{ color: 'red' }}>{movie.Title}</h1>
            <p className="year"><strong>Year:</strong> {movie.Year}</p>
            <p className="release-date"><strong>Release Date:</strong> {movie.Released}</p>
            <p className="genres"><strong>Genres:</strong> {movie.Genre}</p>
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
          <div className="trailer-section">
            <h2>Trailer</h2>
            <iframe
              className="trailer-iframe"
              src={movie.Trailer.replace('watch?v=', 'embed/')}
              title="Trailer"
              frameBorder="0"
              allowFullScreen
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default UserMovie;
