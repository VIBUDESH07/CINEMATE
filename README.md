
# Movie Recommendation Website

## Overview

This is a full-stack movie recommendation web app designed to provide tailored movie suggestions based on user preferences and moods. Users can explore movie details, genres, language options, and popular artists. The web app fetches trailers, includes a robust signup and authentication process, and uses machine learning for emotion-based recommendations.

## Features

- **User Signup and Login**: Language and preference selection during signup.
- **Emotion-Based Recommendations**: Suggests movies based on user moods like "angry," "happy," or "motivational" using a pre-trained model.
- **Search and Prompts**: Users can search by genres, languages, or prompts like "top 10 Tamil movies."
- **Language Support**: Available in Tamil, Telugu, Malayalam, Hindi, and Kannada.
- **Artist and Genre Suggestions**: A curated selection of heroes, heroines, and genres for personalized recommendations.
- **Trailers and Details**: Embedded YouTube trailers and detailed information for each movie.

## Tech Stack

- **Frontend**: React, HTML, CSS
- **Backend**: Node.js, Express.js, MongoDB, Flask (for emotion model API)
- **Database**: MongoDB Atlas and MySQL
- **APIs Used**: Google Custom Search API for fetching YouTube trailers and artist images
- **Hosting**: Render (for Flask API), Elastic Beanstalk for web app

## Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/movie-recommendation-website.git
   cd movie-recommendation-website
   ```

2. **Install Backend Dependencies**:
   ```bash
   cd backend
   npm install
   ```

3. **Install Frontend Dependencies**:
   ```bash
   cd frontend
   npm install
   ```

4. **Environment Variables**: Create `.env` files for frontend and backend with the following variables:
   
   - **MongoDB URL**: For example, `mongodb+srv://vibudesh:040705@cluster0.bojv6ut.mongodb.net/Movie`
   - **Google API Key and CSE ID** for Google Custom Search API

5. **Run the Application**:
   - **Backend**: 
     ```bash
     cd backend
     npm start
     ```
   - **Frontend**:
     ```bash
     cd frontend
     npm start
     ```

## Usage

- **Signup**: Choose preferred languages, heroes, heroines, and genres.
- **Search**: Use prompts or genre-based search to find movies.
- **Emotion-Based Search**: Enter moods or emotional states to get recommended genres and movies.

## Folder Structure

```plaintext
movie-recommendation-website
├── frontend
│   ├── public
│   └── src
├── backend
│   ├── models
│   ├── routes
│   └── controllers
└── README.md
```
