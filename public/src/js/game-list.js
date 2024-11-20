document.addEventListener('DOMContentLoaded', async () => {
    const activitiesContainer = document.getElementById('activities-container');
    const level = localStorage.getItem('selectedLevel');

    if (!level) {
        activitiesContainer.innerHTML = '<p>Nenhum nível selecionado.</p>';
        return;
    }

    try {
        const response = await fetch(`http://127.0.0.1:5051/api/activities?level=${level}`);
        if (!response.ok) {
            const errorMessage = await response.text();
            console.error('Erro do servidor:', errorMessage);
            alert('Erro ao buscar atividades.');
            return;
        }

        const data = await response.json();
        if (data.sucesso) {
            data.activities.forEach(activity => {
                if (!activity.id_quiz) {
                    console.error('ID do quiz não encontrado na atividade:', activity);
                    return;
                }

                const activityCard = document.createElement('div');
                activityCard.classList.add('level-card');
                activityCard.innerHTML = `
                    <h2>${activity.nome}</h2>
                    <p>${activity.descricao}</p>
                    <button onclick="playQuiz(${activity.id_quiz})">Play Now</button>
                `;
                activitiesContainer.appendChild(activityCard);
            });
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
    if (!quizId) {
        alert('ID do quiz não encontrado!');
        return;
    }

    console.log(`Iniciando o quiz com ID: ${quizId}`);
    localStorage.setItem('selectedQuizId', quizId); // Salva o ID do quiz no localStorage
    window.location.href = 'quiz.html'; // Redireciona para a página do quiz
}
