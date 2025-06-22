const { PurgeCSS } = require('purgecss');
const fs = require('fs');
const path = require('path');

async function purgeNutrientTooltipCSS() {
  try {
    console.log('🧹 Starting Nutrient Tooltip CSS purging process...');
    
    // Get original file size
    const originalPath = './nutrient-tooltip/nutrient-tooltip.css';
    const originalStats = fs.statSync(originalPath);
    const originalSize = (originalStats.size / 1024).toFixed(2);
    
    console.log(`📄 Original nutrient-tooltip.css size: ${originalSize} KB`);
    
    const purgeCSSResult = await new PurgeCSS().purge({
      content: [
        // Include main HTML files that use nutrient tooltips
        './*.html',
        './*.js',
        // Include nutrient-tooltip specific files
        './nutrient-tooltip/*.js',
        './nutrient-tooltip/*.html'
      ],
      css: [originalPath],
      
      // Safelist for nutrient-tooltip specific classes
      safelist: [
        // Core tooltip classes
        'nutrient-tooltip',
        'tooltip-header',
        'tooltip-name',
        'tooltip-category', 
        'tooltip-explanation',
        'nutrient-name',
        
        // State classes
        'show',
        'animate',
        'loading',
        'flipped',
        
        // Pseudo-classes and animations
        /hover/, /focus/, /active/,
        /keyframes/, /from/, /to/, /\d+%/,
        
        // Animation names
        'tooltipFadeIn',
        'dots',
        
        // Media query related
        /\@media/, /\@screen/,
        
        // Any dynamic classes that might be added
        /tooltip/, /nutrient/
      ],
      
      // Custom extractor for better detection
      defaultExtractor: content => {
        const broadMatches = content.match(/[^<>"'`\s]*[^<>"'`\s:]/g) || [];
        const innerMatches = content.match(/[^<>"'`\s.()]*[^<>"'`\s.():]/g) || [];
        return broadMatches.concat(innerMatches);
      }
    });
    
    // Write the purged CSS to the css-tools directory
    const purgedCSS = purgeCSSResult[0].css;
    const outputPath = './css-tools/nutrient-tooltip-purged.css';
    fs.writeFileSync(outputPath, purgedCSS);
    
    // Get new file size
    const purgedStats = fs.statSync(outputPath);
    const purgedSize = (purgedStats.size / 1024).toFixed(2);
    const reduction = ((originalStats.size - purgedStats.size) / originalStats.size * 100).toFixed(1);
    
    console.log(`✅ Purged CSS file created: ${outputPath}`);
    console.log(`📄 Purged CSS file size: ${purgedSize} KB`);
    console.log(`📉 Size reduction: ${reduction}%`);
    console.log(`💾 Space saved: ${(originalSize - purgedSize).toFixed(2)} KB`);
    
    // Create a backup of the original
    const backupPath = './css-tools/nutrient-tooltip-original-backup.css';
    fs.copyFileSync(originalPath, backupPath);
    console.log(`💾 Original CSS backed up as: ${backupPath}`);
    
    console.log('\n🎉 Nutrient Tooltip CSS purging completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('1. Review the purged CSS file:', outputPath);
    console.log('2. Test tooltip functionality in your application');
    console.log('3. If everything works, replace the original file');
    console.log('4. Your original CSS is backed up in css-tools/');
    
  } catch (error) {
    console.error('❌ Error during Nutrient Tooltip CSS purging:', error.message);
    console.error(error.stack);
  }
}

// Run the purging process
purgeNutrientTooltipCSS(); 