const fs = require('fs');
const { exec } = require('child_process');

function extractCSSRules(cssContent) {
    const rules = [];
    const blocks = cssContent.split('}');
    
    blocks.forEach(block => {
        const trimmed = block.trim();
        if (trimmed && trimmed.includes('{')) {
            const parts = trimmed.split('{');
            if (parts.length >= 2) {
                const selector = parts[0].trim();
                if (selector && !selector.startsWith('/*') && !selector.startsWith('@import')) {
                    rules.push(selector);
                }
            }
        }
    });
    
    return rules;
}

function compareCSS() {
    try {
        console.log('🔍 Comparing original and purged CSS files...\n');
        
        if (!fs.existsSync('./style.css') || !fs.existsSync('./css-tools/style-purged.css')) {
            console.error('❌ Missing CSS files. Make sure both style.css and css-tools/style-purged.css exist.');
            return;
        }
        
        const originalCSS = fs.readFileSync('./style.css', 'utf8');
        const purgedCSS = fs.readFileSync('./css-tools/style-purged.css', 'utf8');
        
        const originalRules = extractCSSRules(originalCSS);
        const purgedRules = extractCSSRules(purgedCSS);
        
        const removedRules = originalRules.filter(rule => !purgedRules.includes(rule));
        const keptRules = originalRules.filter(rule => purgedRules.includes(rule));
        
        console.log('📊 COMPARISON RESULTS');
        console.log('='.repeat(50));
        console.log(`Original CSS rules: ${originalRules.length}`);
        console.log(`Purged CSS rules: ${purgedRules.length}`);
        console.log(`Removed rules: ${removedRules.length}`);
        console.log(`Kept rules: ${keptRules.length}`);
        console.log(`Removal rate: ${((removedRules.length / originalRules.length) * 100).toFixed(1)}%`);
        
        if (removedRules.length > 0) {
            console.log('\n🗑️  REMOVED SELECTORS:');
            console.log('-'.repeat(30));
            removedRules.slice(0, 20).forEach(rule => {
                console.log(`• ${rule}`);
            });
            
            if (removedRules.length > 20) {
                console.log(`... and ${removedRules.length - 20} more`);
            }
            
            // Save detailed comparison to file
            const comparisonReport = {
                summary: {
                    originalRules: originalRules.length,
                    purgedRules: purgedRules.length,
                    removedRules: removedRules.length,
                    keptRules: keptRules.length,
                    removalRate: ((removedRules.length / originalRules.length) * 100).toFixed(1) + '%'
                },
                removedSelectors: removedRules,
                keptSelectors: keptRules
            };
            
            fs.writeFileSync('./css-tools/css-comparison-report.json', JSON.stringify(comparisonReport, null, 2));
            console.log('\n📄 Detailed comparison saved to: css-tools/css-comparison-report.json');
        }
        
        // File size comparison
        const originalStats = fs.statSync('./style.css');
        const purgedStats = fs.statSync('./css-tools/style-purged.css');
        const sizeDiff = originalStats.size - purgedStats.size;
        const sizeReduction = ((sizeDiff / originalStats.size) * 100).toFixed(1);
        
        console.log('\n💾 FILE SIZE COMPARISON:');
        console.log('-'.repeat(30));
        console.log(`Original: ${(originalStats.size / 1024).toFixed(2)} KB`);
        console.log(`Purged: ${(purgedStats.size / 1024).toFixed(2)} KB`);
        console.log(`Saved: ${(sizeDiff / 1024).toFixed(2)} KB (${sizeReduction}%)`);
        
    } catch (error) {
        console.error('❌ Error comparing CSS files:', error.message);
    }
}

// Run comparison
compareCSS(); 