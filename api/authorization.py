from flask import Flask, jsonify, request
from flask_cors import CORS
from pymongo import MongoClient
from urllib.parse import quote_plus
from bson.objectid import ObjectId
import base64

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
quizzes_collection = db["quizzes"]
combinations_collection = db["combinations"]
windwords_collection = db["windwords"]  # Nova coleção para Palavras ao Vento

# Endpoint para adicionar um novo quiz
@app.route('/add_quiz', methods=['POST'])
def add_quiz():
    try:
        quiz_data = request.json
        result = quizzes_collection.insert_one(quiz_data)
        return jsonify({"status": "success", "id": str(result.inserted_id)})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 400

# Endpoint para adicionar um novo quiz de combinação
@app.route('/add_combination', methods=['POST'])
def add_combination():
    try:
        combination_data = request.json
        result = combinations_collection.insert_one(combination_data)
        return jsonify({"status": "success", "id": str(result.inserted_id)})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 400

# Endpoint para adicionar Palavras ao Vento
@app.route('/add_windwords', methods=['POST'])
def add_windwords():
    try:
        windwords_data = request.json
        result = windwords_collection.insert_one(windwords_data)
        return jsonify({"status": "success", "id": str(result.inserted_id)})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 400

# Endpoint para buscar todos os quizzes
@app.route('/get_quizzes', methods=['GET'])
def get_quizzes():
    quizzes = list(quizzes_collection.find())
    for quiz in quizzes:
        quiz["_id"] = str(quiz["_id"])
    return jsonify(quizzes), 200

# Endpoint para buscar todas as combinações
@app.route('/get_combinations', methods=['GET'])
def get_combinations():
    combinations = list(combinations_collection.find())
    for combination in combinations:
        combination["_id"] = str(combination["_id"])
    return jsonify(combinations), 200

# Endpoint para buscar todas as Palavras ao Vento
@app.route('/get_windwords', methods=['GET'])
def get_windwords():
    windwords = list(windwords_collection.find())
    for item in windwords:
        item["_id"] = str(item["_id"])
    return jsonify(windwords), 200

# Endpoint para atualizar um quiz
@app.route('/update_quiz/<quiz_id>', methods=['PUT'])
def update_quiz(quiz_id):
    try:
        updated_data = request.json
        result = quizzes_collection.update_one({"_id": ObjectId(quiz_id)}, {"$set": updated_data})
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
        result = quizzes_collection.delete_one({"_id": ObjectId(quiz_id)})
        if result.deleted_count > 0:
            return jsonify({"status": "success"}), 200
        else:
            return jsonify({"status": "failure", "message": "Quiz not found"}), 404
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 400

# Endpoint para deletar uma combinação
@app.route('/delete_combination/<combination_id>', methods=['DELETE'])
def delete_combination(combination_id):
    try:
        result = combinations_collection.delete_one({"_id": ObjectId(combination_id)})
        if result.deleted_count > 0:
            return jsonify({"status": "success"}), 200
        else:
            return jsonify({"status": "failure", "message": "Combination not found"}), 404
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 400

# Endpoint para deletar Palavras ao Vento
@app.route('/delete_windwords/<windwords_id>', methods=['DELETE'])
def delete_windwords(windwords_id):
    try:
        result = windwords_collection.delete_one({"_id": ObjectId(windwords_id)})
        if result.deleted_count > 0:
            return jsonify({"status": "success"}), 200
        else:
            return jsonify({"status": "failure", "message": "Windwords not found"}), 404
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 400

# Executa a API
if __name__ == "__main__":
    app.run(debug=True, port=5000)
