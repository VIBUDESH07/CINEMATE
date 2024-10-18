import React, { useState } from 'react';
import axios from 'axios'; // For making API requests
import { useNavigate } from 'react-router-dom';

const FilterPage = () => {
  const navigate = useNavigate();
  const [selectedTopic, setSelectedTopic] = useState('');
  const [selectedHero, setSelectedHero] = useState('');
  const [selectedHeroine, setSelectedHeroine] = useState('');

  const topics = ['Action', 'Romance', 'Drama', 'Love'];
  const heroes = ['Vijay', 'Ajith', 'Suriya', 'Dhanush', 'Vikram']; // Tamil heroes
  const heroines = ['Nayanthara', 'Trisha', 'Kajal Aggarwal', 'Samantha', 'Keerthy Suresh']; // Tamil heroines

  const handleSearch = async () => {
    try {
      // Prepare the query params for the backend request
      const params = {
        topic: selectedTopic,
        hero: selectedHero,
        heroine: selectedHeroine,
      };

      // Send a request to the backend with the selected filters
      const response = await axios.get('/api/movies/filter', { params });
      console.log(response.data)
      // Navigate to the MovieList page with the movie data from the backend
      navigate('/movies', {
        state: { movies: response.data }, 
      });
    } catch (error) {
      console.error('Error fetching filtered movies:', error);
    }
  };

  return (
    <div style={styles.container}>
      <h2>Filter Movies</h2>
      
      {/* Topics */}
      <div style={styles.filterGroup}>
        <h3>Topics</h3>
        {topics.map((topic) => (
          <div key={topic}>
            <input
              type="radio"
              name="topic"
              value={topic}
              checked={selectedTopic === topic}
              onChange={(e) => setSelectedTopic(e.target.value)}
            />
            {topic}
          </div>
        ))}
      </div>

      {/* Heroes */}
      <div style={styles.filterGroup}>
        <h3>Heroes</h3>
        {heroes.map((hero) => (
          <div key={hero}>
            <input
              type="radio"
              name="hero"
              value={hero}
              checked={selectedHero === hero}
              onChange={(e) => setSelectedHero(e.target.value)}
            />
            {hero}
          </div>
        ))}
      </div>

      {/* Heroines */}
      <div style={styles.filterGroup}>
        <h3>Heroines</h3>
        {heroines.map((heroine) => (
          <div key={heroine}>
            <input
              type="radio"
              name="heroine"
              value={heroine}
              checked={selectedHeroine === heroine}
              onChange={(e) => setSelectedHeroine(e.target.value)}
            />
            {heroine}
          </div>
        ))}
      </div>

      <button onClick={handleSearch} style={styles.button}>
        Search
      </button>
    </div>
  );
};

const styles = {
  container: {
    padding: '20px',
    backgroundColor: '#f0f4f8',
    borderRadius: '8px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
  },
  filterGroup: {
    marginBottom: '20px',
  },
  button: {
    padding: '10px 15px',
    backgroundColor: '#007bff',
    color: '#ffffff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
};

export default FilterPage;
