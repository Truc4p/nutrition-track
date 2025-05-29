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
            });
        })
        .catch(error => console.error('Error loading navbar:', error));
}); 