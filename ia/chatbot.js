document.addEventListener('DOMContentLoaded', () => {

    const chatToggle = document.getElementById('chat-toggle');
    const chatPopup = document.getElementById('chat-popup');
    const chatClose = document.getElementById('chat-close');
    const chatBox = document.getElementById('chat-box');
    const chatInput = document.getElementById('chat-input');
    const sendBtn = document.getElementById('send-btn');

    let currentChatState = 'menu'; 
    let reservationData = {
        name: '',
        people: ''
    };
    let welcomeSent = false;

    chatToggle.addEventListener('click', () => {
        chatPopup.classList.add('open');
        chatToggle.classList.add('hidden');
        sendWelcomeMessage();
    });

    chatClose.addEventListener('click', () => {
        chatPopup.classList.remove('open');
        chatToggle.classList.remove('hidden');
        setTimeout(() => {
            currentChatState = 'menu';
            reservationData = { name: '', people: '' };
        }, 500);
    });

    sendBtn.addEventListener('click', handleUserMessage);
    chatInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleUserMessage();
        }
    });

    function handleUserMessage() {
        const userText = chatInput.value.trim();
        if (userText === '') return;

        appendMessage(userText, 'user');
        chatInput.value = '';

        setTimeout(() => {
            switch (currentChatState) {
                case 'menu':
                    handleMenuSelection(userText);
                    break;
                case 'reservation_awaiting_name':
                case 'reservation_awaiting_people':
                    handleReservationFlow(userText);
                    break;
                default:
                    showMenu(true);
            }
        }, 600);
    }

    function sendWelcomeMessage() {
        if (welcomeSent) return;

        appendMessage("Olá! 😊 Sou o assistente virtual do Tradição Mineira.", 'bot');
        setTimeout(() => appendMessage("Suas perguntas são processadas localmente — não coletamos nenhum dado pessoal.", 'bot'), 1200);
        setTimeout(() => showMenu(), 1800);
        welcomeSent = true;
    }

    function showMenu(isError = false) {
        let menuText = isError
            ? "Opção inválida. Por favor, digite apenas o número de uma das opções abaixo:\n\n"
            : "Como posso ajudar?\n\n";
        
        menuText += "1 - Fazer uma reserva\n";
        menuText += "2 - Saber o endereço\n";
        menuText += "3 - Sobre o cardápio\n";
        menuText += "4 - Contato (WhatsApp)";
        
        appendMessage(menuText, 'bot');
        currentChatState = 'menu';
    }

    function handleMenuSelection(input) {
        const choice = input.trim();
        switch(choice) {
            case '1':
                currentChatState = 'reservation_awaiting_name';
                appendMessage("Ótimo! Para iniciar sua reserva, qual é o seu nome?", 'bot');
                break;
            case '2':
                appendMessage(getBotResponse('endereço'), 'bot');
                setTimeout(showMenu, 1000);
                break;
            case '3':
                appendMessage(getBotResponse('cardápio'), 'bot');
                setTimeout(showMenu, 1000);
                break;
            case '4':
                appendMessage(getBotResponse('contato'), 'bot');
                setTimeout(showMenu, 1000);
                break;
            default:
                const keywordResponse = getBotResponse(input);
                if (keywordResponse) {
                    appendMessage(keywordResponse, 'bot');
                    setTimeout(showMenu, 1000);
                } else {
                    showMenu(true);
                }
        }
    }

    function handleReservationFlow(input) {
        if (currentChatState === 'reservation_awaiting_name') {
            reservationData.name = input;
            currentChatState = 'reservation_awaiting_people';
            appendMessage(`Obrigado, ${reservationData.name}. Para quantas pessoas é a reserva?`, 'bot');
        } 
        else if (currentChatState === 'reservation_awaiting_people') {
            const isNumeric = /^\d+$/.test(input);
            const isLengthOk = input.length > 0 && input.length <= 10;

            if (isNumeric && isLengthOk) {
                reservationData.people = input;
                const confirmationTime = getReservationTime();
                
                appendMessage(`Perfeito! Sua mesa para ${reservationData.people} pessoa(s) no nome de ${reservationData.name} está pré-reservada.\n\nIMPORTANTE: A reserva é válida até as ${confirmationTime}.`, 'bot');
                
                currentChatState = 'menu';
                reservationData = { name: '', people: '' };
                setTimeout(showMenu, 2000);
            } else {
                let errorMsg = "Por favor, insira um valor válido.\n";
                if (!isNumeric) errorMsg += "O valor deve conter apenas números.\n";
                if (!isLengthOk) errorMsg += "O valor deve ter entre 1 e 10 caracteres.\n";
                appendMessage(errorMsg + "Para quantas pessoas é a reserva?", 'bot');
            }
        }
    }

    function getBotResponse(userInput) {
        const text = userInput.toLowerCase();

        if (text === 'endereço' || text === '2') {
            return "Estamos na Rod. Dionísio Bortoloto, 120 – Jardim Santa Cecília, Santa Cruz das Palmeiras.";
        }
        if (text === 'cardápio' || text === '3') {
            const cardapioHtml = `
                Aqui está nosso cardápio! 😋
                <br>
                <img src="ia/img/cardapio.jpg" alt="Cardápio do Dia - Tradição Mineira" class="chat-image">
            `;
            return cardapioHtml;
        }
        if (text === 'contato' || text === '4') {
            return "Clique aqui para falar conosco pelo WhatsApp: https://wa.me/5519991931407";
        }

        if (text.includes('horário') || text.includes('abre') || text.includes('fecha')) {
            return "Nosso horário é: \nTerça a Sexta: 10:30h às 14h \nSábado e Domingo: 10:30h às 14:30h.";
        }
        if (text.includes('reserva')) {
            return "Você pode fazer uma reserva escolhendo a opção '1' do menu ou pelo nosso WhatsApp: (19) 991931407.";
        }
        if (text.includes('olá') || text.includes('oi') || text.includes('bom dia')) {
            return "Olá! Como posso te ajudar?";
        }
        if (text.includes('obrigado') || text.includes('valeu')) {
            return "Eu que agradeço o contato! 😊";
        }

        return null; 
    }

    function appendMessage(text, sender) {
        const msgDiv = document.createElement('div');
        msgDiv.classList.add('chat-msg', `msg-${sender}`);
        msgDiv.innerHTML = text.replace(
            /(https?:\/\/[^\s]+)/g,
            '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>'
        ).replace(/\n/g, '<br>');
        
        chatBox.appendChild(msgDiv);
        chatBox.scrollTop = chatBox.scrollHeight;
    }

    function getReservationTime() {
        const now = new Date();
        now.setHours(now.getHours() + 2);
        
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        
        return `${hours}:${minutes}`;
    }

});
