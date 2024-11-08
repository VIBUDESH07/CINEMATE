import { useState, useEffect } from 'react';
import axios from 'axios';
import { Navigate, useNavigate } from 'react-router-dom';
const Recent= () => {
  const [recentMovies, setRecentMovies] = useState([]);
  const email = localStorage.getItem('username');
  const navigate=useNavigate();
  useEffect(() => {
    const fetchRecentSearches = async () => {
      try {
        console.log(email)
        const response = await axios.get(`https://movie-recommendation-web-2.onrender.com/api/users/${email}/rec`);
        const movieIds = response.data.recentSearches;
        
        const movies = [];
        for (const movieId of movieIds) {
          const movie = await axios.get(`https://movie-recommendation-web-2.onrender.com/api/movies/${movieId}`);
          if (movie.data) {
            movies.push(movie.data);
          }
        }
        setRecentMovies(movies);
      } catch (error) {
        console.error('Error fetching recent searches:', error);
      }
    };

    if (email) {
      fetchRecentSearches();
    }
  }, [email]);
  const handleMovieClick = (id) => {
    navigate(`/movie/${id}`); // Navigate to MovieDetails page with the movie id
  };
  return (
    <div>
      <h2 style={{marginLeft:"2rem",alignItems:"center"}}>Recent Searches. . .</h2>
       <section className="movies-list">
        {recentMovies.length ? (
          recentMovies.map((movie) => (
            <div 
              key={movie.id} 
              className="movie-card" 
              onClick={() => handleMovieClick(movie.id)} // Add click handler
            >
              <img src={movie.image || 'default-poster.png'} alt={movie.title} className="movie-poster" />
              <div className="movie-details">
                <h2>{movie.title}</h2>
                <p><strong>Release Date:</strong> {movie.releaseDate || 'Unknown'}</p>
                <p><strong>Genres:</strong> {movie.genres.length ? movie.genres.join(', ') : 'None'}</p>
                <p><strong>Hero:</strong> {movie.hero || 'None'}</p>
                <p><strong>Heroine:</strong> {movie.heroine || 'None'}</p>
                <p><strong>IMDB Rating:</strong> {movie.imdbRating || 'N/A'}</p>
                <p><strong>Duration:</strong> {movie.duration || 'N/A'}</p>
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

export default Recent;
