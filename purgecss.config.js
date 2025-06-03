module.exports = {
  content: [
    './*.html',
    './*.js',
    // Add any other file types that might contain CSS classes
  ],
  css: ['./style.css'],
  output: './style-purged.css',
  
  // Safelist important selectors that might not be detected
  safelist: [
    // Keep all base HTML elements
    'html', 'body', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'p', 'a', 'ul', 'li', 'div', 'span', 'button', 'input', 'textarea', 'select',
    
    // Keep pseudo-classes and states
    /hover/, /focus/, /active/, /disabled/, /checked/,
    
    // Keep animation keyframes
    /keyframes/, /from/, /to/, /\d+%/,
    
    // Keep webkit scrollbar styles
    /webkit-scrollbar/,
    
    // Keep any classes that might be added dynamically
    'user-message', 'chatbot-message', 'assistant-message',
    'recipe-card', 'video-card', 'error-message',
    'messages__item', 'messages__item--visitor', 'messages__item--operator',
    
    // Keep utility classes
    'container', 'main-content', 'loading-indicator',
    
    // Keep responsive and media query related classes
    /\@media/, /\@screen/,
    
    // Keep any classes with special characters that might be missed
    /chatbox/, /nav-/, /food-/, /nutrition-/, /recipe-/, /video-/,
    
    // Keep form and interaction states
    'required', 'form-group', 'button-container',
    
    // Keep layout classes
    'two-sections', 'left-section', 'right-section',
    
    // Keep animation and transition classes
    /fadeIn/, /slideUp/, /gradientMove/, /pulse/
  ],
  
  // Additional options
  defaultExtractor: content => {
    // Custom extractor to find class names in JavaScript
    const matches = content.match(/[A-Za-z0-9-_:/]+/g) || [];
    return matches;
  },
  
  // Whitelist patterns for dynamically generated classes
  whitelistPatterns: [
    /^nav-/,
    /^chat/,
    /^food-/,
    /^recipe-/,
    /^video-/,
    /^nutrition-/,
    /^form-/,
    /^tab-/,
    /-item$/,
    /-button$/,
    /-container$/,
    /-content$/,
    /-header$/,
    /-footer$/
  ]
}; 