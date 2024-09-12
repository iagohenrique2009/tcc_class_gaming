const draggable = document.getElementById('draggable');
const dropzone = document.getElementById('dropzone');

draggable.addEventListener('dragstart', (event) => {
    event.dataTransfer.setData('text/plain', event.target.id);
});

dropzone.addEventListener('dragover', (event) => {
    event.preventDefault();
    dropzone.classList.add('hovered');
});

dropzone.addEventListener('dragleave', () => {
    dropzone.classList.remove('hovered');
});

dropzone.addEventListener('drop', (event) => {
    event.preventDefault();
    const data = event.dataTransfer.getData('text');
    const element = document.getElementById(data);
    dropzone.appendChild(element);
    dropzone.classList.remove('hovered');
});
