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
def add_pergunta():
    data = request.json
    connection = connect_to_db()
    if not connection:
        return jsonify({"status": "error", "message": "Erro ao conectar ao banco de dados"}), 500

    try:
        cursor = connection.cursor()

        # Validar os dados fornecidos
        id_quiz = data.get("id_quiz")
        pergunta = data.get("pergunta", {})
        enunciado = pergunta.get("enunciado")
        alternativas = pergunta.get("alternativas", [])

        if not id_quiz or not enunciado or not alternativas:
            return jsonify({"status": "error", "message": "Os campos 'id_quiz', 'enunciado' e 'alternativas' são obrigatórios"}), 400

        # Verificar se o Quiz existe
        query_validate_quiz = "SELECT id_quiz FROM tb_quizzes WHERE id_quiz = %s"
        cursor.execute(query_validate_quiz, (id_quiz,))
        if cursor.fetchone() is None:
            return jsonify({"status": "error", "message": "O id_quiz fornecido não existe"}), 404

        # Inserir pergunta
        query_pergunta = "INSERT INTO tb_perguntas (id_quiz, enunciado) VALUES (%s, %s)"
        cursor.execute(query_pergunta, (id_quiz, enunciado))
        id_pergunta = cursor.lastrowid

        # Inserir alternativas
        query_alternativa = "INSERT INTO tb_alternativas (id_pergunta, texto, correta) VALUES (%s, %s, %s)"
        for alternativa in alternativas:
            cursor.execute(query_alternativa, (id_pergunta, alternativa["texto"], alternativa["correta"]))

        connection.commit()
        return jsonify({"status": "success", "id_pergunta": id_pergunta}), 201

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 400
    finally:
        cursor.close()
        connection.close()



@app.route('/get_quizzes', methods=['GET'])
def get_quizzes():
    connection = connect_to_db()
    if not connection:
        return jsonify({"status": "error", "message": "Erro ao conectar ao banco de dados"}), 500

    try:
        cursor = connection.cursor(dictionary=True)
        query = "SELECT id_quiz, nome, nivel FROM tb_quizzes"
        cursor.execute(query)
        quizzes = cursor.fetchall()
        return jsonify({"status": "success", "quizzes": quizzes}), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 400
    finally:
        cursor.close()
        connection.close()


# Endpoint para adicionar uma nova combinação
@app.route('/add_combination', methods=['POST'])
def add_combination():
    data = request.json
    if not data or 'imagem_base64' not in data:
        return jsonify({"status": "error", "message": "'imagem_base64' é obrigatório"}), 400

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
        query_text = "INSERT INTO tb_texto_combinacao (texto, nivel) VALUES (%s, %s)"
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

@app.route('/add_windwords', methods=['POST'])
def add_windwords():
    data = request.json
    print('Dados recebidos:', data)

    if not data:
        return jsonify({"status": "error", "message": "Dados ausentes na requisição"}), 400

    required_fields = ["title", "text", "originalText", "correctWords", "difficulty"]
    missing_fields = [field for field in required_fields if field not in data]

    if missing_fields:
        return jsonify({"status": "error", "message": f"Campos ausentes: {', '.join(missing_fields)}"}), 400

    connection = connect_to_db()
    if not connection:
        return jsonify({"status": "error", "message": "Erro ao conectar ao banco de dados"}), 500

    try:
        cursor = connection.cursor()

        # Inserir os dados principais na tabela tb_palavras_ao_vento
        query_main = """
            INSERT INTO tb_palavras_ao_vento (titulo, nivel)
            VALUES (%s, %s)
        """
        cursor.execute(query_main, (data["title"], data["difficulty"]))
        id_palavras_ao_vento = cursor.lastrowid

        # Inserir o texto principal na tabela tb_palavras_ao_vento_texto
        query_text = """
            INSERT INTO tb_palavras_ao_vento_texto (id_palavras_ao_vento, texto, texto_correto)
            VALUES (%s, %s, %s)
        """
        cursor.execute(query_text, (id_palavras_ao_vento, data["text"], data["originalText"]))

        # Inserir palavras corretas na tabela tb_palavras_ao_vento_corretas
        query_correct_words = """
            INSERT INTO tb_palavras_ao_vento_corretas (id_palavras_ao_vento, corretas)
            VALUES (%s, %s)
        """
        correct_words = ",".join(data["correctWords"])  # Lista de palavras corretas formatada como string
        cursor.execute(query_correct_words, (id_palavras_ao_vento, correct_words))

        connection.commit()

        return jsonify({"status": "success", "id": id_palavras_ao_vento}), 201
    except Exception as e:
        print('Erro ao inserir dados no banco de dados:', e)
        return jsonify({"status": "error", "message": str(e)}), 400
    finally:
        cursor.close()
        connection.close()





# Executa a API
if __name__ == "__main__":
    app.run(debug=True, port=5052)
