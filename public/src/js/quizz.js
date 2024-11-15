let currentQuestion = 0;
let score = [];
let selectedAnswersData = [];
let questions = []; // As perguntas serão carregadas da API
let totalQuestions = 0;

// Seleciona os elementos do DOM
const container = document.querySelector('.quiz-container');
const questionEl = document.querySelector('.question');
const option1 = document.querySelector('.option1');
const option2 = document.querySelector('.option2');
const option3 = document.querySelector('.option3');
const option4 = document.querySelector('.option4');
const option5 = document.querySelector('.option5');
const nextButton = document.querySelector('.next');
const previousButton = document.querySelector('.previous');
const result = document.querySelector('.result');

// Função para buscar perguntas da API
async function fetchQuestions() {
    try {
        // Certifique-se de que o endpoint está correto
        const response = await fetch('http://127.0.0.1:5000/api/quiz/2');
        questions = await response.json();
        totalQuestions = questions.length;
        
        if (totalQuestions > 0) {
            generateQuestions(currentQuestion);
        } else {
            console.error("Nenhuma pergunta encontrada.");
        }
    } catch (error) {
        console.error('Erro ao carregar as perguntas:', error);
    }
}

// Função para gerar a pergunta
function generateQuestions(index) {
    const question = questions[index];
    questionEl.innerHTML = `${index + 1}. ${question.question}`;
    
    // Configura as alternativas
    option1.setAttribute('data-total', question.alternatives[0]?.is_correct ? 1 : 0);
    option2.setAttribute('data-total', question.alternatives[1]?.is_correct ? 1 : 0);
    option3.setAttribute('data-total', question.alternatives[2]?.is_correct ? 1 : 0);
    option4.setAttribute('data-total', question.alternatives[3]?.is_correct ? 1 : 0);
    option5.setAttribute('data-total', question.alternatives[4]?.is_correct ? 1 : 0);

    option1.innerHTML = question.alternatives[0]?.text || '';
    option2.innerHTML = question.alternatives[1]?.text || '';
    option3.innerHTML = question.alternatives[2]?.text || '';
    option4.innerHTML = question.alternatives[3]?.text || '';
    option5.innerHTML = question.alternatives[4]?.text || '';
}

// Função para carregar a próxima pergunta
function loadNextQuestion() {
    const selectedOption = document.querySelector('input[type="radio"]:checked');
    if (!selectedOption) {
        alert('Please select your answer!');
        return;
    }

    // Obtenha o valor da pontuação
    const answerScore = Number(selectedOption.nextElementSibling.getAttribute('data-total'));
    score.push(answerScore);

    selectedOption.checked = false;
    currentQuestion++;

    if (currentQuestion === totalQuestions) {
        displayResult();
    } else {
        generateQuestions(currentQuestion);
    }
}

// Função para mostrar o resultado final
function displayResult() {
    const totalScore = score.reduce((a, b) => a + b, 0);
    container.style.display = 'none';
    result.innerHTML = `
        <h1 class="final-score">Sua pontuação: ${totalScore}</h1>
        <div class="summary">
            <h1>Resumo</h1>
            <p>10 - Uauu Parabéns!!</p>
            <p>6 - Você esta na média!</p>
            <p>2 - Vamos praticar mais, certo?</p>
            <p>0 - Comece de novo!</p>
        </div>
        <button class="restart">Reiniciar Quiz</button>
    `;
}

// Função para carregar a pergunta anterior
function loadPreviousQuestion() {
    currentQuestion--;
    score.pop();
    generateQuestions(currentQuestion);
}

// Função para reiniciar o quiz
function restartQuiz() {
    currentQuestion = 0;
    score = [];
    selectedAnswersData = [];
    container.style.display = 'flex';
    result.innerHTML = '';
    fetchQuestions();
}

// Carrega as perguntas da API quando a página é carregada
fetchQuestions();

// Event Listeners
nextButton.addEventListener('click', loadNextQuestion);
previousButton.addEventListener('click', loadPreviousQuestion);
result.addEventListener('click', restartQuiz);
