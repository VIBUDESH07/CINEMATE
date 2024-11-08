import React, { useState, useEffect } from 'react';
import axios from 'axios';

const FeedbackPage = () => {
  const [email, setEmail] = useState('');
  const [feedbackText, setFeedbackText] = useState('');

  useEffect(() => {
    // Retrieve the email (stored as "username") from local storage
    const storedEmail = localStorage.getItem('username');
    if (storedEmail) {
      setEmail(storedEmail);
    }
  }, []);

  const handleFeedbackSubmit = async () => {
    try {
      // Construct feedback data
      const feedbackData = {
        email,
        feedback: feedbackText,
      };

      // Send feedback to the backend
      const response = await axios.post('https://movie-recommendation-web-2.onrender.com/api/feedback', feedbackData);

      console.log('Feedback sent successfully:', response.data);
      alert('Feedback submitted successfully!');
    } catch (error) {
      console.error('Error sending feedback:', error);
      alert('Failed to send feedback');
    }
  };

  return (
    <div style={styles.container}>
      <h2>Website Feedback</h2>

      {/* Email Display */}
      <p><strong>Email:</strong> {email}</p>

      {/* Feedback Textarea */}
      <div style={styles.inputGroup}>
        <label>Your Feedback</label>
        <textarea
          value={feedbackText}
          onChange={(e) => setFeedbackText(e.target.value)}
          style={styles.textArea}
          placeholder="Share your feedback about the website here..."
        />
      </div>

      <button onClick={handleFeedbackSubmit} style={styles.button}>
        Submit Feedback
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
    maxWidth: '500px',
    margin: '0 auto',
  },
  inputGroup: {
    marginBottom: '20px',
  },
  textArea: {
    padding: '10px',
    width: '100%',
    height: '100px',
    borderRadius: '5px',
    border: '1px solid #ccc',
    resize: 'none',
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

export default FeedbackPage;
