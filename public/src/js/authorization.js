document.getElementById('cadastroForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Impede o envio padrão do formulário

    // Captura os dados do formulário
    const nome = document.getElementById('nome').value;
    const email = document.getElementById('email').value;
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
    fetch('http://127.0.0.1:5000/api/cadastrar', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(dados)
    })
    .then(response => response.json())
    .then(data => {
        if (data.sucesso) {
            alert('Cadastro realizado com sucesso!');
            // Redirecionar para a página inicio.html
            window.location.href = 'inicio.html';
        } else {
            alert('Erro ao cadastrar: ' + data.mensagem);
        }
    })
    .catch(error => {
        console.error('Erro:', error);
        alert('Ocorreu um erro ao tentar se cadastrar.');
    });
});
