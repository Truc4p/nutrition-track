# CSS Tools

This folder contains tools for analyzing and optimizing CSS files using PurgeCSS and custom analyzers.

## 📁 Files Overview

### Generated Files
- `style-purged.css` - Cleaned CSS file with unused styles removed
- `style-original-backup.css` - Backup of the original CSS file
- `css-comparison-report.json` - Detailed comparison between original and purged CSS
- `css-analysis-results.json` - Analysis results from custom CSS analyzer

### Configuration & Scripts
- `purgecss.config.js` - PurgeCSS configuration file
- `purge-css.js` - Main PurgeCSS script
- `css-compare.js` - Comparison script for original vs purged CSS
- `css-cleanup-analyzer.js` - Custom CSS analyzer script
- `test-purged-css.html` - Test page to verify purged CSS works correctly

## 🚀 Usage

### Run from Project Root

```bash
# Clean CSS with PurgeCSS (removes unused styles)
npm run purge-css

# Compare original vs purged CSS
npm run compare-css

# Run custom CSS analysis
npm run analyze-css

# Create a timestamped backup
npm run backup-css

# Restore original CSS from backup
npm run restore-css

# Apply purged CSS as main stylesheet
npm run apply-purged

# Run full process: backup → purge → compare
npm run build-css

# Open test page to verify CSS works
npm run css-test
```

## 📊 Results Summary

- **Original CSS**: 55.53 KB (2,799 lines, 327 CSS rules)
- **Purged CSS**: 51.36 KB (2,613 lines, 308 CSS rules)
- **Reduction**: 7.5% (4.17 KB saved, 19 rules removed)

## 🛠️ What Gets Removed

PurgeCSS intelligently removes:
- Unused form styles (`#user-info` variants)
- YouTube video player styles
- Nutrition visualization styles
- Duplicate or unused selectors
- Styles not referenced in HTML or JavaScript

## ⚙️ Configuration

### PurgeCSS Safelist
The configuration includes a comprehensive safelist to preserve:
- Base HTML elements
- Pseudo-classes (`:hover`, `:focus`, etc.)
- Animation keyframes
- Dynamically generated classes
- Important utility classes

### File Paths
All scripts are configured to work from the `css-tools/` subdirectory and reference the parent directory for source files.

## 🧪 Testing

1. Run `npm run css-test` to open the test page
2. Verify all UI components render correctly
3. Test interactive elements (buttons, forms, navigation)
4. Check console for any styling errors

## 🔄 Workflow

1. **Backup**: Always create a backup before purging
2. **Purge**: Run PurgeCSS to remove unused styles
3. **Compare**: Review what was removed
4. **Test**: Verify the application works correctly
5. **Apply**: Replace the original CSS if everything works

## 📝 Notes

- The original CSS is always backed up before purging
- PurgeCSS is conservative and only removes genuinely unused styles
- The safelist can be modified in `purgecss.config.js` if needed
- All generated files are kept in this directory for organization 