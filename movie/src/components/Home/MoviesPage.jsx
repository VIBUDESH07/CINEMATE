import React from 'react';
import { useLocation } from 'react-router-dom';

const MoviesPage = () => {
  // Use useLocation to get the state passed from FilterPage
  const location = useLocation();
  const { movies } = location.state || { movies: [] }; // Default to empty array if no state is passed

  return (
    <div style={styles.container}>
      <h2>Filtered Movies</h2>
      {movies.length > 0 ? (
        <div style={styles.moviesGrid}>
          {movies.map((movie) => (
            <div key={movie._id} style={styles.movieCard}>
              <img
                src={movie.image || 'https://via.placeholder.com/150'}
                alt={movie.title}
                style={styles.movieImage}
              />
              <div style={styles.movieInfo}>
                <h3>{movie.title}</h3>
                <p><strong>Year:</strong> {movie.year}</p>
                <p><strong>Hero:</strong> {movie.hero}</p>
                <p><strong>Heroine:</strong> {movie.heroine}</p>
                <p><strong>Genres:</strong> {movie.genres.join(', ')}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p>No movies found matching the selected filters.</p>
      )}
    </div>
  );
};

const styles = {
  container: {
    padding: '20px',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
  },
  moviesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '20px',
  },
  movieCard: {
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    padding: '15px',
    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
    textAlign: 'center',
  },
  movieImage: {
    width: '100%',
    height: '300px',
    objectFit: 'cover',
    borderRadius: '8px',
    marginBottom: '10px',
  },
  movieInfo: {
    textAlign: 'left',
  },
};

export default MoviesPage;
