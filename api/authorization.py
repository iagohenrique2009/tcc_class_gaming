import re
from bs4 import BeautifulSoup
from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import mysql.connector
from mysql.connector import Error
import bcrypt
from datetime import datetime, timedelta
import jwt
import base64

import requests

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})


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

@app.route('/api/cadastrar', methods=['POST', 'OPTIONS'])
def cadastrar():
    if request.method == 'OPTIONS':
        # Responde às requisições OPTIONS (preflight)
        response = app.make_response('')
        response.headers.add("Access-Control-Allow-Origin", "http://127.0.0.1:5500")
        response.headers.add('Access-Control-Allow-Headers', "Content-Type")
        response.headers.add('Access-Control-Allow-Methods', "POST, OPTIONS")
        return response

    dados = request.get_json()
    nome = dados.get('nome')
    email = dados.get('email')
    senha = dados.get('senha')

    # Validação simples
    if not nome or not email or not senha:
        return jsonify({'sucesso': False, 'mensagem': 'Todos os campos são obrigatórios.'}), 400
    # Validação do email - verificar se contém '@fatec.sp.gov.br'
    if '@fatec.sp.gov.br' not in email.lower():
        return jsonify({'sucesso': False, 'mensagem': 'O email deve ser institucional (@fatec.sp.gov.br).'}), 400
    # Validação da senha - verificar se tem mais de 8 caracteres e contém maiúscula, minúscula e números
    if len(senha) < 8:
        return jsonify({'sucesso': False, 'mensagem': 'A senha deve ter pelo menos 8 caracteres.'}), 400
    if not re.search(r'[A-Z]', senha):
        return jsonify({'sucesso': False, 'mensagem': 'A senha deve conter pelo menos uma letra maiúscula.'}), 400
    if not re.search(r'[a-z]', senha):
        return jsonify({'sucesso': False, 'mensagem': 'A senha deve conter pelo menos uma letra minúscula.'}), 400
    if not re.search(r'\d', senha):
        return jsonify({'sucesso': False, 'mensagem': 'A senha deve conter pelo menos um número.'}), 400
    # Verifica se o email está na lista de docentes
    email_existe = verificar_email_na_pagina(email)
    if email_existe:
        tipo = 2  # Professor
    else:
        tipo = 3  # Aluno

    try:
        conexao = mysql.connector.connect(**db_config)
        cursor = conexao.cursor()
        # Verifica se o email já está cadastrado no banco de dados
        cursor.execute("SELECT id_usuario FROM tb_usuarios WHERE email = %s", (email,))
        if cursor.fetchone():
            return jsonify({'sucesso': False, 'mensagem': 'Email já cadastrado.'}), 400
        # Gera o hash da senha
        senha_hash = bcrypt.hashpw(senha.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        sql = """
            INSERT INTO tb_usuarios (nome, email, senha, senha_hash, tipo, data_hora_cadastro)
            VALUES (%s, %s, %s, %s, %s, %s)
        """
        data_hora_cadastro = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        valores = (nome, email, senha, senha_hash, tipo, data_hora_cadastro)
        cursor.execute(sql, valores)
        conexao.commit()
        return jsonify({'sucesso': True, 'mensagem': 'Usuário cadastrado com sucesso.'}), 200

    except Error as e:
        print(f"Erro ao inserir usuário: {e}")
        return jsonify({'sucesso': False, 'mensagem': 'Erro no servidor.'}), 500

    finally:
        if conexao.is_connected():
            cursor.close()
            conexao.close()

def verificar_email_na_pagina(email_usuario):
    base_url = 'http://www.fatecrp.edu.br/profissionais/'
    emails_encontrados = []
    try:
        pagina_atual = 1
        existe_proxima_pagina = True
        while existe_proxima_pagina:
            # Constrói a URL da página atual
            if pagina_atual == 1:
                url = f"{base_url}?funcao=Docente"
            else:
                url = f"{base_url}page/{pagina_atual}/?funcao=Docente"
            print(f"Processando URL: {url}")  # Depuração

            response = requests.get(url)
            response.raise_for_status()

            soup = BeautifulSoup(response.text, 'html.parser')

            # Extrai os emails da página atual
            for link in soup.find_all('a', href=True):
                href = link['href']
                if 'mailto:' in href:
                    email_extraido = href.split('mailto:')[1]
                    emails_encontrados.append(email_extraido.lower())

            # Verifica se há uma próxima página
            existe_proxima_pagina = False  # Assume que não há próxima página

            # Procura pelos links de paginação
            paginacao = soup.find('div', class_='wp-pagenavi')  # Ajuste conforme necessário
            if paginacao:
                links_paginacao = paginacao.find_all('a', href=True)
                for link in links_paginacao:
                    if link.text.strip() in ['Próxima', 'Próxima »', 'Next', '>']:
                        existe_proxima_pagina = True
                        break

            pagina_atual += 1
        # Verifica se o email do usuário está na lista de emails extraídos
        if email_usuario.lower() in emails_encontrados:
            return True
        else:
            return False

    except requests.RequestException as e:
        print(f"Erro ao acessar a página: {e}")
        return False


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
