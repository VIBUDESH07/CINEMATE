import React from 'react';
import { Link } from 'react-router-dom';
import './styles/Navbar.css';

const Navbar = ({ searchTerm, setSearchTerm }) => {
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  return (
    <nav className="navbar"> {/* Make sure this matches the CSS class */}
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
          <Link to="/filter">Filter</Link>
        </li>
        <li>
          <Link to="/about">About</Link>
        </li>
      </ul>
      <Link to="/login" className="login-button">Login</Link> {/* Login button added */}
    </nav>
  );
};

export default Navbar;
