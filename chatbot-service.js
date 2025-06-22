// Shared Chatbot Service
class ChatbotService {
    constructor() {
        // Use current host IP instead of hardcoded localhost
        const currentHost = window.location.hostname;
        this.GEMINI_API_URL = `http://${currentHost}:3000/ai/chat/`;
        
        // Shared message history across all chat interfaces
        this.messages = [];
        this.chatInstances = new Set(); // Track all chat instances
        this.loadMessages();
    }

    // Send message to the backend and get response
    async sendMessage(userMessage) {
        try {
            console.log('ChatbotService: Sending message to:', this.GEMINI_API_URL);
            
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
            console.error('ChatbotService: Error communicating with chatbot server:', error);
            throw new Error('Failed to get response from the server. Please try again later.');
        }
    }

    // Format response with markdown-like syntax (unified formatting)
    formatResponse(response) {
        if (!response) return '';
        
        // Convert URLs to clickable links
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        let formattedResponse = response.replace(urlRegex, url => `<a href="${url}" target="_blank">${url}</a>`);
        
        // Format markdown-style text
        formattedResponse = formattedResponse
            // Headers
            .replace(/#{3}(.*?)(?:\n|$)/g, '<h3>$1</h3>') // h3
            .replace(/#{2}(.*?)(?:\n|$)/g, '<h2>$1</h2>') // h2
            .replace(/#{1}(.*?)(?:\n|$)/g, '<h1>$1</h1>') // h1
            
            // Text formatting
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold
            .replace(/\*(.*?)\*/g, '<em>$1</em>') // Italic
            .replace(/`(.*?)`/g, '<code>$1</code>') // Inline code
            .replace(/~~(.*?)~~/g, '<del>$1</del>') // Strikethrough
            
            // Lists - handle bullet points
            .replace(/^\s*[-*+]\s+(.*?)(?:\n|$)/gm, '<li>$1</li>') // Unordered list items
            .replace(/^\s*\d+\.\s+(.*?)(?:\n|$)/gm, '<li>$1</li>'); // Ordered list items
        
        // Wrap consecutive list items in ul tags
        if (formattedResponse.includes('<li>')) {
            formattedResponse = formattedResponse.replace(/(<li>.*?<\/li>)/gs, (match) => {
                if (!match.includes('<ul>')) {
                    return '<ul>' + match + '</ul>';
                }
                return match;
            });
            // Clean up any breaks inside lists
            formattedResponse = formattedResponse.replace(/<br><li>/g, '<li>');
            formattedResponse = formattedResponse.replace(/<\/li><br>/g, '</li>');
        }
        
        // Only convert line breaks to <br> if the message doesn't contain HTML block elements
        if (!formattedResponse.includes('<ul>') && !formattedResponse.includes('<ol>') && 
            !formattedResponse.includes('<div>') && !formattedResponse.includes('<p>')) {
            formattedResponse = formattedResponse.replace(/\n/g, '<br>');
        }
        
        return formattedResponse;
    }

    // Get error message for failed requests
    getErrorMessage() {
        return 'Sorry, I could not process your request. Please try again later.';
    }

    // Register a chat instance (UI component that displays messages)
    registerChatInstance(instance) {
        this.chatInstances.add(instance);
        // Restore messages in this instance
        this.restoreMessagesInInstance(instance);
    }

    // Unregister a chat instance
    unregisterChatInstance(instance) {
        this.chatInstances.delete(instance);
    }

    // Add a message to shared history and update all instances
    addMessage(sender, message, isUser = false) {
        const messageObj = {
            sender: sender,
            message: message,
            isUser: isUser,
            timestamp: new Date().toISOString()
        };
        
        this.messages.push(messageObj);
        this.saveMessages();
        
        // Update all registered chat instances
        this.chatInstances.forEach(instance => {
            if (instance.updateMessageHistory) {
                instance.updateMessageHistory(messageObj);
            }
        });
    }

    // Get all messages
    getMessages() {
        return this.messages;
    }

    // Clear all messages
    clearMessages() {
        this.messages = [];
        this.saveMessages();
        
        // Clear messages in all instances
        this.chatInstances.forEach(instance => {
            if (instance.clearMessages) {
                instance.clearMessages();
            }
        });
    }

    // Save messages to localStorage
    saveMessages() {
        try {
            localStorage.setItem('chatbot-messages', JSON.stringify(this.messages));
        } catch (error) {
            console.error('ChatbotService: Error saving messages:', error);
        }
    }

    // Load messages from localStorage
    loadMessages() {
        try {
            const savedMessages = localStorage.getItem('chatbot-messages');
            if (savedMessages) {
                this.messages = JSON.parse(savedMessages);
            } else {
                // Initialize with welcome message if no saved messages
                this.messages = [{
                    sender: 'Nutrition Assistant',
                    message: `Hello! I'm your Nutrition Assistant. I can help you with:
                        <ul>
                            <li>Nutritional information about foods</li>
                            <li>Dietary recommendations</li>
                            <li>Meal planning advice</li>
                            <li>Health and wellness tips</li>
                        </ul>
                        How can I assist you today?`,
                    isUser: false,
                    timestamp: new Date().toISOString()
                }];
                this.saveMessages();
            }
        } catch (error) {
            console.error('ChatbotService: Error loading messages:', error);
            this.messages = [];
        }
    }

    // Restore messages in a specific chat instance
    restoreMessagesInInstance(instance) {
        if (instance.restoreMessages) {
            instance.restoreMessages(this.messages);
        }
    }

    // Send message and add to shared history
    async sendMessageWithHistory(userMessage, senderName = 'You') {
        // Add user message to history
        this.addMessage(senderName, userMessage, true);
        
        try {
            // Get response from backend
            const response = await this.sendMessage(userMessage);
            
            // Add assistant response to history
            this.addMessage('Nutrition Assistant', response, false);
            
            return response;
        } catch (error) {
            // Add error message to history
            const errorMsg = this.getErrorMessage();
            this.addMessage('Nutrition Assistant', errorMsg, false);
            throw error;
        }
    }
}

// Create a global instance of the chatbot service
window.ChatbotService = new ChatbotService(); 