const fs = require('fs');

// Read the current database
const content = fs.readFileSync('nutrient-database.js', 'utf8');

// Parse the database structure and reformat it
const lines = content.split('\n');
let formattedLines = [];
let inDatabase = false;
let braceDepth = 0;

for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Handle the opening of NUTRIENT_DATABASE
    if (line.includes('const NUTRIENT_DATABASE = {')) {
        formattedLines.push('// Comprehensive Nutrient Database with all 218 USDA nutrients');
        formattedLines.push('const NUTRIENT_DATABASE = {');
        inDatabase = true;
        braceDepth = 1;
        continue;
    }
    
    // Handle comments
    if (line.startsWith('//')) {
        formattedLines.push('    ' + line);
        continue;
    }
    
    // Handle nutrient entries
    if (inDatabase && line.includes('": {')) {
        const nutrientName = line.match(/"([^"]+)":/)[1];
        formattedLines.push(`    "${nutrientName}": {`);
        continue;
    }
    
    // Handle category lines
    if (line.includes('category:')) {
        const category = line.match(/category:\s*"([^"]+)"/)[1];
        formattedLines.push(`        category: "${category}",`);
        continue;
    }
    
    // Handle explanation lines
    if (line.includes('explanation:')) {
        const explanationMatch = line.match(/explanation:\s*"(.+)"/);
        if (explanationMatch) {
            const explanation = explanationMatch[1];
            formattedLines.push(`        explanation: "${explanation}"`);
        }
        continue;
    }
    
    // Handle closing braces for nutrients
    if (line === '},') {
        formattedLines.push('    },');
        continue;
    }
    
    // Handle closing brace for the main object
    if (line === '};' && inDatabase) {
        formattedLines.push('};');
        formattedLines.push('');
        inDatabase = false;
        continue;
    }
    
    // Handle utility class and exports (keep as is)
    if (!inDatabase && line.length > 0) {
        formattedLines.push(line);
    }
}

// Write the formatted content
const formattedContent = formattedLines.join('\n');
fs.writeFileSync('nutrient-database.js', formattedContent);

console.log('Database formatting improved!'); 