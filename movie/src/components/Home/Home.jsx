import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Import useNavigate for navigation
import Navbar from './Navbar'; // Import the Navbar component
import './styles/HomePage.css'; // Custom styling for the homepage
import Recent from '../Foot/Recent';

const HomePage = () => {
  const [movies, setMovies] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate(); // Initialize useNavigate
  const [userGenres, setUserGenres] = useState([]);
  const [userHero, setUserHero] = useState('');

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn'); // Check if user is logged in
    const email = localStorage.getItem('username'); // Get the user's email from local storage
    
    if (!isLoggedIn) {
      navigate('/login'); // Redirect to login page if not logged in
    } else {
      // Fetch user genres and hero if logged in
      const fetchUserDetails = async () => {
        try {
          console.log(email);
          const response = await axios.get(`https://movie-recommendation-web-2.onrender.com/api/users/${email}`);
          const { user, movies } = response.data; // Adjust according to your backend response structure
          
          setUserGenres(user.selectedGenres);
          setUserHero(user.selectedArtists[0]); // Assuming the hero is the first artist
          setMovies(movies); // Assuming the movies are already filtered
        } catch (error) {
          console.error('Error fetching user details:', error);
        }
      };

      fetchUserDetails();
    }
  }, [navigate]);

  // Fetch movies from backend API based on search term
  useEffect(() => {
    const fetchMovies = async () => {
      if(searchTerm){
      try {
        const response = await axios.get('https://movie-recommendation-web-2.onrender.com/api/analyze', {
          params: { prompt: searchTerm } // Sending the searchTerm as a prompt
        });
  
        // Assuming the response contains the genre, mood, and language from the Python analysis
        const analyzedResult = response.data;
        console.log('Analyzed Result:', analyzedResult);
  
        // Filter out null fields from analyzedResult
        const filteredResult = Object.fromEntries(
          Object.entries(analyzedResult).filter(([_, value]) => value !== null)
        );
  
        console.log('Filtered Analyzed Result:', filteredResult);
  
        // Prepare parameters for fetching movies
        const fetchParams = {};
  
        // Only add the genre if it exists
        if (filteredResult.genres) {
          fetchParams.genre = filteredResult.genres;
        }
  
        // Only add heroes if they are not empty
        if (filteredResult.heroes && filteredResult.heroes.length > 0) {
          fetchParams.heroes = filteredResult.heroes;
        }
  
        // Only add heroines if they are not empty
        if (filteredResult.heroines && filteredResult.heroines.length > 0) {
          fetchParams.heroines = filteredResult.heroines;
        }
  
        // Only add language if it exists
        if (filteredResult.language) {
          fetchParams.language = filteredResult.language; // Add the language term
        }
  
        console.log(fetchParams);
  
        // Fetch movies based on the analyzed result
       
          if (Object.keys(fetchParams).length > 0) {
            const moviesResponse = await axios.post('https://movie-recommendation-web-2.onrender.com/api', fetchParams);
        
            // Update the state with the fetched movies
            setMovies(moviesResponse.data.movies || []); // Update according to your backend response
          }
        } catch (error) {
          console.error('Error fetching analyzed result or movies:', error);
        }
        
    };
  }
  
    // Call the fetchMovies function
    fetchMovies();
  }, [searchTerm]);
  
  // Function to handle movie card click
  const handleMovieClick = (id) => {
    navigate(`/movie/${id}`); // Navigate to MovieDetails page with the movie id
  };

  return (
    <div className="homepage">
      <Navbar searchTerm={searchTerm} setSearchTerm={setSearchTerm} /> {/* Navbar with search */}
      <div className='div-rec'><Recent/>
      </div>
            
        <section className="movies-list">
        {movies.length ? (
          movies.map((movie) => (
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

export default HomePage;
