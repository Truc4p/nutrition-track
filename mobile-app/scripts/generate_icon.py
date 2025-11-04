#!/usr/bin/env python3
"""
Generate app icons with pink color theme matching the app's color palette
"""

from PIL import Image, ImageDraw, ImageFont
import os

# Modern Pink Color Palette from the app
COLORS = {
    'primary500': "#52aae4",
    'primary600': "#2eccc1", 
    'primary700': '#2ecc71',
    'primary50': '#FDFBF7'
}

def hex_to_rgb(hex_color):
    """Convert hex color to RGB tuple"""
    hex_color = hex_color.lstrip('#')
    return tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))

def generate_gradient_icon(size, output_path):
    """Generate a gradient icon with 'N' letter"""
    # Create image
    img = Image.new('RGB', (size, size), hex_to_rgb(COLORS['primary500']))
    draw = ImageDraw.Draw(img)
    
    # Create gradient effect by drawing circles
    center = size // 2
    primary_color = hex_to_rgb(COLORS['primary500'])
    darker_color = hex_to_rgb(COLORS['primary600'])
    
    # Draw gradient from center outward
    for i in range(size // 2, 0, -1):
        # Interpolate between colors
        ratio = i / (size // 2)
        r = int(primary_color[0] * ratio + darker_color[0] * (1 - ratio))
        g = int(primary_color[1] * ratio + darker_color[1] * (1 - ratio))
        b = int(primary_color[2] * ratio + darker_color[2] * (1 - ratio))
        
        color = (r, g, b)
        bbox = [center - i, center - i, center + i, center + i]
        draw.ellipse(bbox, fill=color)
    
    # Draw 'N' in the center
    text_color = hex_to_rgb(COLORS['primary50'])
    
    # Try to load a font, fallback to default
    try:
        # Try common system fonts
        font_size = int(size * 0.6)
        font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", font_size)
    except:
        try:
            font = ImageFont.truetype("/System/Library/Fonts/SFNSDisplay.ttf", font_size)
        except:
            font = ImageFont.load_default()

    # Draw the letter 'N'
    text = "N"
    bbox = draw.textbbox((0, 0), text, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    
    position = ((size - text_width) // 2, (size - text_height) // 2 - int(size * 0.05))
    draw.text(position, text, fill=text_color, font=font)
    
    # Save the image
    img.save(output_path, 'PNG')
    print(f"✅ Generated {output_path} ({size}x{size})")

def main():
    print("🎨 Generating app icons with pink theme...")
    
    # Get the assets directory path
    script_dir = os.path.dirname(os.path.abspath(__file__))
    assets_dir = os.path.join(os.path.dirname(script_dir), 'assets')
    
    # Ensure assets directory exists
    os.makedirs(assets_dir, exist_ok=True)
    
    # Generate icons in different sizes
    generate_gradient_icon(1024, os.path.join(assets_dir, 'icon.png'))
    generate_gradient_icon(1024, os.path.join(assets_dir, 'adaptive-icon.png'))
    generate_gradient_icon(48, os.path.join(assets_dir, 'favicon.png'))
    
    # Also generate splash screen with pink theme
    print("🎨 Generating splash screen...")
    splash_size = 2048
    splash = Image.new('RGB', (splash_size, splash_size), hex_to_rgb(COLORS['primary50']))
    
    # Add centered logo
    logo_size = splash_size // 3
    logo = Image.new('RGB', (logo_size, logo_size), hex_to_rgb(COLORS['primary500']))
    draw = ImageDraw.Draw(logo)
    
    # Draw 'N' on logo
    text_color = hex_to_rgb(COLORS['primary50'])
    try:
        font_size = int(logo_size * 0.6)
        font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", font_size)
    except:
        font = ImageFont.load_default()
    
    text = "N"
    bbox = draw.textbbox((0, 0), text, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    position = ((logo_size - text_width) // 2, (logo_size - text_height) // 2)
    draw.text(position, text, fill=text_color, font=font)
    
    # Paste logo in center of splash
    splash.paste(logo, ((splash_size - logo_size) // 2, (splash_size - logo_size) // 2))
    splash.save(os.path.join(assets_dir, 'splash.png'), 'PNG')
    print(f"✅ Generated splash.png ({splash_size}x{splash_size})")
    
    print("✨ All icons generated successfully!")
    print(f"📁 Icons saved to: {assets_dir}")

if __name__ == "__main__":
    main()
