import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './styles/Navbar.css';
import { Navigate } from 'react-router-dom';
const Navbar = ({ searchTerm, setSearchTerm }) => {
  const loc=useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [userDetails, setUserDetails] = useState(null);

  // Check local storage for login status and username on mount
  useEffect(() => {
    const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
    setIsLoggedIn(loggedIn);

    const email = localStorage.getItem('username');
    if (email) {
      fetchUserDetails(email); // Fetch user details if email is available
    }
  }, []);

  // Fetch user details from API
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

  // Function to handle logout
  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('username');
    setIsLoggedIn(false);
    loc('/login');
  };

  // Function to handle search input change
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  // Function to toggle the sidebar visibility
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Function to update user details via API
  const updateUserDetails = async (type, updatedFields) => {
    const email = localStorage.getItem('username'); // Get email from localStorage
    let apiUrl = '';

    // Select the appropriate API endpoint based on the type (genres, languages, artists)
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
        body: JSON.stringify({ [`selected${type.charAt(0).toUpperCase() + type.slice(1)}`]: updatedFields }),
      });

      if (response.ok) {
        const data = await response.json();
        setUserDetails(data.user); // Update user details after successful update
        console.log(`${type.charAt(0).toUpperCase() + type.slice(1)} updated successfully:`, data);
      } else {
        console.error(`Failed to update ${type}`);
      }
    } catch (error) {
      console.error(`Error updating ${type}:`, error);
    }
  };

  // Handle edit functions for each field (genre, language, artist)
  const handleEditGenres = () => {
    const newGenres = prompt('Enter new genres (comma separated):', userDetails.selectedGenres.join(', '));
    if (newGenres !== null) {
      updateUserDetails('genres', newGenres.split(',').map(item => item.trim()));
    }
  };

  const handleEditLanguages = () => {
    const newLanguages = prompt('Enter new languages (comma separated):', userDetails.selectedLanguages.join(', '));
    if (newLanguages !== null) {
      updateUserDetails('languages', newLanguages.split(',').map(item => item.trim()));
    }
  };

  const handleEditArtists = () => {
    const newArtists = prompt('Enter new artists (comma separated):', userDetails.selectedArtists.join(', '));
    if (newArtists !== null) {
      updateUserDetails('artists', newArtists.split(',').map(item => item.trim()));
    }
  };

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

      {/* Sidebar */}
      <div className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <button onClick={toggleSidebar} className="close-button">✖</button>
        <h3>PROFILE</h3>

        {/* Display user details if available */}
        {userDetails && (
          <div className="user-details">
            <h4>Welcome, {userDetails.name}</h4>
            <p>Email: <span style={{color:"orange"}}>{userDetails.email}</span></p>

            {/* Display selected genre with edit icon */}
            <div>
  <p > Genres: <span className="answer">{userDetails.selectedGenres.join(', ')}</span></p>
  <span className="edit-icon" onClick={handleEditGenres}>✎</span>
</div>

{/* Display selected languages with edit icon */}
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
