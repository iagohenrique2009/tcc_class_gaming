from flask import Flask, request, jsonify
import mysql.connector
from mysql.connector import Error
from flask import session

app = Flask(__name__)

# Configurações do banco de dados
db_config = {
    "host": "mysql-lcndev.alwaysdata.net",
    "database": "lcndev_classgaming",
    "user": "lcndev_api",
    "password": "7kFTc8T6",
}

@app.route('/atualizar-nivel', methods=['POST'])
def atualizar_nivel():

    data = request.get_json()
    nivel = data.get('nivel')
    user_id = session.get('user_id')  
    if not nivel or not user_id:
        return jsonify({'message': 'Dados inválidos'}), 400

    try:
        connection = mysql.connector.connect(**db_config)
        cursor = connection.cursor()

        sql = "UPDATE tb_usuarios SET nivel = %s WHERE id = %s"
        cursor.execute(sql, (nivel, user_id))
        connection.commit()

        return jsonify({'message': 'Nível atualizado com sucesso'}), 200

    except Error as e:
        return jsonify({'message': f'Erro ao atualizar: {e}'}), 500

    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

if __name__ == '__main__':
    app.run(debug=True, port=5052)
