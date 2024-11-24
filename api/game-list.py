from flask import Flask, request, jsonify
from flask_cors import CORS
import mysql.connector
from mysql.connector import Error
import random

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

        # Query para buscar quizzes
        query_quizzes = """
            SELECT 
                id_quiz, 
                nome, 
                descricao
            FROM tb_quizzes
            WHERE nivel = %s
        """
        cursor.execute(query_quizzes, (level,))
        quizzes = cursor.fetchall()

        # Query para buscar combinações
        query_combinations = """
            SELECT 
                id_combinacao, 
                CONCAT('Combinação ', id_combinacao) AS nome, 
                'Desafie-se com combinações.' AS descricao
            FROM tb_combinacao
            WHERE nivel = %s
        """
        cursor.execute(query_combinations, (level,))
        combinations = cursor.fetchall()

        # Query para buscar palavras ao vento
        query_windwords = """
            SELECT 
                id_palavras_ao_vento, 
                titulo AS nome, 
                'Complete as palavras.' AS descricao
            FROM tb_palavras_ao_vento
            WHERE nivel = %s
        """
        cursor.execute(query_windwords, (level,))
        windwords = cursor.fetchall()

        # Se nenhuma atividade encontrada em qualquer categoria
        if not quizzes and not combinations and not windwords:
            return jsonify({'sucesso': False, 'mensagem': 'Nenhuma atividade encontrada.'}), 404

        # Retorna as atividades divididas por categoria
        return jsonify({
            'sucesso': True,
            'quizzes': quizzes,
            'combinations': combinations,
            'windwords': windwords
        }), 200

    except Error as e:
        print(f"Erro ao conectar ao banco de dados: {e}")
        return jsonify({'sucesso': False, 'mensagem': 'Erro no servidor.'}), 500

    finally:
        if conexao.is_connected():
            cursor.close()
            conexao.close()

@app.route('/api/combinations', methods=['GET'])
def get_combinations():
    level = request.args.get('level')
    if not level:
        return jsonify({'success': False, 'message': 'Nível não fornecido.'}), 400

    try:
        connection = mysql.connector.connect(**db_config)
        cursor = connection.cursor(dictionary=True)

        # Query para buscar combinações pelo nível
        query = """
            SELECT c.id_combinacao, i.url AS image_url, t.texto AS dropzone_text
            FROM tb_combinacao AS c
            JOIN tb_imagens AS i ON c.id_imagem = i.id_imagem
            JOIN tb_texto_combinacao AS t ON c.id_texto = t.id_texto
            WHERE c.nivel = %s
        """
        cursor.execute(query, (level,))
        combinations = cursor.fetchall()

        if not combinations:
            return jsonify({'success': False, 'message': 'Nenhuma combinação encontrada para o nível fornecido.'}), 404

        return jsonify({'success': True, 'combinations': combinations}), 200

    except Error as e:
        return jsonify({'success': False, 'message': f'Erro ao buscar combinações: {str(e)}'}), 500

    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()


@app.route('/api/windwords', methods=['GET'])
def get_windwords_activities():
    level = request.args.get('level')
    if not level:
        return jsonify({'success': False, 'message': 'Nível não fornecido.'}), 400

    try:
        connection = mysql.connector.connect(**db_config)
        cursor = connection.cursor(dictionary=True)

        # Query para buscar as atividades pelo nível
        query_activities = """
            SELECT id_palavras_ao_vento, nivel, titulo
            FROM tb_palavras_ao_vento
            WHERE nivel = %s
        """
        cursor.execute(query_activities, (level,))
        activities = cursor.fetchall()

        if not activities:
            return jsonify({'success': False, 'message': 'Nenhuma atividade encontrada para o nível fornecido.'}), 404

        # Seleciona aleatoriamente até 5 atividades
        random.shuffle(activities)
        selected_activities = activities[:5]

        result = []

        for activity in selected_activities:
            id_palavras_ao_vento = activity['id_palavras_ao_vento']
            # Query para buscar os textos associados à atividade
            query_texts = """
                SELECT id_palavras_ao_vento_texto, texto
                FROM tb_palavras_ao_vento_texto
                WHERE id_palavras_ao_vento = %s
            """
            cursor.execute(query_texts, (id_palavras_ao_vento,))
            texts = cursor.fetchall()

            for text in texts:
                id_texto = text['id_palavras_ao_vento_texto']
                # Query para buscar as palavras corretas associadas ao texto
                query_correct_words = """
                    SELECT corretas
                    FROM tb_palavras_ao_vento_corretas
                    WHERE id_palavras_ao_vento = %s
                """
                cursor.execute(query_correct_words, (id_palavras_ao_vento,))
                correct_words_row = cursor.fetchone()
                if correct_words_row:
                    correct_words = correct_words_row['corretas'].split(',')
                else:
                    correct_words = []
                text['correct_words'] = correct_words

                # Construir o texto completo correto (texto_correto)
                parts = text['texto'].split('__')
                texto_correto = ''
                for i in range(len(parts)):
                    texto_correto += parts[i]
                    if i < len(correct_words):
                        texto_correto += correct_words[i]
                text['texto_correto'] = texto_correto

            activity['texts'] = texts
            result.append(activity)

        return jsonify({'success': True, 'activities': result}), 200

    except Error as e:
        return jsonify({'success': False, 'message': f'Erro ao buscar as atividades: {str(e)}'}), 500

    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()



if __name__ == '__main__':
    app.run(debug=True, port=5051)
