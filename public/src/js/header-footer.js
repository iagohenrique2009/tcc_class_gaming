// header-footer.js

// Função para inserir o cabeçalho
function loadHeader() {
    const headerHTML = `
        <header>
            <div class="logo">Class Gaming</div>
            <nav>
                <ul>
<<<<<<< HEAD
                    <li><a href="login.html">Início</a></li>
                    <li><a href="inicio.html">Níveis</a></li>
                    <li><a href="jogo.html">Jogos</a></li>
=======
					<li><a href="sobre.html">Início</a></li>
                    <li><a href="nivel.html">Níveis</a></li>
                    <li><a href="jogo.html">Jogos</a></li>
					<li><a href="desempenho.html">Desempenho</a></li>
>>>>>>> feature/telas_jogos
                    <li><a href="contato.html">Contato</a></li>
                </ul>
            </nav>
        </header>
    `;
    document.body.insertAdjacentHTML('afterbegin', headerHTML);
}

// Função para inserir o rodapé
function loadFooter() {
    const footerHTML = `
        <footer>
            <p>© 2023 Class Gaming - All Rights Reserved</p>
        </footer>
    `;
    document.body.insertAdjacentHTML('beforeend', footerHTML);
}

// Executa as funções ao carregar o documento
document.addEventListener('DOMContentLoaded', function() {
    loadHeader();
    loadFooter();
});
