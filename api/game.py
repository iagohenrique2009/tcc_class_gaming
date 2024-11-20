from flask import Flask, request, jsonify
from flask_cors import CORS
import mysql.connector
from mysql.connector import Error

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://127.0.0.1:5500"}})

# Configurações do banco de dados
db_config = {
    "host": "mysql-lcndev.alwaysdata.net",
    "database": "lcndev_classgaming",
    "user": "lcndev_api",
    "password": "7kFTc8T6",
}

@app.route('/api/questions', methods=['GET'])
def get_questions():
    quiz_id = request.args.get('quizId')
    print(f"[LOG] ID do quiz recebido: {quiz_id}")  # Log do ID recebido

    if not quiz_id:
        print("[LOG] ID do quiz não fornecido.")
        return jsonify({'sucesso': False, 'mensagem': 'ID do quiz não fornecido.'}), 400

    try:
        print("[LOG] Tentando conectar ao banco de dados...")
        conexao = mysql.connector.connect(**db_config)
        cursor = conexao.cursor(dictionary=True)
        print("[LOG] Conexão com o banco de dados estabelecida.")

        # Consulta para buscar perguntas
        query_perguntas = """
            SELECT id_pergunta, enunciado
            FROM tb_perguntas
            WHERE id_quiz = %s
        """
        print(f"[LOG] Executando consulta de perguntas para quiz ID: {quiz_id}")
        cursor.execute(query_perguntas, (quiz_id,))
        perguntas = cursor.fetchall()
        print(f"[LOG] Perguntas retornadas: {perguntas}")

        if not perguntas:
            print("[LOG] Nenhuma pergunta encontrada.")
            return jsonify({'sucesso': False, 'mensagem': 'Nenhuma pergunta encontrada para este quiz.'}), 404

        # Consulta para buscar opções para cada pergunta
        for pergunta in perguntas:
            print(f"[LOG] Buscando opções para a pergunta ID: {pergunta['id_pergunta']}")
            query_alternativas = """
                SELECT texto AS text, correta AS is_correct
                FROM tb_alternativas
                WHERE id_pergunta = %s
            """
            cursor.execute(query_alternativas, (pergunta['id_pergunta'],))
            alternativas = cursor.fetchall()
            print(f"[LOG] Alternativas encontradas: {alternativas}")

            pergunta['options'] = alternativas

        print("[LOG] Todas as perguntas e opções carregadas com sucesso.")
        return jsonify({'sucesso': True, 'questions': perguntas}), 200

    except Error as e:
        print(f"[ERRO] Erro ao conectar ao banco de dados: {e}")
        return jsonify({'sucesso': False, 'mensagem': 'Erro no servidor.'}), 500

    finally:
        if 'conexao' in locals() and conexao.is_connected():
            print("[LOG] Fechando conexão com o banco de dados.")
            cursor.close()
            conexao.close()


if __name__ == '__main__':
    print("[LOG] Iniciando servidor na porta 5053...")
    app.run(debug=True, port=5053)
