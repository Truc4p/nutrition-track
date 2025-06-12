// State management utilities
const StateManager = {
    // Save state for a specific page
    savePageState(pageKey, state) {
        try {
            localStorage.setItem(`app_state_${pageKey}`, JSON.stringify(state));
        } catch (error) {
            console.warn('Failed to save page state:', error);
        }
    },

    // Load state for a specific page
    loadPageState(pageKey) {
        try {
            const saved = localStorage.getItem(`app_state_${pageKey}`);
            return saved ? JSON.parse(saved) : null;
        } catch (error) {
            console.warn('Failed to load page state:', error);
            return null;
        }
    },

    // Clear state for a specific page
    clearPageState(pageKey) {
        try {
            localStorage.removeItem(`app_state_${pageKey}`);
        } catch (error) {
            console.warn('Failed to clear page state:', error);
        }
    },

    // Clear all app states
    clearAllStates() {
        try {
            const keys = Object.keys(localStorage);
            keys.forEach(key => {
                if (key.startsWith('app_state_') || key === 'float-chat-global') {
                    localStorage.removeItem(key);
                }
            });
        } catch (error) {
            console.warn('Failed to clear all states:', error);
        }
    }
};

// Make StateManager available globally
window.StateManager = StateManager;

// Save current page state before navigation
function saveCurrentPageState() {
    const currentPage = window.location.pathname.split('/').pop() || 'home.html';
    const pageKey = currentPage.replace('.html', '');
    
    // Dispatch a custom event that each page can listen to for saving state
    window.dispatchEvent(new CustomEvent('savePageState', { 
        detail: { pageKey, saveState: StateManager.savePageState } 
    }));
}

// Load state when page loads
function loadCurrentPageState() {
    const currentPage = window.location.pathname.split('/').pop() || 'home.html';
    const pageKey = currentPage.replace('.html', '');
    
    // Dispatch a custom event that each page can listen to for loading state
    window.dispatchEvent(new CustomEvent('loadPageState', { 
        detail: { pageKey, loadState: StateManager.loadPageState } 
    }));
}

document.addEventListener('DOMContentLoaded', function() {
    // Get the current page filename
    const currentPage = window.location.pathname.split('/').pop() || 'home.html';
    
    // Load the navbar content
    fetch('nav-bar.html')
        .then(response => response.text())
        .then(data => {
            // Insert the navbar HTML
            document.getElementById('nav-placeholder').innerHTML = data;
            
            // Add active class to current page link
            const navLinks = document.querySelectorAll('.nav-links a');
            navLinks.forEach(link => {
                if (link.getAttribute('href') === currentPage) {
                    link.classList.add('active');
                }

                // Add click event listener to save state before navigation
                link.addEventListener('click', function(e) {
                    // Don't prevent default navigation, but save state first
                    saveCurrentPageState();
                });
            });

            // Add clear state button functionality
            const clearStateBtn = document.getElementById('clear-state-btn');
            if (clearStateBtn) {
                clearStateBtn.addEventListener('click', function(e) {
                    e.preventDefault();
                    if (confirm('Are you sure you want to clear all saved data? This action cannot be undone.')) {
                        StateManager.clearAllStates();
                        
                        // Also clear floating chat state if available
                        if (window.clearFloatChatState) {
                            window.clearFloatChatState();
                        }
                        
                        alert('All saved data has been cleared. The page will now reload.');
                        window.location.reload();
                    }
                });
            }

            // Load state for current page after navbar is loaded
            setTimeout(loadCurrentPageState, 100);
        })
        .catch(error => console.error('Error loading navbar:', error));

    // Save state when the page is about to unload
    window.addEventListener('beforeunload', saveCurrentPageState);
}); 