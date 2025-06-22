// Nutrient Tooltip System
class NutrientTooltip {
    constructor() {
        this.tooltip = null;
        this.currentTarget = null;
        this.hideTimeout = null;
        this.showTimeout = null;
        this.init();
    }

    init() {
        this.createTooltipElement();
        this.bindEvents();
        this.loadNutrientDatabase();
    }

    createTooltipElement() {
        if (!document.body) {
            console.warn('Document body not ready for tooltip creation');
            return;
        }
        
        this.tooltip = document.createElement('div');
        this.tooltip.className = 'nutrient-tooltip';
        this.tooltip.innerHTML = `
            <div class="tooltip-header">
                <span class="tooltip-name"></span>
                <span class="tooltip-category"></span>
            </div>
            <div class="tooltip-explanation"></div>
        `;
        document.body.appendChild(this.tooltip);
    }

    loadNutrientDatabase() {
        // The database is already loaded from nutrient-database.js
        if (typeof NUTRIENT_DATABASE === 'undefined') {
            console.warn('Nutrient database not loaded. Please include nutrient-database.js');
        }
    }

    bindEvents() {
        // Use event delegation for better performance
        document.addEventListener('mouseenter', (e) => {
            if (e && e.target && e.target.classList && e.target.classList.contains('nutrient-name')) {
                this.showTooltip(e.target, e);
            }
        }, true);

        document.addEventListener('mouseleave', (e) => {
            if (e && e.target && e.target.classList && e.target.classList.contains('nutrient-name')) {
                this.hideTooltip();
            }
        }, true);

        document.addEventListener('mousemove', (e) => {
            if (this.currentTarget && this.tooltip && this.tooltip.classList.contains('show')) {
                this.positionTooltip(e);
            }
        });

        // Hide tooltip when scrolling
        document.addEventListener('scroll', () => {
            this.hideTooltip();
        }, true);

        // Hide tooltip on window resize
        window.addEventListener('resize', () => {
            this.hideTooltip();
        });
    }

    showTooltip(element, event) {
        clearTimeout(this.hideTimeout);
        clearTimeout(this.showTimeout);

        this.currentTarget = element;
        const nutrientName = this.extractNutrientName(element);
        
        if (!nutrientName) return;

        // Show loading state first
        this.showLoadingTooltip(event);

        // Then load the actual content
        this.showTimeout = setTimeout(() => {
            this.loadTooltipContent(nutrientName, event);
        }, 100);
    }

    showLoadingTooltip(event) {
        if (!this.tooltip) return;
        
        this.tooltip.className = 'nutrient-tooltip loading show';
        this.tooltip.querySelector('.tooltip-name').textContent = 'Loading...';
        this.tooltip.querySelector('.tooltip-category').textContent = '';
        this.tooltip.querySelector('.tooltip-explanation').textContent = 'Fetching nutrient information';
        
        this.positionTooltip(event);
    }

    loadTooltipContent(nutrientName, event) {
        if (!this.tooltip) return;
        
        const nutrientInfo = this.getNutrientInfo(nutrientName);
        
        if (!nutrientInfo) {
            this.showNotFoundTooltip(nutrientName, event);
            return;
        }

        // Update tooltip content
        this.tooltip.querySelector('.tooltip-name').textContent = nutrientName;
        this.tooltip.querySelector('.tooltip-category').textContent = nutrientInfo.category;
        this.tooltip.querySelector('.tooltip-explanation').textContent = nutrientInfo.explanation;

        // Use unified styling (no category-specific classes)
        this.tooltip.className = `nutrient-tooltip show animate`;

        this.positionTooltip(event);
    }

    showNotFoundTooltip(nutrientName, event) {
        if (!this.tooltip) return;
        
        this.tooltip.querySelector('.tooltip-name').textContent = nutrientName;
        this.tooltip.querySelector('.tooltip-category').textContent = 'Unknown';
        this.tooltip.querySelector('.tooltip-explanation').textContent = 'Information not available for this nutrient. This might be a specialized or less common nutrient.';

        this.tooltip.className = 'nutrient-tooltip show';
        this.positionTooltip(event);
    }

    hideTooltip() {
        clearTimeout(this.showTimeout);
        this.hideTimeout = setTimeout(() => {
            if (this.tooltip) {
                this.tooltip.classList.remove('show', 'animate');
            }
            this.currentTarget = null;
        }, 150);
    }

    positionTooltip(event) {
        if (!this.tooltip || !event) return;

        const tooltipRect = this.tooltip.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        
        // Get the target element dimensions for better positioning
        const targetRect = this.currentTarget ? this.currentTarget.getBoundingClientRect() : null;
        
        let left = event.pageX - tooltipRect.width / 2;
        let top = event.pageY - tooltipRect.height - 20; // Increased gap from 10 to 20
        
        // If we have target element info, position relative to it instead of cursor
        if (targetRect) {
            // Position tooltip above the target element with more space
            top = targetRect.top + window.pageYOffset - tooltipRect.height - 15;
            left = targetRect.left + targetRect.width / 2 - tooltipRect.width / 2;
        }

        // Adjust horizontal position to stay within viewport
        if (left < 10) {
            left = 10;
        } else if (left + tooltipRect.width > viewportWidth - 10) {
            left = viewportWidth - tooltipRect.width - 10;
        }

        // Adjust vertical position if tooltip would go above viewport
        if (top < window.pageYOffset + 10) {
            if (targetRect) {
                // Position below the target element instead
                top = targetRect.bottom + window.pageYOffset + 15;
            } else {
                top = event.pageY + 20; // Increased gap from 10 to 20
            }
            this.tooltip.classList.add('flipped');
        } else {
            this.tooltip.classList.remove('flipped');
        }

        this.tooltip.style.left = `${left}px`;
        this.tooltip.style.top = `${top}px`;
    }

    extractNutrientName(element) {
        // Try different methods to extract nutrient name
        let nutrientName = element.textContent.trim();
        
        // Remove trailing colon if present
        nutrientName = nutrientName.replace(/:$/, '');
        
        // Handle cases where the text includes values
        // Extract just the nutrient name part
        const colonIndex = nutrientName.indexOf(':');
        if (colonIndex > 0) {
            nutrientName = nutrientName.substring(0, colonIndex).trim();
        }
        
        return nutrientName;
    }

    getNutrientInfo(nutrientName) {
        if (typeof NUTRIENT_DATABASE === 'undefined') {
            return null;
        }

        // Try exact match first
        if (NUTRIENT_DATABASE[nutrientName]) {
            return NUTRIENT_DATABASE[nutrientName];
        }

        // Try case-insensitive match
        const lowerNutrientName = nutrientName.toLowerCase();
        for (const [key, value] of Object.entries(NUTRIENT_DATABASE)) {
            if (key.toLowerCase() === lowerNutrientName) {
                return value;
            }
        }

        // Try partial matches for common variations
        const commonMappings = {
            'calories': 'Energy',
            'energy': 'Energy',
            'fat': 'Total lipid (fat)',
            'fats': 'Total lipid (fat)',
            'carbs': 'Carbohydrate, by difference',
            'carbohydrates': 'Carbohydrate, by difference',
            'fiber': 'Fiber, total dietary',
            'sugar': 'Sugars, Total',
            'protein': 'Protein',
            'cholesterol': 'Cholesterol',
            'saturated fat': 'Fatty acids, total saturated',
            'trans fat': 'Fatty acids, total trans',
            'omega-3': 'PUFA 18:3 n-3 c,c,c (ALA)',
            'omega-6': 'PUFA 18:2 n-6 c,c',
            'vitamin a': 'Vitamin A, RAE',
            'vitamin b6': 'Vitamin B-6',
            'vitamin b12': 'Vitamin B-12',
            'vitamin c': 'Vitamin C, total ascorbic acid',
            'vitamin d': 'Vitamin D (D2 + D3)',
            'vitamin e': 'Vitamin E (alpha-tocopherol)',
            'vitamin k': 'Vitamin K (phylloquinone)',
            'folate': 'Folate, DFE',
            'thiamin': 'Thiamin',
            'riboflavin': 'Riboflavin',
            'niacin': 'Niacin',
            'choline': 'Choline, total',
            'calcium': 'Calcium, Ca',
            'iron': 'Iron, Fe',
            'magnesium': 'Magnesium, Mg',
            'phosphorus': 'Phosphorus, P',
            'potassium': 'Potassium, K',
            'sodium': 'Sodium, Na',
            'zinc': 'Zinc, Zn',
            'copper': 'Copper, Cu',
            'manganese': 'Manganese, Mn',
            'selenium': 'Selenium, Se'
        };

        const mappedName = commonMappings[lowerNutrientName];
        if (mappedName && NUTRIENT_DATABASE[mappedName]) {
            return NUTRIENT_DATABASE[mappedName];
        }

        return null;
    }

    // Public method to manually show tooltip
    showTooltipForElement(element, nutrientName) {
        const fakeEvent = {
            pageX: element.getBoundingClientRect().left + element.offsetWidth / 2,
            pageY: element.getBoundingClientRect().top + window.pageYOffset
        };
        
        this.currentTarget = element;
        this.loadTooltipContent(nutrientName, fakeEvent);
    }

    // Public method to add tooltip to elements
    addTooltipToElements(selector) {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
            if (!element.classList.contains('nutrient-name')) {
                element.classList.add('nutrient-name');
            }
        });
    }

    // Method to refresh tooltips after dynamic content changes
    refresh() {
        // Re-add tooltip class to nutrient names that might have been added dynamically
        const nutrientElements = document.querySelectorAll('[data-nutrient], .nutrition-total-item .nutrient-name, .food-nutrition .nutrient-name');
        nutrientElements.forEach(element => {
            if (!element.classList.contains('nutrient-name')) {
                element.classList.add('nutrient-name');
            }
        });
    }
}

// Auto-initialize when DOM is ready
function initializeNutrientTooltip() {
    if (typeof window === 'undefined' || !document.body) {
        // Wait a bit more if DOM isn't ready
        setTimeout(initializeNutrientTooltip, 100);
        return;
    }
    
    try {
        window.nutrientTooltip = new NutrientTooltip();
        
        // Auto-add tooltips to existing nutrient names
        window.nutrientTooltip.addTooltipToElements('.nutrition-total-item .nutrient-name');
        window.nutrientTooltip.addTooltipToElements('.food-nutrition .nutrient-name');
    } catch (error) {
        console.warn('Failed to initialize nutrient tooltip:', error);
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeNutrientTooltip);
} else {
    // DOM is already ready
    initializeNutrientTooltip();
}

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NutrientTooltip;
} 