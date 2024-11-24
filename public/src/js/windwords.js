document.addEventListener('DOMContentLoaded', async () => {
    console.log('DOM completamente carregado e analisado');

    const urlParams = new URLSearchParams(window.location.search);
    const level = urlParams.get('level');
    console.log('Nível selecionado:', level);

    const activityContainer = document.querySelector('.activity-container');
    if (!activityContainer) {
        console.error('Elemento .activity-container não encontrado.');
        return;
    }

    if (!level) {
        console.error('Nenhum nível selecionado.');
        return;
    }

    // Seleciona os elementos do spinner e do botão "Play"
    const spinner = document.querySelector('.spinner');
    const playButton = document.querySelector('.play-button');
    console.log('Elemento spinner:', spinner);
    console.log('Elemento playButton:', playButton);

    // Exibe o spinner inicialmente e oculta o botão "Play"
    if (spinner) {
        spinner.style.display = 'block';
        console.log('Spinner exibido');
    } else {
        console.error('Elemento spinner não encontrado');
    }

    if (playButton) {
        playButton.style.display = 'none';
        console.log('Botão Play oculto');
    } else {
        console.error('Elemento playButton não encontrado');
    }

    try {
        console.log('Iniciando fetch para a API...');
        const response = await fetch(`http://127.0.0.1:5051/api/windwords?level=${level}`);
        console.log('Resposta da API recebida:', response);

        if (!response.ok) {
            const errorMessage = await response.text();
            throw new Error(errorMessage);
        }

        const data = await response.json();
        console.log('Dados recebidos da API:', data);

        if (data.success) {
            const activities = data.activities;
            console.log('Atividades recebidas:', activities);

            if (!activities || activities.length === 0) {
                console.error('Nenhuma atividade retornada.');
                if (spinner) spinner.style.display = 'none';
                alert('Nenhuma atividade disponível para este nível.');
                return;
            }

            // Processa os dados das atividades
            createWindWordsActivities(activities);
            console.log('Atividades processadas');

            // Oculta o spinner e exibe o botão "Play"
            if (spinner) {
                spinner.style.display = 'none';
                console.log('Spinner ocultado');
            }
            if (playButton) {
                playButton.style.display = 'block';
                console.log('Botão Play exibido');
            }

            // Adiciona evento ao botão "Play"
            playButton.addEventListener('click', () => {
                const gameCover = document.querySelector('.game-cover');
                if (gameCover) {
                    gameCover.style.display = 'none';
                    console.log('Overlay ocultado');
                }
                startTimer(300); // Inicia o timer
                console.log('Timer iniciado');
            }, { once: true });
        } else {
            console.error('Erro na API:', data.message);
            if (spinner) spinner.style.display = 'none';
            alert('Erro ao carregar atividades: ' + data.message);
        }
    } catch (error) {
        console.error('Erro ao buscar as atividades:', error.message);
        if (spinner) spinner.style.display = 'none';
        alert('Erro ao buscar as atividades: ' + error.message);
    }
});

let totalCorrectWords = []; // Torna global para acesso em endActivity
let textDataArray = [];     // Torna global para acesso em endActivity
let interval; // Variável global para o timer

function createWindWordsActivities(activities) {
    const activityContainer = document.querySelector('.activity-container');
    if (!activityContainer) {
        console.error('Elemento .activity-container não encontrado.');
        return;
    }

    let wordIndex = 0;

    activities.forEach((activity) => {
        if (!activity.texts || activity.texts.length === 0) {
            console.error('Nenhum texto encontrado para a atividade:', activity);
            return;
        }

        activity.texts.forEach((textObj) => {
            const text = textObj.texto;
            const correctWords = textObj.correct_words;
            const textoCorreto = textObj.texto_correto;

            if (!correctWords || correctWords.length === 0) {
                console.error('Nenhuma palavra correta encontrada para o texto:', textObj);
                return;
            }

            if (!textoCorreto) {
                console.error('Texto correto não encontrado para o texto:', textObj);
                return;
            }

            // Armazena o índice inicial e final das palavras deste texto
            const startIndex = wordIndex;
            const endIndex = wordIndex + correctWords.length - 1;

            totalCorrectWords = totalCorrectWords.concat(correctWords);

            // Processa o texto e gera o HTML com dropdowns
            const processed = processText(text, correctWords, wordIndex, totalCorrectWords);

            const paragraph = document.createElement('p');
            paragraph.innerHTML = processed.html;
            activityContainer.appendChild(paragraph);

            // Salva os dados deste texto
            textDataArray.push({
                startIndex: startIndex,
                endIndex: endIndex,
                textoCorreto: textoCorreto,
                parts: processed.parts,
                dropdownIndices: processed.dropdownIndices,
            });

            wordIndex += correctWords.length;
        });
    });

    if (textDataArray.length === 0) {
        console.error('Nenhum texto correto encontrado nas atividades.');
        return;
    }

    // Botão "Verificar Respostas"
    const checkButton = document.createElement('button');
    checkButton.textContent = 'Verificar Respostas';
    checkButton.classList.add('check-button');
    checkButton.addEventListener('click', () => {
        checkAnswers(totalCorrectWords, textDataArray);
    });

    activityContainer.appendChild(checkButton);
}

function processText(text, correctWords, wordStartIndex, totalCorrectWords) {
    // Divide o texto nos espaços em branco '__'
    const parts = text.split('__');

    let result = '';
    let dropdownIndices = [];
    for (let i = 0; i < parts.length; i++) {
        result += parts[i];
        if (i < parts.length - 1) {
            // Insere um dropdown
            const dataIndex = wordStartIndex + i;
            const selectHTML = createDropdown(correctWords[i], dataIndex, totalCorrectWords);
            result += selectHTML;
            dropdownIndices.push(dataIndex);
        }
    }
    return { html: result, parts: parts, dropdownIndices: dropdownIndices };
}

function createDropdown(correctWord, dataIndex, totalCorrectWords) {
    // Usamos todas as palavras corretas como opções
    const options = [...new Set(totalCorrectWords)]; // Remove duplicatas, se houver
    const shuffledOptions = options.sort(() => Math.random() - 0.5);

    let selectHTML = `<select data-index="${dataIndex}" class="word-dropdown">`;
    selectHTML += `<option value="">Selecione...</option>`;
    shuffledOptions.forEach((option) => {
        selectHTML += `<option value="${option}">${option}</option>`;
    });
    selectHTML += `</select>`;

    return selectHTML;
}

function checkAnswers(totalCorrectWords, textDataArray) {
    const dropdowns = document.querySelectorAll('.word-dropdown');
    let correctAnswerCount = 0;
    let totalAnswers = dropdowns.length;

    textDataArray.forEach((textData) => {
        const { parts, dropdownIndices } = textData;

        for (let i = 0; i < dropdownIndices.length; i++) {
            const dataIndex = dropdownIndices[i];
            const dropdown = document.querySelector(`.word-dropdown[data-index="${dataIndex}"]`);
            const selectedValue = dropdown ? dropdown.value : '';

            // Obtém a palavra correta para este índice
            const correctWord = totalCorrectWords[dataIndex];

            // Verifica se a seleção do usuário está correta
            if (selectedValue === correctWord) {
                dropdown.classList.add('correct');
                dropdown.classList.remove('incorrect');
                correctAnswerCount++;
            } else {
                dropdown.classList.add('incorrect');
                dropdown.classList.remove('correct');
            }
        }
    });

    // Exibe uma mensagem de feedback
    const feedback = document.createElement('div');
    feedback.classList.add('feedback');
    if (correctAnswerCount === totalAnswers) {
        feedback.textContent = 'Parabéns! Você acertou todas as alternativas.';
        feedback.classList.add('correct');

        // Parar o timer quando todas as respostas estiverem corretas
        if (interval) {
            clearInterval(interval);
            console.log('Timer parado. Todas as respostas corretas.');
        }

        // Desabilitar todos os dropdowns
        dropdowns.forEach((dropdown) => {
            dropdown.disabled = true;
        });

    } else {
        feedback.textContent = `Você acertou ${correctAnswerCount} de ${totalAnswers} alternativas.`;
        feedback.classList.add('incorrect');
    }

    // Remove feedback anterior, se existir
    const existingFeedback = document.querySelector('.feedback');
    if (existingFeedback) {
        existingFeedback.remove();
    }

    document.querySelector('.activity-container').appendChild(feedback);
}

function endActivity() {
    // Desabilitar todos os dropdowns
    const dropdowns = document.querySelectorAll('.word-dropdown');
    dropdowns.forEach((dropdown) => {
        dropdown.disabled = true;
    });

    //  Exibir uma mensagem ou enviar automaticamente as respostas
    checkAnswers(totalCorrectWords, textDataArray);
}

function startTimer(maxDuration) {
    let timer = 0; // Inicia em zero
    const timerElement = document.createElement('div');
    timerElement.id = 'timer';
    timerElement.style.fontSize = '1.5rem';
    timerElement.style.marginBottom = '20px';
    timerElement.style.color = '#e12f31';
    document.querySelector('.activity-container').prepend(timerElement);

    interval = setInterval(() => {
        let minutes = parseInt(timer / 60, 10);
        let seconds = parseInt(timer % 60, 10);

        minutes = minutes < 10 ? '0' + minutes : minutes;
        seconds = seconds < 10 ? '0' + seconds : seconds;

        timerElement.textContent = `Tempo decorrido: ${minutes}:${seconds}`;

        timer++; // Incrementa o timer

        if (timer >= maxDuration) {
            clearInterval(interval);
            timerElement.textContent += ' (Tempo limite alcançado!)';
            console.log('Tempo limite alcançado.');
            endActivity();
        }
    }, 1000);
}
