document.addEventListener('DOMContentLoaded', async () => {
    const level = localStorage.getItem('selectedLevel');
    const gameContainer = document.querySelector('.game-container');

    if (!gameContainer) {
        console.error("Elemento '.game-container' não encontrado.");
        return;
    }

    if (!level) {
        console.error('Nenhum nível selecionado.');
        return;
    }

    const loadingIndicator = document.createElement('div');
    loadingIndicator.classList.add('loading-indicator');
    loadingIndicator.innerHTML = `<div class="spinner"></div>`;
    document.body.appendChild(loadingIndicator);

    try {
        const response = await fetch(`http://127.0.0.1:5051/api/combinations?level=${level}`);
        if (!response.ok) {
            const errorMessage = await response.text();
            throw new Error(errorMessage);
        }

        const data = await response.json();
        if (data.success) {
            const combinations = data.combinations;

            if (combinations.length === 0) {
                console.error('Nenhuma combinação retornada.');
                return;
            }

            const items = combinations.map((combination, index) => ({
                id: combination.id_combinacao,
                imagePath: `data:image/jpeg;base64,${combination.image_url}`,
                dropzoneText: combination.dropzone_text || `Solte aqui ${index + 1}`,
            }));

            createGameCover(gameContainer, items);
        } else {
            console.error('Erro na API:', data.message);
        }
    } catch (error) {
        console.error('Erro ao buscar combinações:', error.message);
    } finally {
        loadingIndicator.remove();
    }
});

function createGameCover(container, items) {
    const cover = document.createElement('div');
    cover.classList.add('game-cover');
    cover.innerHTML = `
        <div class="cover-content">
            <button class="play-button">Play</button>
        </div>
    `;
    container.appendChild(cover);

    const playButton = cover.querySelector('.play-button');
    playButton.addEventListener('click', () => {
        cover.remove();
        startGame(container, items);
    });
}

let correctMatches = 0;

function startGame(container, items) {
    let time = 0;

    const timer = document.createElement('div');
    timer.classList.add('game-timer');
    timer.textContent = `Tempo: ${time}s`;
    container.prepend(timer);

    const interval = setInterval(() => {
        time += 1;
        timer.textContent = `Tempo: ${time}s`;
    }, 1000);

    container.dataset.intervalId = interval;
    createDragAndDrop(items);
}

function createDragAndDrop(items) {
    const imageColumn = document.querySelector('.image-column');
    const dropzoneColumn = document.querySelector('.dropzone-column');

    if (!imageColumn || !dropzoneColumn) {
        console.error("Elementos '.image-column' ou '.dropzone-column' não encontrados!");
        return;
    }

    imageColumn.innerHTML = '';
    dropzoneColumn.innerHTML = '';

    const shuffledItems = items.slice().sort(() => Math.random() - 0.5);

    shuffledItems.forEach((item) => {
        const draggable = document.createElement('img');
        draggable.src = item.imagePath;
        draggable.alt = `Imagem para arrastar`;
        draggable.id = `draggable-${item.id}`;
        draggable.classList.add('draggable');
        draggable.draggable = true;
        draggable.dataset.id = item.id;

        draggable.addEventListener('dragstart', (event) => {
            event.dataTransfer.setData('text/plain', event.target.id);
            setTimeout(() => {
                draggable.style.display = "none";
            }, 0);
        });

        draggable.addEventListener('dragend', (event) => {
            event.preventDefault();
            draggable.style.display = "block";
        });

        imageColumn.appendChild(draggable);
    });

    items.forEach((item) => {
        const dropzone = document.createElement('div');
        dropzone.classList.add('dropzone');
        dropzone.id = `dropzone-${item.id}`;
        dropzone.innerHTML = `<span class="dropzone-text">${item.dropzoneText}</span>`;
        dropzone.dataset.id = item.id;

        addDropzoneEvents(dropzone);
        dropzoneColumn.appendChild(dropzone);
    });
}

function addDropzoneEvents(dropzone) {
    dropzone.addEventListener('dragover', (event) => {
        event.preventDefault();
        dropzone.classList.add('hovered');
    });

    dropzone.addEventListener('dragleave', () => {
        dropzone.classList.remove('hovered');
    });

    dropzone.addEventListener('drop', (event) => {
        event.preventDefault();
        dropzone.classList.remove('hovered');

        const draggedElementId = event.dataTransfer.getData('text');
        const draggedElement = document.getElementById(draggedElementId);
        if (!draggedElement) return;

        if (draggedElement.dataset.id === dropzone.dataset.id) {
            if (!dropzone.classList.contains('correct')) {
                correctMatches += 1;
            }
            dropzone.classList.add('correct');
        } else {
            if (dropzone.classList.contains('correct')) {
                correctMatches -= 1;
            }
            dropzone.classList.remove('correct');
        }

        const previousImage = dropzone.querySelector('img');
        if (previousImage) {
            document.querySelector('.image-column').appendChild(previousImage);
        }

        dropzone.appendChild(draggedElement);
        checkGameCompletion();
    });
}

function checkGameCompletion() {
    const totalItems = document.querySelectorAll('.dropzone').length;

    if (correctMatches === totalItems) {
        const intervalId = document.querySelector('.game-container').dataset.intervalId;
        clearInterval(intervalId);
        showGameOverlay();
    }
}

function showGameOverlay() {
    const gameContainer = document.querySelector('.game-container');
    const time = document.querySelector('.game-timer').textContent.split(': ')[1];

    const overlay = document.createElement('div');
    overlay.classList.add('game-overlay');
    overlay.innerHTML = `
        <div class="overlay-content">
            <h2>Jogo Concluído!</h2>
            <p>Tempo gasto: ${time}</p>
            <button class="restart-button">Reiniciar</button>
            <button class="finish-button">Finalizar</button>
        </div>
    `;
    gameContainer.appendChild(overlay);

    overlay.querySelector('.restart-button').addEventListener('click', () => {
        location.reload();
    });

    overlay.querySelector('.finish-button').addEventListener('click', async () => {
        const userId = 1; // Substitua pelo ID do usuário
        const atividadeId = 1; // Substitua pelo ID da atividade
        const pontuacao = 100;

        try {
            const dados = {
                id_usuario: userId,
                id_atividade: atividadeId,
                pontuacao: pontuacao,
                tempo_gasto: time,
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
