document.addEventListener('DOMContentLoaded', async () => {
    const quizId = localStorage.getItem('selectedQuizId');
    const quizContainer = document.getElementById('quiz-container');
    const startScreen = document.getElementById('start-screen');
    const resultScreen = document.getElementById('result-screen');
    const startButton = document.getElementById('start-quiz');
    const previousButton = document.getElementById('previous-button');
    const nextButton = document.getElementById('next-button');
    const finishButton = document.getElementById('finish-button');
    const resultElement = document.getElementById('final-score');

    let questions = [];
    let currentQuestionIndex = 0;
    let score = 0;
    let time = 0;
    let interval;

    if (!quizId) {
        startScreen.innerHTML = '<p>Nenhum quiz selecionado.</p>';
        return;
    }

    async function fetchQuestions() {
        try {
            const response = await fetch(`http://127.0.0.1:5053/api/questions?quizId=${quizId}`);
            if (!response.ok) {
                const errorMessage = await response.text();
                console.error('Erro do servidor:', errorMessage);
                startScreen.innerHTML = '<p>Erro ao buscar perguntas do quiz.</p>';
                return;
            }

            const data = await response.json();
            if (data.sucesso && data.questions.length > 0) {
                questions = data.questions;
            } else {
                startScreen.innerHTML = `<p>${data.mensagem || 'Nenhuma pergunta encontrada.'}</p>`;
            }
        } catch (error) {
            console.error('Erro ao buscar perguntas:', error.message);
            startScreen.innerHTML = '<p>Erro ao carregar o quiz.</p>';
        }
    }

    function renderQuestion(index) {
        if (!questions || !questions[index]) {
            console.error('Índice inválido ou perguntas não carregadas.');
            startScreen.innerHTML = '<p>Erro ao carregar pergunta. Por favor, recarregue a página.</p>';
            return;
        }

        const question = questions[index];
        const questionElement = document.getElementById('question');
        const optionsElement = document.getElementById('options');

        if (!questionElement || !optionsElement) {
            console.error('Elementos DOM para pergunta ou opções não encontrados.');
            return;
        }

        questionElement.innerHTML = question.enunciado;
        optionsElement.innerHTML = question.options.map((option, i) => `
            <label>
                <input type="radio" name="option" value="${option.is_correct}" />
                ${option.text}
            </label>
        `).join('');

        previousButton.style.display = index > 0 ? 'inline-block' : 'none';
        nextButton.style.display = index < questions.length - 1 ? 'inline-block' : 'none';
        finishButton.style.display = index === questions.length - 1 ? 'inline-block' : 'none';
    }

    function calculateScore() {
        const selectedOption = document.querySelector('input[name="option"]:checked');
        if (selectedOption && selectedOption.value === '1') {
            score++;
        }
    }

    function showResultOverlay() {
        clearInterval(interval);
    
        const totalQuestions = questions.length;
        const allCorrect = score === totalQuestions;
    
        // Oculta os botões "Anterior", "Próximo" e "Finalizar" do quiz principal
        if (previousButton) {
            previousButton.style.display = 'none';
        }
        if (nextButton) {
            nextButton.style.display = 'none';
        }
        if (finishButton) {
            finishButton.style.display = 'none';
        }
    
        // Remove qualquer overlay existente
        const existingOverlay = document.querySelector('.game-overlay');
        if (existingOverlay) {
            existingOverlay.remove();
        }
    
        // Cria o novo overlay
        const overlay = document.createElement('div');
        overlay.classList.add('game-overlay');
        overlay.innerHTML = `
            <div class="overlay-content">
                <h2>Quiz Concluído!</h2>
                <p>Tempo gasto: ${time} segundos</p>
                <p>Sua pontuação: ${score} de ${totalQuestions} perguntas.</p>
                <button class="restart-button">Reiniciar</button>
                ${allCorrect ? '<button class="finish-button-overlay">Finalizar</button>' : ''}
            </div>
        `;
        quizContainer.appendChild(overlay);
    
        // Configura o botão "Reiniciar"
        overlay.querySelector('.restart-button').addEventListener('click', () => {
            location.reload();
        });
    
        // Configura o botão "Finalizar" do overlay
        if (allCorrect) {
            const finishButtonOverlay = overlay.querySelector('.finish-button-overlay');
            finishButtonOverlay.addEventListener('click', async () => {
                const userId = 1; // Substitua pelo ID do usuário
                const atividadeId = quizId;
    
                try {
                    const dados = {
                        id_usuario: userId,
                        id_atividade: atividadeId,
                        pontuacao: score,
                        tempo_gasto: `${time}`,
                        data_execucao: new Date().toISOString(),
                    };
    
                    const response = await fetch('http://127.0.0.1:5054/api/desempenho', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(dados),
                    });
    
                    if (!response.ok) throw new Error('Erro ao salvar desempenho.');
    
                    alert('Desempenho salvo com sucesso!');
                    location.href = 'levels.html';
                } catch (error) {
                    console.error(error);
                    alert('Erro ao salvar desempenho.');
                }
            });
        }
    }
    
    

    function startTimer() {
        const timerElement = document.getElementById('timer');
        time = 0;

        interval = setInterval(() => {
            time++;
            if (timerElement) {
                timerElement.textContent = `Tempo: ${time}s`;
            }
        }, 1000);
    }

    startButton.addEventListener('click', async () => {
        await fetchQuestions();
        if (questions.length === 0) {
            console.error('Nenhuma pergunta carregada.');
            startScreen.innerHTML = '<p>Erro ao carregar perguntas do quiz.</p>';
            return;
        }
        startScreen.style.display = 'none';
        quizContainer.style.display = 'block';
        renderQuestion(currentQuestionIndex);
        startTimer();
    });

    nextButton.addEventListener('click', () => {
        calculateScore();
        currentQuestionIndex++;
        renderQuestion(currentQuestionIndex);
    });

    previousButton.addEventListener('click', () => {
        currentQuestionIndex--;
        renderQuestion(currentQuestionIndex);
    });

    finishButton.addEventListener('click', () => {
        calculateScore();
        showResultOverlay();
    });
});
