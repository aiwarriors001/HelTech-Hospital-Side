document.addEventListener('DOMContentLoaded', () => {
    const chatInput = document.getElementById('chat-input');
    const sendBtn = document.getElementById('send-chat');
    const chatHistory = document.getElementById('chat-history');

    function sendMessage() {
        const text = chatInput.value.trim();
        if (!text) return;

        // User Message
        const userDiv = document.createElement('div');
        userDiv.className = 'message user';
        userDiv.innerText = text;
        chatHistory.appendChild(userDiv);
        chatInput.value = '';

        // Auto Scroll
        chatHistory.scrollTop = chatHistory.scrollHeight;

        // Bot Response (Mock)
        setTimeout(() => {
            const botDiv = document.createElement('div');
            botDiv.className = 'message bot';
            botDiv.innerText = "I understand. Based on your inputs, I recommend consulting the 'Prescription Intelligence' tab for detailed analysis, or booking an appointment if symptoms persist.";
            chatHistory.appendChild(botDiv);
            chatHistory.scrollTop = chatHistory.scrollHeight;
        }, 1000);
    }

    if (sendBtn) {
        sendBtn.addEventListener('click', sendMessage);
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') sendMessage();
        });
    }
});
