// Função para alternar entre os formulários de Quiz, Combinação e Palavras ao Vento
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

    // Pré-visualização da imagem
    const comboImageInput = document.getElementById('comboImage');
    const previewImage = document.getElementById('previewImage');

    if (comboImageInput) {
        comboImageInput.addEventListener('change', function() {
            const file = this.files[0];
            
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    previewImage.src = e.target.result;
                    previewImage.style.display = 'block';
                };
                reader.readAsDataURL(file);
            } else {
                previewImage.src = "";
                previewImage.style.display = 'none';
            }
        });
    }

    // Adicionar uma nova opção para Quiz
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

    // Controle de checkbox única para dificuldade
    document.querySelectorAll('.difficulty-level').forEach(level => {
        level.addEventListener('change', function() {
            document.querySelectorAll('.difficulty-level').forEach(cb => {
                if (cb !== this) cb.checked = false;
            });
        });
    });

    const quizDropdown = document.getElementById('quizDropdown');
    if (quizDropdown) {
        fetch('http://localhost:5052/get_quizzes')
            .then(response => response.json())
            .then(data => {
                if (data.status === "success") {
                    quizDropdown.innerHTML = '<option value="">Selecione um Tema</option>';
                    data.quizzes.forEach(quiz => {
                        const option = document.createElement('option');
                        option.value = quiz.id_quiz;
                        option.textContent = quiz.nome;
                        option.dataset.nivel = quiz.nivel;
                        quizDropdown.appendChild(option);
                    });
                } else {
                    alert(`Erro ao carregar quizzes: ${data.message}`);
                }
            })
            .catch(error => console.error('Erro ao conectar com a API:', error));
    };
    const addQuizButton = document.getElementById('addQuizButton');
    if (addQuizButton) {
        addQuizButton.addEventListener('click', function () {
            const nome = document.getElementById('title').value.trim();
            const descricao = document.getElementById('description').value.trim();
            const selectedQuiz = quizDropdown.options[quizDropdown.selectedIndex]; // Quiz selecionado
            const id_quiz = selectedQuiz ? selectedQuiz.value : null; // Pega o id_quiz do dropdown
            const nivel = selectedQuiz ? selectedQuiz.dataset.nivel : null; // Nível do quiz


            const questionText = document.querySelector('.question-text').value.trim();
            const options = [];
            let correctAnswer = null;

            document.querySelectorAll('.option-item').forEach((item, index) => {
                const texto = item.querySelector('.option').value.trim();
                const isCorrect = item.querySelector('.correct-answer').checked;

                options.push({ texto, correta: isCorrect ? 1 : 0 });
                if (isCorrect) correctAnswer = index;
            });

            // Validações
            if (!nome || !descricao || !nivel || !questionText || options.length < 2 || correctAnswer === null) {
                alert("Preencha todos os campos corretamente antes de enviar.");
                return;
            }

            const quizData = {
                id_quiz: id_quiz, 
                nome: nome,
                descricao: descricao,
                nivel: nivel,
                pergunta: {
                    enunciado: questionText,
                    alternativas: options
                }
            };

            // Enviar os dados
            fetch('http://localhost:5052/add_quiz', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(quizData)
            })
                .then(response => response.json())
                .then(data => {
                    if (data.status === "success") {
                        alert('Quiz e pergunta adicionados com sucesso!');
                        document.getElementById('quizForm').reset();
                    } else {
                        alert(`Erro: ${data.message}`);
                    }
                })
                .catch(error => {
                    console.error("Erro ao conectar com a API:", error);
                    alert("Erro ao conectar com a API.");
                });
        });
    } else {
        console.error("Botão 'Adicionar Quiz' não encontrado no DOM.");
    };
    
    

    // Enviar Combinação
    const addCombinationButton = document.getElementById("addCombinationButton");
    if (addCombinationButton) {
        addCombinationButton.addEventListener("click", function() {
            const comboName = document.getElementById("comboName").value;
            const comboImage = document.getElementById("comboImage").files[0];
            const word = document.getElementById("word").value;
            let difficulty = null;

            document.querySelectorAll(".difficulty-level").forEach(level => {
                if (level.checked) difficulty = level.value;
            });

            if (!comboImage) {
                alert("Por favor, adicione uma imagem.");
                return;
            }

            const reader = new FileReader();
            reader.onload = function (e) {
                const imageBase64 = e.target.result.split(",")[1];

                const combinationData = {
                    comboName: comboName,
                    imagem_base64: imageBase64,
                    descricao_imagem: "Descrição da imagem",
                    texto: word,
                    nivel: difficulty,
                };

                fetch("http://localhost:5052/add_combination", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(combinationData),
                })
                .then(response => response.json())
                .then(data => {
                    if (data.status === "success") {
                        alert("Combinação adicionada com sucesso!");
                        // Limpa os campos
                        document.getElementById("comboName").value = "";
                        document.getElementById("comboImage").value = "";
                        document.getElementById("word").value = "";
                        document.querySelectorAll(".difficulty-level").forEach(level => level.checked = false);
                    } else {
                        alert(`Erro: ${data.message}`);
                    }
                })
                .catch(error => console.error("Erro ao conectar com a API:", error));
            };
            reader.readAsDataURL(comboImage);
        });
    }

   // Armazena o texto original e gerencia palavras corretas
   const windwordsText = document.getElementById("windwordsText");
   const correctWordsInput = document.getElementById("correctWords");
   let originalText = "";
   let correctWordsArray = []; // Armazena palavras corretas

   function escapeRegExp(string) {
       return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
   }

   // Evento de duplo clique para selecionar palavras corretas
   windwordsText.addEventListener("dblclick", function(event) {
       const selection = window.getSelection();
       const selectedText = selection.toString().trim();

       if (selectedText) {
           // Verifica se a palavra já está na lista
           if (!correctWordsArray.includes(selectedText)) {
               correctWordsArray.push(selectedText);

               // Atualiza o campo de palavras corretas
               correctWordsInput.value = correctWordsArray.join(", ");
           }

           selection.removeAllRanges();
           updateDisplayedText();
       }
   });

   // Restaura a palavra correta ao clicar no campo de palavras corretas
   correctWordsInput.addEventListener("click", function(event) {
       const input = event.target;
       const cursorPosition = input.selectionStart;
       const value = input.value;

       const regexSeparator = /(\s*,\s*)/;
       const wordsAndSeparators = value.split(regexSeparator);

       let cumulativeLength = 0;
       let clickedWord = null;

       for (let i = 0; i < wordsAndSeparators.length; i++) {
           const part = wordsAndSeparators[i];
           const partLength = part.length;

           if (!regexSeparator.test(part)) {
               // É uma palavra
               const wordStart = cumulativeLength;
               const wordEnd = cumulativeLength + partLength;

               if (cursorPosition >= wordStart && cursorPosition <= wordEnd) {
                   clickedWord = part.trim();
                   break;
               }
           }

           cumulativeLength += partLength;
       }

       if (clickedWord) {
           // Remove a palavra da lista de palavras corretas
           correctWordsArray = correctWordsArray.filter(word => word !== clickedWord);

           // Atualiza o campo de palavras corretas
           correctWordsInput.value = correctWordsArray.join(", ");

           // Atualiza o texto exibido
           updateDisplayedText();
       }
   });

   // Impedir entrada manual no campo de Palavras Corretas
   correctWordsInput.addEventListener('keydown', function(event) {
       event.preventDefault();
   });

   function updateDisplayedText() {
       // Se o texto original ainda não foi armazenado, armazene-o
       if (!originalText) {
           originalText = windwordsText.value;
       }

       // Começa com o texto original
       let textContent = originalText;

       // Substitui todas as ocorrências das palavras corretas por "__"
       correctWordsArray.forEach(word => {
           const escapedWord = escapeRegExp(word);
           const regex = new RegExp(`\\b${escapedWord}\\b`, 'g');
           textContent = textContent.replace(regex, "__");
       });

       windwordsText.value = textContent;
   }

   // Envio de Palavras ao Vento
// Envio de Palavras ao Vento
const addWindwordsButton = document.getElementById('addWindwordsButton');
if (addWindwordsButton) {
    addWindwordsButton.addEventListener('click', function () {
        const title = document.getElementById('windwordsTitle').value.trim();
        const text = windwordsText.value.trim(); // Este é o texto com os '__'
        const correctWords = correctWordsInput.value.split(',').map(word => word.trim());
        let difficulty = null;

        // Captura a dificuldade selecionada
        document.querySelectorAll('#windwords-form .difficulty-level').forEach(level => {
            if (level.checked) difficulty = parseInt(level.value);
        });

        // Validações
        if (!title) {
            alert("Por favor, preencha o título.");
            return;
        }
        if (!text) {
            alert("Por favor, preencha o texto principal.");
            return;
        }
        if (!correctWords.length || correctWords[0] === "") {
            alert("Por favor, selecione ao menos uma palavra correta.");
            return;
        }
        if (!difficulty) {
            alert("Por favor, selecione uma dificuldade.");
            return;
        }

        const windwordsData = {
            title: title,
            text: text, // Texto com '__'
            originalText: originalText.trim(), // Adicione o texto original
            correctWords: correctWords,
            difficulty: difficulty
        };

        // Enviar requisição para a API
        fetch('http://localhost:5052/add_windwords', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(windwordsData)
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === "success") {
                alert('Palavras ao Vento adicionadas com sucesso!');
                document.getElementById('windwordsForm').reset(); // Reseta o formulário
                correctWordsInput.value = ""; // Limpa as palavras corretas
                originalText = ""; // Limpa o texto original
            } else {
                alert(`Erro ao adicionar Palavras ao Vento: ${data.message}`);
            }
        })
        .catch(error => {
            console.error('Erro ao fazer a solicitação fetch:', error);
            alert('Erro ao conectar com a API.');
        });
    });
} else {
    console.error("Botão 'Adicionar Palavras ao Vento' não encontrado");
}

});
