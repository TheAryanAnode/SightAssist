const fs = require('fs');
const path = require('path');

// Verify react-native-worklets is installed (required by react-native-reanimated v4)
const nodeModulesPath = path.join(__dirname, '..', 'node_modules');
const workletsPath = path.join(nodeModulesPath, 'react-native-worklets');

if (fs.existsSync(workletsPath)) {
  console.log('✓ react-native-worklets is installed');
} else {
  console.warn(
    'Warning: react-native-worklets is not installed. Run: npm install react-native-worklets --legacy-peer-deps'
  );
}
