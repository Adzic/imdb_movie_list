from flask import Flask, jsonify
from bs4 import BeautifulSoup
import requests
import re

app = Flask(__name__)

@app.route('/api/lists/<user_id>')
def get_lists(user_id):
    url = f'https://www.imdb.com/user/{user_id}/lists/'
    response = requests.get(url)
    soup = BeautifulSoup(response.text, 'html.parser')
    lists = soup.find_all('a', href=re.compile('/list/'))
    return jsonify([f"https://www.imdb.com{link['href']}" for link in lists])

if __name__ == '__main__':
    app.run(debug=True)