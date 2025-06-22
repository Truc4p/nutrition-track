class ChatUI {
    constructor() {
        this.chatInput = document.getElementById('chat-input');
        this.sendButton = document.getElementById('send-button');
        this.chatMessages = document.getElementById('chat-messages');
        this.quickPrompts = document.querySelectorAll('.prompt-button');

        this.isProcessing = false;

        this.initializeEventListeners();
        this.initializeStateManagement();
        this.registerWithChatbotService();
    }

    registerWithChatbotService() {
        // Register this chat instance with the ChatbotService for shared history
        if (window.ChatbotService) {
            const chatInstance = {
                chatMessages: this.chatMessages,
                chatInput: this.chatInput,
                
                // Method to update message history when messages are added from other instances
                updateMessageHistory: (messageObj) => {
                    this.addMessageToUI(messageObj.message, messageObj.isUser, false); // false = no animation for history restore
                },
                
                // Method to restore all messages
                restoreMessages: (messages) => {
                    this.chatMessages.innerHTML = '';
                    messages.forEach(msg => {
                        this.addMessageToUI(msg.message, msg.isUser, false); // false = no animation for history restore
                    });
                },
                
                // Method to clear messages
                clearMessages: () => {
                    this.chatMessages.innerHTML = '';
                }
            };
            
            window.ChatbotService.registerChatInstance(chatInstance);
        }
    }

    initializeStateManagement() {
        // Listen for the clearPageInputs event to clear input fields when state is cleared
        window.addEventListener('clearPageInputs', () => {
            if (this.chatInput) {
                this.chatInput.value = '';
                this.autoResizeTextarea();
            }
            // Clear messages using ChatbotService
            if (window.ChatbotService) {
                window.ChatbotService.clearMessages();
            }
        });
    }



    initializeEventListeners() {
        this.sendButton.addEventListener('click', () => this.handleSend());
        this.chatInput.addEventListener('keypress', (e) => this.handleKeyPress(e));
        this.chatInput.addEventListener('input', () => this.autoResizeTextarea());

        // Add event listeners for quick prompts
        this.quickPrompts.forEach(button => {
            button.addEventListener('click', () => this.handleQuickPrompt(button.textContent));
        });

        // Add clear chat button functionality
        const clearChatButton = document.getElementById('clear-chat-button-main');
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

    handleKeyPress(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            this.handleSend();
        }
    }

    autoResizeTextarea() {
        this.chatInput.style.height = 'auto';
        const newHeight = Math.min(this.chatInput.scrollHeight, 150); // Max height of 150px
        this.chatInput.style.height = newHeight + 'px';
    }

    handleQuickPrompt(promptText) {
        this.chatInput.value = promptText;
        this.autoResizeTextarea();
        this.handleSend();
    }

    addMessage(message, isUser) {
        // Add to UI only (history is now managed by ChatbotService)
        this.addMessageToUI(message, isUser, true);
    }

    addMessageToUI(message, isUser, withAnimation = true) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${isUser ? 'user-message' : 'assistant-message'}`;
        
        // Convert URLs to clickable links and preserve line breaks
        const formattedMessage = this.formatMessage(message);
        messageDiv.innerHTML = formattedMessage;
        
        this.chatMessages.appendChild(messageDiv);
        this.scrollToBottom();

        // Add animation class only for new messages
        if (withAnimation) {
        requestAnimationFrame(() => {
            messageDiv.style.opacity = '0';
            messageDiv.style.transform = 'translateY(20px)';
            requestAnimationFrame(() => {
                messageDiv.style.transition = 'all 0.3s ease';
                messageDiv.style.opacity = '1';
                messageDiv.style.transform = 'translateY(0)';
            });
        });
        }
    }

    formatMessage(message) {
        // Use the shared ChatbotService for consistent formatting
        return window.ChatbotService.formatResponse(message);
    }

    scrollToBottom() {
        const lastMessage = this.chatMessages.lastElementChild;
        if (lastMessage) {
            lastMessage.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }
    }

    setLoading(isLoading) {
        this.isProcessing = isLoading;
        this.sendButton.disabled = isLoading;
        this.chatInput.disabled = isLoading;
        


        // Disable quick prompts while processing
        this.quickPrompts.forEach(button => {
            button.disabled = isLoading;
            button.style.opacity = isLoading ? '0.5' : '1';
            button.style.cursor = isLoading ? 'not-allowed' : 'pointer';
        });
    }

    async handleSend() {
        const message = this.chatInput.value.trim();
        if (!message || this.isProcessing) return;

        try {
            this.chatInput.value = '';
            this.autoResizeTextarea();
            this.setLoading(true);

            // Use the shared ChatbotService with history management
            // This will automatically add both user message and response to shared history
            // and update all chat instances
            await window.ChatbotService.sendMessageWithHistory(message, 'You');

        } catch (error) {
            console.error('Error sending message:', error);
            // Error message is already added to history by sendMessageWithHistory
        } finally {
            this.setLoading(false);
        }
    }

    async sendMessageToBackend(userMessage) {
        // Use the shared ChatbotService
        return await window.ChatbotService.sendMessage(userMessage);
    }
}

// Initialize chat when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const chat = new ChatUI();
}); 