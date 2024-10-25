import React, { useState } from 'react';
import axios from 'axios';
import './SignupForm.css'; // Import the CSS file for styling

// Import artist images
import vijay from '../artists_images/vijay.jpg';
import ajith from '../artists_images/ajith.jpg';
import dhanush from '../artists_images/dhanush.jpg';
import kamalHaasan from '../artists_images/kamal_haasan.jpg';
import alluArjun from '../artists_images/allu_arjun.jpg';
import ntr from '../artists_images/ntr.jpg';
import maheshBabu from '../artists_images/mahesh_babu.jpg';
import chiranjeevi from '../artists_images/chiranjeevi.jpg';
import mohanlal from '../artists_images/mohanlal.jpg';
import mammootty from '../artists_images/mammootty.jpg';
import dulquerSalmaan from '../artists_images/dulquer_salmaan.jpg';
import nivinPauly from '../artists_images/nivin_pauly.jpg';
import fahadhFaasil from '../artists_images/fahadh_faasil.jpg';
import shahRukhKhan from '../artists_images/shah_rukh_khan.jpg';
import salmanKhan from '../artists_images/salman_khan.jpg';
import aamirKhan from '../artists_images/aamir_khan.jpg';
import hrithikRoshan from '../artists_images/hrithik_roshan.jpg';
import ranveerSingh from '../artists_images/ranveer_singh.jpg';
import yash from '../artists_images/yash.jpg';
import shivrajkumar from '../artists_images/shivrajkumar.jpg';
import sudeep from '../artists_images/sudeep.jpg';
import ganesh from '../artists_images/ganesh.jpg';
import tamil from '../language_images/tamil.jpg';
import malayalam from '../language_images/malayalam.jpg';
import telugu from '../language_images/telugu.jpg';
import hindi from '../language_images/hindi.jpg';
import kannada from '../language_images/kannada.jpg';
import { useNavigate } from 'react-router-dom';
const LanguageAndArtists = ({ email, password }) => {
  const navigate= useNavigate();
  const [selectedLanguages, setSelectedLanguages] = useState([]);
  const [selectedArtists, setSelectedArtists] = useState([]);
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [step, setStep] = useState(1);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleLanguageChange = (language) => {
    setSelectedLanguages((prev) =>
      prev.includes(language)
        ? prev.filter((lang) => lang !== language)
        : [...prev, language]
    );
  };

  const handleArtistChange = (artist) => {
    setSelectedArtists((prev) =>
      prev.includes(artist)
        ? prev.filter((art) => art !== artist)
        : [...prev, artist]
    );
  };

  const handleGenreChange = (genre) => {
    setSelectedGenres((prev) =>
      prev.includes(genre)
        ? prev.filter((gen) => gen !== genre)
        : [...prev, genre]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post('http://localhost:5001/api/users', {
        email,
        password,
        selectedLanguages,
        selectedArtists,
        selectedGenres,
      });

      if (response.status === 201) {
        setSuccess('User registered successfully!');
        setError(null);
        resetSelections();
        navigate('/login');
      }
    } catch (err) {
      setError('Error registering user: ' + (err.response?.data || err.message));
      setSuccess(null);
    }
  };

  const resetSelections = () => {
    setSelectedLanguages([]);
    setSelectedArtists([]);
    setSelectedGenres([]);
    setStep(1);
  };

  const getArtists = () => {
    const artists = {
      Tamil: [vijay, ajith, dhanush, kamalHaasan],
      Telugu: [alluArjun, ntr, maheshBabu, chiranjeevi],
      Malayalam: [mohanlal, mammootty, dulquerSalmaan, nivinPauly, fahadhFaasil],
      Hindi: [shahRukhKhan, salmanKhan, aamirKhan, hrithikRoshan, ranveerSingh],
      Kannada: [yash, shivrajkumar, sudeep, ganesh],
    };

    return selectedLanguages.flatMap((lang) => artists[lang] || []);
  };

  const genres = ['Action', 'Drama', 'Comedy', 'Thriller', 'Romance'];

  return (
    <div className='artis-body'>
    <div className="artis-signup-container">
      {error && <p className="artis-error">{error}</p>}
      {success && <p className="artis-success">{success}</p>}
      
      {step === 1 && (
        <div>
          <h3>Select Your Preferred Languages:</h3>
          <div className="artis-language-buttons">
            {['Tamil', 'Telugu', 'Malayalam', 'Hindi', 'Kannada'].map((language) => (
              <button
                key={language}
                type="button"
                className={`artis-language-button ${selectedLanguages.includes(language) ? 'selected' : ''}`}
                onClick={() => handleLanguageChange(language)}
              >
                <img src={require(`../language_images/${language.toLowerCase()}.jpg`)} alt={`${language} icon`} className="artis-icon" />
              </button>
            ))}
          </div>
          <button 
            type="button" 
            className="artis-next-button" 
            onClick={() => { 
              if (selectedLanguages.length > 0) {
                setStep(2); 
              }
            }}
            disabled={selectedLanguages.length === 0}
          >
            Next
          </button>
        </div>
      )}

      {step === 2 && (
        <div>
          <h3>Select Your Favorite Artists:</h3>
          <div className="artis-artist-grid">
            {getArtists().map((artist, index) => (
              <div key={index} className={`artis-artist-card ${selectedArtists.includes(artist) ? 'selected' : ''}`} onClick={() => handleArtistChange(artist)}>
                <img src={artist} alt={`Artist`} className="artis-artist-icon" />
                <p>{artist.split('/').pop().split('.')[0]}</p>
                <input type="checkbox" checked={selectedArtists.includes(artist)} readOnly />
              </div>
            ))}
          </div>
          <button 
            type="button" 
            className="artis-next-button" 
            onClick={() => { 
              if (selectedArtists.length > 0) {
                setStep(3); 
              }
            }}
            disabled={selectedArtists.length === 0}
          >
            Next
          </button>
          <button type="button" className="artis-back-button" onClick={() => setStep(1)}>Back</button>
        </div>
      )}

      {step === 3 && (
        <form onSubmit={handleSubmit} className="artis-genre-selection">
          <h3>Select Your Favorite Genres:</h3>
          <div className="artis-genre-buttons">
            {genres.map((genre) => (
              <button
                key={genre}
                type="button"
                className={`artis-genre-button ${selectedGenres.includes(genre) ? 'selected' : ''}`}
                onClick={() => handleGenreChange(genre)}
              >
                {genre} {selectedGenres.includes(genre) && '✔️'}
              </button>
            ))}
          </div>
          <button type="submit" className="artis-submit-button">Register</button>
          <button type="button" className="artis-back-button" onClick={() => setStep(2)}>Back</button>
        </form>
      )}
    </div>
    </div>
  );
};

export default LanguageAndArtists;
