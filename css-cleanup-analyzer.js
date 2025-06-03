// CSS Cleanup Analyzer
const fs = require('fs');
const path = require('path');

function extractSelectorsFromCSS(cssContent) {
    const selectors = new Set();
    
    // Remove comments
    const withoutComments = cssContent.replace(/\/\*[\s\S]*?\*\//g, '');
    
    // Split by { to get potential selectors
    const blocks = withoutComments.split('{');
    
    for (let i = 0; i < blocks.length - 1; i++) {
        const block = blocks[i];
        // Get the last line before { which should contain selectors
        const lines = block.split('\n');
        const selectorLine = lines[lines.length - 1].trim();
        
        if (selectorLine) {
            // Split by comma for multiple selectors
            const multipleSelectors = selectorLine.split(',');
            
            multipleSelectors.forEach(selector => {
                const cleanSelector = selector.trim();
                if (cleanSelector && !cleanSelector.includes('@')) {
                    selectors.add(cleanSelector);
                }
            });
        }
    }
    
    return Array.from(selectors);
}

function extractUsedClassesAndIds(htmlContent, jsContent) {
    const used = new Set();
    
    // Extract from HTML
    const htmlClassMatches = htmlContent.match(/class=["']([^"']+)["']/g) || [];
    const htmlIdMatches = htmlContent.match(/id=["']([^"']+)["']/g) || [];
    
    htmlClassMatches.forEach(match => {
        const classes = match.replace(/class=["']/, '').replace(/["']/, '').split(/\s+/);
        classes.forEach(cls => cls && used.add(`.${cls}`));
    });
    
    htmlIdMatches.forEach(match => {
        const id = match.replace(/id=["']/, '').replace(/["']/, '');
        if (id) used.add(`#${id}`);
    });
    
    // Extract from JavaScript
    const jsIdMatches = jsContent.match(/getElementById\(['"`]([^'"`]+)['"`]\)/g) || [];
    const jsQueryMatches = jsContent.match(/querySelector\(['"`]([^'"`]+)['"`]\)/g) || [];
    const jsClassMatches = jsContent.match(/className\s*=\s*['"`]([^'"`]+)['"`]/g) || [];
    
    jsIdMatches.forEach(match => {
        const id = match.match(/getElementById\(['"`]([^'"`]+)['"`]\)/)[1];
        if (id) used.add(`#${id}`);
    });
    
    jsQueryMatches.forEach(match => {
        const selector = match.match(/querySelector\(['"`]([^'"`]+)['"`]\)/)[1];
        if (selector) used.add(selector);
    });
    
    jsClassMatches.forEach(match => {
        const classes = match.match(/className\s*=\s*['"`]([^'"`]+)['"`]/)[1].split(/\s+/);
        classes.forEach(cls => cls && used.add(`.${cls}`));
    });
    
    return Array.from(used);
}

function analyzeUnusedCSS() {
    try {
        // Read CSS file
        const cssContent = fs.readFileSync('style.css', 'utf8');
        
        // Read all HTML files
        let allHtmlContent = '';
        const htmlFiles = ['home.html', 'chat.html', 'meal-search.html', 'search.html', 'nav-bar.html', 'float-chat.html'];
        htmlFiles.forEach(file => {
            if (fs.existsSync(file)) {
                allHtmlContent += fs.readFileSync(file, 'utf8') + '\n';
            }
        });
        
        // Read all JS files
        let allJsContent = '';
        const jsFiles = ['home.js', 'chat.js', 'meal-search.js', 'search.js', 'nav-bar.js', 'float-chat.js'];
        jsFiles.forEach(file => {
            if (fs.existsSync(file)) {
                allJsContent += fs.readFileSync(file, 'utf8') + '\n';
            }
        });
        
        // Extract CSS selectors
        const cssSelectors = extractSelectorsFromCSS(cssContent);
        console.log(`Found ${cssSelectors.length} CSS selectors`);
        
        // Extract used classes and IDs
        const usedSelectors = extractUsedClassesAndIds(allHtmlContent, allJsContent);
        console.log(`Found ${usedSelectors.length} used selectors`);
        
        // Find unused selectors
        const unused = [];
        const used = [];
        
        cssSelectors.forEach(selector => {
            // Simple selector matching
            const isUsed = usedSelectors.some(usedSelector => {
                // Direct match
                if (selector === usedSelector) return true;
                
                // Check for class/id in complex selectors
                const selectorParts = selector.split(/\s+|>|\+|~|:/);
                return selectorParts.some(part => {
                    const cleanPart = part.replace(/[^\w#.-]/g, '');
                    return cleanPart && usedSelectors.includes(cleanPart);
                });
            });
            
            if (isUsed) {
                used.push(selector);
            } else {
                unused.push(selector);
            }
        });
        
        console.log('\n=== ANALYSIS RESULTS ===');
        console.log(`Total CSS selectors: ${cssSelectors.length}`);
        console.log(`Used selectors: ${used.length}`);
        console.log(`Potentially unused selectors: ${unused.length}`);
        
        console.log('\n=== POTENTIALLY UNUSED SELECTORS ===');
        unused.forEach(selector => console.log(selector));
        
        // Write results to file
        const results = {
            summary: {
                total: cssSelectors.length,
                used: used.length,
                unused: unused.length
            },
            unusedSelectors: unused,
            usedSelectors: used
        };
        
        fs.writeFileSync('css-analysis-results.json', JSON.stringify(results, null, 2));
        console.log('\n=== Results saved to css-analysis-results.json ===');
        
    } catch (error) {
        console.error('Error analyzing CSS:', error.message);
    }
}

// Run the analysis
analyzeUnusedCSS(); 