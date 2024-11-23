const items = [
    { imagePath: 'https://via.placeholder.com/100', dropzoneText: 'Solte aqui 1' },
    { imagePath: 'https://via.placeholder.com/100', dropzoneText: 'Solte aqui 2' },
    { imagePath: 'https://via.placeholder.com/100', dropzoneText: 'Solte aqui 3' },
    { imagePath: 'https://via.placeholder.com/100', dropzoneText: 'Solte aqui 4' },
    { imagePath: 'https://via.placeholder.com/100', dropzoneText: 'Solte aqui 5' },
];

function createDragAndDrop(items) {
    const imageColumn = document.querySelector('.image-column');
    const dropzoneColumn = document.querySelector('.dropzone-column');
    const gameContainer = document.querySelector('.game-container');

    if (!imageColumn || !dropzoneColumn || !gameContainer) {
        console.error("Elementos '.image-column', '.dropzone-column' ou '.game-container' não encontrados!");
        return;
    }

    imageColumn.innerHTML = ''; // Limpa o conteúdo anterior
    dropzoneColumn.innerHTML = ''; // Limpa o conteúdo anterior

    items.forEach((item, index) => {
        // Criação da imagem arrastável
        const draggable = document.createElement('img');
        draggable.src = item.imagePath;
        draggable.alt = `Imagem ${index + 1} para arrastar`;
        draggable.id = `draggable-${index + 1}`;
        draggable.classList.add('draggable');
        draggable.draggable = true;

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

    // Criação das dropzones
    items.forEach((item, index) => {
        const dropzone = document.createElement('div');
        dropzone.classList.add('dropzone');
        dropzone.id = `dropzone-${index + 1}`;
        dropzone.innerHTML = `<span class="dropzone-text">${item.dropzoneText}</span>`;

        // Adiciona eventos à dropzone
        addDropzoneEvents(dropzone);
        dropzoneColumn.appendChild(dropzone);
    });

    // Ajusta a altura da game-container após a renderização
    adjustGameContainerHeight();

    // Permite arrastar para qualquer lugar da área do jogo
    gameContainer.addEventListener('dragover', (event) => {
        event.preventDefault();
    });

    gameContainer.addEventListener('drop', (event) => {
        event.preventDefault();
        const draggedElementId = event.dataTransfer.getData('text');
        const draggedElement = document.getElementById(draggedElementId);

        const containerRect = gameContainer.getBoundingClientRect();
        const dropX = event.clientX - containerRect.left;
        const dropY = event.clientY - containerRect.top;

        // Remove a imagem da dropzone, se estiver em uma
        if (draggedElement.parentElement.classList.contains('dropzone')) {
            const previousDropzone = draggedElement.parentElement;
            previousDropzone.removeChild(draggedElement);
        }

        // Garante que a imagem permaneça dentro dos limites da game-container
        const maxX = gameContainer.clientWidth - draggedElement.offsetWidth;
        const maxY = gameContainer.clientHeight - draggedElement.offsetHeight;

        const posX = Math.max(0, Math.min(dropX - draggedElement.offsetWidth / 2, maxX));
        const posY = Math.max(0, Math.min(dropY - draggedElement.offsetHeight / 2, maxY));

        // Restaura o tamanho original da imagem ao sair de uma dropzone
        draggedElement.style.width = '100px'; // Tamanho original fora das dropzones
        draggedElement.style.height = '100px';

        // Posiciona a imagem dentro da game-container
        draggedElement.style.position = 'absolute';
        draggedElement.style.left = `${posX}px`;
        draggedElement.style.top = `${posY}px`;

        gameContainer.appendChild(draggedElement);
    });
}

function addDropzoneEvents(dropzone) {
    // Evento de arrastar sobre a dropzone
    dropzone.addEventListener('dragover', (event) => {
        event.preventDefault();
        dropzone.classList.add('hovered');
    });

    // Evento de sair da dropzone
    dropzone.addEventListener('dragleave', () => {
        dropzone.classList.remove('hovered');
    });

    // Evento de soltar na dropzone
    dropzone.addEventListener('drop', (event) => {
        event.preventDefault();
        dropzone.classList.remove('hovered');

        const draggedElementId = event.dataTransfer.getData('text');
        const draggedElement = document.getElementById(draggedElementId);
        const currentElementInDropzone = dropzone.querySelector('img');

        // Se já houver uma imagem, troque de posição
        if (currentElementInDropzone) {
            dropzone.appendChild(draggedElement);

            // Centraliza e ajusta o tamanho da imagem na dropzone
            draggedElement.style.position = 'absolute';
            draggedElement.style.left = '50%';
            draggedElement.style.top = '50%';
            draggedElement.style.transform = 'translate(-50%, -50%)';
            draggedElement.style.width = '120px'; // Mesmo tamanho da dropzone
            draggedElement.style.height = '120px'; // Mesmo tamanho da dropzone

            // Posiciona a imagem removida fora da dropzone, mas dentro da game-container
            const gameContainer = document.querySelector('.game-container');
            const containerRect = gameContainer.getBoundingClientRect();
            const dropzoneRect = dropzone.getBoundingClientRect();

            const newX = dropzoneRect.right - containerRect.left + 10;
            const newY = dropzoneRect.top - containerRect.top;

            // Garante que a imagem removida permaneça dentro dos limites da game-container
            const maxX = gameContainer.clientWidth - currentElementInDropzone.offsetWidth;
            const maxY = gameContainer.clientHeight - currentElementInDropzone.offsetHeight;

            const finalX = Math.max(0, Math.min(newX, maxX));
            const finalY = Math.max(0, Math.min(newY, maxY));

            currentElementInDropzone.style.position = 'absolute';
            currentElementInDropzone.style.left = `${finalX}px`;
            currentElementInDropzone.style.top = `${finalY}px`;
            currentElementInDropzone.style.width = '100px'; // Volta ao tamanho original fora das dropzones
            currentElementInDropzone.style.height = '100px';
            gameContainer.appendChild(currentElementInDropzone);
        } else {
            // Adiciona o elemento arrastado à dropzone e ajusta o tamanho
            dropzone.appendChild(draggedElement);
            draggedElement.style.position = 'absolute';
            draggedElement.style.left = '50%';
            draggedElement.style.top = '50%';
            draggedElement.style.transform = 'translate(-50%, -50%)';
            draggedElement.style.width = '120px'; // Mesmo tamanho da dropzone
            draggedElement.style.height = '120px'; // Mesmo tamanho da dropzone
        }
    });
}

// Ajusta a altura da game-container com base na altura da coluna de dropzones
function adjustGameContainerHeight() {
    const dropzoneColumn = document.querySelector('.dropzone-column');
    const gameContainer = document.querySelector('.game-container');

    if (dropzoneColumn && gameContainer) {
        const dropzoneColumnHeight = dropzoneColumn.scrollHeight;
        const newHeight = dropzoneColumnHeight * 1.3; // Aumenta a altura da game-container em 30% para dar mais espaço
        gameContainer.style.height = `${newHeight}px`;
    }
}

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    createDragAndDrop(items);
});
