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

                if (data.sucesso && data.activities.length > 0) {
                    localStorage.setItem('selectedLevel', levelNumber);
                    localStorage.setItem('activities', JSON.stringify(data.activities));

                    // Redireciona para a página de atividades
                    window.location.href = 'game-list.html';
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
