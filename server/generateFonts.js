const fs = require('fs');
const path = require('path');

const fontsDir = path.join(__dirname, 'fonts');
const fonts = {
  'Roboto-Regular': 'Roboto-Regular.ttf',
  'Roboto-Medium': 'Roboto-Medium.ttf',  // For bold
  'Roboto-Italic': 'Roboto-Italic.ttf'   // Optional for italics
};

Object.entries(fonts).forEach(([key, filename]) => {
  const filePath = path.join(fontsDir, filename);
  if (fs.existsSync(filePath)) {
    const fontBuffer = fs.readFileSync(filePath);
    const base64 = fontBuffer.toString('base64');
    console.log(`export const ${key}Base64 = '${base64}';`);
  } else {
    console.error(`Missing: ${filePath}`);
  }
});