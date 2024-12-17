// Função para verificar se está na página de login
function isLoginPage() {
    return window.location.pathname.includes("login.html");
}

// Função para inserir o cabeçalho
function loadHeader(loggedUser = null) {
    console.log("Carregando cabeçalho...");

    // Remove cabeçalho existente
    const existingHeader = document.querySelector("header");
    if (existingHeader) existingHeader.remove();

    let navHTML = "";
    let userMenuHTML = "";

    // Verifica se NÃO está na página de login
    if (!isLoginPage()) {
        navHTML = `
            <nav>
                <div class="nav-toggle" id="nav-toggle">☰</div>
                <ul class="nav-links" id="nav-links">
                    <li><a href="levels.html">Início</a></li>
                    <li><a href="levels.html">Níveis</a></li>
                    <li><a href="game-list.html">Jogos</a></li>
                    <li><a href="performance.html">Desempenho</a></li>
                    <li><a href="about.html">Sobre</a></li>
                    <li><a href="contact.html">Contato</a></li>
                </ul>
            </nav>
        `;

        if (loggedUser) {
            userMenuHTML = `
                <div class="user-dropdown">
                    <button class="dropdown-button">${loggedUser.email}</button>
                    <div class="dropdown-content">
                        <a href="#" id="logoutButton" class="app-button logout-button">Logout</a>
                    </div>
                </div>
            `;
        }
    }

    // Estrutura final do cabeçalho
    const headerHTML = `
        <header>
            <div class="logo">Class Gaming</div>
            ${navHTML}
            ${userMenuHTML}
        </header>
    `;

    // Insere o cabeçalho no DOM
    document.body.insertAdjacentHTML("afterbegin", headerHTML);
    console.log("Cabeçalho inserido no DOM.");

    // Adicionar evento ao botão de logout
    const logoutButton = document.getElementById("logoutButton");
    if (logoutButton) {
        logoutButton.addEventListener("click", () => {
            localStorage.removeItem("token");
            window.location.href = "login.html";
        });
    }

    // Adicionar evento ao botão do menu hambúrguer
    const navToggle = document.getElementById("nav-toggle");
    const navLinks = document.getElementById("nav-links");
    if (navToggle && navLinks) {
        navToggle.addEventListener("click", () => {
            navLinks.classList.toggle("active");
        });
    }
}

// Função para inserir o rodapé
function loadFooter() {
    console.log("Carregando rodapé...");

    const existingFooter = document.querySelector("footer");
    if (existingFooter) existingFooter.remove();

    const footerHTML = `
        <footer>
            <p>© 2023 Class Gaming - All Rights Reserved</p>
        </footer>
    `;

    document.body.insertAdjacentHTML("beforeend", footerHTML);
    console.log("Rodapé inserido no DOM.");
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
            headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
            console.warn("Token inválido. Redirecionando para login.");
            localStorage.removeItem("token");
            window.location.href = "login.html";
            return null;
        }

        const data = await response.json();
        return data.sucesso ? data.usuario : null;
    } catch (error) {
        console.error("Erro ao obter usuário:", error);
        localStorage.removeItem("token");
        window.location.href = "login.html";
        return null;
    }
}

// Executa as funções ao carregar o documento
document.addEventListener("DOMContentLoaded", async () => {
    console.log("Carregando página...");

    if (!isLoginPage()) {
        const user = await getLoggedUser();
        if (!user) {
            console.log("Redirecionando por falta de autenticação.");
            return;
        }
        loadHeader(user);
    } else {
        loadHeader();
    }

    loadFooter();
});
