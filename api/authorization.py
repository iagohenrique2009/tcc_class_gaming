from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import mysql.connector
from mysql.connector import Error
import bcrypt
from datetime import datetime, timedelta
import jwt
import base64

app = Flask(__name__)
CORS(app)  # Permite CORS para todas as origens em todas as rotas

# Configurações do banco de dados
db_config = {
    "host": "mysql-lcndev.alwaysdata.net",
    "database": "lcndev_classgaming",
    "user": "lcndev_api",
    "password": "7kFTc8T6",
}

# Chave secreta para assinar os tokens JWT
SECRET_KEY = "sua_chave_secreta_muito_segura"

# Rota para login
@app.route('/api/login', methods=['POST'])
def login():
    dados = request.get_json()
    email = dados.get('email')
    senha = dados.get('senha')

    if not email or not senha:
        return jsonify({'sucesso': False, 'mensagem': 'Email e senha são obrigatórios.'}), 400

    try:
        conexao = mysql.connector.connect(**db_config)
        cursor = conexao.cursor(dictionary=True)

        # Busca o usuário pelo email
        cursor.execute("SELECT id_usuario, nome, email, senha_hash, tipo FROM tb_usuarios WHERE email = %s", (email,))
        usuario = cursor.fetchone()

        if usuario:
            # Decodifica o hash da senha de Base64 para bytes
            try:
                senha_hash_db = base64.b64decode(usuario['senha_hash'])
            except Exception as e:
                print(f"Erro ao decodificar o hash: {e}")
                return jsonify({'sucesso': False, 'mensagem': 'Erro interno no servidor.'}), 500

            # Verifica a senha
            if bcrypt.checkpw(senha.encode('utf-8'), senha_hash_db):
                # Gera um token JWT
                token = jwt.encode(
                    {
                        'id_usuario': usuario['id_usuario'],
                        'nome': usuario['nome'],
                        'email': usuario['email'],
                        'tipo': usuario['tipo'],
                        'exp': datetime.utcnow() + timedelta(hours=24)  # Token expira em 24 horas
                    },
                    SECRET_KEY,
                    algorithm="HS256"
                )

                return jsonify({
                    'sucesso': True,
                    'mensagem': 'Login realizado com sucesso.',
                    'token': token
                }), 200
            else:
                return jsonify({'sucesso': False, 'mensagem': 'Email ou senha incorretos.'}), 401
        else:
            return jsonify({'sucesso': False, 'mensagem': 'Email ou senha incorretos.'}), 401

    except Exception as e:
        print(f"Erro no login: {e}")
        return jsonify({'sucesso': False, 'mensagem': 'Erro no servidor.'}), 500

    finally:
        if conexao.is_connected():
            cursor.close()
            conexao.close()


# Middleware para verificar o token JWT
def autenticar_token(f):
    def wrapper(*args, **kwargs):
        token = request.headers.get('Authorization')

        if not token:
            return jsonify({'sucesso': False, 'mensagem': 'Token não fornecido.'}), 401

        try:
            token = token.replace("Bearer ", "")
            dados = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
            request.usuario = dados
        except jwt.ExpiredSignatureError:
            return jsonify({'sucesso': False, 'mensagem': 'Token expirado.'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'sucesso': False, 'mensagem': 'Token inválido.'}), 401

        return f(*args, **kwargs)

    wrapper.__name__ = f.__name__
    return wrapper


# Rota protegida para retornar informações do usuário logado
@app.route('/api/usuario', methods=['GET'])
@autenticar_token
def usuario_logado():
    usuario = request.usuario
    return jsonify({
        'sucesso': True,
        'usuario': usuario
    }), 200

if __name__ == '__main__':
    app.run(debug=True,port=5050)
