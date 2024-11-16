from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import mysql.connector
from mysql.connector import Error
import bcrypt
from datetime import datetime
import requests
from bs4 import BeautifulSoup
import re  # Importação para expressões regulares

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "http://127.0.0.1:5500"}})

# Configurações do banco de dados
db_config = {
    "host": "mysql-lcndev.alwaysdata.net",
    "database": "lcndev_classgaming",
    "user": "lcndev_api",
    "password": "7kFTc8T6",
}

# Rota para a página inicial
@app.route('/')
def index():
    return render_template('index.html')

# Rota para cadastro
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

# Roda a aplicação
if __name__ == '__main__':
    app.run(debug=True)
