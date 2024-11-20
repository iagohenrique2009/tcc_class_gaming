from flask import Flask, jsonify, request
from flask_cors import CORS
import mysql.connector
from mysql.connector import Error
import base64

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://127.0.0.1:5500"}})

# Configurações do banco de dados
db_config = {
    "host": "mysql-lcndev.alwaysdata.net",
    "database": "lcndev_classgaming",
    "user": "lcndev_api",
    "password": "7kFTc8T6",
}

# Função para conectar ao banco de dados
def connect_to_db():
    try:
        connection = mysql.connector.connect(**db_config)
        return connection
    except Error as e:
        print(f"Erro ao conectar ao banco de dados: {e}")
        return None

# Endpoint para adicionar um novo quiz
@app.route('/add_quiz', methods=['POST'])
def add_quiz():
    data = request.json
    connection = connect_to_db()
    if not connection:
        return jsonify({"status": "error", "message": "Erro ao conectar ao banco de dados"}), 500

    try:
        cursor = connection.cursor()
        query = "INSERT INTO tb_quizzes (nome, descricao, nivel) VALUES (%s, %s, %s)"
        cursor.execute(query, (data["nome"], data["descricao"], data["nivel"]))
        connection.commit()
        return jsonify({"status": "success", "id": cursor.lastrowid})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 400
    finally:
        cursor.close()
        connection.close()

# Endpoint para adicionar uma nova combinação
@app.route('/add_combination', methods=['POST'])
def add_combination():
    data = request.json
    connection = connect_to_db()
    if not connection:
        return jsonify({"status": "error", "message": "Erro ao conectar ao banco de dados"}), 500

    try:
        cursor = connection.cursor()

        # Insere a imagem como Base64
        query_image = "INSERT INTO tb_imagens (url, descricao, nivel) VALUES (%s, %s, %s)"
        image_base64 = data["imagem_base64"]
        cursor.execute(query_image, (image_base64, data["descricao_imagem"], data["nivel"]))
        image_id = cursor.lastrowid

        # Insere o texto
        query_text = "INSERT INTO tb_textos (texto, nivel) VALUES (%s, %s)"
        cursor.execute(query_text, (data["texto"], data["nivel"]))
        text_id = cursor.lastrowid

        # Cria a combinação
        query_combination = "INSERT INTO tb_combinacao (id_imagem, id_texto, nivel) VALUES (%s, %s, %s)"
        cursor.execute(query_combination, (image_id, text_id, data["nivel"]))
        connection.commit()

        return jsonify({"status": "success", "id": cursor.lastrowid})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 400
    finally:
        cursor.close()
        connection.close()

# Endpoint para buscar todas as combinações
@app.route('/get_combinations', methods=['GET'])
def get_combinations():
    connection = connect_to_db()
    if not connection:
        return jsonify({"status": "error", "message": "Erro ao conectar ao banco de dados"}), 500

    try:
        cursor = connection.cursor(dictionary=True)
        query = """
            SELECT c.id_combinacao, i.url AS imagem_base64, t.texto, c.nivel
            FROM tb_combinacao c
            JOIN tb_imagens i ON c.id_imagem = i.id_imagem
            JOIN tb_textos t ON c.id_texto = t.id_texto
        """
        cursor.execute(query)
        combinations = cursor.fetchall()
        return jsonify({"status": "success", "combinations": combinations})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 400
    finally:
        cursor.close()
        connection.close()

# Endpoint para deletar uma combinação
@app.route('/delete_combination/<combination_id>', methods=['DELETE'])
def delete_combination(combination_id):
    connection = connect_to_db()
    if not connection:
        return jsonify({"status": "error", "message": "Erro ao conectar ao banco de dados"}), 500

    try:
        cursor = connection.cursor()
        query = "DELETE FROM tb_combinacao WHERE id_combinacao = %s"
        cursor.execute(query, (combination_id,))
        connection.commit()

        if cursor.rowcount > 0:
            return jsonify({"status": "success"}), 200
        else:
            return jsonify({"status": "failure", "message": "Combinação não encontrada"}), 404
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 400
    finally:
        cursor.close()
        connection.close()

# Executa a API
if __name__ == "__main__":
    app.run(debug=True, port=5052)
