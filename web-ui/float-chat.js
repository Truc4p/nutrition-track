// Floating Chat Interface Functionality
// State management for floating chat
let isChatOpen = false;
let floatChatInstance = null;

// Function to load the chat interface from external HTML file
async function loadChatInterface() {
    console.log('Float-chat: Loading chat interface...');
    try {
        const response = await fetch('float-chat.html');
        if (!response.ok) {
            throw new Error(`Failed to load chat interface: ${response.status}`);
        }
        const html = await response.text();
        const chatPlaceholder = document.getElementById('float-chat-placeholder');
        if (chatPlaceholder) {
            console.log('Float-chat: Chat placeholder found, initializing...');
            chatPlaceholder.innerHTML = html;
            initializeChatInterface();
            initializeFloatChatStateManagement();
            console.log('Float-chat: Initialization complete');
        } else {
            console.error('Chat placeholder not found in the document');
        }
    } catch (error) {
        console.error('Error loading chat interface:', error);
    }
}

// Initialize state management for floating chat
function initializeFloatChatStateManagement() {
    // Listen for the clearPageInputs event
    window.addEventListener('clearPageInputs', () => {
        clearFloatChatState();
    });

    // Add clear chat button functionality
    const clearChatButton = document.getElementById('clear-chat-button');
    if (clearChatButton) {
        clearChatButton.addEventListener('click', (e) => {
            e.preventDefault();
            if (confirm('Are you sure you want to clear this chat history?')) {
                // Use the shared ChatbotService to clear all messages
                if (window.ChatbotService) {
                    window.ChatbotService.clearMessages();
                }
            }
        });
    }
}

// Function to get current chat input value
function getChatInputValue() {
    const chatInput = document.getElementById('chat-input');
    return chatInput ? chatInput.value : '';
}

// Function to initialize the chat interface after it's loaded
function initializeChatInterface() {
    // Chat elements for floating chat
    const chatSupport = document.querySelector('.chatbox__support');
    const chatButton = document.querySelector('.chatbox__button button');
    const chatInput = document.getElementById('chat-input');
    const sendButton = document.querySelector('.chatbox__send--footer');
    const chatMessages = document.getElementById('chat-messages');

    // Create float chat instance and register with ChatbotService
    floatChatInstance = {
        chatMessages: chatMessages,
        chatInput: chatInput,
        
        // Method to update message history when messages are added from other instances
        updateMessageHistory: function(messageObj) {
            if (this.chatMessages) {
                this.addMessageToUI(messageObj.sender, messageObj.message, messageObj.isUser);
            }
        },
        
        // Method to restore all messages
        restoreMessages: function(messages) {
            if (this.chatMessages) {
                this.chatMessages.innerHTML = '';
                messages.forEach(msg => {
                    this.addMessageToUI(msg.sender, msg.message, msg.isUser);
                });
            }
        },
        
        // Method to clear messages
        clearMessages: function() {
            if (this.chatMessages) {
                this.chatMessages.innerHTML = '';
            }
        },
        
        // Method to add message to UI
        addMessageToUI: function(sender, message, isUser) {
            const messageElement = document.createElement('div');
            messageElement.classList.add('messages__item');
            messageElement.classList.add(isUser ? 'messages__item--visitor' : 'messages__item--operator');
            messageElement.innerHTML = window.ChatbotService.formatResponse(message);
            this.chatMessages.appendChild(messageElement);
            this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
        }
    };

    // Register this instance with the ChatbotService
    if (window.ChatbotService) {
        window.ChatbotService.registerChatInstance(floatChatInstance);
    }

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
}

// Load the chat interface when the document is ready
document.addEventListener('DOMContentLoaded', loadChatInterface);

// Function to handle sending messages
async function handleSendMessage(input, messagesContainer) {
    const userMessage = input.value.trim();
    if (!userMessage) return;

    // Clear input field
    input.value = '';

    try {
        // Use the shared ChatbotService with history management
        // This will automatically add both user message and response to shared history
        // and update all chat instances
        await window.ChatbotService.sendMessageWithHistory(userMessage, 'You');
    } catch (error) {
        console.error('Float-chat: Error communicating with chatbot server:', error);
        // Error message is already added to history by sendMessageWithHistory
    }
}

// Function to append a message to the chat container (legacy support)
function appendMessage(sender, message, container) {
    // This is now handled by the ChatbotService and chat instances
    // Keep for backward compatibility but functionality is moved to chat instances
}

// Function to format the response with markdown-like syntax
function formatResponse(response) {
    // Use the shared ChatbotService for consistent formatting
    return window.ChatbotService.formatResponse(response);
}

// Global function to clear float chat state
function clearFloatChatState() {
    // Clear input
    const chatInput = document.getElementById('chat-input');
    if (chatInput) {
        chatInput.value = '';
    }
    
    // Close chat if open
    const chatSupport = document.querySelector('.chatbox__support');
    if (chatSupport) {
        chatSupport.classList.remove('chatbox--active');
    }
}

// Global function for backward compatibility
window.clearFloatChatState = function() {
    clearFloatChatState();
    // Use shared ChatbotService to clear messages
    if (window.ChatbotService) {
        window.ChatbotService.clearMessages();
    }
};
