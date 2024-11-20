from flask import Flask, request, jsonify
from flask_cors import CORS
import mysql.connector
from mysql.connector import Error

app = Flask(__name__)
CORS(app)  # Permite CORS para todas as origens

# Configurações do banco de dados
db_config = {
    "host": "mysql-lcndev.alwaysdata.net",
    "database": "lcndev_classgaming",
    "user": "lcndev_api",
    "password": "7kFTc8T6",
}

@app.route('/api/activities', methods=['GET'])
def get_activities():
    level = request.args.get('level')
    if not level:
        return jsonify({'sucesso': False, 'mensagem': 'Nível não fornecido.'}), 400

    try:
        # Log para depuração
        print(f"Nível recebido: {level}")

        # Conecta ao banco de dados
        conexao = mysql.connector.connect(**db_config)
        cursor = conexao.cursor(dictionary=True)

        # Query para buscar atividades
        query = """
            SELECT id_quiz, nome, descricao
            FROM tb_quizzes
            WHERE nivel = %s
        """
        cursor.execute(query, (level,))
        atividades = cursor.fetchall()

        if not atividades:
            return jsonify({'sucesso': False, 'mensagem': 'Nenhuma atividade encontrada.'}), 404

        # Retorna as atividades com sucesso
        return jsonify({'sucesso': True, 'activities': atividades}), 200

    except Error as e:
        print(f"Erro ao conectar ao banco de dados: {e}")
        return jsonify({'sucesso': False, 'mensagem': 'Erro no servidor.'}), 500

    finally:
        if conexao.is_connected():
            cursor.close()
            conexao.close()


if __name__ == '__main__':
    app.run(debug=True, port=5051)
