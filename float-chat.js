// Floating Chat Interface Functionality
const GEMINI_API_URL = "http://127.0.0.1:5000/ai/chat/";

// Function to load the chat interface from external HTML file
async function loadChatInterface() {
    try {
        const response = await fetch('float-chat.html');
        if (!response.ok) {
            throw new Error(`Failed to load chat interface: ${response.status}`);
        }
        const html = await response.text();
        const chatPlaceholder = document.getElementById('float-chat-placeholder');
        if (chatPlaceholder) {
            chatPlaceholder.innerHTML = html;
            initializeChatInterface();
        } else {
            console.error('Chat placeholder not found in the document');
        }
    } catch (error) {
        console.error('Error loading chat interface:', error);
    }
}

// Function to initialize the chat interface after it's loaded
function initializeChatInterface() {
    // Chat elements for floating chat
    const chatSupport = document.querySelector('.chatbox__support');
    const chatButton = document.querySelector('.chatbox__button button');
    const chatInput = document.getElementById('chat-input');
    const sendButton = document.querySelector('.chatbox__send--footer');
    const chatMessages = document.getElementById('chat-messages');

    // Chat elements for fixed chat
    const chatInputFixed = document.getElementById('chat-input-fixed');
    const sendButtonFixed = document.getElementById('send-button-fixed');
    const chatMessagesFixed = document.getElementById('chat-messages-fixed');

    // Toggle chat functionality
    if (chatButton) {
        chatButton.addEventListener('click', () => {
            chatSupport.classList.toggle('chatbox--active');
        });
    }

    // Chat message handling for floating chat
    if (sendButton && chatInput) {
        sendButton.addEventListener('click', () => handleSendMessage(chatInput, chatMessages));
        chatInput.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                handleSendMessage(chatInput, chatMessages);
            }
        });
    }

    // Chat message handling for fixed chat
    if (sendButtonFixed && chatInputFixed) {
        sendButtonFixed.addEventListener('click', () => handleSendMessage(chatInputFixed, chatMessagesFixed));
        chatInputFixed.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                handleSendMessage(chatInputFixed, chatMessagesFixed);
            }
        });
    }
}

// Load the chat interface when the document is ready
document.addEventListener('DOMContentLoaded', loadChatInterface);

// Function to handle sending messages
async function handleSendMessage(input, messagesContainer) {
    const userMessage = input.value.trim();
    if (!userMessage) return;

    // Display user message
    appendMessage('You', userMessage, messagesContainer);

    // Clear input field
    input.value = '';

    try {
        // Send user message to the chatbot server
        const response = await fetch(GEMINI_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userMessage }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // Display chatbot response
        appendMessage('Nutrition Assistant', data.recommendation || 'No response received.', messagesContainer);
    } catch (error) {
        console.error('Error communicating with chatbot server:', error);
        appendMessage('Nutrition Assistant', 'Sorry, I could not process your request. Please try again later.', messagesContainer);
    }
}

// Function to append a message to the chat container
function appendMessage(sender, message, container) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('messages__item');
    messageElement.classList.add(sender === 'You' ? 'messages__item--operator' : 'messages__item--visitor');
    messageElement.innerHTML = formatResponse(message);
    container.appendChild(messageElement);
    container.scrollTop = container.scrollHeight;
}

// Function to format the response with markdown-like syntax
function formatResponse(response) {
    // Replace ** with bold
    let formattedResponse = response.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Replace * with italic
    formattedResponse = formattedResponse.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    // Replace newlines with <br>
    formattedResponse = formattedResponse.replace(/\n/g, '<br>');
    
    // Replace bullet points
    formattedResponse = formattedResponse.replace(/- (.*?)(?:<br>|$)/g, '<li>$1</li>');
    
    // Wrap lists in <ul> tags if there are list items
    if (formattedResponse.includes('<li>')) {
        formattedResponse = '<ul>' + formattedResponse + '</ul>';
        // Clean up any breaks inside lists
        formattedResponse = formattedResponse.replace(/<br><li>/g, '<li>');
        formattedResponse = formattedResponse.replace(/<\/li><br>/g, '</li>');
    }
    
    return formattedResponse;
}
