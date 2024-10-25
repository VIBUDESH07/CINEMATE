import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './styles/Navbar.css';

const Navbar = ({ searchTerm, setSearchTerm }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check local storage for login status on mount
  useEffect(() => {
    const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
    setIsLoggedIn(loggedIn);
  }, []);

  // Function to handle logout
  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn'); // Remove login status
    localStorage.removeItem('username'); // Optionally remove username
    setIsLoggedIn(false); // Update local state
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  return (
    <nav className="navbar">
      <div className="logo">
        <Link to="/">🎬 MovieFlix</Link>
      </div>
      <div className="search-bar">
        <input
          type="text"
          placeholder="What's your mood?..."
          value={searchTerm}
          onChange={handleSearch}
        />
      </div>
      <ul className="nav-links">
        <li>
          <Link to="/">Home</Link>
        </li>
        <li>
          <Link to="/filter">Filter</Link>
        </li>
        <li>
          <Link to="/about">About</Link>
        </li>
      </ul>
      {isLoggedIn ? (
        <button onClick={handleLogout} className="logout-button">Logout</button>
      ) : (
        <Link to="/login" className="login-button">Login</Link>
      )}
    </nav>
  );
};

export default Navbar;
