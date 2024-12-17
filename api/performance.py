from datetime import timedelta
import mysql.connector
from mysql.connector import Error
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://127.0.0.1:5500"}})

# Configurações do banco de dados
db_config = {
    "host": "mysql-lcndev.alwaysdata.net",

    "database": "lcndev_classgaming",
    "user": "lcndev_api",
    "password": "7kFTc8T6",
}

@app.route('/api/desempenho-professor', methods=['GET'])
def get_desempenho():
    try:
        conexao = mysql.connector.connect(**db_config)
        cursor = conexao.cursor(dictionary=True)

        # Incluindo a.id_atividade e a.descricao
        query = """
            SELECT 
                d.id_desempenho,
                u.nome AS nome_aluno,
                a.id_atividade,
                a.descricao AS descricao_atividade,
                d.pontuacao,
                d.tempo_gasto,
                d.data_execucao
            FROM 
                tb_desempenho d
            INNER JOIN 
                tb_usuarios u ON d.id_usuario = u.id_usuario
            INNER JOIN 
                tb_atividades a ON d.id_atividade = a.id_atividade
            WHERE 
                d.data_hora_exclusao IS NULL
            ORDER BY 
                d.data_execucao DESC
        """
        cursor.execute(query)
        resultados = cursor.fetchall()

        # Converte tempo_gasto (timedelta) em string "HH:MM:SS"
        for item in resultados:
            if item['tempo_gasto'] is not None and isinstance(item['tempo_gasto'], timedelta):
                total_seconds = int(item['tempo_gasto'].total_seconds())
                hours = total_seconds // 3600
                minutes = (total_seconds % 3600) // 60
                seconds = total_seconds % 60
                item['tempo_gasto'] = f"{hours:02d}:{minutes:02d}:{seconds:02d}"
            else:
                item['tempo_gasto'] = item['tempo_gasto'] if item['tempo_gasto'] else ""

            # Converte data_execucao (datetime) para string
            if item['data_execucao'] is not None:
                item['data_execucao'] = item['data_execucao'].strftime("%Y-%m-%d %H:%M:%S")
            else:
                item['data_execucao'] = ""

        return jsonify({"sucesso": True, "desempenho": resultados}), 200

    except Error as e:
        print(f"Erro ao acessar o banco de dados: {e}")
        return jsonify({"sucesso": False, "mensagem": "Erro no servidor. Não foi possível acessar os dados."}), 500

    finally:
        if 'conexao' in locals() and conexao.is_connected():
            cursor.close()
            conexao.close()

if __name__ == '__main__':
    print("[LOG] Iniciando servidor na porta 5054...")
    app.run(debug=True, port=5054)
