from flask import Flask, jsonify
from flask_cors import CORS
import mysql.connector

app = Flask(__name__)
CORS(app)

# Configurações do banco de dados
db_config = {
    'host': 'mysql-lcndev.alwaysdata.net',
    'user': 'lcndev',
    'password': 'Lu@na92#',
    'database': 'lcndev_classgaming'
}

# Função para buscar perguntas e alternativas do banco de dados
def get_questions_from_db(quiz_id):
    conn = mysql.connector.connect(**db_config)
    cursor = conn.cursor(dictionary=True)

    # Consulta SQL para buscar as perguntas e suas alternativas associadas
    query = """
        SELECT p.id_pergunta, p.enunciado,
               a.id_alternativa, a.texto, a.correta
        FROM tb_perguntas p
        LEFT JOIN tb_alternativas a ON p.id_pergunta = a.id_pergunta
        WHERE p.id_quiz = %s
        ORDER BY p.id_pergunta, a.id_alternativa
    """
    cursor.execute(query, (quiz_id,))
    rows = cursor.fetchall()
    conn.close()

    # Estrutura os dados das perguntas e alternativas
    questions = {}
    for row in rows:
        question_id = row['id_pergunta']
        if question_id not in questions:
            questions[question_id] = {
                'question': row['enunciado'],
                'alternatives': []
            }
        questions[question_id]['alternatives'].append({
            'id': row['id_alternativa'],
            'text': row['texto'],
            'is_correct': row['correta']
        })

    return list(questions.values())

# Endpoint para obter as perguntas e alternativas para um quiz específico
@app.route('/api/quiz/<int:quiz_id>', methods=['GET'])
def get_quiz(quiz_id):
    questions = get_questions_from_db(quiz_id)
    return jsonify(questions)

if __name__ == '__main__':
    app.run(debug=True)
