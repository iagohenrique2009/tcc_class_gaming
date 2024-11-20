// Seleciona o formulário de cadastro
const cadastroForm = document.getElementById('cadastroForm');
if (cadastroForm) {
    cadastroForm.addEventListener('submit', function(event) {
        event.preventDefault(); // Impede o envio padrão do formulário

        // Captura os dados do formulário
        const nome = document.getElementById('nome').value.trim();
        const email = document.getElementById('email').value.trim();
        const senha = document.getElementById('senha').value;
        const confirmarSenha = document.getElementById('confirmarSenha').value;

        // Verifica se as senhas são iguais
        if (senha !== confirmarSenha) {
            alert('As senhas não coincidem. Por favor, verifique e tente novamente.');
            return; // Impede o envio do formulário
        }

        // Cria um objeto com os dados
        const dados = {
            nome: nome,
            email: email,
            senha: senha
        };

        // Envia os dados para a API com a URL completa
        fetch('http://127.0.0.1:5050/api/cadastrar', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dados)
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => {
                    throw new Error(err.mensagem || 'Erro ao cadastrar.');
                });
            }
            return response.json();
        })
        .then(data => {
            alert('Cadastro realizado com sucesso!');
            // Redirecionar para a página de login
            window.location.href = 'login.html';
        })
        .catch(error => {
            console.error('Erro:', error);
            alert('Erro ao cadastrar: ' + error.message);
        });
    });
}

// Seleciona o formulário de login
// Lida com o formulário de login
// Lida com o formulário de login
const loginFormElement = document.getElementById('loginForm');
if (loginFormElement) {
    loginFormElement.addEventListener('submit', function(event) {
        event.preventDefault();

        const email = document.getElementById('loginEmail').value.trim();
        const senha = document.getElementById('loginSenha').value;

        if (!email || !senha) {
            alert('Por favor, preencha todos os campos.');
            return;
        }

        const dados = {
            email: email,
            senha: senha
        };

        fetch('http://127.0.0.1:5050/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dados)
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => {
                    throw new Error(err.mensagem || 'Erro ao fazer login.');
                });
            }
            return response.json();
        })
        .then(data => {
            alert('Login realizado com sucesso!');
            console.log('Token JWT recebido:', data.token);
            localStorage.setItem('token', data.token); // Armazena o token no localStorage
            window.location.href = 'levels.html';
        })
        .catch(error => {
            console.error('Erro:', error);
            alert('Erro ao fazer login: ' + error.message);
        });
    });
}


// Função para obter informações do usuário logado
async function getLoggedUser() {
    const token = localStorage.getItem("token");
    if (!token) {
        console.log("Nenhum token encontrado.");
        return null;
    }

    try {
        const response = await fetch("http://127.0.0.1:5050/api/usuario", {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            console.log("Token inválido ou expirado.");
            localStorage.removeItem("token"); // Remove o token inválido
            return null;
        }

        const data = await response.json();
        if (data.sucesso) {
            console.log("Usuário logado:", data.usuario);
            return data.usuario;
        } else {
            console.log("Erro ao obter usuário:", data.mensagem);
            return null;
        }
    } catch (error) {
        console.error("Erro ao obter informações do usuário logado:", error);
        return null;
    }
}

// Exemplo de uso para exibir informações do usuário logado
document.addEventListener('DOMContentLoaded', async () => {
    const user = await getLoggedUser();
    if (user) {
        console.log(`Usuário: ${user.nome} (${user.email})`);
    }
});
