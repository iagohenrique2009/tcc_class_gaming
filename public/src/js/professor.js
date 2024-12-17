document.addEventListener("DOMContentLoaded", () => {
    const logoutButton = document.getElementById("logoutButton");
    const viewPerformanceButton = document.getElementById("viewPerformanceButton");
    const performanceSection = document.getElementById("performanceSection");
    const performanceTableBody = document.querySelector("#performanceTable tbody");

    if (logoutButton) {
        logoutButton.addEventListener("click", () => {
            localStorage.removeItem("token");
            window.location.href = "login.html";
        });
    }

    if (viewPerformanceButton) {
        viewPerformanceButton.addEventListener("click", async () => {
            try {
                const response = await fetch("http://127.0.0.1:5054/api/desempenho-professor", {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                });

                if (!response.ok) {
                    throw new Error("Erro ao buscar desempenho.");
                }

                const data = await response.json();
                if (data.sucesso && data.desempenho.length > 0) {
                    performanceTableBody.innerHTML = "";

                    data.desempenho.forEach((item) => {
                        let dataExecucaoStr = "";
                        if (item.data_execucao) {
                            const dataObj = new Date(item.data_execucao);
                            dataExecucaoStr = dataObj.toLocaleDateString();
                        }

                        const row = `
                            <tr>
                                <td>${item.nome_aluno || ''}</td>
                                <td>${item.descricao_atividade || ''}</td>
                                <td>${item.pontuacao !== null ? item.pontuacao : ''}</td>
                                <td>${item.tempo_gasto || ''}</td>
                                <td>${dataExecucaoStr}</td>
                            </tr>
                        `;
                        performanceTableBody.insertAdjacentHTML("beforeend", row);
                    });

                    performanceSection.classList.remove("hidden");
                } else {
                    alert("Nenhum desempenho encontrado.");
                }
            } catch (error) {
                console.error("Erro ao buscar desempenho:", error);
                alert("Erro ao buscar desempenho. Tente novamente mais tarde.");
            }
        });
    }
});
