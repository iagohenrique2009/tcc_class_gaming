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
        const question = questions[index];
        const questionElement = document.getElementById('question');
        const optionsElement = document.getElementById('options');

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

    function showResult() {
        quizContainer.style.display = 'none';
        resultScreen.style.display = 'block';
        resultElement.innerHTML = `Sua pontuação: ${score}`;
    }

    startButton.addEventListener('click', () => {
        startScreen.style.display = 'none';
        quizContainer.style.display = 'block';
        renderQuestion(currentQuestionIndex);
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
        showResult();
    });

    await fetchQuestions();
});
