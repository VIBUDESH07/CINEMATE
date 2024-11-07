from flask import Flask, render_template, request,jsonify
import re
from fuzzywuzzy import fuzz
from flask_cors import CORS
# Define mappings for languages, genres, moods, heroes, and heroines
languages = ["tamil", "hindi", "telugu", "malayalam", "kannada"]
expanded_genres = [
    "action", "adventure", "comedy", "drama", "romance", 
    "thriller", "motivation", "family", "crime", "feel good", 
    "horror", "sci-fi", "fantasy", "mystery", "musical", 
    "biography", "documentary", "history", "war", "animation", 
    "superhero", "epic", "noir", "western", "experimental", 
    "indie", "mockumentary", "psychological", "slice of life", 
    "sport", "romantic comedy", "coming-of-age", "dance", 
    "art-house", "urban", "political", "historical drama", "spy"
]
positive_keywords = [
    "like", "love", "favorite", "enjoy", "adore", "appreciate", "prefer", 
    "admire", "excited", "thrilled", "passionate", "satisfied", "delighted", 
    "pleased", "grateful", "joyful", "fond", "happy", "ecstatic", "overjoyed", 
    "positive", "inspired", "optimistic", "good", "support", "proud", "fantastic",
    "amazing", "great", "marvelous", "beautiful", "charmed", "touched", "content", 
    "blessed", "thankful", "hopeful", "relieved", "eager", "cheerful", "elated"
]
negative_keywords = [
    "hate", "dislike", "avoid", "don't", "dread", "annoyed", "disgusted", 
    "unhappy", "depressed", "frustrated", "angry", "upset", "bored", 
    "tired", "miserable", "angsty", "resent", "offended", "displeased", 
    "uncomfortable", "irritated", "uninterested", "detest", "abhorrence", 
    "pessimistic", "down", "sad", "defeated", "hopeless", "sorrow", "regret", 
    "shame", "distressed", "discouraged", "lonely", "jealous", "guilty", 
    "betrayed", "helpless", "rejected", "terrible", "terrifying", "disheartening", 
    "disappointed", "annoyance", "vulnerable", "weary"
]

mood_genre_mapping = {
    "angry": ["action", "comedy", "feel good", "thriller"],
    "depressed": ["motivation", "family", "drama", "romance"],
    "happy": ["comedy", "romance", "family", "musical"],
    "sad": ["drama", "family", "romance", "feel good"],
    "excited": ["adventure", "thriller", "action", "sci-fi"],
    "bored": ["sci-fi", "fantasy", "adventure", "comedy"],
    "scared": ["horror", "thriller", "mystery", "crime"],
    "surprised": ["mystery", "thriller", "sci-fi", "fantasy"],
    "nostalgic": ["romance", "drama", "musical", "feel good"],
    "romantic": ["romance", "comedy", "drama", "musical"],
    "motivated": ["motivational", "drama", "action", "sports"],
    "sentimental": ["drama", "romance", "family", "musical"],
    "confused": ["mystery", "thriller", "sci-fi", "fantasy"],
    "curious": ["mystery", "adventure", "sci-fi", "fantasy"],
    "grateful": ["drama", "romance", "family", "feel good"],
    "hopeful": ["romance", "motivational", "comedy", "family"],
    "loved": ["romance", "family", "drama", "feel good"],
    "guilty": ["drama", "thriller", "crime", "mystery"],
    "proud": ["action", "drama", "motivational", "sports"],
    "inspired": ["motivational", "drama", "family", "sports"],
    "relaxed": ["comedy", "romance", "family", "feel good"],
    "playful": ["comedy", "family", "animation", "musical"],
    "anxious": ["thriller", "horror", "mystery", "drama"],
    "love-struck": ["romance", "comedy", "drama", "musical"],
    "jealous": ["thriller", "drama", "mystery", "crime"],
    "rejected": ["drama", "romance", "comedy", "feel good"],
    "empty": ["drama", "romance", "family", "motivational"]
}

heroes = [
    "Rajinikanth", "Kamal Haasan", "Vijay", "Ajith Kumar", "Suriya", 
    "Dhanush", "Vikram", "Mahesh Babu", "Allu Arjun", "Ram Charan", 
    "Shah Rukh Khan", "Salman Khan", "Aamir Khan", "Ranveer Singh", 
    "Akshay Kumar", "Prabhas", "Yash", "Hrithik Roshan", "Ranbir Kapoor", 
    "Arvind Swamy", "Rana Daggubati", "Nani", "Vijay Sethupathi", 
    "Dulquer Salmaan", "Fahadh Faasil", "Karthi", "Naga Chaitanya", 
    "Siddharth", "Vishal", "Sathyaraj", "Prithviraj Sukumaran", "Raghava Lawrence", 
    "Jagapathi Babu", "Tovino Thomas", "Suresh Gopi", "Mammootty", "Chiranjeevi", 
    "Nandamuri Balakrishna", "Pawan Kalyan", "Venkatesh", "Dhanraj", "Venu Madhav"
]


heroines = [
    "Sridevi", "Simran", "Nayanthara", "Jyothika", "Samantha", 
    "Rashmika Mandanna", "Shruti Haasan", "Anushka Shetty", 
    "Deepika Padukone", "Katrina Kaif", "Priyanka Chopra", 
    "Alia Bhatt", "Kangana Ranaut", "Kareena Kapoor", "Rani Mukerji", 
    "Vidya Balan", "Anushka Sharma", "Sonam Kapoor", "Kriti Sanon", 
    "Tapsee Pannu", "Kajal Aggarwal", "Shraddha Kapoor", "Jacqueline Fernandez", 
    "Madhuri Dixit", "Parineeti Chopra", "Ileana D'Cruz", "Zareen Khan", 
    "Asin Thottumkal", "Bipasha Basu", "Neha Sharma", "Pooja Hegde", 
    "Nivetha Thomas", "Tamannaah Bhatia", "Nayanthara", "Raashi Khanna", 
    "Trisha Krishnan", "Madhubala", "Mehreen Pirzada", "Aishwarya Rai", 
    "Nargis Fakhri", "Sunny Leone", "Sushmita Sen"
]

# Function to find best fuzzy match within a list
def find_best_matches(input_text, options, threshold=80):
    matches = []
    for option in options:
        if fuzz.partial_ratio(input_text.lower(), option.lower()) >= threshold:
            matches.append(option)
    return matches

# Function to analyze input prompt and return details
def analyze_prompt(prompt):
    result = {
        "language": None,
        "genres": [],
        "excluded_genres": [],
        "top_n": None,
        "heroes": [],
        "heroines": [],
        "order": "desc",
        "year": None
    }

    # Detect language
    for lang in languages:
        if lang in prompt.lower():
            result["language"] = lang.capitalize()
            break

    is_negative = any(keyword in prompt.lower() for keyword in negative_keywords)
    is_positive = any(keyword in prompt.lower() for keyword in positive_keywords)

    # Detect genre preferences
    for genre in expanded_genres:
        if fuzz.partial_ratio(prompt.lower(), genre.lower()) > 80:
            if is_negative:
                result["excluded_genres"].append(genre)
            else:
                result["genres"].append(genre)

    # Detect mood-based genres
    for mood, mood_genres in mood_genre_mapping.items():
        if mood in prompt.lower():
            result["genres"].extend(mood_genres)

    # Detect heroes and heroines
    result["heroes"] = find_best_matches(prompt, heroes)
    result["heroines"] = find_best_matches(prompt, heroines)

    return result

# Initialize Flask app
app = Flask(__name__)
CORS(app) 
@app.route("/", methods=["GET", "POST"])
def index():
    if request.method == "POST":
        # Check if the request is JSON
        if request.is_json:
            data = request.get_json()
            prompt = data.get("prompt")
            analysis = analyze_prompt(prompt)
            return jsonify(analysis)  # Return JSON response
        else:
            # If the request is not JSON, return a 400 error
            return jsonify({"error": "Expected JSON format"}), 400

    # Handle GET request and return a simple message or 404 for unsupported methods
    return "Send a POST request with JSON data", 404

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
