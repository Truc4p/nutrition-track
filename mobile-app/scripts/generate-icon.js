const fs = require('fs');
const { createCanvas } = require('canvas');

// Modern Pink Color Palette from your app
const colors = {
  'primary500': '#52aae4',
  'primary600': "#2eccc1",
  'primary700': '#2ecc71',
  primary50: '#FDFBF7'
};

function generateIcon(size, filename) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // Fill background with primary pink
  ctx.fillStyle = colors.primary500;
  ctx.fillRect(0, 0, size, size);

  // Add a subtle gradient overlay
  const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  gradient.addColorStop(0, colors.primary500);
  gradient.addColorStop(1, colors.primary600);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  // Draw a simple "S" for Skin Study in the center
  ctx.fillStyle = colors.primary50;
  ctx.font = `bold ${size * 0.6}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('N', size / 2, size / 2);

  // Save the image
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(filename, buffer);
  console.log(`✅ Generated ${filename} (${size}x${size})`);
}

// Generate different sizes
console.log('🎨 Generating app icons with pink theme...');
generateIcon(1024, './assets/icon.png');
generateIcon(1024, './assets/adaptive-icon.png');
generateIcon(48, './assets/favicon.png');

console.log('✨ All icons generated successfully!');
