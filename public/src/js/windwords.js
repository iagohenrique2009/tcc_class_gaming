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

    const spinner = document.querySelector('.spinner');
    const playButton = document.querySelector('.play-button');

    if (spinner) spinner.style.display = 'block';
    if (playButton) playButton.style.display = 'none';

    try {
        const response = await fetch(`http://127.0.0.1:5051/api/windwords?level=${level}`);
        if (!response.ok) {
            const errorMessage = await response.text();
            throw new Error(errorMessage);
        }

        const data = await response.json();
        if (data.success) {
            const activities = data.activities;

            if (!activities || activities.length === 0) {
                if (spinner) spinner.style.display = 'none';
                alert('Nenhuma atividade disponível para este nível.');
                return;
            }

            createWindWordsActivities(activities);

            if (spinner) spinner.style.display = 'none';
            if (playButton) playButton.style.display = 'block';

            playButton.addEventListener('click', () => {
                const gameCover = document.querySelector('.game-cover');
                if (gameCover) gameCover.style.display = 'none';
                startTimer(300); // Inicia o timer
            }, { once: true });
        } else {
            if (spinner) spinner.style.display = 'none';
            alert('Erro ao carregar atividades: ' + data.message);
        }
    } catch (error) {
        if (spinner) spinner.style.display = 'none';
        alert('Erro ao buscar as atividades: ' + error.message);
    }
});

let totalCorrectWords = [];
let textDataArray = [];
let interval;

function createWindWordsActivities(activities) {
    const activityContainer = document.querySelector('.activity-container');
    if (!activityContainer) return;

    let wordIndex = 0;

    activities.forEach((activity) => {
        if (!activity.texts || activity.texts.length === 0) return;

        activity.texts.forEach((textObj) => {
            const text = textObj.texto;
            const correctWords = textObj.correct_words;
            const textoCorreto = textObj.texto_correto;

            if (!correctWords || correctWords.length === 0) return;
            if (!textoCorreto) return;

            const startIndex = wordIndex;
            const endIndex = wordIndex + correctWords.length - 1;

            totalCorrectWords = totalCorrectWords.concat(correctWords);

            const processed = processText(text, correctWords, wordIndex, totalCorrectWords);

            const paragraph = document.createElement('p');
            paragraph.innerHTML = processed.html;
            activityContainer.appendChild(paragraph);

            textDataArray.push({
                startIndex,
                endIndex,
                textoCorreto,
                parts: processed.parts,
                dropdownIndices: processed.dropdownIndices,
            });

            wordIndex += correctWords.length;
        });
    });

    if (textDataArray.length === 0) return;

    const checkButton = document.createElement('button');
    checkButton.textContent = 'Verificar Respostas';
    checkButton.classList.add('check-button');
    checkButton.addEventListener('click', () => {
        checkAnswers(totalCorrectWords, textDataArray);
    });

    activityContainer.appendChild(checkButton);
}

function processText(text, correctWords, wordStartIndex, totalCorrectWords) {
    const parts = text.split('__');
    let result = '';
    let dropdownIndices = [];

    for (let i = 0; i < parts.length; i++) {
        result += parts[i];
        if (i < parts.length - 1) {
            const dataIndex = wordStartIndex + i;
            const selectHTML = createDropdown(correctWords[i], dataIndex, totalCorrectWords);
            result += selectHTML;
            dropdownIndices.push(dataIndex);
        }
    }
    return { html: result, parts, dropdownIndices };
}

function createDropdown(correctWord, dataIndex, totalCorrectWords) {
    const options = [...new Set(totalCorrectWords)];
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
        const { dropdownIndices } = textData;

        dropdownIndices.forEach((dataIndex) => {
            const dropdown = document.querySelector(`.word-dropdown[data-index="${dataIndex}"]`);
            const selectedValue = dropdown ? dropdown.value : '';
            const correctWord = totalCorrectWords[dataIndex];

            if (selectedValue === correctWord) {
                dropdown.classList.add('correct');
                dropdown.classList.remove('incorrect');
                correctAnswerCount++;
            } else {
                dropdown.classList.add('incorrect');
                dropdown.classList.remove('correct');
            }
        });
    });

    const feedback = document.createElement('div');
    feedback.classList.add('feedback');

    if (correctAnswerCount === totalAnswers) {
        feedback.textContent = 'Parabéns! Você acertou todas as alternativas.';
        feedback.classList.add('correct');
        clearInterval(interval);

        const timerElement = document.getElementById('timer');
        const timer = timerElement ? timerElement.textContent.replace('Tempo decorrido: ', '') : '00:00';

        showFinalizationOverlay(correctAnswerCount, totalAnswers, timer);
    } else {
        feedback.textContent = `Você acertou ${correctAnswerCount} de ${totalAnswers} alternativas.`;
        feedback.classList.add('incorrect');
    }

    const existingFeedback = document.querySelector('.feedback');
    if (existingFeedback) existingFeedback.remove();

    document.querySelector('.activity-container').appendChild(feedback);
}

function showFinalizationOverlay(correctAnswersCount, totalAnswers, timer) {
    const overlay = document.createElement('div');
    overlay.classList.add('finalization-overlay');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
    overlay.style.display = 'flex';
    overlay.style.flexDirection = 'column';
    overlay.style.justifyContent = 'center';
    overlay.style.alignItems = 'center';
    overlay.style.zIndex = '9999';

    overlay.innerHTML = `
        <div>
            <h2>Atividade Finalizada!</h2>
            <p>Parabéns! Você acertou todas as alternativas.</p>
            <p>Tempo decorrido: ${timer}</p>
            <button id="save-performance">Salvar Desempenho</button>
            <button id="restart-activity">Reiniciar</button>
        </div>
    `;

    document.body.appendChild(overlay);

    document.getElementById('save-performance').addEventListener('click', () => {
        alert('Desempenho salvo!');
        location.reload();
    });

    document.getElementById('restart-activity').addEventListener('click', () => {
        location.reload();
    });
}


function startTimer(maxDuration) {
    let timer = 0;
    const timerElement = document.createElement('div');
    timerElement.id = 'timer';
    document.querySelector('.activity-container').prepend(timerElement);

    interval = setInterval(() => {
        const minutes = String(Math.floor(timer / 60)).padStart(2, '0');
        const seconds = String(timer % 60).padStart(2, '0');

        timerElement.textContent = `Tempo decorrido: ${minutes}:${seconds}`;
        timer++;

        if (timer >= maxDuration) {
            clearInterval(interval);
            timerElement.textContent += ' (Tempo limite alcançado!)';
            endActivity();
        }
    }, 1000);
}

function endActivity() {
    // Pode exibir um feedback ao usuário, por exemplo, ou bloquear interações
}
