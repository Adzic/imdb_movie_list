import re 
from flask import Flask, jsonify
from flask_cors import CORS, cross_origin
from bs4 import BeautifulSoup
import requests

app = Flask(__name__)
cors = CORS(app)

@app.route('/api/lists/<user_id>')
@cross_origin()
def get_lists(user_id):
    url = f'https://www.imdb.com/user/{user_id}/lists/'
    response = requests.get(url)
    soup = BeautifulSoup(response.text, 'html.parser')
    lists = soup.find_all('a', href=re.compile('/list/'))
    return jsonify([f"https://www.imdb.com{link['href']}" for link in lists])

@app.route('/api/list/<list_id>')
@cross_origin()
def get_list_movies(list_id):
    url = f'https://www.imdb.com/list/{list_id}/'
    response = requests.get(url)
    soup = BeautifulSoup(response.text, 'html.parser')
    movies = []
    
    for item in soup.select('.lister-item'):
        title = item.select_one('.lister-item-header a').text
        year = item.select_one('.lister-item-year').text.strip('()')
        rating = item.select_one('.ipl-rating-star__rating')
        rating = rating.text if rating else 'N/A'
        genre = item.select_one('.genre')
        genre = genre.text.strip() if genre else 'N/A'
        
        movies.append({
            'title': title,
            'year': year,
            'rating': rating,
            'genre': genre
        })
    
    return jsonify(movies)

@app.route('/')
def index():
    return app.send_static_file('index.html')

if __name__ == '__main__':
    app.run(debug=True)