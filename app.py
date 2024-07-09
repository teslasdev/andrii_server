from flask import Flask, request, jsonify
from pymongo import MongoClient
from flask_cors import CORS
from dotenv import load_dotenv
import os
import hashlib
from urllib.parse import quote_plus

# Load environment variables from the .env file
load_dotenv()

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Get MongoDB connection details from environment variables
mongo_uri_base = os.getenv("MONGO_URI_BASE")
mongo_user = os.getenv("MONGO_USER")
mongo_pass = os.getenv("MONGO_PASS")

if not all([mongo_uri_base, mongo_user, mongo_pass]):
    raise ValueError("MongoDB connection details are missing in environment variables")

# URL-encode the username and password
mongo_user = quote_plus(mongo_user)
mongo_pass = quote_plus(mongo_pass)

# Construct the full MongoDB URI
mongo_uri = f"mongodb+srv://{mongo_user}:{mongo_pass}@cluster0.oizxf9h.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"

client = MongoClient(mongo_uri)

db = client["user_database"]
users_collection = db["users"]

def hash_password(password):
    return hashlib.sha256(password.encode()).hexdigest()

@app.route('/api/register', methods=['POST'])
def register_user():
    data = request.json
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')

    if not all([name, email, password]):
        return jsonify({"error": "Missing data"}), 400

    user = {
        "name": name,
        "email": email,
        "password": hash_password(password)
    }

    users_collection.insert_one(user)
    return jsonify({"message": "User registered successfully"}), 201

@app.route('/api/login', methods=['POST'])
def login_user():
    data = request.json
    email = data.get('email')
    password = data.get('password')

    if not all([email, password]):
        return jsonify({"error": "Missing data"}), 400

    # Check if user exists in the database
    user = users_collection.find_one({"email": email})

    if user:
        # Validate password
        hashed_password = hash_password(password)
        if user['password'] == hashed_password:
            return jsonify({"message": "Login successful"}), 200
        else:
            return jsonify({"error": "Invalid credentials"}), 401
    else:
        return jsonify({"error": "User not found"}), 404
# Add a simple GET endpoint
@app.route('/api/', methods=['GET'])
def hello_world():
    return jsonify({"message": "Hello World"}), 200

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=8080)
