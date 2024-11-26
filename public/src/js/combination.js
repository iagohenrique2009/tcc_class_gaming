document.addEventListener('DOMContentLoaded', async () => {
    const level = localStorage.getItem('selectedLevel');
    const gameContainer = document.querySelector('.game-container'); // Usando o game-container como container principal

    if (!gameContainer) {
        console.error("Elemento '.game-container' não encontrado.");
        return;
    }

    if (!level) {
        console.error('Nenhum nível selecionado.');
        return;
    }

    // Cria o elemento de carregamento
    const loadingIndicator = document.createElement('div');
    loadingIndicator.classList.add('loading-indicator');
    loadingIndicator.innerHTML = `<div class="spinner"></div>`;
    document.body.appendChild(loadingIndicator); // Adiciona o indicador ao corpo do documento

    try {
        // Chamada para buscar combinações
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

            // Configura os itens diretamente a partir do JSON retornado, incluindo um ID único
            const items = combinations.map((combination, index) => ({
                id: combination.id_combinacao,
                imagePath: `data:image/jpeg;base64,${combination.image_url}`, 
                dropzoneText: combination.dropzone_text || `Solte aqui ${index + 1}`,
            }));

            // Chama a função para criar a capa e iniciar o jogo
            createGameCover(gameContainer, items);
        } else {
            console.error('Erro na API:', data.message);
        }
    } catch (error) {
        console.error('Erro ao buscar combinações:', error.message);
    } finally {
        // Remove o indicador de carregamento após o carregamento dos dados
        loadingIndicator.remove();
    }
});

// Cria a capa com o botão "Play"
function createGameCover(container, items) {
    // Adiciona a capa ao container
    const cover = document.createElement('div');
    cover.classList.add('game-cover');
    cover.innerHTML = `
        <div class="cover-content">
            <button class="play-button">Play</button>
        </div>
    `;
    container.appendChild(cover);

    // Adiciona evento ao botão "Play"
    const playButton = cover.querySelector('.play-button');
    playButton.addEventListener('click', () => {
        cover.remove(); // Remove a capa
        startGame(container, items); // Inicia o jogo
    });
}

// Variável global para rastrear o número de combinações corretas
let correctMatches = 0;

// Inicia o jogo com contador
function startGame(container, items) {
    let time = 0;

    // Cria o contador
    const timer = document.createElement('div');
    timer.classList.add('game-timer');
    timer.textContent = `Tempo: ${time}s`;
    container.prepend(timer);

    // Atualiza o contador a cada segundo
    const interval = setInterval(() => {
        time += 1;
        timer.textContent = `Tempo: ${time}s`;
    }, 1000);

    // Configura o Drag-and-Drop
    createDragAndDrop(items);

    // Salva o intervalo para poder parar depois
    container.dataset.intervalId = interval;
}

// Função para criar drag-and-drop
function createDragAndDrop(items) {
    const imageColumn = document.querySelector('.image-column');
    const dropzoneColumn = document.querySelector('.dropzone-column');

    if (!imageColumn || !dropzoneColumn) {
        console.error("Elementos '.image-column' ou '.dropzone-column' não encontrados!");
        return;
    }

    imageColumn.innerHTML = ''; // Limpa o conteúdo anterior
    dropzoneColumn.innerHTML = ''; // Limpa o conteúdo anterior

    // Embaralha as imagens para que não estejam na mesma ordem das dropzones
    const shuffledItems = items.slice().sort(() => Math.random() - 0.5);

    shuffledItems.forEach((item, index) => {
        // Criação da imagem arrastável
        const draggable = document.createElement('img');
        draggable.src = item.imagePath; // Base64 direto do JSON
        draggable.alt = `Imagem ${index + 1} para arrastar`;
        draggable.id = `draggable-${item.id}`; // Usando o ID único
        draggable.classList.add('draggable');
        draggable.draggable = true;

        // Armazena o ID único como um atributo data
        draggable.dataset.id = item.id;

        // Evento de início do arraste
        draggable.addEventListener('dragstart', (event) => {
            event.dataTransfer.setData('text/plain', event.target.id);
            setTimeout(() => {
                draggable.style.display = "none"; // Oculta temporariamente enquanto arrasta
            }, 0);
        });

        draggable.addEventListener('dragend', (event) => {
            event.preventDefault();
            draggable.style.display = "block"; // Torna visível após o drop
        });

        // Adiciona a imagem à coluna de imagens
        imageColumn.appendChild(draggable);
    });

    items.forEach((item, index) => {
        // Criação das dropzones
        const dropzone = document.createElement('div');
        dropzone.classList.add('dropzone');
        dropzone.id = `dropzone-${item.id}`; // Usando o ID único
        dropzone.innerHTML = `<span class="dropzone-text">${item.dropzoneText}</span>`;

        // Armazena o ID único como um atributo data
        dropzone.dataset.id = item.id;

        // Adiciona eventos à dropzone
        addDropzoneEvents(dropzone);
        dropzoneColumn.appendChild(dropzone);
    });

    // Ajusta a altura da game-container após a renderização
    adjustGameContainerHeight();
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

        // Verifica se a imagem corresponde à dropzone
        if (draggedElement.dataset.id === dropzone.dataset.id) {
            // Se ainda não havia uma imagem correta nesta dropzone
            if (!dropzone.classList.contains('correct')) {
                correctMatches += 1;
            }
            dropzone.classList.add('correct');
        } else {
            // Se havia uma imagem correta e agora está incorreta
            if (dropzone.classList.contains('correct')) {
                correctMatches -= 1;
            }
            dropzone.classList.remove('correct');
        }

        // Remove a imagem anterior, se houver
        const previousImage = dropzone.querySelector('img');
        if (previousImage) {
            previousImage.style.position = 'initial';
            previousImage.style.transform = 'none';
            previousImage.style.width = '100px';
            previousImage.style.height = '100px';
            document.querySelector('.image-column').appendChild(previousImage);
        }

        dropzone.appendChild(draggedElement);

        draggedElement.style.position = 'absolute';
        draggedElement.style.left = '50%';
        draggedElement.style.top = '50%';
        draggedElement.style.transform = 'translate(-50%, -50%)';
        draggedElement.style.width = '120px';
        draggedElement.style.height = '120px';

        checkGameCompletion(); // Verifica se o jogo foi concluído
    });
}

function adjustGameContainerHeight() {
    const dropzoneColumn = document.querySelector('.dropzone-column');
    const gameContainer = document.querySelector('.game-container');

    if (dropzoneColumn && gameContainer) {
        const dropzoneColumnHeight = dropzoneColumn.scrollHeight;
        gameContainer.style.height = `${dropzoneColumnHeight * 1.3}px`;
    }
}

// Função para verificar se o jogo foi concluído
function checkGameCompletion() {
    const totalItems = document.querySelectorAll('.dropzone').length;

    if (correctMatches === totalItems) {
        // Todas as combinações estão corretas
        showFinishButton();
    }
}

// Função para exibir o botão "Terminar"
function showFinishButton() {
    const gameContainer = document.querySelector('.game-container');

    // Verifica se o botão já existe
    if (!document.querySelector('.finish-button')) {
        const finishButton = document.createElement('button');
        finishButton.classList.add('finish-button');
        finishButton.textContent = 'Terminar';
        gameContainer.appendChild(finishButton);

        finishButton.addEventListener('click', () => {
            // Lógica para quando o jogo termina
            alert('Parabéns! Você completou o jogo.');

            // Para o contador
            const intervalId = gameContainer.dataset.intervalId;
            clearInterval(intervalId);

            // Redireciona para a página inicial de jogos
            window.location.href = 'game-list.html';
        });
    }
}
