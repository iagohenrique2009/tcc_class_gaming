document.addEventListener('DOMContentLoaded', () => {
    const buttons = document.querySelectorAll('.play-game-btn');

    buttons.forEach((button, index) => {
        button.addEventListener('click', async () => {
            const levelNumber = index + 1;
            console.log(`Buscando atividades para o nível: ${levelNumber}`);

            try {
                const response = await fetch(`http://127.0.0.1:5051/api/activities?level=${levelNumber}`);
                if (!response.ok) {
                    const errorMessage = await response.text();
                    console.error('Erro do servidor:', errorMessage);
                    alert('Erro ao buscar atividades.');
                    return;
                }

                const data = await response.json();
                console.log('Dados recebidos:', data);

                if (data.sucesso) {
                    // Combina todas as atividades em um único array
                    let activities = [];

                    if (data.quizzes && data.quizzes.length > 0) {
                        const quizzesWithType = data.quizzes.map(quiz => ({ ...quiz, tipo: 'quiz' }));
                        activities = activities.concat(quizzesWithType);
                    }

                    if (data.combinations && data.combinations.length > 0) {
                        const combinationsWithType = data.combinations.map(combination => ({ ...combination, tipo: 'combination' }));
                        activities = activities.concat(combinationsWithType);
                    }

                    if (data.windwords && data.windwords.length > 0) {
                        const windwordsWithType = data.windwords.map(windword => ({ ...windword, tipo: 'windword' }));
                        activities = activities.concat(windwordsWithType);
                    }

                    if (activities.length > 0) {
                        localStorage.setItem('selectedLevel', levelNumber);
                        localStorage.setItem('activities', JSON.stringify(activities));

                        // Redireciona para a página de atividades
                        window.location.href = 'game-list.html';
                    } else {
                        alert('Nenhuma atividade encontrada para este nível.');
                    }
                } else {
                    alert(data.mensagem || 'Nenhuma atividade encontrada para este nível.');
                }
            } catch (error) {
                console.error('Erro ao buscar atividades:', error.message);
                alert('Erro ao buscar atividades.');
            }
        });
    });
});
