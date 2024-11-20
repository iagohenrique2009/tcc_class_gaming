document.getElementById('feedbackForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const message = document.getElementById('message').value;

    // Enviando os dados para o servidor (precisa de um backend configurado)
    const response = await fetch('http://localhost:3000/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message })
    });

    if (response.ok) {
        document.getElementById('feedbackMessage').innerText = 'Mensagem enviada com sucesso!';
    } else {
        document.getElementById('feedbackMessage').innerText = 'Erro ao enviar a mensagem. Tente novamente mais tarde.';
    }
});
