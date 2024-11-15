<<<<<<< HEAD
// Função para alternar entre os formulários de Quiz e Combinação
function showTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    document.querySelectorAll('.tab-button').forEach(button => button.classList.remove('active'));

    const tabContent = document.getElementById(`${tabName}-form`);
    const tabButton = document.querySelector(`.tab-button[onclick="showTab('${tabName}')"]`);
    
    if (tabContent && tabButton) {
        tabContent.classList.add('active');
        tabButton.classList.add('active');
    }
}

// Executa o código principal após o DOM estar carregado
document.addEventListener("DOMContentLoaded", function() {
    const optionLabels = ['A', 'B', 'C', 'D', 'E'];

    // Função para adicionar uma nova opção para Quiz
    const addOptionButton = document.querySelector('.add-option');
    if (addOptionButton) {
        addOptionButton.addEventListener('click', function() {
            const optionsDiv = document.querySelector('.options');
            const optionCount = optionsDiv ? optionsDiv.querySelectorAll('.option-item').length : 0;

            if (optionsDiv && optionCount < 5) {
                const optionItem = document.createElement('div');
                optionItem.classList.add('option-item');

                optionItem.innerHTML = `
                    <label>${optionLabels[optionCount]}</label>
                    <input type="text" class="option" placeholder="Opção ${optionLabels[optionCount]}" required>
                    <label class="correct-label">
                        <input type="checkbox" class="correct-answer"> Correta
                    </label>
                `;
                
                // Adiciona evento para limitar checkbox única
                optionItem.querySelector('.correct-answer').addEventListener('change', function() {
                    optionsDiv.querySelectorAll('.correct-answer').forEach(cb => {
                        if (cb !== this) cb.checked = false;
                    });
                });

                optionsDiv.appendChild(optionItem);
            } else {
                alert('Máximo de 5 opções alcançado.');
            }
        });
    }

    // Controle de checkbox única para dificuldade nos formulários
    document.querySelectorAll('.difficulty-level').forEach(level => {
        level.addEventListener('change', function() {
            document.querySelectorAll('.difficulty-level').forEach(cb => {
                if (cb !== this) cb.checked = false;
            });
        });
    });

    document.querySelectorAll('.combo-difficulty').forEach(level => {
        level.addEventListener('change', function() {
            document.querySelectorAll('.combo-difficulty').forEach(cb => {
                if (cb !== this) cb.checked = false;
            });
        });
    });

    // Envio do Quiz
    const addQuizButton = document.getElementById('addQuizButton');
    if (addQuizButton) {
        addQuizButton.addEventListener('click', function() {
            const title = document.getElementById('title').value;
            const description = document.getElementById('description').value;
            const questionText = document.querySelector('.question-text').value;
            const options = [];
            let correctAnswer = null;
            let difficulty = null;

            document.querySelectorAll('.difficulty-level').forEach(level => {
                if (level.checked) difficulty = level.value;
            });

            document.querySelectorAll('.option-item').forEach((item, index) => {
                const optionText = item.querySelector('.option').value;
                const isCorrect = item.querySelector('.correct-answer').checked;
                options.push(optionText);
                if (isCorrect) correctAnswer = optionLabels[index];
            });

            const quizData = {
                title, 
                description, 
                question: questionText,
                options, 
                answer: correctAnswer, 
                difficulty
            };

            fetch('http://localhost:5000/add_quiz', {
                method: 'POST', 
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(quizData)
            })
            .then(response => response.json())
            .then(data => alert(data.status === "success" ? 'Quiz adicionado!' : 'Erro ao adicionar quiz.'))
            .catch(error => console.error("Erro ao conectar com a API:", error));
        });
    }

    // Função para adicionar par de combinação
    const addPairButton = document.querySelector('.add-pair');
    if (addPairButton) {
        addPairButton.addEventListener('click', function() {
            const pairContainer = document.getElementById('pairsContainer');
            if (pairContainer) {
                const pairItem = document.createElement('div');
                pairItem.classList.add('pair-item');
                pairItem.innerHTML = `
                    <input type="text" class="pair-left" placeholder="Palavra em inglês" required>
                    <input type="text" class="pair-right" placeholder="Palavra em português" required>
                `;
                pairContainer.appendChild(pairItem);
            }
        });
    }

    // Envio do Jogo de Combinação
    const addCombinationButton = document.getElementById('addCombinationButton');
    if (addCombinationButton) {
        addCombinationButton.addEventListener('click', function() {
            const comboName = document.getElementById('comboName').value;
            const comboImage = document.getElementById('comboImage').files[0];
            const word = document.getElementById('word').value;
            let difficulty = null;

            document.querySelectorAll('.combo-difficulty').forEach(level => {
                if (level.checked) difficulty = level.value;
            });

            if (!comboImage) {
                alert("Por favor, adicione uma imagem.");
                return;
            }

            const formData = new FormData();
            formData.append('comboName', comboName);
            formData.append('comboImage', comboImage);
            formData.append('word', word);
            formData.append('difficulty', difficulty);

            fetch('http://localhost:5000/add_combination', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                alert(data.status === "success" ? 'Combinação adicionada com sucesso!' : 'Erro ao adicionar a combinação.');
            })
            .catch(error => {
                console.error('Erro ao fazer a solicitação fetch:', error);
                alert('Erro ao conectar com a API.');
            });
        });
    } else {
        console.error("Botão 'Adicionar Combinação' não encontrado");
    }
});
=======
let questionCount = 0;  // Contador para criar identificadores únicos para cada pergunta

// Alterna entre as abas do formulário (Quiz e Combinação)
function showTab(event, tabName) {
    document.querySelectorAll('.tab-content').forEach(tabContent => {
        tabContent.classList.remove('active');
    });
    document.querySelectorAll('.tab-button').forEach(button => {
        button.classList.remove('active');
    });
    document.getElementById(`${tabName}-form`).classList.add('active');
    event.target.classList.add('active');
}

// Função para carregar quizzes existentes
function loadExistingQuizzes() {
    const existingQuizSelect = document.getElementById('existingQuiz');
    const quizzes = [
        { id: 1, title: "Quiz de Verbo to be" },
        { id: 2, title: "Quiz fanboys" }
    ];

    quizzes.forEach(quiz => {
        const option = document.createElement('option');
        option.value = quiz.id;
        option.textContent = quiz.title;
        existingQuizSelect.appendChild(option);
    });
}

// Evento para adicionar uma nova pergunta ao quiz
document.getElementById('addNewQuestionButton').addEventListener('click', function() {
    const questionContainer = document.getElementById('questionsContainer');
    const newQuestionBlock = document.createElement('div');
    newQuestionBlock.classList.add('question-block');

    // Incrementa o contador para gerar um identificador único
    questionCount++;

    // HTML da nova pergunta com um identificador único para os checkboxes
    newQuestionBlock.innerHTML = `
        <label>Pergunta:</label>
        <input type="text" class="question-text" required>

        <label>Alternativas:</label>
        <div class="options">
            <div class="option-item">
                <label>A</label>
                <input type="text" class="option" placeholder="Opção A" required>
                <label>
                    <input type="checkbox" class="correct-answer" value="A"> 
                </label>
            </div>
            <div class="option-item">
                <label>B</label>
                <input type="text" class="option" placeholder="Opção B" required>
                <label>
                    <input type="checkbox" class="correct-answer" value="B"> 
                </label>
            </div>
            <div class="option-item">
                <label>C</label>
                <input type="text" class="option" placeholder="Opção C" required>
                <label>
                    <input type="checkbox" class="correct-answer" value="C"> 
                </label>
            </div>
            <div class="option-item">
                <label>D</label>
                <input type="text" class="option" placeholder="Opção D" required>
                <label>
                    <input type="checkbox" class="correct-answer" value="D"> 
                </label>
            </div>
            <div class="option-item">
                <label>E</label>
                <input type="text" class="option" placeholder="Opção E" required>
                <label>
                    <input type="checkbox" class="correct-answer" value="E"> 
                </label>
            </div>
        </div>
        <button type="button" class="remove-question-button">Excluir Pergunta</button>
    `;
    
    // Evento para excluir o bloco de pergunta
    newQuestionBlock.querySelector('.remove-question-button').addEventListener('click', function() {
        newQuestionBlock.remove();  // Remove o bloco de pergunta do formulário
    });

    questionContainer.appendChild(newQuestionBlock);  // Adiciona o novo bloco ao container de perguntas
});

// Salvar o quiz com as questões e suas opções
document.getElementById("saveQuizButton").addEventListener("click", function () {
    const title = document.getElementById("title").value;
    const description = document.getElementById("description").value;
    const difficulty = 3;  // Altere conforme necessário
    const questions = [];

    // Percorrer todas as perguntas e coletar dados
    document.querySelectorAll(".question-block").forEach((block) => {
        const questionText = block.querySelector(".question-text").value;
        const options = [];
        let correctAnswer = null;

        // Coletar as opções e identificar qual é a correta
        block.querySelectorAll(".option-item").forEach((optionItem, index) => {
            const optionText = optionItem.querySelector(".option").value;
            const isCorrect = optionItem.querySelector(".correct-answer").checked;

            // Adiciona as opções de forma dinâmica
            options.push({
                [`answer${String.fromCharCode(65 + index)}`]: optionText
            });

            // Identifica qual é a resposta correta
            if (isCorrect) {
                correctAnswer = String.fromCharCode(65 + index);  // "A", "B", "C", etc.
            }
        });

        // Adiciona a pergunta com as opções e a resposta correta
        questions.push({
            question: questionText,
            difficulty: { $numberInt: String(difficulty) },
            options: options,
            answer: correctAnswer  // A resposta correta será uma string ("A", "B", etc.)
        });
    });

    // Criar o objeto final para salvar no banco de dados com a estrutura esperada
    const quizData = {
        title: title,
        description: description,
        difficulty: { $numberInt: String(difficulty) },
        questions: questions
    };

    // Salvar o quiz no banco de dados
    saveQuizToDatabase(quizData);
});

// Função de exemplo para salvar o quiz no banco de dados
function saveQuizToDatabase(data) {
    // Aqui você pode implementar a lógica para salvar os dados no MongoDB
    console.log("Quiz data saved:", data);
}

// Carregar os quizzes existentes na inicialização da página
loadExistingQuizzes();
>>>>>>> feature/telas_jogos
