from flask import Flask, jsonify, request
from flask_cors import CORS
<<<<<<< HEAD
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
=======
from flask_mysqldb import MySQL

# Inicialização do Flask
app = Flask(__name__)

# Configuração do CORS para permitir requisições do Live Server
CORS(app, resources={r"/*": {"origins": "http://127.0.0.1:5500"}})

# Configuração do MySQL
app.config['MYSQL_HOST'] = 'localhost'  # ou o endereço do servidor de banco de dados
app.config['MYSQL_USER'] = 'root'  # ou o nome de usuário configurado
app.config['MYSQL_PASSWORD'] = 'sua_senha'  # senha do banco de dados
app.config['MYSQL_DB'] = 'class_gaming'

# Inicialização do MySQL
mysql = MySQL(app)

#----------------------------------------------------
# Endpoints da API
#----------------------------------------------------

# Endpoint para atualizar o nível do usuário
@app.route('/update_user_level', methods=['POST'])
def update_user_level():
    try:
        # Obtendo os dados enviados na requisição
        data = request.json
        user_id = data.get("user_id")
        new_level = data.get("new_level")

        # Verificando se os dados foram fornecidos corretamente
        if not user_id or not new_level:
            return jsonify({"status": "error", "message": "user_id and new_level are required"}), 400

        # Atualizando o nível do usuário no banco de dados
        cur = mysql.connection.cursor()
        cur.execute('''UPDATE tb_usuarios SET nivel = %s WHERE id = %s''', (new_level, user_id))
        mysql.connection.commit()
        cur.close()

        return jsonify({"status": "success", "message": "User level updated successfully"}), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 400

>>>>>>> feature/telas_jogos

# Endpoint para adicionar um novo quiz
@app.route('/add_quiz', methods=['POST'])
def add_quiz():
    try:
        quiz_data = request.json
<<<<<<< HEAD
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
=======
        if not quiz_data or "questions" not in quiz_data:
            return jsonify({"status": "error", "message": "Invalid data format"}), 400
        
        # Inserir quiz
        cur = mysql.connection.cursor()
        cur.execute('''INSERT INTO quizzes (nivel, titulo, descricao) VALUES (%s, %s, %s)''', 
                    (quiz_data.get("nivel"), quiz_data.get("titulo"), quiz_data.get("descricao")))
        quiz_id = cur.lastrowid  # ID do quiz inserido
        mysql.connection.commit()

        # Inserir questões
        for question in quiz_data.get("questions", []):
            cur.execute('''INSERT INTO questions (quiz_id, pergunta, alternativa_correta) VALUES (%s, %s, %s)''', 
                        (quiz_id, question["pergunta"], question["alternativa_correta"]))
            question_id = cur.lastrowid  # ID da questão inserida
            mysql.connection.commit()

            # Inserir alternativas
            for alternative in question.get("alternativas", []):
                cur.execute('''INSERT INTO alternativas (question_id, alternativa) VALUES (%s, %s)''', 
                            (question_id, alternative))
                mysql.connection.commit()

        cur.close()

        return jsonify({"status": "success", "id": quiz_id}), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 400


# Endpoint para buscar todos os quizzes de um nível específico
@app.route('/get_quizzes_by_level/<level>', methods=['GET'])
def get_quizzes_by_level(level):
    try:
        cur = mysql.connection.cursor()
        cur.execute('''SELECT * FROM quizzes WHERE nivel = %s''', (level,))
        quizzes = cur.fetchall()
        
        result = []
        for quiz in quizzes:
            quiz_data = {
                "quiz_id": quiz[0],
                "nivel": quiz[1],
                "titulo": quiz[2],
                "descricao": quiz[3],
                "questions": []
            }

            # Buscar as questões do quiz
            cur.execute('''SELECT * FROM questions WHERE quiz_id = %s''', (quiz[0],))
            questions = cur.fetchall()
            for question in questions:
                question_data = {
                    "question_id": question[0],
                    "pergunta": question[1],
                    "alternativa_correta": question[2],
                    "alternativas": []
                }

                # Buscar alternativas da questão
                cur.execute('''SELECT * FROM alternativas WHERE question_id = %s''', (question[0],))
                alternatives = cur.fetchall()
                for alt in alternatives:
                    question_data["alternativas"].append(alt[1])
                
                quiz_data["questions"].append(question_data)

            result.append(quiz_data)

        cur.close()
        return jsonify({"status": "success", "quizzes": result}), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 400


# Endpoint para buscar um quiz específico com questões e alternativas
@app.route('/get_quiz/<quiz_id>', methods=['GET'])
def get_quiz(quiz_id):
    try:
        cur = mysql.connection.cursor()
        cur.execute('''SELECT * FROM quizzes WHERE quiz_id = %s''', (quiz_id,))
        quiz = cur.fetchone()

        if quiz:
            quiz_data = {
                "quiz_id": quiz[0],
                "nivel": quiz[1],
                "titulo": quiz[2],
                "descricao": quiz[3],
                "questions": []
            }

            # Buscar as questões do quiz
            cur.execute('''SELECT * FROM questions WHERE quiz_id = %s''', (quiz[0],))
            questions = cur.fetchall()
            for question in questions:
                question_data = {
                    "question_id": question[0],
                    "pergunta": question[1],
                    "alternativa_correta": question[2],
                    "alternativas": []
                }

                # Buscar alternativas da questão
                cur.execute('''SELECT * FROM alternativas WHERE question_id = %s''', (question[0],))
                alternatives = cur.fetchall()
                for alt in alternatives:
                    question_data["alternativas"].append(alt[1])
                
                quiz_data["questions"].append(question_data)

            cur.close()
            return jsonify({"status": "success", "quiz": quiz_data}), 200
>>>>>>> feature/telas_jogos
        else:
            return jsonify({"status": "failure", "message": "Quiz not found"}), 404
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 400

<<<<<<< HEAD
=======

# Endpoint para salvar o desempenho do usuário em um quiz
@app.route('/submit_quiz', methods=['POST'])
def submit_quiz():
    try:
        performance_data = request.json
        cur = mysql.connection.cursor()
        cur.execute('''INSERT INTO user_performances (user_id, quiz_id, correct_answers, time_taken) 
                    VALUES (%s, %s, %s, %s)''', 
                    (performance_data["user_id"], performance_data["quiz_id"], 
                     performance_data["correct_answers"], performance_data["time_taken"]))
        mysql.connection.commit()
        cur.close()
        return jsonify({"status": "success", "id": performance_data["quiz_id"]}), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 400


# Endpoint para buscar o ranking dos usuários com base no desempenho
@app.route('/get_ranking', methods=['GET'])
def get_ranking():
    try:
        cur = mysql.connection.cursor()
        cur.execute('''SELECT * FROM user_performances ORDER BY correct_answers DESC, time_taken ASC''')
        ranking = cur.fetchall()

        result = []
        for entry in ranking:
            result.append({
                "user_id": entry[0],
                "quiz_id": entry[1],
                "correct_answers": entry[2],
                "time_taken": entry[3]
            })

        cur.close()
        return jsonify({"status": "success", "ranking": result}), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 400


# Endpoint para associar imagens no jogo de combinações
@app.route('/add_image_pair', methods=['POST'])
def add_image_pair():
    try:
        data = request.json
        imagem_id_1 = data.get("imagem_id_1")
        imagem_id_2 = data.get("imagem_id_2")
        
        # Inserir o par de imagens
        cur = mysql.connection.cursor()
        cur.execute('''INSERT INTO pares_imagens (imagem_id_1, imagem_id_2) VALUES (%s, %s)''',
                    (imagem_id_1, imagem_id_2))
        mysql.connection.commit()
        cur.close()

        return jsonify({"status": "success"}), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 400


>>>>>>> feature/telas_jogos
# Executa a API
if __name__ == "__main__":
    app.run(debug=True, port=5000)
