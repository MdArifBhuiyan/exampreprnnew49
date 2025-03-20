const fs = require('fs');
const path = require('path');

// Paths
const sourcePath = path.join(__dirname, 'google-services.json');
const destinationPath = path.join(__dirname, 'android', 'app', 'google-services.json');

// Ensure the destination directory exists
const destinationDir = path.dirname(destinationPath);
if (!fs.existsSync(destinationDir)) {
  fs.mkdirSync(destinationDir, { recursive: true });
}

// Copy the file
fs.copyFile(sourcePath, destinationPath, (err) => {
  if (err) {
    console.error('Error copying google-services.json:', err);
    process.exit(1);
  }
  console.log('google-services.json copied successfully!');
});