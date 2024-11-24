document.addEventListener('DOMContentLoaded', async () => {
    const activitiesContainer = document.getElementById('activities-container');
    const level = localStorage.getItem('selectedLevel');

    if (!activitiesContainer) {
        console.error("Elemento 'activities-container' não encontrado.");
        return;
    }

    if (!level) {
        activitiesContainer.innerHTML = '<p>Nenhum nível selecionado.</p>';
        return;
    }

    try {
        // Fetch de atividades do nível
        const response = await fetch(`http://127.0.0.1:5051/api/activities?level=${level}`);
        if (!response.ok) {
            const errorMessage = await response.text();
            console.error('Erro do servidor:', errorMessage);
            alert('Erro ao buscar atividades.');
            return;
        }

        const data = await response.json();
        console.log('Dados recebidos:', data); // Log para depuração

        // Verifique se a propriedade 'sucesso' é verdadeira
        if (data.sucesso) {
            let hasActivities = false;

            // Adiciona quizzes
            if (data.quizzes && data.quizzes.length > 0) {
                hasActivities = true;
                const quizzesHeader = document.createElement('h3');
                quizzesHeader.textContent = 'Quizzes';
                activitiesContainer.appendChild(quizzesHeader);

                data.quizzes.forEach(quiz => {
                    const quizCard = document.createElement('div');
                    quizCard.classList.add('level-card');
                    quizCard.innerHTML = `
                        <h2>${quiz.nome}</h2>
                        <p>${quiz.descricao}</p>
                        <button onclick="playQuiz(${quiz.id_quiz})">Play Quiz</button>
                    `;
                    activitiesContainer.appendChild(quizCard);
                });
            }

            // Adiciona um único bloco para Combinações
            if (data.combinations && data.combinations.length > 0) {
                hasActivities = true;
                const combinationsHeader = document.createElement('h3');
                combinationsHeader.textContent = 'Combinações';
                activitiesContainer.appendChild(combinationsHeader);

                const combinationCard = document.createElement('div');
                combinationCard.classList.add('level-card');
                combinationCard.innerHTML = `
                    <h2>Combinações</h2>
                    <p>Atividade de Combinação para o Nível ${level}</p>
                    <button onclick="playCombination()">Play Combination</button>
                `;
                activitiesContainer.appendChild(combinationCard);
            }

            // Adiciona um único bloco para Palavras ao Vento
            if (data.windwords && data.windwords.length > 0) {
                hasActivities = true;
                const windWordsHeader = document.createElement('h3');
                windWordsHeader.textContent = 'Palavras ao Vento';
                activitiesContainer.appendChild(windWordsHeader);

                const windWordsCard = document.createElement('div');
                windWordsCard.classList.add('level-card');
                windWordsCard.innerHTML = `
                    <h2>Palavras ao Vento</h2>
                    <p>Atividade de Palavras ao Vento para o Nível ${level}</p>
                    <button onclick="playWindWords()">Play Wind Words</button>
                `;
                activitiesContainer.appendChild(windWordsCard);
            }

            // Caso nenhuma atividade seja encontrada
            if (!hasActivities) {
                activitiesContainer.innerHTML = '<p>Nenhuma atividade encontrada para este nível.</p>';
            }
        } else {
            activitiesContainer.innerHTML = '<p>Nenhuma atividade encontrada para este nível.</p>';
        }
    } catch (error) {
        console.error('Erro ao buscar atividades:', error.message);
        activitiesContainer.innerHTML = '<p>Erro ao carregar atividades.</p>';
    }
});

// Função para iniciar o quiz selecionado
function playQuiz(quizId) {
    if (quizId == null || quizId === '') {
        alert('ID do quiz não encontrado!');
        return;
    }

    console.log(`Iniciando o quiz com ID: ${quizId}`);
    localStorage.setItem('selectedQuizId', quizId); // Salva o ID do quiz no localStorage
    window.location.href = 'quiz.html'; // Redireciona para a página do quiz
}

// Função para iniciar a combinação do nível selecionado
function playCombination() {
    const level = localStorage.getItem('selectedLevel');
    if (!level) {
        alert('Nenhum nível selecionado.');
        return;
    }
    console.log(`Iniciando a atividade de Combinação para o Nível ${level}`);
    window.location.href = `combination.html?level=${level}`;
}

// Função para iniciar palavras ao vento do nível selecionado
function playWindWords() {
    const level = localStorage.getItem('selectedLevel');
    if (!level) {
        alert('Nenhum nível selecionado.');
        return;
    }
    console.log(`Iniciando a atividade de Palavras ao Vento para o Nível ${level}`);
    window.location.href = `windwords.html?level=${level}`;
}
