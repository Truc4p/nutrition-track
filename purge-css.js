const { PurgeCSS } = require('purgecss');
const fs = require('fs');
const path = require('path');

async function purgeCSSFiles() {
  try {
    console.log('🧹 Starting CSS purging process...');
    
    // Get original file size
    const originalStats = fs.statSync('style.css');
    const originalSize = (originalStats.size / 1024).toFixed(2);
    
    console.log(`📄 Original CSS file size: ${originalSize} KB`);
    
    const purgeCSSResult = await new PurgeCSS().purge({
      content: [
        './*.html',
        './*.js'
      ],
      css: ['./style.css'],
      
      // Safelist important selectors
      safelist: [
        // Base HTML elements
        'html', 'body', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'p', 'a', 'ul', 'li', 'div', 'span', 'button', 'input', 'textarea', 'select',
        
        // Important dynamic classes
        'user-message', 'chatbot-message', 'assistant-message',
        'recipe-card', 'video-card', 'error-message',
        'messages__item', 'messages__item--visitor', 'messages__item--operator',
        
        // Layout and utility classes
        'container', 'main-content', 'loading-indicator', 'no-print',
        'two-sections', 'left-section', 'right-section',
        'form-group', 'button-container', 'required',
        
        // Animation classes
        'fadeIn', 'slideUp', 'gradientMove', 'pulse',
        
        // Regex patterns for pseudo-classes and dynamic content
        /hover/, /focus/, /active/, /disabled/, /checked/,
        /keyframes/, /from/, /to/, /\d+%/,
        /webkit-scrollbar/,
        /chatbox/, /nav-/, /food-/, /nutrition-/, /recipe-/, /video-/,
        /tab-/, /-item$/, /-button$/, /-container$/, /-content$/, /-header$/, /-footer$/
      ],
      
      // Custom extractor for better detection
      defaultExtractor: content => {
        const broadMatches = content.match(/[^<>"'`\s]*[^<>"'`\s:]/g) || [];
        const innerMatches = content.match(/[^<>"'`\s.()]*[^<>"'`\s.():]/g) || [];
        return broadMatches.concat(innerMatches);
      }
    });
    
    // Write the purged CSS to a new file
    const purgedCSS = purgeCSSResult[0].css;
    fs.writeFileSync('style-purged.css', purgedCSS);
    
    // Get new file size
    const purgedStats = fs.statSync('style-purged.css');
    const purgedSize = (purgedStats.size / 1024).toFixed(2);
    const reduction = ((originalStats.size - purgedStats.size) / originalStats.size * 100).toFixed(1);
    
    console.log(`✅ Purged CSS file created: style-purged.css`);
    console.log(`📄 Purged CSS file size: ${purgedSize} KB`);
    console.log(`📉 Size reduction: ${reduction}%`);
    console.log(`💾 Space saved: ${(originalSize - purgedSize).toFixed(2)} KB`);
    
    // Create a backup of the original
    fs.copyFileSync('style.css', 'style-original-backup.css');
    console.log(`💾 Original CSS backed up as: style-original-backup.css`);
    
    console.log('\n🎉 CSS purging completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('1. Review the purged CSS file: style-purged.css');
    console.log('2. Test your application with the purged CSS');
    console.log('3. If everything works, replace style.css with style-purged.css');
    console.log('4. Your original CSS is backed up as style-original-backup.css');
    
  } catch (error) {
    console.error('❌ Error during CSS purging:', error.message);
    console.error(error.stack);
  }
}

// Run the purging process
purgeCSSFiles(); 