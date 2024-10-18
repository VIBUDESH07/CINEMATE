// src/LoginSignup.js
import React, { useState } from 'react';
import { auth } from '../Firebase'; // Import the Firebase auth instance
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import loginImage from './images/unnamed.jpg'; // Replace with your image path

const LoginSignup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [popupMessage, setPopupMessage] = useState(''); // State for popup message
  const navigate = useNavigate(); // Initialize useNavigate

  const validatePassword = (password) => {
    const regex = /^(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/; // At least 8 characters and one special character
    return regex.test(password);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password || (!isLogin && !confirmPassword)) {
      setError('Please fill in all required fields');
      return;
    }

    if (!isLogin && password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!validatePassword(password)) {
      setError('Password must be at least 8 characters long and contain at least one special character');
      return;
    }

    try {
      if (isLogin) {
        // Login
        await signInWithEmailAndPassword(auth, email, password);
        setPopupMessage('Login successful!'); // Set popup message
        navigate('/'); // Redirect to the home page
      } else {
        // Signup
        await createUserWithEmailAndPassword(auth, email, password);
        setPopupMessage('Signup successful!'); // Set popup message
        navigate('/login'); // Redirect to the login page
      }
      // Hide the popup after 3 seconds
      setTimeout(() => setPopupMessage(''), 3000);
    } catch (err) {
      setError(err.message); // Set error message from Firebase
      console.error('Error processing request', err);
    }
  };

  return (
    <div style={styles.container}>
      {/* Left Side Image */}
      <div style={styles.imageContainer}>
        <img
          src={loginImage} // Replace with your image path if local
          alt="Login"
          style={styles.image}
        />
      </div>

      {/* Right Side Form */}
      <div style={styles.formContainer}>
        <h2>{isLogin ? 'Login' : 'Signup'}</h2>
        {error && <p style={styles.error}>{error}</p>}
        {popupMessage && <div style={styles.popup}>{popupMessage}</div>} {/* Popup message */}
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
              required
            />
          </div>
          <div style={styles.inputGroup}>
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
              required
            />
          </div>
          {!isLogin && (
            <div style={styles.inputGroup}>
              <label>Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                style={styles.input}
                required
              />
            </div>
          )}
          <button type="submit" style={styles.button}>
            {isLogin ? 'Login' : 'Signup'}
          </button>
        </form>
        <p style={styles.toggleText}>
          {isLogin ? "Don't have an account?" : 'Already have an account?'}
          <button
            style={styles.toggleButton}
            onClick={() => {
              setIsLogin(!isLogin);
              setError(''); // Clear error when toggling
            }}
          >
            {isLogin ? 'Sign up' : 'Login'}
          </button>
        </p>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    height: '100vh',
    flexDirection: 'row',
    backgroundColor: '#f0f4f8', // Light background for contrast
  },
  imageContainer: {
    flex: 1,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#d9e3eb', // Slightly darker for depth
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)', // Shadow for depth
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    borderRadius: '10px 0 0 10px', // Rounded corners
  },
  formContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '40px',
    backgroundColor: '#ffffff',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)', // Deeper shadow for contrast
    borderRadius: '10px',
  },
  form: {
    width: '320px',
    padding: '20px',
    borderRadius: '15px',
    background: 'linear-gradient(145deg, #ffffff, #f0f0f0)', // Soft gradient for depth
    boxShadow: '0 8px 30px rgba(0, 0, 0, 0.2)', // Initial shadow effect
  },
  inputGroup: {
    marginBottom: '20px',
  },
  input: {
    width: '100%',
    padding: '12px',
    border: '2px solid #007bff', // Thicker border
    borderRadius: '5px',
    transition: 'border-color 0.3s, box-shadow 0.3s', // Transition for input focus
  },
  button: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#007bff',
    color: '#ffffff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontWeight: 'bold',
    transition: 'background-color 0.3s', // Button hover effects
  },
  toggleText: {
    marginTop: '20px',
    fontSize: '14px',
    color: '#495057', // Darker text color for toggle text
  },
  toggleButton: {
    background: 'none',
    border: 'none',
    color: '#007bff',
    cursor: 'pointer',
    marginLeft: '5px',
    textDecoration: 'underline',
    fontWeight: 'bold',
  },
  error: {
    color: 'red',
    marginBottom: '15px',
    fontWeight: 'bold',
  },
  popup: {
    backgroundColor: '#28a745', // Green background for success message
    color: '#ffffff',
    padding: '10px',
    borderRadius: '5px',
    marginBottom: '15px',
    animation: 'fadeIn 0.5s, fadeOut 0.5s 3s', // Animation for pop-up (optional)
    width: '100%',
    textAlign: 'center',
  },
};

export default LoginSignup;
