import React from 'react';
import { Link } from 'react-router-dom';
import './styles/Navbar.css'; // Assume you have styles in this file

const Navbar = ({ searchTerm, setSearchTerm }) => {
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
          placeholder="Search movies by title, hero, heroine, genre..."
          value={searchTerm}
          onChange={handleSearch}
        />
      </div>
      <ul className="nav-links">
        <li>
          <Link to="/">Home</Link>
        </li>
        <li>
          <Link to="/movies">All Movies</Link>
        </li>
        <li>
          <Link to="/about">About</Link>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
