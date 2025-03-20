const { withDangerousMod, withPlugins } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

const withGoogleServices = (config) => {
  return withDangerousMod(config, [
    'android',
    async (config) => {
      const sourcePath = path.join(__dirname, 'google-services.json');
      const destinationPath = path.join(
        config.modRequest.platformProjectRoot,
        'app',
        'google-services.json'
      );

      // Ensure the destination directory exists
      const destinationDir = path.dirname(destinationPath);
      if (!fs.existsSync(destinationDir)) {
        fs.mkdirSync(destinationDir, { recursive: true });
      }

      // Copy the file
      fs.copyFileSync(sourcePath, destinationPath);
      console.log('google-services.json copied successfully!');

      return config;
    },
  ]);
};

module.exports = (config) => {
  return withPlugins(config, [
    [withGoogleServices, {}], // Ensure the plugin runs before prebuild
  ]);
};