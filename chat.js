class ChatUI {
    constructor() {
        this.chatInput = document.getElementById('chat-input');
        this.sendButton = document.getElementById('send-button');
        this.chatMessages = document.getElementById('chat-messages');
        this.quickPrompts = document.querySelectorAll('.prompt-button');

        this.isProcessing = false;
        this.GEMINI_API_URL = "http://127.0.0.1:5000/ai/chat/";
        this.messages = []; // Store messages for state persistence

        this.initializeEventListeners();
        this.initializeStateManagement();
    }

    initializeStateManagement() {
        // State management event listeners
        window.addEventListener('savePageState', (event) => {
            if (event.detail.pageKey === 'chat') {
                const state = {
                    messages: this.messages,
                    chatInput: this.chatInput ? this.chatInput.value : ''
                };
                event.detail.saveState('chat', state);
            }
        });

        window.addEventListener('loadPageState', (event) => {
            if (event.detail.pageKey === 'chat') {
                const state = event.detail.loadState('chat');
                if (state) {
                    // Restore messages
                    if (state.messages) {
                        this.messages = state.messages;
                        this.restoreMessages();
                    }
                    
                    // Restore input
                    if (this.chatInput && state.chatInput) {
                        this.chatInput.value = state.chatInput;
                        this.autoResizeTextarea();
                    }
                }
            }
        });
        
        // Listen for the clearPageInputs event to clear input fields when state is cleared
        window.addEventListener('clearPageInputs', () => {
            if (this.chatInput) {
                this.chatInput.value = '';
                this.autoResizeTextarea();
            }
            this.messages = [];
            if (this.chatMessages) {
                this.chatMessages.innerHTML = '';
            }
        });
    }

    restoreMessages() {
        // Clear current messages and restore from state
        this.chatMessages.innerHTML = '';
        this.messages.forEach(message => {
            this.addMessageToUI(message.text, message.isUser, false); // false = don't store again
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
        // Store message in state
        this.messages.push({ text: message, isUser: isUser });
        
        // Add to UI
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
        if (!message) return '';
        
        // Convert URLs to clickable links
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        let formattedMessage = message.replace(urlRegex, url => `<a href="${url}" target="_blank">${url}</a>`);
        
        // Format markdown-style text
        formattedMessage = formattedMessage
            // Headers
            .replace(/#{3}(.*?)(?:\n|$)/g, '<h3>$1</h3>') // h3
            .replace(/#{2}(.*?)(?:\n|$)/g, '<h2>$1</h2>') // h2
            .replace(/#{1}(.*?)(?:\n|$)/g, '<h1>$1</h1>') // h1
            
            // Text formatting
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold
            .replace(/\*(.*?)\*/g, '<em>$1</em>') // Italic
            .replace(/`(.*?)`/g, '<code>$1</code>') // Inline code
            .replace(/~~(.*?)~~/g, '<del>$1</del>') // Strikethrough
            
            // Lists
            .replace(/^\s*[-*+]\s+(.*?)(?:\n|$)/gm, '<li>$1</li>') // Unordered list items
            .replace(/^\s*\d+\.\s+(.*?)(?:\n|$)/gm, '<li>$1</li>') // Ordered list items
            .replace(/(<li>.*?<\/li>)\n?/gs, '<ul>$1</ul>') // Wrap list items in ul
            
            // Line breaks
            .replace(/\n/g, '<br>');
        
        return formattedMessage;
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
            this.addMessage(message, true);
            this.chatInput.value = '';
            this.autoResizeTextarea();
            this.setLoading(true);

            const response = await this.sendMessageToBackend(message);
            this.addMessage(response, false);

        } catch (error) {
            console.error('Error sending message:', error);
            this.addMessage('Sorry, there was an error processing your message. Please try again.', false);
        } finally {
            this.setLoading(false);
        }
    }

    async sendMessageToBackend(userMessage) {
        try {
            const response = await fetch(this.GEMINI_API_URL, {
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
            return data.recommendation || 'No response received.';

        } catch (error) {
            console.error('Error communicating with chatbot server:', error);
            throw new Error('Failed to get response from the server. Please try again later.');
        }
    }
}

// Initialize chat when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const chat = new ChatUI();
}); 