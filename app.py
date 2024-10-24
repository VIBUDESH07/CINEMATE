import requests
import os

# Replace with your actual API key and Custom Search Engine ID
API_KEY = 'AIzaSyB16086eqQJCqpgqUtRp3xSpqREQOW5BZ8'
SEARCH_ENGINE_ID = '5428a1ae51cd7458e'

# List of languages to download images for
languages = ['Tamil', 'Telugu', 'Malayalam', 'Hindi', 'Kannada']

def download_image(url, folder, filename):
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3'
    }
    
    try:
        response = requests.get(url, headers=headers)
        if response.status_code == 200:
            with open(os.path.join(folder, filename), 'wb') as f:
                f.write(response.content)
            print(f"Downloaded {filename} from {url}")
        else:
            print(f"Error downloading {filename}: {response.status_code}")
    except Exception as e:
        print(f"Exception occurred while downloading {filename}: {e}")

def fetch_image(language_name):
    search_url = f"https://www.googleapis.com/customsearch/v1?q={language_name} flag&cx={SEARCH_ENGINE_ID}&key={API_KEY}&searchType=image"
    response = requests.get(search_url)
    if response.status_code == 200:
        search_results = response.json()
        if 'items' in search_results:
            return search_results['items'][0]['link']  # Get the first image link
        else:
            print(f"No images found for {language_name}")
    else:
        print(f"Error fetching images for {language_name}: {response.status_code}")
    return None

# Create a folder to save the images
if not os.path.exists('language_images'):
    os.makedirs('language_images')

# Loop through each language to download images
for language in languages:
    print(f"Searching for image of {language}...")
    image_url = fetch_image(language)
    if image_url:
        download_image(image_url, 'language_images', f"{language.lower()}.jpg")
