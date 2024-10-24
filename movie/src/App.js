import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from './components/Home/Home.jsx';
import MovieDetails from './components/Home/MovieDetails.jsx';
import LoginSignup from './components/Home/Login.jsx';
import FilterPage from './components/Home/FilterPage.jsx';
import MoviesPage from './components/Home/MoviesPage.jsx';
import Artists from './components/Main/user_details/Artists'; // Import Artists component

const App = () => {
  return (
    
      <Routes>
        {/* Define your routes here */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginSignup />} />
        <Route path="/movie/:id" element={<MovieDetails />} />
        <Route path="/filter" element={<FilterPage />} />
        <Route path="/movies" element={<MoviesPage />} />
       
        <Route path="/artists" element={<Artists />} /> {/* Artists route */}
      </Routes>
    
  );
};

export default App;
