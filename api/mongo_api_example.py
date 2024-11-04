from flask import Flask, jsonify, request
from flask_cors import CORS
from pymongo import MongoClient
from urllib.parse import quote_plus
from bson.objectid import ObjectId

app = Flask(__name__)

# Configurar CORS para permitir requisições do Live Server
CORS(app, resources={r"/*": {"origins": "http://127.0.0.1:5500"}})

# Configuração da Conexão com o MongoDB
username = quote_plus("api_rest")
password = quote_plus("Zi20z1lu8NkZS9Qw")
cluster_url = "cluster0.kqv60.mongodb.net"
database_name = "class_gaming"

client = MongoClient(f"mongodb+srv://{username}:{password}@{cluster_url}/{database_name}?retryWrites=true&w=majority")
db = client[database_name]
collection = db["quizzes"]

# Endpoint para adicionar um novo quiz
@app.route('/add_quiz', methods=['POST'])
def add_quiz():
    try:
        quiz_data = request.json
        result = collection.insert_one(quiz_data)
        return jsonify({"status": "success", "id": str(result.inserted_id)})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 400

# Endpoint para buscar todos os quizzes
@app.route('/get_quizzes', methods=['GET'])
def get_quizzes():
    quizzes = list(collection.find())
    for quiz in quizzes:
        quiz["_id"] = str(quiz["_id"])
    return jsonify(quizzes), 200

# Endpoint para atualizar um quiz
@app.route('/update_quiz/<quiz_id>', methods=['PUT'])
def update_quiz(quiz_id):
    try:
        updated_data = request.json
        result = collection.update_one({"_id": ObjectId(quiz_id)}, {"$set": updated_data})
        if result.modified_count > 0:
            return jsonify({"status": "success"}), 200
        else:
            return jsonify({"status": "failure", "message": "Quiz not found or data unchanged"}), 404
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 400

# Endpoint para deletar um quiz
@app.route('/delete_quiz/<quiz_id>', methods=['DELETE'])
def delete_quiz(quiz_id):
    try:
        result = collection.delete_one({"_id": ObjectId(quiz_id)})
        if result.deleted_count > 0:
            return jsonify({"status": "success"}), 200
        else:
            return jsonify({"status": "failure", "message": "Quiz not found"}), 404
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 400

# Executa a API
if __name__ == "__main__":
    app.run(debug=True, port=5000)
