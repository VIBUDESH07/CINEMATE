import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './styles/Navbar.css';
import axios from 'axios';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition'; // Import necessary functions
import { FaMicrophone } from "react-icons/fa";
import UserMovie from './UserMovie';
const Navbar = ({ searchTerm, setSearchTerm }) => {
  const loc = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [userDetails, setUserDetails] = useState(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [audioSearchTerm, setAudioSearchTerm] = useState('');
  const [enter,setEnter]=useState(false);
  
  // React-speech-recognition hook
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();


  const [timeElapsed, setTimeElapsed] = useState(0);


  useEffect(() => {
    const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
    setIsLoggedIn(loggedIn);

    const email = localStorage.getItem('username');
    if (email) {
      fetchUserDetails(email);
    }
  }, []);

  useEffect(() => {
    const fetchAudioSearch = async () => {
      try {
        if (audioSearchTerm) {
          console.log(audioSearchTerm)
          SpeechRecognition.stopListening();
          loc(`/mov/${audioSearchTerm}`);
        }
      } catch (error) {
        console.error('Error with audio search:', error);
      }
    };
    fetchAudioSearch();
  }, [enter]);

  const fetchUserDetails = async (email) => {
    try {
      const response = await fetch(`https://movie-recommendation-web-2.onrender.com/api/${email}`);
      if (response.ok) {
        const data = await response.json();
        setUserDetails(data);
      } else {
        console.error('Failed to fetch user details');
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('username');
    setIsLoggedIn(false);
    loc('/login');
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleAudioSearch = (e) => {
    setAudioSearchTerm(e.target.value);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const updateUserDetails = async (type, updatedFields) => {
    const email = localStorage.getItem('username');
    let apiUrl = '';

    if (type === 'genres') {
      apiUrl = `https://movie-recommendation-web-2.onrender.com/api/user/genres/${email}`;
    } else if (type === 'languages') {
      apiUrl = `https://movie-recommendation-web-2.onrender.com/api/user/languages/${email}`;
    } else if (type === 'artists') {
      apiUrl = `https://movie-recommendation-web-2.onrender.com/api/user/artists/${email}`;
    }

    try {
      const response = await fetch(apiUrl, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ [`selected${type.charAt(0).toUpperCase() + type.slice(1)}`]: updatedFields } ),
      });

      if (response.ok) {
        const data = await response.json();
        setUserDetails(data.user);
        console.log(`${type.charAt(0).toUpperCase() + type.slice(1)} updated successfully:`, data);
      } else {
        console.error(`Failed to update ${type}`);
      }
    } catch (error) {
      console.error(`Error updating ${type}:`, error);
    }
  };

  const handleEditGenres = () => {
    if (!userDetails) return;
    const newGenres = prompt('Enter new genres (comma separated):', userDetails.selectedGenres.join(', '));
    if (newGenres !== null) {
      updateUserDetails('genres', newGenres.split(',').map(item => item.trim()));
    }
  };

  const handleEditLanguages = () => {
    if (!userDetails) return;
    const newLanguages = prompt('Enter new languages (comma separated):', userDetails.selectedLanguages.join(', '));
    if (newLanguages !== null) {
      updateUserDetails('languages', newLanguages.split(',').map(item => item.trim()));
    }
  };


  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      setEnter(event.target.value);
    }
  };
  // Update the audio search term with the transcript
  useEffect(() => {
    if (transcript) {
      console.log(transcript)
      setAudioSearchTerm(transcript); // Update the audio search term
    }
  }, [transcript]);

  // Check if browser supports speech recognition
  if (!browserSupportsSpeechRecognition) {
    return <div>Speech recognition is not supported in your browser.</div>;
  }

  return (
    <nav className="navbar">
      <button onClick={toggleSidebar} className="sidebar-toggle">☰</button>
      <div className="logo">
        <Link to="/">🎬 MovieFlix</Link>
      </div>
      <div className="search-bar">
        <input
          type="text"
          placeholder="What's your mood?"
          value={searchTerm}
          onChange={handleSearch}
        />
        <div className="voice-search-container">
          <input
            type="text"
            placeholder="Search by voice"
            value={audioSearchTerm}
            onKeyPress={handleKeyPress}
            onChange={handleAudioSearch}
            className="voice-search-input"
          />
          <div className="flex gap-3 items-center">
        <button
          className="btn btn-primary btn-sm rounded-full w-16 h-16 flex justify-center items-center"
          onClick={() => {
            if (listening) {
              SpeechRecognition.stopListening();
            } else {
              resetTranscript();
              SpeechRecognition.startListening();
            }
          }}
        >
          <FaMicrophone className={`text-3xl ${listening ? "text-red-500" : "text-black"}`}  style={{color:"white"}} />
        </button>
      </div>
     
        </div>
      </div>
      <ul className="nav-links">
        <li><Link to="/">Home</Link></li>
        <li><Link to="/filter">Feedback</Link></li>
        <li><Link to="/about">About</Link></li>
      </ul>
      {isLoggedIn ? (
        <button onClick={handleLogout} className="logout-button">Logout</button>
      ) : (
        <Link to="/login" className="login-button">Login</Link>
      )}

      <div className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <button onClick={toggleSidebar} className="close-button">✖</button>
        <h3>PROFILE</h3>

        {userDetails && (
          <div className="user-details">
            <h4>Welcome, {userDetails.name}</h4>
            <p>Email: <span style={{ color: "orange" }}>{userDetails.email}</span></p>
            <div>
              <p>Genres: <span className="answer">{userDetails.selectedGenres.join(', ')}</span></p>
              <span className="edit-icon" onClick={handleEditGenres}>✎</span>
            </div>
            <div>
              <p>Languages: <span className="answer">{userDetails.selectedLanguages.join(', ')}</span></p>
              <span className="edit-icon" onClick={handleEditLanguages}>✎</span>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
