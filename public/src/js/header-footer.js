// Função para verificar se o usuário está na página de login
function isLoginPage() {
    return window.location.pathname.includes("login.html");
}

// Função para inserir o cabeçalho
function loadHeader(loggedUser = null) {
    let navHTML = "";
    let userMenuHTML = "";

    if (!isLoginPage()) {
        // Cabeçalho para páginas fora do login
        navHTML = `
            <nav>
                <ul>
                    <li><a href="levels.html">Início</a></li>
                    <li><a href="game-list.html">Níveis</a></li>
                    <li><a href="game-list.html">Jogos</a></li>
                    <li><a href="contact.html">Contato</a></li>
                </ul>
            </nav>
        `;

        // Dropdown do usuário logado
        if (loggedUser) {
            userMenuHTML = `
                <div class="user-dropdown">
                    <button class="dropdown-button">${loggedUser.email}</button>
                    <div class="dropdown-content">
                        <a href="#" id="logoutButton">Logout</a>
                    </div>
                </div>
            `;
        }
    }

    const headerHTML = `
        <header>
            <div class="logo">Class Gaming</div>
            ${navHTML}
            ${userMenuHTML}
        </header>
    `;
    document.body.insertAdjacentHTML('afterbegin', headerHTML);

    // Adiciona o evento de logout se o botão existir
    const logoutButton = document.getElementById("logoutButton");
    if (logoutButton) {
        logoutButton.addEventListener("click", () => {
            localStorage.removeItem("token"); // Remove o token
            window.location.href = "login.html"; // Redireciona para a página de login
        });
    }
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
            throw new Error("Falha ao obter usuário logado.");
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

// Executa as funções ao carregar o documento
document.addEventListener("DOMContentLoaded", async function () {
    const token = localStorage.getItem("token");

    if (!isLoginPage()) {
        const user = await getLoggedUser();
        if (!user) {
            console.log("Redirecionando para login por falta de autenticação.");
            window.location.href = "login.html";
        } else {
            console.log("Usuário autenticado:", user);
            loadHeader(user); // Carrega o cabeçalho com o usuário logado
        }
    } else {
        loadHeader(); // Carrega o cabeçalho padrão
    }

    loadFooter(); // Sempre carrega o rodapé
});
