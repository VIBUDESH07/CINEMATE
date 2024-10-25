from flask import Flask, request, jsonify
import re

app = Flask(__name__)

# Define mappings for languages, genres, emotions, heroes, and heroines
languages = ["tamil", "hindi", "telugu", "malayalam", "kannada"]
genres = [
    "action", "comedy", "drama", "romance", "thriller", 
    "motivation", "family", "crime", "feel good", "horror"
]

# Map additional emotions and phrases to genres
emotion_to_genre = {
    "sad": "Drama",
    "angry": "Motivation",
    "relaxed": "Comedy",
    "tortured": "Thriller",
    "happy": "Feel Good",
    "excited": "Action",
    "scared": "Horror",
    "love": "Romance",
    "bored": "Comedy",
    "heartbroken": "Romance",
    "inspired": "Motivation",
    "anxious": "Thriller",
    "adventurous": "Action",
    "nostalgic": "Family",
    "lonely": "Drama",
    "suspenseful": "Thriller",
    "funny": "Comedy",
    "mysterious": "Crime",
    "dark": "Thriller",
    "chilling": "Horror",
    "romantic": "Romance",
}

prompt_to_genre = {
    "feel good movie": "Feel Good",
    "crime movie": "Crime",
    "romantic movie": "Romance",
    "thriller movie": "Thriller",
    "motivational movie": "Motivation",
    "family movie": "Family",
    "horror movie": "Horror",
    "action movie": "Action",
    "comedy movie": "Comedy",
    "adventure movie": "Action",
    "mystery movie": "Crime",
}

# Expanded list of heroes and heroines
heroes = [
    "Rajinikanth", "Kamal Haasan", "Vijay", "Ajith Kumar", "Suriya", 
    "Dhanush", "Vikram", "Mahesh Babu", "Allu Arjun", "Ram Charan", 
    "Shah Rukh Khan", "Salman Khan", "Aamir Khan", "Ranveer Singh", 
    "Akshay Kumar", "Prabhas", "Yash"
]
heroines = [
    "Sridevi", "Simran", "Nayanthara", "Jyothika", "Samantha", 
    "Rashmika Mandanna", "Shruti Haasan", "Anushka Shetty", 
    "Deepika Padukone", "Katrina Kaif", "Priyanka Chopra", 
    "Alia Bhatt", "Kangana Ranaut", "Kareena Kapoor"
]

# Function to analyze input prompt and return details
def analyze_prompt(prompt):
    # Initialize results
    result = {
        "language": None,
        "genre": None,
        "top_n": None,
        "heroes": [],
        "heroines": [],
        "order": "desc"  # default to descending order
    }

    # Detect language
    for lang in languages:
        if lang in prompt.lower():
            result["language"] = lang.capitalize()
            break

    # Detect genre by specific prompt
    for phrase, mapped_genre in prompt_to_genre.items():
        if phrase in prompt.lower():
            result["genre"] = mapped_genre
            break

    # Detect genre by emotion in the prompt
    if not result["genre"]:  # only if no specific prompt matched
        for emotion, mapped_genre in emotion_to_genre.items():
            if emotion in prompt.lower():
                result["genre"] = mapped_genre
                break

    # Detect top N (e.g., "top 10")
    top_n_match = re.search(r"top (\d+)", prompt.lower())
    if top_n_match:
        result["top_n"] = int(top_n_match.group(1))

    # Detect order (e.g., "order=asc")
    if "order=asc" in prompt.lower():
        result["order"] = "asc"

    # Detect heroes and heroines
    for hero in heroes:
        if hero.lower() in prompt.lower() and hero not in result["heroes"]:
            result["heroes"].append(hero)

    for heroine in heroines:
        if heroine.lower() in prompt.lower() and heroine not in result["heroines"]:
            result["heroines"].append(heroine)

    return result

# Flask route to analyze prompt
@app.route('/analyze', methods=['GET'])
def analyze():
    # Get the prompt from request args
    prompt = request.args.get('prompt')
    
    if not prompt:
        return jsonify({"error": "Please provide a prompt parameter"}), 400
    
    # Analyze the prompt and return JSON response
    result = analyze_prompt(prompt)
    return jsonify(result)

# Main entry point for Flask app
if __name__ == '__main__':
    app.run(debug=True)
