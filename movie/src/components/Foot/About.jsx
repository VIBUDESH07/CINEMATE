import React from 'react';
import './About.css';

const About = () => {
  return (
    <div className="about-container">
      <div className="about-header">
        <h1>About MovieHub</h1>
        <p>Your Ultimate Movie Recommendation Hub</p>
      </div>

      <div className="about-content">
        <section className="about-section">
          <h2>Our Mission</h2>
          <p>
            MovieHub is dedicated to providing the best movie recommendations based on your preferences. Whether you're in the mood for action, comedy, romance, or a genre you're discovering for the first time, our platform offers personalized suggestions tailored to your tastes. 
          </p>
          <p>
            We strive to make it easier for you to find movies in your preferred language, featuring your favorite heroes and heroines. Our diverse range of movie genres ensures that there's something for everyone!
          </p>
        </section>

        <section className="about-section">
          <h2>How It Works</h2>
          <p>
            MovieHub uses advanced algorithms to analyze your viewing history, ratings, and genre preferences. You can easily select your favorite genres, languages, and actors to receive accurate recommendations. Our recommendation engine considers the emotional tone of your requests to offer the perfect match for your mood.
          </p>
          <p>
            Simply log in, choose your preferences, and let MovieHub do the rest. It’s that simple! You'll be able to watch trailers, read reviews, and make an informed decision on what to watch next.
          </p>
        </section>

        <section className="about-section">
          <h2>Why Choose Us?</h2>
          <ul>
            <li>Personalized movie recommendations based on your preferences.</li>
            <li>Multilingual platform, offering movie suggestions in Tamil, Telugu, Hindi, Malayalam, Kannada, and more.</li>
            <li>Seamless user experience with intuitive navigation and sleek design.</li>
            <li>In-depth movie information including trailers, reviews, and ratings.</li>
          </ul>
        </section>

        <section className="about-section">
          <h2>Join Us Today</h2>
          <p>
            Ready to find your next favorite movie? Join MovieHub and start discovering movies tailored to your taste today! Sign up for free and explore a world of cinematic experiences!
          </p>
        </section>
      </div>

      <div className="about-footer">
        <p>© 2024 MovieHub | All Rights Reserved</p>
      </div>
    </div>
  );
};

export default About;
