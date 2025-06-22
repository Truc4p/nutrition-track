# Nutrient Tooltip System with Categories

A comprehensive tooltip system that provides detailed information about nutrients, including their categories and explanations. This system displays tooltips when hovering over nutrient names, showing the nutrient's category classification and a brief explanation of its function and importance.

## Features

- **218 Comprehensive Nutrients**: Complete database covering all major nutrient categories
- **Category Classification**: Each nutrient is organized into logical categories
- **Hover Tooltips**: Smooth, animated tooltips that appear on hover
- **Responsive Design**: Works on both desktop and mobile devices
- **Auto-Detection**: Automatically detects nutrient names in your existing HTML
- **Fuzzy Matching**: Handles common nutrient name variations

## Nutrient Categories

The system organizes nutrients into the following categories:

### Core Nutrients
- **Energy**: Calories and energy measurements
- **Macronutrients**: Protein, fats, carbohydrates
- **Basic Components**: Water, ash, nitrogen

### Vitamins
- **Fat-Soluble Vitamins**: A, D, E, K variants
- **Water-Soluble Vitamins**: C and B-complex
- **B Vitamins**: Individual B vitamin family members
- **Vitamin E**: Tocopherols and tocotrienols
- **Folate**: All forms of folate and folic acid

### Minerals
- **Major Minerals**: Calcium, magnesium, phosphorus, potassium, sodium
- **Trace Minerals**: Iron, zinc, copper, selenium, iodine, etc.

### Fatty Acids
- **Fatty Acid Totals**: Total saturated, monounsaturated, polyunsaturated
- **Saturated Fatty Acids**: Individual SFA chains (4:0 to 24:0)
- **Monounsaturated Fatty Acids**: Individual MUFA chains
- **Polyunsaturated Fatty Acids**: Omega-3, omega-6, and other PUFA
- **Trans Fatty Acids**: All harmful trans fat variants

### Specialized Compounds
- **Amino Acids**: All essential and non-essential amino acids
- **Carotenoids**: Beta-carotene, lycopene, lutein, zeaxanthin, etc.
- **Phytosterols**: Plant sterols with health benefits
- **Choline**: All forms of choline compounds
- **Isoflavones**: Soy-derived phytoestrogens

### Carbohydrates & Fiber
- **Fiber**: Soluble, insoluble, and total dietary fiber
- **Sugars**: Individual sugars (glucose, fructose, sucrose, etc.)
- **Complex Carbohydrates**: Starch and complex sugars

### Other Compounds
- **Organic Acids**: Citric, malic, oxalic acids
- **Other Compounds**: Caffeine, theobromine, alcohol

## Files

- `nutrient-database.js` - Complete database of 218 nutrients with categories and explanations
- `nutrient-tooltip.js` - Main tooltip functionality with category display
- `nutrient-tooltip.css` - Styling for tooltips including category formatting
- `README.md` - This documentation file

## Installation

1. Include the required files in your HTML:

```html
<!-- CSS for tooltip styling -->
<link rel="stylesheet" href="path/to/nutrient-tooltip.css">

<!-- JavaScript files -->
<script src="path/to/nutrient-database.js"></script>
<script src="path/to/nutrient-tooltip.js"></script>
```

2. Add the `nutrient-name` class to any element containing a nutrient name:

```html
<span class="nutrient-name">Vitamin C, total ascorbic acid</span>
<span class="nutrient-name">Calcium, Ca</span>
<span class="nutrient-name">Protein</span>
```

## Usage

### Automatic Detection

The system automatically detects and adds tooltips to elements with the `nutrient-name` class:

```html
<div class="nutrition-item">
    <span class="nutrient-name">Iron, Fe</span>
    <span>3.2 mg</span>
</div>
```

### Manual Integration

You can manually add tooltips to existing elements:

```javascript
// Add tooltip functionality to specific selectors
window.nutrientTooltip.addTooltipToElements('.my-nutrient-class');

// Refresh tooltips after dynamic content changes
window.nutrientTooltip.refresh();

// Manually show tooltip for an element
window.nutrientTooltip.showTooltipForElement(element, 'Vitamin D (D2 + D3)');
```

### Tooltip Content

Each tooltip displays:

1. **Nutrient Name**: The full scientific name
2. **Category**: The classification group (e.g., "VITAMINS", "MAJOR MINERALS")
3. **Explanation**: A brief description of the nutrient's function and importance

## Customization

### Styling

The tooltip appearance can be customized by modifying `nutrient-tooltip.css`:

```css
.nutrient-tooltip {
    /* Customize background, colors, fonts, etc. */
}

.nutrient-tooltip .tooltip-category {
    /* Customize category display */
}
```

### Adding New Nutrients

Add new nutrients to the `NUTRIENT_DATABASE` object in `nutrient-database.js`:

```javascript
"New Nutrient Name": {
    category: "Category Name",
    explanation: "Description of the nutrient's function and importance."
}
```

## Browser Support

- Modern browsers with ES6 support
- Mobile browsers (responsive design)
- Touch devices (tap to show tooltip)

## Demo

Open `nutrient-demo.html` in a web browser to see the tooltip system in action. The demo includes examples from all major nutrient categories.

## Integration with Existing Projects

This tooltip system is designed to integrate seamlessly with existing nutrition applications. Simply:

1. Include the CSS and JavaScript files
2. Add the `nutrient-name` class to nutrient text elements
3. The tooltips will automatically appear on hover

The system includes fuzzy matching for common nutrient name variations, so it works with simplified names like "Vitamin C" as well as full scientific names like "Vitamin C, total ascorbic acid".

## Performance

- Lightweight: ~45KB total for all files
- Efficient event delegation
- Minimal DOM manipulation
- Responsive positioning system
- Smooth animations with CSS transitions

## Future Enhancements

- Additional nutrient information (RDA values, food sources)
- Color-coded categories
- Search functionality
- Integration with nutrition APIs
- Accessibility improvements 