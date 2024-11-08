import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from './components/Home/Home.jsx';
import MovieDetails from './components/Home/MovieDetails.jsx';
import LoginSignup from './components/Home/Login.jsx';
import FilterPage from './components/Home/FilterPage.jsx';
import MoviesPage from './components/Home/MoviesPage.jsx';
import Artists from './components/Main/user_details/Artists';
import About1 from './components/Foot/About.jsx';
import ProtectedRoute from './components/ProtectedRoute'; // Import ProtectedRoute component
import Recent from './components/Foot/Recent.jsx';

const App = () => {
  return (

      <Routes>
        {/* Public Route */}
        <Route path="/login" element={<LoginSignup />} />
        
        {/* Protected Routes */}
        <Route path="/" element={
          <ProtectedRoute>
            <HomePage />
          </ProtectedRoute>
        } />
        <Route path="/movie/:id" element={
          <ProtectedRoute>
            <MovieDetails />
          </ProtectedRoute>
        } />
      
        <Route path="/filter" element={
          <ProtectedRoute>
            <FilterPage />
          </ProtectedRoute>
        } />
        <Route path="/movies" element={
          <ProtectedRoute>
            <MoviesPage />
          </ProtectedRoute>
        } />
        <Route path="/artists" element={
          <ProtectedRoute>
            <Artists />
          </ProtectedRoute>
        } />

        {/* Public Route */}
        <Route path="/about" element={<About1 />} />
      </Routes>
 
  );
};

export default App;
